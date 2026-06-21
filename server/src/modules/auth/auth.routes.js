const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authLimiter } = require('../../shared/middleware/rateLimit.middleware');

// Public Routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Protected Routes (will add auth middleware in Phase 2)
router.get('/me', authController.getMe);

module.exports = router;