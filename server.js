const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust proxy setting for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: config.cors.allowedOrigins,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later'
});

// Add logging for trust proxy and X-Forwarded-For header
app.use('/api', (req, res, next) => {
    console.log('Trust proxy setting:', app.get('trust proxy'));
    console.log('X-Forwarded-For header:', req.headers['x-forwarded-for']);
    next();
});

app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.env === 'development') {
    app.use(morgan('dev'));
}

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to SmartBus TZ API 🚌',
        version: '1.0.0',
        endpoints: '/api/v1'
    });
});

// API routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/trips', require('./routes/tripRoutes'));
app.use('/api/v1/bookings', require('./routes/bookingRoutes'));
app.use('/api/v1/locations', require('./routes/locationRoutes'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${config.env} mode`);
});