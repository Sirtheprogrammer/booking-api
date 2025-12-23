const express = require('express');
const {
    searchTrips,
    getSeatAvailability,
    getTripDetails
} = require('../controllers/tripController');

const router = express.Router();

// Public routes
router.get('/search', searchTrips);
router.get('/:tripId', getTripDetails);
router.get('/:tripId/seats', getSeatAvailability);

module.exports = router;
