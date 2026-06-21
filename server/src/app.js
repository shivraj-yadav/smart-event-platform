const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { errorMiddleware, notFoundMiddleware } = require('./shared/middleware/error.middleware');
const { generalLimiter } = require('./shared/middleware/rateLimit.middleware');
const logger = require('./shared/utils/logger');

// Route imports (will add as we build modules)
// const authRoutes = require('./modules/auth/auth.routes');
// const eventRoutes = require('./modules/events/event.routes');

const app = express();

// ========================
// Security Middleware
// ========================
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ========================
// General Middleware
// ========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// ========================
// Rate Limiting
// ========================
app.use('/api', generalLimiter);

// ========================
// Health Check Route
// ========================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Smart Event Platform API is Running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// ========================
// API Routes (v1)
// ========================
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
// app.use('/api/v1/events', eventRoutes);
// app.use('/api/v1/bookings', bookingRoutes);
// app.use('/api/v1/payments', paymentRoutes);
// app.use('/api/v1/tickets', ticketRoutes);
// app.use('/api/v1/notifications', notificationRoutes);
// app.use('/api/v1/analytics', analyticsRoutes);

// ========================
// Error Handling
// ========================
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;