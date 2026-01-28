# Slotta - Smart Booking Protection Platform

## Original Problem Statement
Build a sophisticated booking and payment platform that protects professionals' time from no-shows by placing a smart, calculated hold on a client's card via Stripe, rather than a full upfront charge.

## What's Been Implemented

### Phase 1: UI & Backend Scaffolding ✅ (Completed)
- Full 12-page visual frontend using React, Tailwind CSS, Radix UI
- Complete FastAPI backend with MongoDB
- Slotta calculation engine for dynamic hold amounts
- All third-party integrations configured (Stripe, SendGrid, Telegram, Google Calendar)

### Phase 2: P0 - Connect Frontend to Backend ✅ (Completed Jan 28, 2025)
- **Dashboard**: Connected to `/api/analytics/master/{id}` for real stats
- **Services**: Full CRUD (create, read, update, delete) via `/api/services/*`
- **Bookings**: Fetches from `/api/bookings/master/{id}`
- **Calendar**: Block Time modal posts to `/api/calendar/blocks`
- **Clients**: Fetches from `/api/clients/master/{id}`
- **Wallet**: Fetches from `/api/wallet/master/{id}`
- **Analytics**: Connected to `/api/analytics/master/{id}`
- **Settings**: Profile updates via `/api/masters/{id}`

### Phase 3: P1 - Authentication System ✅ (Completed Jan 28, 2025)
- JWT-based authentication with 7-day token expiration
- **Register**: `POST /api/auth/register` - creates account with hashed password
- **Login**: `POST /api/auth/login` - validates credentials, returns JWT
- **Protected Routes**: Dashboard requires authentication, redirects to /login
- Token stored in localStorage, included in all API requests
- Logout functionality clears token and redirects

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn/UI components, Lucide React icons
- **Backend**: FastAPI (Python), Motor (async MongoDB driver)
- **Database**: MongoDB
- **Auth**: JWT (PyJWT), SHA256 password hashing
- **Integrations**: Stripe, SendGrid, Telegram, Google Calendar

## Key Database Collections
- `masters`: Professional accounts (name, email, password_hash, booking_slug, etc.)
- `services`: Services offered (name, price, duration, base_slotta)
- `clients`: Client profiles (reliability score, booking history, wallet balance)
- `bookings`: Appointments (status, slotta_amount, stripe_payment_intent_id)
- `transactions`: Financial records (payouts, credits)
- `calendar_blocks`: Blocked time periods

## API Endpoints
### Auth
- `POST /api/auth/register` - Create new master account
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user

### Masters
- `POST /api/masters` - Create master
- `GET /api/masters/{booking_slug}` - Get by slug
- `PUT /api/masters/{id}` - Update profile

### Services
- `POST /api/services` - Create service
- `GET /api/services/master/{master_id}` - List services
- `PUT /api/services/{id}` - Update service
- `DELETE /api/services/{id}` - Delete service

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/master/{master_id}` - List bookings
- `PUT /api/bookings/{id}/complete` - Mark complete
- `PUT /api/bookings/{id}/no-show` - Mark no-show (captures Slotta)

### Clients
- `GET /api/clients/master/{master_id}` - List master's clients

### Wallet
- `GET /api/wallet/master/{master_id}` - Get wallet balance & transactions

### Calendar
- `POST /api/calendar/blocks` - Block time
- `GET /api/calendar/blocks/master/{master_id}` - Get blocks
- `DELETE /api/calendar/blocks/{block_id}` - Remove block

### Analytics
- `GET /api/analytics/master/{master_id}` - Get stats

## Test Credentials
- Email: `uitest_4169d49d@slotta.app`
- Password: `test123456`

## Prioritized Backlog

### P0 - Critical (Next)
- [ ] End-to-end public booking flow with Stripe payment authorization
- [ ] Trigger real notifications on booking events

### P1 - High Priority
- [ ] Google Calendar sync UI for masters
- [ ] Booking detail page - fetch real data instead of mock
- [ ] Client Portal page - connect to backend

### P2 - Medium Priority
- [ ] Profile image upload
- [ ] Advanced analytics charts
- [ ] Email templates customization

### P3 - Future
- [ ] Multi-master/salon support
- [ ] Mobile app
- [ ] Recurring booking rules

## File Structure
```
/app/
├── backend/
│   ├── services/           # Email, Stripe, Telegram, Google Calendar
│   ├── models.py           # Pydantic models
│   ├── server.py           # FastAPI endpoints
│   ├── slotta_engine.py    # Slotta calculation logic
│   └── tests/              # Pytest tests
└── frontend/
    └── src/
        ├── components/
        │   ├── ui/             # Shadcn components
        │   └── ProtectedRoute.js
        ├── lib/
        │   ├── api.js          # API client with auth
        │   └── utils.js
        └── pages/
            ├── auth/           # Login, Register
            ├── master/         # Dashboard pages
            ├── BookingPage.js  # Public booking
            ├── ClientPortal.js
            └── LandingPage.js
```

## Last Updated
January 28, 2025
