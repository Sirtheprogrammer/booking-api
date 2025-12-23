# SmartBus TZ API - Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote URI)
- SMTP email account (Gmail recommended for testing)

## Installation

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your configuration:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Random secret key for JWT
     - `SMTP_USER` & `SMTP_PASS`: Your Gmail credentials
     - Other settings as needed

3. **Start MongoDB**:
   ```bash
   # If using local MongoDB
   sudo systemctl start mongod
   
   # Or start MongoDB in Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Run the application**:
   ```bash
   # Development mode (with hot-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

## Project Structure

```
booking-api/
├── config/           # Configuration files
│   ├── index.js     # Main config loader
│   └── database.js  # MongoDB connection
├── controllers/     # Route controllers (to be added)
├── middleware/      # Custom middleware
│   ├── auth.js      # JWT authentication
│   ├── errorHandler.js
│   └── validate.js
├── models/          # MongoDB models
│   ├── User.js
│   ├── Operator.js
│   ├── Bus.js
│   ├── Route.js
│   ├── Trip.js
│   ├── Booking.js
│   └── Payment.js
├── routes/          # API routes (to be added)
├── services/        # Business logic
│   └── emailService.js
├── utils/           # Helper functions
│   ├── asyncHandler.js
│   └── jwt.js
├── .env.example     # Environment template
├── .gitignore
├── package.json
├── planning.md      # API planning document
└── server.js        # Entry point
```

## Next Steps

The project foundation is now complete! Next phases:
1. **Phase 1**: Build authentication, trip, and booking endpoints
2. **Phase 2**: Add payment simulation and admin features
3. **Phase 3**: Integrate real SMS and payment gateways

## Testing the API

Once running, visit:
- Health check: `http://localhost:3000/`
- API base: `http://localhost:3000/api/v1/`

## Notes
- Make sure MongoDB is running before starting the server
- For Gmail SMTP, you may need to enable "Less secure app access" or use an App Password
- The server includes security features: CORS, Helmet, Rate Limiting
