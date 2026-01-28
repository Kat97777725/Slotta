from fastapi import FastAPI, APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Optional
import hashlib
import jwt

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import models and services
from models import (
    Master, MasterCreate, MasterLogin, MasterResponse, Service, ServiceCreate,
    Client, ClientCreate, Booking, BookingCreate, BookingCreateWithPayment,
    Transaction, TransactionCreate, BookingStatus, ClientReliability
)
from slotta_engine import SlottaEngine
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

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'slotta_jwt_secret_key_2025')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Security
security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == password_hash

def create_token(master_id: str, email: str) -> str:
    """Create JWT token"""
    payload = {
        "sub": master_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_master(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated master"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        master_id = payload.get("sub")
        if not master_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        master = await db.masters.find_one({"id": master_id}, {"_id": 0, "password_hash": 0})
        if not master:
            raise HTTPException(status_code=401, detail="Master not found")
        
        return master
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Create FastAPI app
app = FastAPI(title="Slotta API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@api_router.post("/auth/register")
async def register_master(master_input: MasterCreate):
    """Register a new master account"""
    
    # Check if email already exists
    existing_email = await db.masters.find_one({"email": master_input.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if slug is unique
    existing_slug = await db.masters.find_one({"booking_slug": master_input.booking_slug})
    if existing_slug:
        raise HTTPException(status_code=400, detail="Booking slug already taken")
    
    # Create master with hashed password
    master_data = master_input.model_dump()
    password = master_data.pop('password')
    master_data['password_hash'] = hash_password(password)
    
    master = Master(**master_data)
    await db.masters.insert_one(master.model_dump())
    
    # Generate token
    token = create_token(master.id, master.email)
    
    logger.info(f"✅ Master registered: {master.name} ({master.email})")
    
    # Return without password_hash
    master_dict = master.model_dump()
    del master_dict['password_hash']
    
    return {
        "token": token,
        "master": master_dict
    }

@api_router.post("/auth/login")
async def login_master(login_data: MasterLogin):
    """Login master and get JWT token"""
    
    # Find master by email
    master = await db.masters.find_one({"email": login_data.email})
    if not master:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not master.get('password_hash') or not verify_password(login_data.password, master['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate token
    token = create_token(master['id'], master['email'])
    
    logger.info(f"✅ Master logged in: {master['email']}")
    
    # Return without password_hash
    del master['password_hash']
    del master['_id']
    
    return {
        "token": token,
        "master": master
    }

@api_router.get("/auth/me")
async def get_current_user(current_master: dict = Depends(get_current_master)):
    """Get current authenticated master profile"""
    return current_master

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
    
    # Calculate base Slotta
    base_slotta = SlottaEngine.calculate_base_slotta(
        service_input.price,
        service_input.duration_minutes
    )
    
    service = Service(
        **service_input.model_dump(),
        base_slotta=base_slotta
    )
    
    await db.services.insert_one(service.model_dump())
    
    logger.info(f"✅ Service created: {service.name} - €{service.price} (Slotta: €{service.base_slotta})")
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

@api_router.put("/services/{service_id}", response_model=Service)
async def update_service(service_id: str, service_update: ServiceCreate):
    """Update a service"""
    
    # Check if service exists
    existing = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Calculate new base Slotta
    base_slotta = SlottaEngine.calculate_base_slotta(
        service_update.price,
        service_update.duration_minutes
    )
    
    # Update service
    update_data = service_update.model_dump()
    update_data['base_slotta'] = base_slotta
    
    await db.services.update_one(
        {"id": service_id},
        {"$set": update_data}
    )
    
    updated_service = await db.services.find_one({"id": service_id}, {"_id": 0})
    
    logger.info(f"✅ Service updated: {service_id}")
    return updated_service

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str):
    """Delete a service"""
    
    # Check if service exists
    existing = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Soft delete by setting active = false
    await db.services.update_one(
        {"id": service_id},
        {"$set": {"active": False}}
    )
    
    logger.info(f"✅ Service deleted: {service_id}")
    return {"message": "Service deleted successfully"}

@api_router.put("/masters/{master_id}", response_model=Master)
async def update_master(master_id: str, master_data: dict):
    """Update master profile"""
    
    # Check if master exists
    existing = await db.masters.find_one({"id": master_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Master not found")
    
    # Update master
    master_data['updated_at'] = datetime.utcnow()
    await db.masters.update_one(
        {"id": master_id},
        {"$set": master_data}
    )
    
    updated_master = await db.masters.find_one({"id": master_id}, {"_id": 0})
    
    logger.info(f"✅ Master updated: {master_id}")
    return updated_master



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

@api_router.get("/clients/master/{master_id}", response_model=List[Client])
async def get_master_clients(master_id: str):
    """Get all clients who have booked with this master"""
    
    # Find all bookings for this master
    bookings = await db.bookings.find({"master_id": master_id}, {"client_id": 1}).to_list(10000)
    client_ids = list(set(b['client_id'] for b in bookings))
    
    if not client_ids:
        return []
    
    # Get all clients
    clients = await db.clients.find({"id": {"$in": client_ids}}, {"_id": 0}).to_list(1000)
    return clients

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
    
    # Calculate Slotta
    slotta_amount = SlottaEngine.calculate_slotta(
        price=service['price'],
        duration_minutes=service['duration_minutes'],
        client_reliability=client['reliability'],
        no_shows=client['no_shows'],
        cancellations=client['cancellations']
    )
    
    # Calculate risk score
    risk_score = SlottaEngine.calculate_risk_score(
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
        slotta_amount=slotta_amount,
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
        slotta_amount=slotta_amount
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
    
    logger.info(f"✅ Booking created: {client['name']} → {master['name']} (Slotta: €{slotta_amount})")
    return booking

@api_router.post("/bookings/with-payment")
async def create_booking_with_payment(booking_input: BookingCreateWithPayment):
    """Create booking with Stripe payment authorization (public booking flow)"""
    
    # Get service
    service = await db.services.find_one({"id": booking_input.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get master
    master = await db.masters.find_one({"id": booking_input.master_id}, {"_id": 0})
    if not master:
        raise HTTPException(status_code=404, detail="Master not found")
    
    # Get or create client
    client = await db.clients.find_one({"email": booking_input.client_email}, {"_id": 0})
    if not client:
        # Create new client
        new_client = Client(
            email=booking_input.client_email,
            name=booking_input.client_name,
            phone=booking_input.client_phone,
            reliability=ClientReliability.NEW
        )
        await db.clients.insert_one(new_client.model_dump())
        client = new_client.model_dump()
        logger.info(f"✅ New client created: {client['name']} ({client['email']})")
    
    # Calculate Slotta amount
    slotta_amount = SlottaEngine.calculate_slotta(
        price=service['price'],
        duration_minutes=service['duration_minutes'],
        client_reliability=client.get('reliability', 'new'),
        no_shows=client.get('no_shows', 0),
        cancellations=client.get('cancellations', 0)
    )
    
    # Calculate risk score
    risk_score = SlottaEngine.calculate_risk_score(
        total_bookings=client.get('total_bookings', 0),
        completed_bookings=client.get('completed_bookings', 0),
        no_shows=client.get('no_shows', 0),
        cancellations=client.get('cancellations', 0)
    )
    
    # Create Stripe payment intent with hold
    payment_intent = await stripe_service.create_payment_intent(
        amount=slotta_amount,
        customer_email=booking_input.client_email,
        metadata={
            'master_id': booking_input.master_id,
            'service_id': booking_input.service_id,
            'client_email': booking_input.client_email,
            'booking_type': 'slotta_hold'
        }
    )
    
    if not payment_intent:
        raise HTTPException(status_code=500, detail="Failed to create payment authorization")
    
    # Confirm the payment intent with the payment method
    if stripe_service.enabled:
        import stripe
        try:
            stripe.PaymentIntent.confirm(
                payment_intent['id'],
                payment_method=booking_input.payment_method_id
            )
            logger.info(f"✅ Payment authorized: {payment_intent['id']}")
        except Exception as e:
            logger.error(f"❌ Payment authorization failed: {e}")
            raise HTTPException(status_code=400, detail=f"Payment authorization failed: {str(e)}")
    
    # Calculate reschedule deadline
    reschedule_deadline = booking_input.booking_date - timedelta(hours=24)
    
    # Create booking
    booking = Booking(
        master_id=booking_input.master_id,
        client_id=client['id'],
        service_id=booking_input.service_id,
        booking_date=booking_input.booking_date,
        duration_minutes=service['duration_minutes'],
        service_price=service['price'],
        slotta_amount=slotta_amount,
        risk_score=risk_score,
        reschedule_deadline=reschedule_deadline,
        stripe_payment_intent_id=payment_intent['id'],
        payment_authorized=True,
        status=BookingStatus.CONFIRMED,
        notes=booking_input.notes
    )
    
    await db.bookings.insert_one(booking.model_dump())
    
    # Update client stats
    await db.clients.update_one(
        {"id": client['id']},
        {"$inc": {"total_bookings": 1}}
    )
    
    # Send notifications
    booking_date_str = booking_input.booking_date.strftime("%A, %B %d, %Y")
    booking_time_str = booking_input.booking_date.strftime("%I:%M %p")
    
    # Email to client
    await email_service.send_booking_confirmation(
        to_email=booking_input.client_email,
        client_name=booking_input.client_name,
        master_name=master['name'],
        service_name=service['name'],
        booking_date=booking_date_str,
        booking_time=booking_time_str,
        slotta_amount=slotta_amount
    )
    
    # Email to master
    await email_service.send_master_new_booking(
        to_email=master['email'],
        master_name=master['name'],
        client_name=booking_input.client_name,
        service_name=service['name'],
        booking_date=booking_date_str,
        booking_time=booking_time_str
    )
    
    # Telegram notification if enabled
    if master.get('telegram_chat_id'):
        await telegram_service.send_new_booking_alert(
            chat_id=master['telegram_chat_id'],
            client_name=booking_input.client_name,
            service_name=service['name'],
            booking_date=booking_date_str,
            booking_time=booking_time_str,
            slotta_amount=slotta_amount
        )
    
    # Create Google Calendar event if connected
    if master.get('google_calendar_token'):
        end_time = booking_input.booking_date + timedelta(minutes=service['duration_minutes'])
        await google_calendar_service.create_event(
            access_token=master['google_calendar_token'],
            summary=f"{service['name']} - {booking_input.client_name}",
            start_time=booking_input.booking_date,
            end_time=end_time,
            description=f"Client: {booking_input.client_name}\nEmail: {booking_input.client_email}\nSlotta: €{slotta_amount}"
        )
    
    logger.info(f"✅ Booking with payment created: {booking_input.client_name} → {master['name']} (Slotta: €{slotta_amount})")
    
    return {
        "id": booking.id,
        "status": "confirmed",
        "slotta_amount": slotta_amount,
        "payment_intent_id": payment_intent['id'],
        "message": "Booking confirmed! Payment hold authorized."
    }

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

@api_router.get("/bookings/client/email/{email}")
async def get_client_bookings_by_email(email: str):
    """Get all bookings for a client by email"""
    
    client = await db.clients.find_one({"email": email}, {"_id": 0})
    if not client:
        return []
    
    bookings = await db.bookings.find(
        {"client_id": client['id']},
        {"_id": 0}
    ).sort("booking_date", -1).to_list(1000)
    
    # Enrich with service and master details
    enriched = []
    for booking in bookings:
        service = await db.services.find_one({"id": booking['service_id']}, {"_id": 0, "name": 1, "price": 1})
        master = await db.masters.find_one({"id": booking['master_id']}, {"_id": 0, "name": 1, "location": 1})
        enriched.append({
            **booking,
            "service_name": service['name'] if service else "Unknown",
            "service_price": service['price'] if service else 0,
            "master_name": master['name'] if master else "Unknown",
            "master_location": master.get('location') if master else None
        })
    
    return enriched

@api_router.put("/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str):
    """Cancel a booking and release the payment hold"""
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking['status'] in ['completed', 'cancelled', 'no-show']:
        raise HTTPException(status_code=400, detail="Booking cannot be cancelled")
    
    # Check if within reschedule deadline
    if booking.get('reschedule_deadline') and datetime.utcnow() > booking['reschedule_deadline']:
        raise HTTPException(status_code=400, detail="Cancellation deadline has passed")
    
    # Release payment hold
    if booking.get('stripe_payment_intent_id'):
        await stripe_service.cancel_payment(booking['stripe_payment_intent_id'])
    
    # Update booking status
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": BookingStatus.CANCELLED, "updated_at": datetime.utcnow()}}
    )
    
    # Update client stats
    await db.clients.update_one(
        {"id": booking['client_id']},
        {"$inc": {"cancellations": 1}}
    )
    
    logger.info(f"✅ Booking cancelled: {booking_id}")
    return {"message": "Booking cancelled successfully", "payment_released": True}

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
    new_reliability = SlottaEngine.determine_reliability(
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
    """Mark booking as no-show and capture Slotta"""
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Calculate split
    split = SlottaEngine.calculate_no_show_split(booking['slotta_amount'])
    
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
    new_reliability = SlottaEngine.determine_reliability(
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
            booking['slotta_amount']
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
        description="Wallet credit from no-show"
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
    
    total_slotta_protected = sum(b.get('slotta_amount', 0) for b in bookings)
    
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
        "time_protected_eur": total_slotta_protected,
        "wallet_balance": wallet_balance,
        "avg_slotta": total_slotta_protected / total_bookings if total_bookings > 0 else 0
    }

# ============================================================================
# WALLET / TRANSACTIONS ENDPOINTS
# ============================================================================

@api_router.get("/wallet/master/{master_id}")
async def get_master_wallet(master_id: str):
    """Get wallet balance and transactions for a master"""
    
    # Get all transactions for this master
    transactions = await db.transactions.find(
        {"master_id": master_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    # Calculate balances
    total_credits = sum(t['amount'] for t in transactions if t.get('type') in ['wallet_credit', 'payout_received'])
    total_payouts = sum(t['amount'] for t in transactions if t.get('type') == 'payout')
    wallet_balance = total_credits - total_payouts
    
    # Get pending amount from confirmed bookings
    confirmed_bookings = await db.bookings.find(
        {"master_id": master_id, "status": "confirmed"},
        {"_id": 0, "slotta_amount": 1}
    ).to_list(10000)
    pending_amount = sum(b.get('slotta_amount', 0) for b in confirmed_bookings)
    
    # Calculate lifetime earnings
    lifetime_earnings = total_credits
    
    return {
        "wallet_balance": round(wallet_balance, 2),
        "pending_payouts": round(pending_amount, 2),
        "lifetime_earnings": round(lifetime_earnings, 2),
        "transactions": transactions[:50]  # Last 50 transactions
    }

@api_router.get("/transactions/master/{master_id}")
async def get_master_transactions(master_id: str, limit: int = 50, offset: int = 0):
    """Get paginated transactions for a master"""
    
    transactions = await db.transactions.find(
        {"master_id": master_id},
        {"_id": 0}
    ).sort("created_at", -1).skip(offset).limit(limit).to_list(limit)
    
    total_count = await db.transactions.count_documents({"master_id": master_id})
    
    return {
        "transactions": transactions,
        "total_count": total_count,
        "limit": limit,
        "offset": offset
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

# ============================================================================
# MESSAGING ENDPOINTS
# ============================================================================

@api_router.post("/messages/send")
async def send_message_to_client(
    master_id: str,
    client_id: str,
    booking_id: Optional[str] = None,
    message: str = ""
):
    """Send message to client via email/Telegram"""
    
    # Get master and client
    master = await db.masters.find_one({"id": master_id}, {"_id": 0})
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    
    if not master or not client:
        raise HTTPException(status_code=404, detail="Master or client not found")
    
    # Send via email
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        
        email_message = Mail(
            from_email=os.getenv('FROM_EMAIL', 'noreply@slotta.app'),
            to_emails=client['email'],
            subject=f"Message from {master['name']}",
            html_content=f'''
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #8b5cf6;">Message from {master['name']}</h2>
                <p>Hi {client['name']},</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    {message}
                </div>
                <p>Reply to this email to contact {master['name']} directly.</p>
                <p style="color: #6b7280; font-size: 12px;">Slotta - Smart scheduling for professionals.</p>
            </div>
            ''')
        
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(email_message)
        
        logger.info(f"✅ Message sent to {client['email']}")
        
    except Exception as e:
        logger.error(f"❌ Failed to send email: {e}")
    
    # Store message in database
    message_doc = {
        "id": str(datetime.utcnow().timestamp()),
        "master_id": master_id,
        "client_id": client_id,
        "booking_id": booking_id,
        "message": message,
        "sent_at": datetime.utcnow()
    }
    await db.messages.insert_one(message_doc)
    
    return {"message": "Message sent successfully"}

# ============================================================================
# CALENDAR BLOCK ENDPOINTS
# ============================================================================

@api_router.post("/calendar/blocks")
async def create_calendar_block(
    master_id: str,
    start_datetime: datetime,
    end_datetime: datetime,
    reason: Optional[str] = None
):
    """Block time on calendar"""
    
    block = {
        "id": str(datetime.utcnow().timestamp()),
        "master_id": master_id,
        "start_datetime": start_datetime,
        "end_datetime": end_datetime,
        "reason": reason,
        "created_at": datetime.utcnow()
    }
    
    await db.calendar_blocks.insert_one(block)
    
    logger.info(f"✅ Calendar blocked: {master_id} from {start_datetime} to {end_datetime}")
    return {"message": "Time blocked successfully", "block_id": block['id']}

@api_router.get("/calendar/blocks/master/{master_id}")
async def get_master_calendar_blocks(master_id: str):
    """Get all calendar blocks for a master"""
    
    blocks = await db.calendar_blocks.find(
        {"master_id": master_id},
        {"_id": 0}
    ).sort("start_datetime", 1).to_list(1000)
    
    return blocks

@api_router.delete("/calendar/blocks/{block_id}")
async def delete_calendar_block(block_id: str):
    """Delete a calendar block"""
    
    result = await db.calendar_blocks.delete_one({"id": block_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Block not found")
    
    logger.info(f"✅ Calendar block deleted: {block_id}")
    return {"message": "Block deleted successfully"}


@api_router.get("/")
async def root():
    return {
        "message": "Slotta API v1.0",
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
    logger.info("🚀 Slotta API starting...")
    logger.info(f"📧 Email service: {'✅ Enabled' if email_service.enabled else '❌ Disabled (add SENDGRID_API_KEY)'}")
    logger.info(f"🤖 Telegram bot: {'✅ Enabled' if telegram_service.enabled else '❌ Disabled (add TELEGRAM_BOT_TOKEN)'}")
    logger.info(f"💳 Stripe: {'✅ Enabled' if stripe_service.enabled else '❌ Disabled (add STRIPE_SECRET_KEY)'}")
    logger.info(f"📅 Google Calendar: {'✅ Enabled' if google_calendar_service.enabled else '❌ Disabled (add GOOGLE_CLIENT_ID)'}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("👋 Slotta API shutting down...")
