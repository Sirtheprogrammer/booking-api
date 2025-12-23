const asyncHandler = require('../utils/asyncHandler');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const Payment = require('../models/Payment');
const User = require('../models/User');
const emailService = require('../services/emailService');
const config = require('../config');

// @desc    Create booking (hold seat)
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res) => {
    const { tripId, seatNumber } = req.body;
    const userId = req.user.id;

    // Find trip
    const trip = await Trip.findById(tripId)
        .populate('busId', 'seatCount')
        .populate('routeId', 'from to');

    if (!trip) {
        return res.status(404).json({
            success: false,
            message: 'Trip not found'
        });
    }

    if (trip.status !== 'active') {
        return res.status(400).json({
            success: false,
            message: 'This trip is not available for booking'
        });
    }

    // Validate seat number
    if (seatNumber < 1 || seatNumber > trip.busId.seatCount) {
        return res.status(400).json({
            success: false,
            message: `Invalid seat number. Must be between 1 and ${trip.busId.seatCount}`
        });
    }

    // Check if seat is available
    if (!trip.isSeatAvailable(seatNumber)) {
        return res.status(400).json({
            success: false,
            message: 'This seat is already booked'
        });
    }

    // Check if user already has a pending booking for this trip
    const existingBooking = await Booking.findOne({
        userId,
        tripId,
        status: { $in: ['pending_payment', 'confirmed'] }
    });

    if (existingBooking) {
        return res.status(400).json({
            success: false,
            message: 'You already have a booking for this trip'
        });
    }

    // Create booking with expiration
    const expiresAt = new Date(Date.now() + config.booking.seatHoldMinutes * 60 * 1000);

    const booking = await Booking.create({
        userId,
        tripId,
        seatNumber,
        status: 'pending_payment',
        expiresAt
    });

    // Book the seat on the trip (atomic operation)
    trip.bookSeat(seatNumber);
    await trip.save();

    res.status(201).json({
        success: true,
        message: `Seat ${seatNumber} reserved successfully. Please complete payment within ${config.booking.seatHoldMinutes} minutes.`,
        data: {
            booking: {
                id: booking._id,
                tripId: booking.tripId,
                seatNumber: booking.seatNumber,
                status: booking.status,
                expiresAt: booking.expiresAt
            }
        }
    });
});

// @desc    Confirm booking (simulate payment)
// @route   POST /api/v1/bookings/:bookingId/confirm
// @access  Private
exports.confirmBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { paymentMethod } = req.body; // mpesa, tigopesa, airtel, cash, card
    const userId = req.user.id;

    // Find booking
    const booking = await Booking.findById(bookingId)
        .populate({
            path: 'tripId',
            populate: [
                { path: 'busId', select: 'plateNumber' },
                { path: 'routeId', select: 'from to' }
            ]
        });

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    // Check if booking belongs to the user
    if (booking.userId.toString() !== userId) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to confirm this booking'
        });
    }

    // Check if already confirmed
    if (booking.status === 'confirmed') {
        return res.status(400).json({
            success: false,
            message: 'Booking already confirmed'
        });
    }

    // Check if expired
    if (booking.status === 'expired' || new Date() > booking.expiresAt) {
        booking.status = 'expired';
        await booking.save();

        return res.status(400).json({
            success: false,
            message: 'Booking has expired. Please create a new booking.'
        });
    }

    // Validate payment method
    const validMethods = ['mpesa', 'tigopesa', 'airtel', 'cash', 'card'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid payment method. Valid options: mpesa, tigopesa, airtel, cash, card'
        });
    }

    // Simulate payment processing
    const paymentReference = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const payment = await Payment.create({
        bookingId: booking._id,
        method: paymentMethod,
        reference: paymentReference,
        amount: booking.tripId.price,
        status: 'success' // Simulated success
    });

    // Update booking status and generate ticket number
    booking.status = 'confirmed';
    booking.generateTicketNumber();
    await booking.save();

    // Get user details
    const user = await User.findById(userId);

    // Send confirmation email
    try {
        await emailService.sendTicketConfirmation(user.email, {
            ticketNumber: booking.ticketNumber,
            from: booking.tripId.routeId.from,
            to: booking.tripId.routeId.to,
            seatNumber: booking.seatNumber,
            departureTime: booking.tripId.departureTime,
            price: booking.tripId.price
        });
    } catch (error) {
        console.error('Failed to send confirmation email:', error);
        // Continue even if email fails
    }

    res.status(200).json({
        success: true,
        message: 'Booking confirmed successfully! 🎉',
        data: {
            booking: {
                id: booking._id,
                ticketNumber: booking.ticketNumber,
                seatNumber: booking.seatNumber,
                status: booking.status,
                route: {
                    from: booking.tripId.routeId.from,
                    to: booking.tripId.routeId.to
                },
                departureTime: booking.tripId.departureTime,
                price: booking.tripId.price
            },
            payment: {
                reference: payment.reference,
                method: payment.method,
                amount: payment.amount,
                status: payment.status
            }
        }
    });
});

// @desc    Get user bookings
// @route   GET /api/v1/bookings
// @access  Private
exports.getUserBookings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { status } = req.query;

    const filter = { userId };
    if (status) {
        filter.status = status;
    }

    const bookings = await Booking.find(filter)
        .populate({
            path: 'tripId',
            populate: [
                { path: 'busId', select: 'plateNumber operatorId' },
                { path: 'routeId', select: 'from to' }
            ]
        })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: bookings.length,
        data: {
            bookings: bookings.map(booking => ({
                id: booking._id,
                ticketNumber: booking.ticketNumber,
                seatNumber: booking.seatNumber,
                status: booking.status,
                route: booking.tripId.routeId,
                departureTime: booking.tripId.departureTime,
                price: booking.tripId.price,
                createdAt: booking.createdAt,
                expiresAt: booking.expiresAt
            }))
        }
    });
});

// @desc    Get single booking details
// @route   GET /api/v1/bookings/:bookingId
// @access  Private
exports.getBookingDetails = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId)
        .populate({
            path: 'tripId',
            populate: [
                { path: 'busId', select: 'plateNumber seatCount layout' },
                { path: 'routeId', select: 'from to distanceKm' }
            ]
        });

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    // Check if booking belongs to the user
    if (booking.userId.toString() !== userId) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to view this booking'
        });
    }

    // Get payment details if confirmed
    let paymentDetails = null;
    if (booking.status === 'confirmed') {
        const payment = await Payment.findOne({ bookingId: booking._id });
        if (payment) {
            paymentDetails = {
                method: payment.method,
                reference: payment.reference,
                amount: payment.amount,
                status: payment.status
            };
        }
    }

    res.status(200).json({
        success: true,
        data: {
            booking: {
                id: booking._id,
                ticketNumber: booking.ticketNumber,
                seatNumber: booking.seatNumber,
                status: booking.status,
                trip: {
                    route: booking.tripId.routeId,
                    bus: booking.tripId.busId,
                    departureTime: booking.tripId.departureTime,
                    price: booking.tripId.price
                },
                payment: paymentDetails,
                createdAt: booking.createdAt,
                expiresAt: booking.expiresAt
            }
        }
    });
});

// @desc    Cancel booking
// @route   DELETE /api/v1/bookings/:bookingId
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    // Check if booking belongs to the user
    if (booking.userId.toString() !== userId) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to cancel this booking'
        });
    }

    // Can only cancel pending or confirmed bookings
    if (!['pending_payment', 'confirmed'].includes(booking.status)) {
        return res.status(400).json({
            success: false,
            message: 'This booking cannot be cancelled'
        });
    }

    // Release the seat from the trip
    const trip = await Trip.findById(booking.tripId);
    if (trip) {
        trip.releaseSeat(booking.seatNumber);
        await trip.save();
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: {
            bookingId: booking._id,
            status: booking.status
        }
    });
});
