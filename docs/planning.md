# 🚌 SmartBus TZ – Bus Ticketing API  
**API-First System Design & Planning (Proposal Version)**

> Focus: **Backend API development only**  
> Mobile/Web apps will consume this API later.

---

## 1️⃣ PROJECT OVERVIEW

**Objective**  
Design and implement a **scalable, API-first bus ticketing system** that supports:
- Route search
- Seat reservation
- Ticket booking
- Payment simulation
- Confirmation via SMTP (Email → SMS gateway style)

This API is built as a **production-ready foundation** that can later integrate real SMS and payment gateways.

---

## 2️⃣ TECHNOLOGY STACK

| Layer | Technology |
|----|----|
| API Server | Node.js (Express / NestJS) |
| Database | MongoDB |
| Authentication | JWT + OTP |
| Messaging | SMTP Server |
| Payments | Mock Payment Engine |
| API Style | REST (JSON) |
| Security | HTTPS, Rate Limiting |

---

## 3️⃣ ARCHITECTURE (API-FIRST)


Client (Any App)
|
| HTTPS + JWT
|
Bus Ticketing API
|
|── MongoDB
|── SMTP Server
|── Payment Simulator


The API is **client-agnostic**:
- Mobile apps
- Web apps
- Partner integrations

---

## 4️⃣ AUTHENTICATION & IDENTITY MANAGEMENT

### 🔐 Authentication Strategy
- Email or Phone registration
- OTP verification via SMTP
- JWT access tokens
- Role-based access control

### 🔁 Auth Flow


Register
→ Send OTP (SMTP)
→ Verify OTP
→ Activate Account
→ Login
→ JWT Issued


---

## 5️⃣ DATABASE DESIGN (MONGODB)

### users
```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john@mail.com",
  "phone": "2557xxxxxxx",
  "password_hash": "hashed",
  "role": "passenger",
  "verified": false,
  "created_at": "ISODate"
}

operators
{
  "_id": "ObjectId",
  "company_name": "ABC Coach",
  "contact_email": "ops@abc.co.tz",
  "approved": false,
  "created_at": "ISODate"
}

buses
{
  "_id": "ObjectId",
  "operator_id": "ObjectId",
  "plate_number": "T123ABC",
  "seat_count": 45,
  "layout": "2x2"
}

routes
{
  "_id": "ObjectId",
  "from": "Dar es Salaam",
  "to": "Arusha",
  "distance_km": 650
}

trips
{
  "_id": "ObjectId",
  "bus_id": "ObjectId",
  "route_id": "ObjectId",
  "departure_time": "ISODate",
  "price": 35000,
  "booked_seats": [1, 4, 10],
  "status": "active"
}

bookings
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "trip_id": "ObjectId",
  "seat_number": 7,
  "status": "pending_payment",
  "expires_at": "ISODate"
}

payments
{
  "_id": "ObjectId",
  "booking_id": "ObjectId",
  "method": "mpesa",
  "reference": "TXN88901",
  "status": "success"
}

6️⃣ API ENDPOINT DESIGN
Base URL
/api/v1

🔐 AUTH ENDPOINTS
Register User
POST /api/v1/auth/register

{
  "name": "Ali",
  "email": "ali@mail.com",
  "password": "secret"
}


➡ Sends OTP via SMTP

Verify OTP
POST /api/v1/auth/verify

{
  "email": "ali@mail.com",
  "otp": "928211"
}

Login
POST /api/v1/auth/login

🧭 TRIPS & SEARCH
Search Available Trips
GET /api/v1/trips/search?from=Dar&to=Arusha&date=2025-02-01

Get Seat Availability
GET /api/v1/trips/{tripId}/seats

🎟️ BOOKINGS
Create Booking (Seat Hold)
POST /api/v1/bookings

{
  "trip_id": "ObjectId",
  "seat_number": 8
}


➡ Seat locked for 10 minutes

Confirm Booking
POST /api/v1/bookings/{bookingId}/confirm

💳 PAYMENTS (SIMULATED)
Initiate Payment
POST /api/v1/payments/initiate

{
  "booking_id": "ObjectId",
  "method": "mpesa"
}

📩 SMTP NOTIFICATIONS
Events Triggered

Account verification

Booking confirmation

Ticket issuance

Example Message

Ticket Confirmed
Ticket No: BUS-2025-0091
Seat: 8
Departure: 08:00

🏢 OPERATOR API
Create Trip
POST /api/v1/operator/trips

View Operator Bookings
GET /api/v1/operator/bookings

👑 ADMIN API
Approve Operator
POST /api/v1/admin/operators/{id}/approve

System Overview
GET /api/v1/admin/dashboard

7️⃣ SECURITY CONSIDERATIONS

JWT expiration & refresh

Role-based middleware

Rate limiting

MongoDB indexes

Seat locking with atomic updates

8️⃣ API DEVELOPMENT PHASES
Phase 1 – Core API

Auth

Trips

Bookings

SMTP notifications

Phase 2 – Payments & Admin

Payment simulation

Admin & operator dashboards

Phase 3 – Integrations

Real SMS

Mobile Money

Partner APIs

9️⃣ FUTURE SCALABILITY

Microservices

Webhooks

GraphQL layer

Real-time seat updates

QR validation endpoints