# SmartBus TZ API - Endpoints Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

Create a new user account and send OTP verification email.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "255712345678",
  "password": "secret123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email for OTP.",
  "data": {
    "email": "john@example.com",
    "expiresIn": "10 minutes"
  }
}
```

---

### 2. Verify OTP
**POST** `/auth/verify`

Verify email with OTP code.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account verified successfully!",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "255712345678",
      "role": "passenger"
    }
  }
}
```

---

### 3. Login
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful!",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "255712345678",
      "role": "passenger"
    }
  }
}
```

---

### 4. Get Current User
**GET** `/auth/me`

Get currently logged-in user details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "255712345678",
      "role": "passenger",
      "verified": true
    }
  }
}
```

---

### 5. Resend OTP
**POST** `/auth/resend-otp`

Resend OTP verification email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully. Please check your email.",
  "data": {
    "expiresIn": "10 minutes"
  }
}
```

---

## Trip Endpoints

### 1. Search Trips
**GET** `/trips/search?from=Dar&to=Arusha&date=2025-02-01`

Search available trips by route and date.

**Query Parameters:**
- `from` - Starting point (e.g., "Dar es Salaam")
- `to` - Destination (e.g., "Arusha")
- `date` - Travel date (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": {
    "trips": [
      {
        "id": "64def456...",
        "route": {
          "from": "Dar es Salaam",
          "to": "Arusha",
          "distance": 650
        },
        "bus": {
          "plateNumber": "T123ABC",
          "totalSeats": 45,
          "layout": "2x2"
        },
        "departureTime": "2025-02-01T08:00:00.000Z",
        "price": 35000,
        "availableSeats": 32,
        "status": "active"
      }
    ]
  }
}
```

---

### 2. Get Trip Details
**GET** `/trips/:tripId`

Get detailed information about a specific trip.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "64def456...",
      "route": {
        "from": "Dar es Salaam",
        "to": "Arusha",
        "distanceKm": 650
      },
      "bus": {
        "plateNumber": "T123ABC",
        "seatCount": 45,
        "layout": "2x2",
        "operator": {
          "companyName": "ABC Coach",
          "contactEmail": "ops@abc.co.tz"
        }
      },
      "departureTime": "2025-02-01T08:00:00.000Z",
      "price": 35000,
      "availableSeats": 32,
      "status": "active"
    }
  }
}
```

---

### 3. Get Seat Availability
**GET** `/trips/:tripId/seats`

Get seat map and availability for a specific trip.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tripId": "64def456...",
    "totalSeats": 45,
    "bookedCount": 13,
    "availableCount": 32,
    "layout": "2x2",
    "seats": [
      { "seatNumber": 1, "isAvailable": false },
      { "seatNumber": 2, "isAvailable": true },
      { "seatNumber": 3, "isAvailable": true }
    ]
  }
}
```

---

## Booking Endpoints
*All booking endpoints require authentication*

### 1. Create Booking
**POST** `/bookings`

Reserve a seat (10-minute hold).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "tripId": "64def456...",
  "seatNumber": 7
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Seat 7 reserved successfully. Please complete payment within 10 minutes.",
  "data": {
    "booking": {
      "id": "64ghi789...",
      "tripId": "64def456...",
      "seatNumber": 7,
      "status": "pending_payment",
      "expiresAt": "2025-02-01T08:10:00.000Z"
    }
  }
}
```

---

### 2. Confirm Booking
**POST** `/bookings/:bookingId/confirm`

Confirm booking with payment (simulated).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "paymentMethod": "mpesa"
}
```

*Valid payment methods: mpesa, tigopesa, airtel, cash, card*

**Response (200):**
```json
{
  "success": true,
  "message": "Booking confirmed successfully! 🎉",
  "data": {
    "booking": {
      "id": "64ghi789...",
      "ticketNumber": "BUS-2025-4821",
      "seatNumber": 7,
      "status": "confirmed",
      "route": {
        "from": "Dar es Salaam",
        "to": "Arusha"
      },
      "departureTime": "2025-02-01T08:00:00.000Z",
      "price": 35000
    },
    "payment": {
      "reference": "TXN-1704123456-4821",
      "method": "mpesa",
      "amount": 35000,
      "status": "success"
    }
  }
}
```

---

### 3. Get User Bookings
**GET** `/bookings?status=confirmed`

Get all bookings for logged-in user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (optional):**
- `status` - Filter by status (pending_payment, confirmed, cancelled, expired)

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": {
    "bookings": [
      {
        "id": "64ghi789...",
        "ticketNumber": "BUS-2025-4821",
        "seatNumber": 7,
        "status": "confirmed",
        "route": {
          "from": "Dar es Salaam",
          "to": "Arusha"
        },
        "departureTime": "2025-02-01T08:00:00.000Z",
        "price": 35000,
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 4. Get Booking Details
**GET** `/bookings/:bookingId`

Get detailed information about a specific booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "64ghi789...",
      "ticketNumber": "BUS-2025-4821",
      "seatNumber": 7,
      "status": "confirmed",
      "trip": {
        "route": { "from": "Dar es Salaam", "to": "Arusha" },
        "bus": { "plateNumber": "T123ABC" },
        "departureTime": "2025-02-01T08:00:00.000Z",
        "price": 35000
      },
      "payment": {
        "method": "mpesa",
        "reference": "TXN-1704123456-4821",
        "amount": 35000,
        "status": "success"
      }
    }
  }
}
```

---

### 5. Cancel Booking
**DELETE** `/bookings/:bookingId`

Cancel a booking and release the seat.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "bookingId": "64ghi789...",
    "status": "cancelled"
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error
