const express = require('express');
const router = express.Router();
const eventController = require('./event.controller');
const { protect } = require('../../shared/middleware/auth.middleware');
const { authorize } = require('../../shared/middleware/role.middleware');
const { validate, validateQuery } = require('../../shared/middleware/validate.middleware');
const {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
} = require('./event.validation');

// ========================
// Public Routes
// ========================
router.get('/', validateQuery(eventQuerySchema), eventController.getAllEvents);
router.get('/featured', eventController.getFeaturedEvents);
router.get('/slug/:slug', eventController.getEventBySlug);
router.get('/:id', eventController.getEventById);

// ========================
// Organizer Routes
// ========================
router.post(
  '/',
  protect,
  authorize('organizer', 'superadmin'),
  validate(createEventSchema),
  eventController.createEvent
);

router.get(
  '/organizer/my-events',
  protect,
  authorize('organizer', 'superadmin'),
  eventController.getMyEvents
);

router.put(
  '/:id',
  protect,
  authorize('organizer', 'superadmin'),
  validate(updateEventSchema),
  eventController.updateEvent
);

router.patch(
  '/:id/publish',
  protect,
  authorize('organizer', 'superadmin'),
  eventController.publishEvent
);

router.patch(
  '/:id/cancel',
  protect,
  authorize('organizer', 'superadmin'),
  eventController.cancelEvent
);

router.delete(
  '/:id',
  protect,
  authorize('organizer', 'superadmin'),
  eventController.deleteEvent
);

// ========================
// Admin Only Routes
// ========================
router.patch(
  '/:id/featured',
  protect,
  authorize('superadmin'),
  eventController.toggleFeatured
);

module.exports = router;