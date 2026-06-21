const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { protect } = require('../../shared/middleware/auth.middleware');
const { authorize } = require('../../shared/middleware/role.middleware');
const { validate } = require('../../shared/middleware/validate.middleware');
const { authLimiter } = require('../../shared/middleware/rateLimit.middleware');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  updateProfileSchema,
} = require('./auth.validation');

// ========================
// Public Routes
// ========================
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);

// ========================
// Protected Routes
// ========================
router.get('/me', protect, authController.getMe);
router.put('/update-profile', protect, validate(updateProfileSchema), authController.updateProfile);
router.put('/change-password', protect, validate(changePasswordSchema), authController.changePassword);

// ========================
// Admin Routes
// ========================
router.get('/users', protect, authorize('superadmin'), authController.getAllUsers);
router.put('/users/:id/toggle-status', protect, authorize('superadmin'), authController.toggleUserStatus);

module.exports = router;