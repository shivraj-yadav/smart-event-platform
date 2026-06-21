const asyncHandler = require('../../shared/utils/asyncHandler');
const ApiResponse = require('../../shared/utils/ApiResponse');
const venueService = require('./venue.service');
const { getPagination } = require('../../shared/utils/pagination');

const createVenue = asyncHandler(async (req, res) => {
  const venue = await venueService.createVenue(req.user._id, req.body);
  return ApiResponse.created(res, venue, 'Venue created successfully');
});

const getAllVenues = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const result = await venueService.getAllVenues(req.query, pagination);
  return ApiResponse.success(res, result, 'Venues fetched successfully');
});

const getVenueById = asyncHandler(async (req, res) => {
  const venue = await venueService.getVenueById(req.params.id);
  return ApiResponse.success(res, venue, 'Venue fetched successfully');
});

const updateVenue = asyncHandler(async (req, res) => {
  const venue = await venueService.updateVenue(
    req.params.id,
    req.user._id,
    req.body,
    req.user.role
  );
  return ApiResponse.success(res, venue, 'Venue updated successfully');
});

const deleteVenue = asyncHandler(async (req, res) => {
  await venueService.deleteVenue(req.params.id, req.user._id, req.user.role);
  return ApiResponse.success(res, null, 'Venue deleted successfully');
});

module.exports = {
  createVenue,
  getAllVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
};