const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    operatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Operator',
        required: true
    },
    plateNumber: {
        type: String,
        required: [true, 'Plate number is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    seatCount: {
        type: Number,
        required: [true, 'Seat count is required'],
        min: 1
    },
    layout: {
        type: String,
        enum: ['2x2', '2x3', '1x2'],
        default: '2x2'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bus', busSchema);
