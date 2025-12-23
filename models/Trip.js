const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true
    },
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    },
    departureTime: {
        type: Date,
        required: [true, 'Departure time is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    bookedSeats: [{
        type: Number
    }],
    status: {
        type: String,
        enum: ['active', 'cancelled', 'completed'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for searching trips by route and date
tripSchema.index({ routeId: 1, departureTime: 1, status: 1 });

// Method to check seat availability
tripSchema.methods.isSeatAvailable = function (seatNumber) {
    return !this.bookedSeats.includes(seatNumber);
};

// Method to book a seat
tripSchema.methods.bookSeat = function (seatNumber) {
    if (!this.bookedSeats.includes(seatNumber)) {
        this.bookedSeats.push(seatNumber);
    }
};

// Method to release a seat
tripSchema.methods.releaseSeat = function (seatNumber) {
    this.bookedSeats = this.bookedSeats.filter(seat => seat !== seatNumber);
};

module.exports = mongoose.model('Trip', tripSchema);
