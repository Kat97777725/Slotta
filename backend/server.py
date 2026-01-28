from fastapi import FastAPI, APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Optional

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import models and services
from models import (
    Master, MasterCreate, Service, ServiceCreate,
    Client, ClientCreate, Booking, BookingCreate,
    Transaction, TransactionCreate, BookingStatus, ClientReliability
)
from aurasync_engine import TimeHoldEngine
from services import email_service, telegram_service, stripe_service, google_calendar_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create FastAPI app
app = FastAPI(title="AuraSync API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# ============================================================================
# MASTER ENDPOINTS
# ============================================================================

@api_router.post("/masters", response_model=Master, status_code=status.HTTP_201_CREATED)
async def create_master(master_input: MasterCreate):
    """Create a new master (beauty professional)"""
    
    # Check if slug is unique
    existing = await db.masters.find_one({"booking_slug": master_input.booking_slug})
    if existing:
        raise HTTPException(status_code=400, detail="Booking slug already taken")
    
    master = Master(**master_input.model_dump())
    await db.masters.insert_one(master.model_dump())
    
    logger.info(f"✅ Master created: {master.name} ({master.booking_slug})")
    return master

@api_router.get("/masters/{booking_slug}", response_model=Master)
async def get_master_by_slug(booking_slug: str):
    """Get master by booking slug"""
    
    master = await db.masters.find_one({"booking_slug": booking_slug}, {"_id": 0})
    if not master:
        raise HTTPException(status_code=404, detail="Master not found")
    
    return master

@api_router.get("/masters/id/{master_id}", response_model=Master)
async def get_master(master_id: str):
    """Get master by ID"""
    
    master = await db.masters.find_one({"id": master_id}, {"_id": 0})
    if not master:
        raise HTTPException(status_code=404, detail="Master not found")
    
    return master

# ============================================================================
# SERVICE ENDPOINTS
# ============================================================================

@api_router.post("/services", response_model=Service, status_code=status.HTTP_201_CREATED)
async def create_service(service_input: ServiceCreate):
    """Create a new service"""
    
    # Calculate base AuraSync
    base_aurasync = TimeHoldEngine.calculate_base_aurasync(
        service_input.price,
        service_input.duration_minutes
    )
    
    service = Service(
        **service_input.model_dump(),
        base_aurasync=base_aurasync
    )
    
    await db.services.insert_one(service.model_dump())
    
    logger.info(f"✅ Service created: {service.name} - €{service.price} (AuraSync: €{service.base_aurasync})")
    return service

@api_router.get("/services/master/{master_id}", response_model=List[Service])
async def get_master_services(master_id: str, active_only: bool = True):
    """Get all services for a master"""
    
    query = {"master_id": master_id}
    if active_only:
        query["active"] = True
    
    services = await db.services.find(query, {"_id": 0}).to_list(100)
    return services

@api_router.get("/services/{service_id}", response_model=Service)
async def get_service(service_id: str):
    """Get service by ID"""
    
    service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return service

# ============================================================================
# CLIENT ENDPOINTS
# ============================================================================

@api_router.post("/clients", response_model=Client, status_code=status.HTTP_201_CREATED)
async def create_client(client_input: ClientCreate):
    """Create or get existing client"""
    
    # Check if client exists
    existing = await db.clients.find_one({"email": client_input.email}, {"_id": 0})
    if existing:
        return Client(**existing)
    
    client = Client(**client_input.model_dump())
    await db.clients.insert_one(client.model_dump())
    
    logger.info(f"✅ Client created: {client.name} ({client.email})")
    return client

@api_router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str):
    """Get client by ID"""
    
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return client

@api_router.get("/clients/email/{email}", response_model=Client)
async def get_client_by_email(email: str):
    """Get client by email"""
    
    client = await db.clients.find_one({"email": email}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return client

# ============================================================================
# BOOKING ENDPOINTS  
# ============================================================================

@api_router.post("/bookings", response_model=Booking, status_code=status.HTTP_201_CREATED)
async def create_booking(booking_input: BookingCreate):
    """Create a new booking"""
    
    # Get service details
    service = await db.services.find_one({"id": booking_input.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get client details
    client = await db.clients.find_one({"id": booking_input.client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Calculate AuraSync
    aurasync_amount = AuraSyncEngine.calculate_aurasync(
        price=service['price'],
        duration_minutes=service['duration_minutes'],
        client_reliability=client['reliability'],
        no_shows=client['no_shows'],
        cancellations=client['cancellations']
    )
    
    # Calculate risk score
    risk_score = AuraSyncEngine.calculate_risk_score(
        total_bookings=client['total_bookings'],
        completed_bookings=client['completed_bookings'],
        no_shows=client['no_shows'],
        cancellations=client['cancellations']
    )
    
    # Calculate reschedule deadline (24 hours before)
    reschedule_deadline = booking_input.booking_date - timedelta(hours=24)
    
    # Create booking
    booking = Booking(
        **booking_input.model_dump(),
        duration_minutes=service['duration_minutes'],
        service_price=service['price'],
        aurasync_amount=aurasync_amount,
        risk_score=risk_score,
        reschedule_deadline=reschedule_deadline
    )
    
    await db.bookings.insert_one(booking.model_dump())
    
    # Update client stats
    await db.clients.update_one(
        {"id": booking_input.client_id},
        {"$inc": {"total_bookings": 1}}
    )
    
    # Get master for notifications
    master = await db.masters.find_one({"id": booking_input.master_id}, {"_id": 0})
    
    # Send notifications
    await email_service.send_booking_confirmation(
        to_email=client['email'],
        client_name=client['name'],
        master_name=master['name'],
        service_name=service['name'],
        booking_date=booking_input.booking_date.strftime("%A, %B %d, %Y"),
        booking_time=booking_input.booking_date.strftime("%I:%M %p"),
        aurasync_amount=aurasync_amount
    )
    
    await email_service.send_master_new_booking(
        to_email=master['email'],
        master_name=master['name'],
        client_name=client['name'],
        service_name=service['name'],
        booking_date=booking_input.booking_date.strftime("%A, %B %d, %Y"),
        booking_time=booking_input.booking_date.strftime("%I:%M %p")
    )
    
    # Telegram notification if enabled
    if master.get('telegram_chat_id'):
        await telegram_service.notify_new_booking(
            chat_id=master['telegram_chat_id'],
            client_name=client['name'],
            service_name=service['name'],
            booking_date=booking_input.booking_date.strftime("%A, %B %d"),
            booking_time=booking_input.booking_date.strftime("%I:%M %p")
        )
    
    logger.info(f"✅ Booking created: {client['name']} → {master['name']} (AuraSync: €{aurasync_amount})")
    return booking

@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str):
    """Get booking by ID"""
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return booking

@api_router.get("/bookings/master/{master_id}", response_model=List[Booking])
async def get_master_bookings(master_id: str, status: Optional[BookingStatus] = None):
    """Get all bookings for a master"""
    
    query = {"master_id": master_id}
    if status:
        query["status"] = status
    
    bookings = await db.bookings.find(query, {"_id": 0}).sort("booking_date", -1).to_list(1000)
    return bookings

@api_router.get("/bookings/client/{client_id}", response_model=List[Booking])
async def get_client_bookings(client_id: str):
    """Get all bookings for a client"""
    
    bookings = await db.bookings.find(
        {"client_id": client_id},
        {"_id": 0}
    ).sort("booking_date", -1).to_list(1000)
    return bookings

@api_router.put("/bookings/{booking_id}/complete")
async def mark_booking_complete(booking_id: str):
    """Mark booking as completed"""
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Update booking status
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": BookingStatus.COMPLETED, "updated_at": datetime.utcnow()}}
    )
    
    # Update client stats
    await db.clients.update_one(
        {"id": booking['client_id']},
        {"$inc": {"completed_bookings": 1}}
    )
    
    # Update client reliability
    client = await db.clients.find_one({"id": booking['client_id']}, {"_id": 0})
    new_reliability = AuraSyncEngine.determine_reliability(
        total_bookings=client['total_bookings'],
        no_shows=client['no_shows']
    )
    await db.clients.update_one(
        {"id": booking['client_id']},
        {"$set": {"reliability": new_reliability}}
    )
    
    # Release payment hold if exists
    if booking.get('stripe_payment_intent_id'):
        await stripe_service.cancel_payment(booking['stripe_payment_intent_id'])
    
    logger.info(f"✅ Booking completed: {booking_id}")
    return {"message": "Booking marked as completed"}

@api_router.put("/bookings/{booking_id}/no-show")
async def mark_booking_no_show(booking_id: str):
    """Mark booking as no-show and capture AuraSync"""
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Calculate split
    split = AuraSyncEngine.calculate_no_show_split(booking['aurasync_amount'])
    
    # Update booking status
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": BookingStatus.NO_SHOW, "updated_at": datetime.utcnow()}}
    )
    
    # Update client stats
    await db.clients.update_one(
        {"id": booking['client_id']},
        {
            "$inc": {
                "no_shows": 1,
                "wallet_balance": split['client_wallet_credit']
            }
        }
    )
    
    # Update client reliability
    client = await db.clients.find_one({"id": booking['client_id']}, {"_id": 0})
    new_reliability = AuraSyncEngine.determine_reliability(
        total_bookings=client['total_bookings'],
        no_shows=client['no_shows'] + 1
    )
    await db.clients.update_one(
        {"id": booking['client_id']},
        {"$set": {"reliability": new_reliability}}
    )
    
    # Capture payment if exists
    if booking.get('stripe_payment_intent_id'):
        await stripe_service.capture_payment(
            booking['stripe_payment_intent_id'],
            booking['aurasync_amount']
        )
    
    # Create transactions
    master_transaction = Transaction(
        booking_id=booking_id,
        master_id=booking['master_id'],
        type="wallet_credit",
        amount=split['master_compensation'],
        description=f"No-show compensation for booking {booking_id}"
    )
    await db.transactions.insert_one(master_transaction.model_dump())
    
    client_transaction = Transaction(
        booking_id=booking_id,
        client_id=booking['client_id'],
        type="wallet_credit",
        amount=split['client_wallet_credit'],
        description=f"Wallet credit from no-show"
    )
    await db.transactions.insert_one(client_transaction.model_dump())
    
    # Send notifications
    master = await db.masters.find_one({"id": booking['master_id']}, {"_id": 0})
    client_doc = await db.clients.find_one({"id": booking['client_id']}, {"_id": 0})
    
    await email_service.send_no_show_alert(
        to_email=master['email'],
        master_name=master['name'],
        client_name=client_doc['name'],
        compensation=split['master_compensation'],
        wallet_credit=split['client_wallet_credit']
    )
    
    if master.get('telegram_chat_id'):
        await telegram_service.notify_no_show(
            chat_id=master['telegram_chat_id'],
            client_name=client_doc['name'],
            compensation=split['master_compensation']
        )
    
    logger.info(f"⚠️ No-show processed: {booking_id} - Master: €{split['master_compensation']}, Client: €{split['client_wallet_credit']}")
    return {
        "message": "Booking marked as no-show",
        "master_compensation": split['master_compensation'],
        "client_wallet_credit": split['client_wallet_credit']
    }

# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@api_router.get("/analytics/master/{master_id}")
async def get_master_analytics(master_id: str):
    """Get analytics for a master"""
    
    # Get all bookings
    bookings = await db.bookings.find({"master_id": master_id}, {"_id": 0}).to_list(10000)
    
    # Calculate stats
    total_bookings = len(bookings)
    completed = len([b for b in bookings if b['status'] == BookingStatus.COMPLETED])
    no_shows = len([b for b in bookings if b['status'] == BookingStatus.NO_SHOW])
    
    total_aurasync_protected = sum(b.get('aurasync_amount', 0) for b in bookings)
    
    # Get transactions
    transactions = await db.transactions.find(
        {"master_id": master_id},
        {"_id": 0}
    ).to_list(10000)
    
    wallet_balance = sum(t['amount'] for t in transactions if t['type'] == 'wallet_credit')
    
    return {
        "total_bookings": total_bookings,
        "completed_bookings": completed,
        "no_shows": no_shows,
        "no_show_rate": (no_shows / total_bookings * 100) if total_bookings > 0 else 0,
        "time_protected_eur": total_aurasync_protected,
        "wallet_balance": wallet_balance,
        "avg_aurasync": total_aurasync_protected / total_bookings if total_bookings > 0 else 0
    }

# ============================================================================
# HEALTH CHECK
# ============================================================================

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "email": email_service.enabled,
            "telegram": telegram_service.enabled,
            "stripe": stripe_service.enabled,
            "google_calendar": google_calendar_service.enabled
        }
    }

@api_router.get("/")
async def root():
    return {
        "message": "AuraSync API v1.0",
        "docs": "/docs",
        "health": "/api/health"
    }

# Include router
app.include_router(api_router)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 AuraSync API starting...")
    logger.info(f"📧 Email service: {'✅ Enabled' if email_service.enabled else '❌ Disabled (add SENDGRID_API_KEY)'}")
    logger.info(f"🤖 Telegram bot: {'✅ Enabled' if telegram_service.enabled else '❌ Disabled (add TELEGRAM_BOT_TOKEN)'}")
    logger.info(f"💳 Stripe: {'✅ Enabled' if stripe_service.enabled else '❌ Disabled (add STRIPE_SECRET_KEY)'}")
    logger.info(f"📅 Google Calendar: {'✅ Enabled' if google_calendar_service.enabled else '❌ Disabled (add GOOGLE_CLIENT_ID)'}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("👋 AuraSync API shutting down...")
