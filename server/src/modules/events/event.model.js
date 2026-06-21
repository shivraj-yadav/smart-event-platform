const mongoose = require('mongoose');

// Ticket Type Schema
const ticketTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['vip', 'premium', 'general', 'economy'],
  },
  price: { type: Number, required: true, min: 0 },
  totalSeats: { type: Number, required: true, min: 1 },
  availableSeats: { type: Number, required: true, min: 0 },
  description: { type: String },
  benefits: [String],
  maxPerBooking: { type: Number, default: 10 },
  saleStartDate: { type: Date },
  saleEndDate: { type: Date },
  isActive: { type: Boolean, default: true },
});

// Event Schema
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    shortDescription: {
      type: String,
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Event start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Event end date is required'],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    ticketTypes: [ticketTypeSchema],
    images: {
      banner: { type: String, default: null },
      thumbnail: { type: String, default: null },
      gallery: [String],
    },
    tags: [String],
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed', 'postponed'],
      default: 'draft',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    onlineLink: {
      type: String,
      default: null,
    },
    ageRestriction: {
      type: Number,
      default: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ========================
// Virtuals
// ========================
eventSchema.virtual('totalSeats').get(function () {
  return this.ticketTypes.reduce((sum, t) => sum + t.totalSeats, 0);
});

eventSchema.virtual('totalAvailableSeats').get(function () {
  return this.ticketTypes.reduce((sum, t) => sum + t.availableSeats, 0);
});

eventSchema.virtual('isSoldOut').get(function () {
  return this.ticketTypes.every((t) => t.availableSeats === 0);
});

// ========================
// Indexes
// ========================
eventSchema.index({ slug: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ isFeatured: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

// ========================
// Auto slug generation
// ========================
eventSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .concat('-', Date.now());
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;