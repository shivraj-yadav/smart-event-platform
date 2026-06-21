const asyncHandler = require('../../shared/utils/asyncHandler');
const ApiResponse = require('../../shared/utils/ApiResponse');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const result = await authService.register({ name, email, password, role, phone });
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
  return ApiResponse.success(res, result, 'Token refreshed');
});

const logout = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  await authService.logout(userId);
  return ApiResponse.success(res, null, 'Logged out successfully');
});

const getMe = asyncHandler(async (req, res) => {
  // Will implement with auth middleware in Phase 2
  return ApiResponse.success(res, null, 'Get me route working');
});

module.exports = { register, login, refreshToken, logout, getMe };