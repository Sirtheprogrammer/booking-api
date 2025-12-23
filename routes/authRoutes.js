const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
    register,
    verifyOTP,
    login,
    getMe,
    resendOTP
} = require('../controllers/authController');

const router = express.Router();

// Validation rules
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone')
        .matches(/^2557\d{8}$/)
        .withMessage('Please provide a valid Tanzanian phone number (2557xxxxxxxx)'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

const verifyOTPValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits')
];

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

const resendOTPValidation = [
    body('email').isEmail().withMessage('Please provide a valid email')
];

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/verify', verifyOTPValidation, validate, verifyOTP);
router.post('/login', loginValidation, validate, login);
router.post('/resend-otp', resendOTPValidation, validate, resendOTP);
router.get('/me', protect, getMe);

module.exports = router;
