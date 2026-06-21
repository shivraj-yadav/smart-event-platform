const express = require('express');
const router = express.Router();
const venueController = require('./venue.controller');
const { protect } = require('../../shared/middleware/auth.middleware');
const { authorize } = require('../../shared/middleware/role.middleware');

// Public Routes
router.get('/', venueController.getAllVenues);
router.get('/:id', venueController.getVenueById);

// Protected Routes
router.post('/', protect, authorize('organizer', 'superadmin'), venueController.createVenue);
router.put('/:id', protect, authorize('organizer', 'superadmin'), venueController.updateVenue);
router.delete('/:id', protect, authorize('organizer', 'superadmin'), venueController.deleteVenue);

module.exports = router;