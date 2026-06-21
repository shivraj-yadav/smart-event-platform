const Venue = require('./venue.model');
const ApiError = require('../../shared/utils/ApiError');
const { getPaginatedResponse } = require('../../shared/utils/pagination');

const createVenue = async (userId, data) => {
  const venue = await Venue.create({ ...data, createdBy: userId });
  return venue;
};

const getAllVenues = async (query, { page, limit, skip }) => {
  const filter = { isActive: true };

  if (query.city) {
    filter['address.city'] = { $regex: query.city, $options: 'i' };
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { 'address.city': { $regex: query.search, $options: 'i' } },
    ];
  }

  const [venues, total] = await Promise.all([
    Venue.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Venue.countDocuments(filter),
  ]);

  return getPaginatedResponse(venues, total, page, limit);
};

const getVenueById = async (venueId) => {
  const venue = await Venue.findById(venueId).populate('createdBy', 'name email');
  if (!venue) throw ApiError.notFound('Venue not found');
  return venue;
};

const updateVenue = async (venueId, userId, data, role) => {
  const venue = await Venue.findById(venueId);
  if (!venue) throw ApiError.notFound('Venue not found');

  if (role !== 'superadmin' && venue.createdBy.toString() !== userId.toString()) {
    throw ApiError.forbidden('Not authorized to update this venue');
  }

  return Venue.findByIdAndUpdate(venueId, { ...data }, { new: true, runValidators: true });
};

const deleteVenue = async (venueId, userId, role) => {
  const venue = await Venue.findById(venueId);
  if (!venue) throw ApiError.notFound('Venue not found');

  if (role !== 'superadmin' && venue.createdBy.toString() !== userId.toString()) {
    throw ApiError.forbidden('Not authorized to delete this venue');
  }

  venue.isActive = false;
  await venue.save();
};

module.exports = { createVenue, getAllVenues, getVenueById, updateVenue, deleteVenue };