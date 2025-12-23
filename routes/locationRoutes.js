const express = require('express');
const { getLocations } = require('../controllers/locationController');

const router = express.Router();

// Public route
router.get('/', getLocations);

module.exports = router;
