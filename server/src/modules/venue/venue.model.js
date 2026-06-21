const mongoose = require('mongoose');

// Seat Schema
const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  row: { type: String, required: true },
  column: { type: Number, required: true },
  category: {
    type: String,
    enum: ['vip', 'premium', 'general', 'economy'],
    default: 'general',
  },
  isActive: { type: Boolean, default: true },
});

// Section Schema
const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  seats: [seatSchema],
});

// Venue Schema
const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Venue name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    totalCapacity: {
      type: Number,
      required: true,
    },
    sections: [sectionSchema],
    amenities: [String],
    images: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Geospatial index
venueSchema.index({ location: '2dsphere' });
venueSchema.index({ 'address.city': 1 });
venueSchema.index({ createdBy: 1 });

const Venue = mongoose.model('Venue', venueSchema);
module.exports = Venue;