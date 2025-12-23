// This file contains sample data to seed the database for testing
// Run this script with: node utils/seedData.js

const mongoose = require('mongoose');
const config = require('../config');
const Operator = require('../models/Operator');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Trip = require('../models/Trip');

const seedData = async () => {
    try {
        // Connect to database
        await mongoose.connect(config.mongodb.uri);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Operator.deleteMany({});
        await Bus.deleteMany({});
        await Route.deleteMany({});
        await Trip.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create operators
        const operators = await Operator.create([
            {
                companyName: 'ABC Coach',
                contactEmail: 'ops@abccoach.co.tz',
                contactPhone: '255712345678',
                approved: true
            },
            {
                companyName: 'Kilimanjaro Express',
                contactEmail: 'info@kiliexpress.co.tz',
                contactPhone: '255723456789',
                approved: true
            },
            {
                companyName: 'Dar Express',
                contactEmail: 'support@darexpress.co.tz',
                contactPhone: '255734567890',
                approved: true
            }
        ]);
        console.log('✅ Created operators');

        // Create buses
        const buses = await Bus.create([
            {
                operatorId: operators[0]._id,
                plateNumber: 'T123ABC',
                seatCount: 45,
                layout: '2x2'
            },
            {
                operatorId: operators[0]._id,
                plateNumber: 'T456DEF',
                seatCount: 50,
                layout: '2x2'
            },
            {
                operatorId: operators[1]._id,
                plateNumber: 'T789GHI',
                seatCount: 40,
                layout: '2x3'
            },
            {
                operatorId: operators[2]._id,
                plateNumber: 'T321JKL',
                seatCount: 45,
                layout: '2x2'
            }
        ]);
        console.log('✅ Created buses');

        // Create routes with location codes
        const routes = await Route.create([
            {
                from: 'Dar Es Salaam',
                fromCode: 'DSM',
                to: 'Morogoro',
                toCode: 'MRO',
                distanceKm: 200
            },
            {
                from: 'Dar Es Salaam',
                fromCode: 'DSM',
                to: 'Moshi',
                toCode: 'MSH',
                distanceKm: 560
            },
            {
                from: 'Dar Es Salaam',
                fromCode: 'DSM',
                to: 'Arusha',
                toCode: 'ARK',
                distanceKm: 650
            },
            {
                from: 'Dar Es Salaam',
                fromCode: 'DSM',
                to: 'Dodoma',
                toCode: 'DOD',
                distanceKm: 450
            },
            {
                from: 'Morogoro',
                fromCode: 'MRO',
                to: 'Arusha',
                toCode: 'ARK',
                distanceKm: 500
            },
            {
                from: 'Turiani',
                fromCode: 'TUR',
                to: 'Dar Es Salaam',
                toCode: 'DSM',
                distanceKm: 150
            }
        ]);
        console.log('✅ Created routes');

        // Create trips for the next 7 days
        const trips = [];
        const today = new Date();

        for (let day = 0; day < 7; day++) {
            const tripDate = new Date(today);
            tripDate.setDate(today.getDate() + day);

            // Dar Es Salaam to Morogoro (short route - multiple trips)
            trips.push({
                busId: buses[0]._id,
                routeId: routes[0]._id,
                departureTime: new Date(tripDate.setHours(6, 0, 0, 0)),
                price: 15000,
                bookedSeats: [],
                status: 'active'
            });

            trips.push({
                busId: buses[1]._id,
                routeId: routes[0]._id,
                departureTime: new Date(tripDate.setHours(14, 0, 0, 0)),
                price: 15000,
                bookedSeats: [],
                status: 'active'
            });

            // Dar Es Salaam to Moshi
            trips.push({
                busId: buses[2]._id,
                routeId: routes[1]._id,
                departureTime: new Date(tripDate.setHours(7, 30, 0, 0)),
                price: 32000,
                bookedSeats: [],
                status: 'active'
            });

            // Dar Es Salaam to Arusha
            trips.push({
                busId: buses[0]._id,
                routeId: routes[2]._id,
                departureTime: new Date(tripDate.setHours(8, 0, 0, 0)),
                price: 35000,
                bookedSeats: [],
                status: 'active'
            });

            trips.push({
                busId: buses[3]._id,
                routeId: routes[2]._id,
                departureTime: new Date(tripDate.setHours(15, 0, 0, 0)),
                price: 35000,
                bookedSeats: [],
                status: 'active'
            });

            // Dar Es Salaam to Dodoma
            trips.push({
                busId: buses[1]._id,
                routeId: routes[3]._id,
                departureTime: new Date(tripDate.setHours(9, 0, 0, 0)),
                price: 25000,
                bookedSeats: [],
                status: 'active'
            });

            // Morogoro to Arusha
            trips.push({
                busId: buses[2]._id,
                routeId: routes[4]._id,
                departureTime: new Date(tripDate.setHours(10, 0, 0, 0)),
                price: 28000,
                bookedSeats: [],
                status: 'active'
            });

            // Turiani to Dar Es Salaam
            trips.push({
                busId: buses[3]._id,
                routeId: routes[5]._id,
                departureTime: new Date(tripDate.setHours(11, 30, 0, 0)),
                price: 12000,
                bookedSeats: [],
                status: 'active'
            });
        }

        await Trip.create(trips);
        console.log(`✅ Created ${trips.length} trips`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\nSample Data Summary:');
        console.log(`- ${operators.length} operators`);
        console.log(`- ${buses.length} buses`);
        console.log(`- ${routes.length} routes`);
        console.log(`- ${trips.length} trips`);

        console.log('\n📍 Available Routes:');
        routes.forEach(route => {
            console.log(`   ${route.from} → ${route.to} (${route.distanceKm} km)`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
