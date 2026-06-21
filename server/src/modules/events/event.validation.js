const Joi = require('joi');

const ticketTypeSchema = Joi.object({
  name: Joi.string().valid('vip', 'premium', 'general', 'economy').required(),
  price: Joi.number().min(0).required(),
  totalSeats: Joi.number().min(1).required(),
  availableSeats: Joi.number().min(0).required(),
  description: Joi.string().optional(),
  benefits: Joi.array().items(Joi.string()).optional(),
  maxPerBooking: Joi.number().min(1).max(20).default(10),
  saleStartDate: Joi.date().optional(),
  saleEndDate: Joi.date().optional(),
  isActive: Joi.boolean().default(true),
});

const createEventSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'any.required': 'Event title is required',
    'string.min': 'Title must be at least 3 characters',
  }),
  description: Joi.string().min(10).required().messages({
    'any.required': 'Description is required',
  }),
  shortDescription: Joi.string().max(200).optional(),
  category: Joi.string().required().messages({
    'any.required': 'Category is required',
  }),
  venue: Joi.string().required().messages({
    'any.required': 'Venue is required',
  }),
  startDate: Joi.date().greater('now').required().messages({
    'any.required': 'Start date is required',
    'date.greater': 'Start date must be in the future',
  }),
  endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
    'any.required': 'End date is required',
    'date.greater': 'End date must be after start date',
  }),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  ticketTypes: Joi.array().items(ticketTypeSchema).min(1).required().messages({
    'any.required': 'At least one ticket type is required',
  }),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string()
    .valid('draft', 'published')
    .default('draft'),
  isOnline: Joi.boolean().default(false),
  onlineLink: Joi.string().uri().optional(),
  ageRestriction: Joi.number().min(0).default(0),
});

const updateEventSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).optional(),
  shortDescription: Joi.string().max(200).optional(),
  category: Joi.string().optional(),
  venue: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  startTime: Joi.string().optional(),
  endTime: Joi.string().optional(),
  ticketTypes: Joi.array().items(ticketTypeSchema).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string()
    .valid('draft', 'published', 'cancelled', 'postponed')
    .optional(),
  isOnline: Joi.boolean().optional(),
  onlineLink: Joi.string().uri().optional(),
  ageRestriction: Joi.number().min(0).optional(),
});

const eventQuerySchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(50).default(10),
  search: Joi.string().optional(),
  category: Joi.string().optional(),
  status: Joi.string()
    .valid('draft', 'published', 'cancelled', 'completed', 'postponed')
    .optional(),
  city: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().optional(),
  isFeatured: Joi.boolean().optional(),
  sortBy: Joi.string()
    .valid('startDate', 'createdAt', 'title', 'totalBookings')
    .default('startDate'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
};