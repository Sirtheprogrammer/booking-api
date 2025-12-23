const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    seatNumber: {
        type: Number,
        required: [true, 'Seat number is required'],
        min: 1
    },
    status: {
        type: String,
        enum: ['pending_payment', 'confirmed', 'cancelled', 'expired'],
        default: 'pending_payment'
    },
    expiresAt: {
        type: Date,
        required: true
    },
    ticketNumber: {
        type: String,
        unique: true,
        sparse: true // Only confirmed bookings get ticket numbers
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for finding bookings by user and trip
bookingSchema.index({ userId: 1, tripId: 1 });
bookingSchema.index({ expiresAt: 1 }); // For cleanup of expired bookings

// Pre-save hook to set expiration time
bookingSchema.pre('save', function () {
    if (this.isNew && !this.expiresAt) {
        this.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }
});

// Generate ticket number
bookingSchema.methods.generateTicketNumber = function () {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.ticketNumber = `BUS-${year}-${random}`;
    return this.ticketNumber;
};

module.exports = mongoose.model('Booking', bookingSchema);
