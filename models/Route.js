const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    from: {
        type: String,
        required: [true, 'Starting point is required'],
        trim: true
    },
    fromCode: {
        type: String,
        required: [true, 'Starting point code is required'],
        uppercase: true,
        trim: true,
        index: true
    },
    to: {
        type: String,
        required: [true, 'Destination is required'],
        trim: true
    },
    toCode: {
        type: String,
        required: [true, 'Destination code is required'],
        uppercase: true,
        trim: true,
        index: true
    },
    distanceKm: {
        type: Number,
        required: [true, 'Distance is required'],
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create compound indexes for route lookup
routeSchema.index({ fromCode: 1, toCode: 1 });
routeSchema.index({ from: 1, to: 1 });

module.exports = mongoose.model('Route', routeSchema);
