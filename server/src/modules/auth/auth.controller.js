const asyncHandler = require('../../shared/utils/asyncHandler');
const ApiResponse = require('../../shared/utils/ApiResponse');
const authService = require('./auth.service');
const { getPagination } = require('../../shared/utils/pagination');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return ApiResponse.created(res, result, 'User registered successfully');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return ApiResponse.success(res, result, 'Login successful');
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshToken(refreshToken);
  return ApiResponse.success(res, result, 'Token refreshed successfully');
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  return ApiResponse.success(res, null, 'Logged out successfully');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  return ApiResponse.success(res, user, 'User profile fetched');
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  return ApiResponse.success(res, user, 'Profile updated successfully');
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, currentPassword, newPassword);
  return ApiResponse.success(res, null, 'Password changed successfully');
});

const getAllUsers = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const result = await authService.getAllUsers(req.query, pagination);
  return ApiResponse.success(res, result, 'Users fetched successfully');
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await authService.toggleUserStatus(req.params.id);
  return ApiResponse.success(res, user, 'User status updated successfully');
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  toggleUserStatus,
};