const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { errorMiddleware, notFoundMiddleware } = require('./shared/middleware/error.middleware');
const { generalLimiter } = require('./shared/middleware/rateLimit.middleware');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate Limiting
app.use('/api', generalLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Smart Event Platform API is Running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '2.0.0',
  });
});

// ========================
// API Routes v1
// ========================
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/events', require('./modules/events/event.routes'));
app.use('/api/v1/venues', require('./modules/venue/venue.routes'));
app.use('/api/v1/categories', require('./modules/category/category.routes'));

// Error Handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;