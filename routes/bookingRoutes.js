const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
    createBooking,
    confirmBooking,
    getUserBookings,
    getBookingDetails,
    cancelBooking
} = require('../controllers/bookingController');

const router = express.Router();

// Validation rules
const createBookingValidation = [
    body('tripId').notEmpty().withMessage('Trip ID is required'),
    body('seatNumber')
        .isInt({ min: 1 })
        .withMessage('Seat number must be a positive integer')
];

const confirmBookingValidation = [
    body('paymentMethod')
        .isIn(['mpesa', 'tigopesa', 'airtel', 'cash', 'card'])
        .withMessage('Invalid payment method')
];

// All booking routes require authentication
router.use(protect);

// Routes
router.post('/', createBookingValidation, validate, createBooking);
router.post('/:bookingId/confirm', confirmBookingValidation, validate, confirmBooking);
router.get('/', getUserBookings);
router.get('/:bookingId', getBookingDetails);
router.delete('/:bookingId', cancelBooking);

module.exports = router;
