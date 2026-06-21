const asyncHandler = require('../../shared/utils/asyncHandler');
const ApiResponse = require('../../shared/utils/ApiResponse');
const Category = require('./category.model');
const ApiError = require('../../shared/utils/ApiError');

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({ ...req.body, createdBy: req.user._id });
  return ApiResponse.created(res, category, 'Category created successfully');
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  return ApiResponse.success(res, categories, 'Categories fetched successfully');
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!category) throw ApiError.notFound('Category not found');
  return ApiResponse.success(res, category, 'Category updated successfully');
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!category) throw ApiError.notFound('Category not found');
  return ApiResponse.success(res, null, 'Category deleted successfully');
});

module.exports = { createCategory, getAllCategories, updateCategory, deleteCategory };