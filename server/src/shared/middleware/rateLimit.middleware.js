const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP',
  handler: (req, res) => {
    res.status(429).json(
      ApiError.tooManyRequests('Too many requests. Please try again later.')
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many auth attempts',
  handler: (req, res) => {
    res.status(429).json(
      ApiError.tooManyRequests('Too many login attempts. Try after 15 minutes.')
    );
  },
});

// Booking rate limiter
const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many booking attempts',
  handler: (req, res) => {
    res.status(429).json(
      ApiError.tooManyRequests('Too many booking attempts. Slow down!')
    );
  },
});

module.exports = { generalLimiter, authLimiter, bookingLimiter };