const asyncHandler = require('../../shared/utils/asyncHandler');
const ApiResponse = require('../../shared/utils/ApiResponse');
const eventService = require('./event.service');
const { getPagination } = require('../../shared/utils/pagination');

const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.user._id, req.body);
  return ApiResponse.created(res, event, 'Event created successfully');
});

const getAllEvents = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const result = await eventService.getAllEvents(req.query, pagination);
  return ApiResponse.success(res, result, 'Events fetched successfully');
});

const getEventBySlug = asyncHandler(async (req, res) => {
  const event = await eventService.getEventBySlug(req.params.slug);
  return ApiResponse.success(res, event, 'Event fetched successfully');
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  return ApiResponse.success(res, event, 'Event fetched successfully');
});

const getMyEvents = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const result = await eventService.getOrganizerEvents(
    req.user._id,
    req.query,
    pagination
  );
  return ApiResponse.success(res, result, 'Your events fetched successfully');
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(
    req.params.id,
    req.user._id,
    req.body,
    req.user.role
  );
  return ApiResponse.success(res, event, 'Event updated successfully');
});

const publishEvent = asyncHandler(async (req, res) => {
  const event = await eventService.publishEvent(
    req.params.id,
    req.user._id,
    req.user.role
  );
  return ApiResponse.success(res, event, 'Event published successfully');
});

const cancelEvent = asyncHandler(async (req, res) => {
  const event = await eventService.cancelEvent(
    req.params.id,
    req.user._id,
    req.body.reason,
    req.user.role
  );
  return ApiResponse.success(res, event, 'Event cancelled successfully');
});

const deleteEvent = asyncHandler(async (req, res) => {
  const result = await eventService.deleteEvent(
    req.params.id,
    req.user._id,
    req.user.role
  );
  return ApiResponse.success(res, result, 'Event deleted successfully');
});

const toggleFeatured = asyncHandler(async (req, res) => {
  const event = await eventService.toggleFeatured(req.params.id);
  return ApiResponse.success(res, event, 'Event featured status updated');
});

const getFeaturedEvents = asyncHandler(async (req, res) => {
  const events = await eventService.getFeaturedEvents();
  return ApiResponse.success(res, events, 'Featured events fetched');
});

module.exports = {
  createEvent,
  getAllEvents,
  getEventBySlug,
  getEventById,
  getMyEvents,
  updateEvent,
  publishEvent,
  cancelEvent,
  deleteEvent,
  toggleFeatured,
  getFeaturedEvents,
};