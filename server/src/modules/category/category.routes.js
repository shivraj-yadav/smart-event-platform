const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const { protect } = require('../../shared/middleware/auth.middleware');
const { authorize } = require('../../shared/middleware/role.middleware');

// Public
router.get('/', categoryController.getAllCategories);

// Admin Only
router.post('/', protect, authorize('superadmin'), categoryController.createCategory);
router.put('/:id', protect, authorize('superadmin'), categoryController.updateCategory);
router.delete('/:id', protect, authorize('superadmin'), categoryController.deleteCategory);

module.exports = router;