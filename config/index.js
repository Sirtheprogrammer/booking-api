require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smartbus-tz'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'dev_secret_key',
        expire: process.env.JWT_EXPIRE || '7d',
        refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d'
    },
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.SMTP_FROM || 'SmartBus TZ <noreply@smartbus.co.tz>'
    },
    otp: {
        expireMinutes: parseInt(process.env.OTP_EXPIRE_MINUTES) || 10
    },
    booking: {
        seatHoldMinutes: parseInt(process.env.SEAT_HOLD_MINUTES) || 10
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },
    cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
    }
};
