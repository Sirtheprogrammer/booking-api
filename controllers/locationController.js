const asyncHandler = require('../utils/asyncHandler');
const Route = require('../models/Route');

// @desc    Get all available locations/routes
// @route   GET /api/v1/locations
// @access  Public
exports.getLocations = asyncHandler(async (req, res) => {
    // Get all unique locations from routes
    const routes = await Route.find({}).select('from fromCode to toCode');

    // Create a map of unique locations
    const locationsMap = new Map();

    routes.forEach(route => {
        // Add 'from' location
        if (!locationsMap.has(route.fromCode)) {
            locationsMap.set(route.fromCode, {
                name: route.from,
                code: route.fromCode
            });
        }

        // Add 'to' location
        if (!locationsMap.has(route.toCode)) {
            locationsMap.set(route.toCode, {
                name: route.to,
                code: route.toCode
            });
        }
    });

    // Convert map to array and sort by name
    const locations = Array.from(locationsMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    // Get all available routes
    const availableRoutes = routes.map(route => ({
        from: route.from,
        fromCode: route.fromCode,
        to: route.to,
        toCode: route.toCode,
        routeString: `${route.from} (${route.fromCode}) → ${route.to} (${route.toCode})`
    }));

    res.status(200).json({
        success: true,
        data: {
            locations,
            routes: availableRoutes,
            totalLocations: locations.length,
            totalRoutes: routes.length
        }
    });
});
