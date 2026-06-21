const Event = require('./event.model');
const Venue = require('../venue/venue.model');
const Category = require('../category/category.model');
const ApiError = require('../../shared/utils/ApiError');
const { getPaginatedResponse } = require('../../shared/utils/pagination');

// Create Event
const createEvent = async (organizerId, data) => {
  // Validate venue exists
  const venue = await Venue.findById(data.venue);
  if (!venue) throw ApiError.notFound('Venue not found');

  // Validate category exists
  const category = await Category.findById(data.category);
  if (!category) throw ApiError.notFound('Category not found');

  // Set available seats equal to total seats for new event
  const ticketTypes = data.ticketTypes.map((tt) => ({
    ...tt,
    availableSeats: tt.totalSeats,
  }));

  const event = await Event.create({
    ...data,
    organizer: organizerId,
    ticketTypes,
  });

  return await event.populate(['category', 'venue', 'organizer']);
};

// Get All Events (Public)
const getAllEvents = async (query, { page, limit, skip }) => {
  const filter = { status: 'published' };

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.category) filter.category = query.category;
  if (query.isFeatured) filter.isFeatured = query.isFeatured;

  if (query.startDate || query.endDate) {
    filter.startDate = {};
    if (query.startDate) filter.startDate.$gte = new Date(query.startDate);
    if (query.endDate) filter.startDate.$lte = new Date(query.endDate);
  }

  if (query.minPrice || query.maxPrice) {
    filter['ticketTypes.price'] = {};
    if (query.minPrice) filter['ticketTypes.price'].$gte = Number(query.minPrice);
    if (query.maxPrice) filter['ticketTypes.price'].$lte = Number(query.maxPrice);
  }

  const sortOptions = {};
  sortOptions[query.sortBy || 'startDate'] = query.sortOrder === 'desc' ? -1 : 1;

  const [events, total] = await Promise.all([
    Event.find(filter)
      .populate('category', 'name slug icon')
      .populate('venue', 'name address')
      .populate('organizer', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('-__v'),
    Event.countDocuments(filter),
  ]);

  return getPaginatedResponse(events, total, page, limit);
};

// Get Event By Slug (Public)
const getEventBySlug = async (slug) => {
  const event = await Event.findOne({ slug, status: 'published' })
    .populate('category', 'name slug icon')
    .populate('venue')
    .populate('organizer', 'name email');

  if (!event) throw ApiError.notFound('Event not found');
  return event;
};

// Get Event By ID
const getEventById = async (eventId) => {
  const event = await Event.findById(eventId)
    .populate('category', 'name slug icon')
    .populate('venue')
    .populate('organizer', 'name email');

  if (!event) throw ApiError.notFound('Event not found');
  return event;
};

// Get Organizer Events
const getOrganizerEvents = async (organizerId, query, { page, limit, skip }) => {
  const filter = { organizer: organizerId };
  if (query.status) filter.status = query.status;

  const [events, total] = await Promise.all([
    Event.find(filter)
      .populate('category', 'name slug')
      .populate('venue', 'name address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Event.countDocuments(filter),
  ]);

  return getPaginatedResponse(events, total, page, limit);
};

// Update Event
const updateEvent = async (eventId, organizerId, data, role) => {
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Event not found');

  // Only organizer who created or superadmin can update
  if (
    role !== 'superadmin' &&
    event.organizer.toString() !== organizerId.toString()
  ) {
    throw ApiError.forbidden('Not authorized to update this event');
  }

  // Cannot update cancelled event
  if (event.status === 'cancelled') {
    throw ApiError.badRequest('Cannot update a cancelled event');
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { ...data },
    { new: true, runValidators: true }
  ).populate(['category', 'venue', 'organizer']);

  return updatedEvent;
};

// Publish Event
const publishEvent = async (eventId, organizerId, role) => {
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Event not found');

  if (
    role !== 'superadmin' &&
    event.organizer.toString() !== organizerId.toString()
  ) {
    throw ApiError.forbidden('Not authorized to publish this event');
  }

  if (event.status === 'published') {
    throw ApiError.badRequest('Event is already published');
  }

  // Validate event has ticket types
  if (!event.ticketTypes || event.ticketTypes.length === 0) {
    throw ApiError.badRequest('Event must have at least one ticket type');
  }

  event.status = 'published';
  await event.save();
  return event;
};

// Cancel Event
const cancelEvent = async (eventId, organizerId, reason, role) => {
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Event not found');

  if (
    role !== 'superadmin' &&
    event.organizer.toString() !== organizerId.toString()
  ) {
    throw ApiError.forbidden('Not authorized to cancel this event');
  }

  if (event.status === 'cancelled') {
    throw ApiError.badRequest('Event is already cancelled');
  }

  event.status = 'cancelled';
  event.cancelledAt = new Date();
  event.cancelReason = reason;
  await event.save();
  return event;
};

// Delete Event (Only Draft)
const deleteEvent = async (eventId, organizerId, role) => {
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Event not found');

  if (
    role !== 'superadmin' &&
    event.organizer.toString() !== organizerId.toString()
  ) {
    throw ApiError.forbidden('Not authorized to delete this event');
  }

  if (event.status !== 'draft') {
    throw ApiError.badRequest('Only draft events can be deleted');
  }

  await Event.findByIdAndDelete(eventId);
  return { message: 'Event deleted successfully' };
};

// Toggle Featured
const toggleFeatured = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Event not found');

  event.isFeatured = !event.isFeatured;
  await event.save();
  return event;
};

// Get Featured Events
const getFeaturedEvents = async () => {
  return Event.find({ isFeatured: true, status: 'published' })
    .populate('category', 'name slug icon')
    .populate('venue', 'name address')
    .limit(6)
    .sort({ startDate: 1 });
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventBySlug,
  getEventById,
  getOrganizerEvents,
  updateEvent,
  publishEvent,
  cancelEvent,
  deleteEvent,
  toggleFeatured,
  getFeaturedEvents,
};