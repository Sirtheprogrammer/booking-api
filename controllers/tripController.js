const asyncHandler = require('../utils/asyncHandler');
const Trip = require('../models/Trip');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const Operator = require('../models/Operator');

// @desc    Search available trips
// @route   GET /api/v1/trips/search
// @access  Public
exports.searchTrips = asyncHandler(async (req, res) => {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
        return res.status(400).json({
            success: false,
            message: 'Please provide from, to, and date parameters'
        });
    }

    // Normalize inputs (remove extra spaces, convert to uppercase for code matching)
    const fromInput = from.trim();
    const toInput = to.trim();
    const fromUpper = fromInput.toUpperCase();
    const toUpper = toInput.toUpperCase();

    // Create flexible search query - match by code OR name
    const routeQuery = {
        $or: [
            // Exact code match (case-insensitive)
            { fromCode: fromUpper, toCode: toUpper },
            // Partial name match (case-insensitive)
            {
                from: new RegExp(fromInput, 'i'),
                to: new RegExp(toInput, 'i')
            },
            // Handle common abbreviations
            {
                from: new RegExp(fromInput.replace(/^dar$/i, 'dar es salaam'), 'i'),
                to: new RegExp(toInput.replace(/^dar$/i, 'dar es salaam'), 'i')
            }
        ]
    };

    // Find route
    const route = await Route.findOne(routeQuery);

    if (!route) {
        // Get all available routes for helpful error message
        const availableRoutes = await Route.find({})
            .select('from fromCode to toCode')
            .sort({ from: 1 });

        return res.status(404).json({
            success: false,
            message: 'No route found for this journey',
            hint: 'Use location codes (e.g., DSM, ARK) or full names (e.g., Dar Es Salaam, Arusha)',
            data: {
                searchedFrom: fromInput,
                searchedTo: toInput,
                availableRoutes: availableRoutes.map(r => ({
                    from: `${r.from} (${r.fromCode})`,
                    to: `${r.to} (${r.toCode})`
                }))
            }
        });
    }

    // Parse date (start and end of day)
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    // Find trips for this route and date
    const trips = await Trip.find({
        routeId: route._id,
        departureTime: {
            $gte: startOfDay,
            $lte: endOfDay
        },
        status: 'active'
    })
        .populate('busId', 'plateNumber seatCount layout')
        .populate('routeId', 'from fromCode to toCode distanceKm')
        .sort({ departureTime: 1 });

    // Format response with available seats
    const tripsWithAvailability = trips.map(trip => ({
        id: trip._id,
        route: {
            from: trip.routeId.from,
            fromCode: trip.routeId.fromCode,
            to: trip.routeId.to,
            toCode: trip.routeId.toCode,
            distance: trip.routeId.distanceKm
        },
        bus: {
            plateNumber: trip.busId.plateNumber,
            totalSeats: trip.busId.seatCount,
            layout: trip.busId.layout
        },
        departureTime: trip.departureTime,
        price: trip.price,
        availableSeats: trip.busId.seatCount - trip.bookedSeats.length,
        status: trip.status
    }));

    res.status(200).json({
        success: true,
        count: tripsWithAvailability.length,
        data: {
            trips: tripsWithAvailability
        }
    });
});

// @desc    Get seat availability for a trip
// @route   GET /api/v1/trips/:tripId/seats
// @access  Public
exports.getSeatAvailability = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId).populate('busId', 'seatCount layout');

    if (!trip) {
        return res.status(404).json({
            success: false,
            message: 'Trip not found'
        });
    }

    if (trip.status !== 'active') {
        return res.status(400).json({
            success: false,
            message: 'This trip is not active'
        });
    }

    // Generate seat map
    const totalSeats = trip.busId.seatCount;
    const bookedSeats = trip.bookedSeats;
    const availableSeats = [];

    for (let i = 1; i <= totalSeats; i++) {
        availableSeats.push({
            seatNumber: i,
            isAvailable: !bookedSeats.includes(i)
        });
    }

    res.status(200).json({
        success: true,
        data: {
            tripId: trip._id,
            totalSeats,
            bookedCount: bookedSeats.length,
            availableCount: totalSeats - bookedSeats.length,
            layout: trip.busId.layout,
            seats: availableSeats
        }
    });
});

// @desc    Get trip details
// @route   GET /api/v1/trips/:tripId
// @access  Public
exports.getTripDetails = asyncHandler(async (req, res) => {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId)
        .populate('busId', 'plateNumber seatCount layout operatorId')
        .populate('routeId', 'from to distanceKm')
        .populate({
            path: 'busId',
            populate: {
                path: 'operatorId',
                select: 'companyName contactEmail'
            }
        });

    if (!trip) {
        return res.status(404).json({
            success: false,
            message: 'Trip not found'
        });
    }

    res.status(200).json({
        success: true,
        data: {
            trip: {
                id: trip._id,
                route: trip.routeId,
                bus: {
                    plateNumber: trip.busId.plateNumber,
                    seatCount: trip.busId.seatCount,
                    layout: trip.busId.layout,
                    operator: trip.busId.operatorId
                },
                departureTime: trip.departureTime,
                price: trip.price,
                availableSeats: trip.busId.seatCount - trip.bookedSeats.length,
                status: trip.status
            }
        }
    });
});
