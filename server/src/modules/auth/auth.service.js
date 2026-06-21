const jwt = require('jsonwebtoken');
const User = require('./auth.model');
const ApiError = require('../../shared/utils/ApiError');
const { getPaginatedResponse } = require('../../shared/utils/pagination');

// Generate Tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
  return { accessToken, refreshToken };
};

// Format user response
const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  avatar: user.avatar,
  isEmailVerified: user.isEmailVerified,
  isActive: user.isActive,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
});

// Register
const register = async ({ name, email, password, role, phone }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  if (role === 'superadmin') {
    throw ApiError.forbidden('Cannot create superadmin via registration');
  }

  const user = await User.create({ name, email, password, role, phone });
  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user: formatUser(user), accessToken, refreshToken };
};

// Login
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated');
  }

  user.lastLogin = new Date();
  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user: formatUser(user), accessToken, refreshToken };
};

// Refresh Token
const refreshToken = async (token) => {
  if (!token) throw ApiError.unauthorized('Refresh token required');

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
};

// Logout
const logout = async (token) => {
  if (!token) return;
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
  } catch (error) {
    // Token invalid, just ignore
  }
};

// Get Me
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return formatUser(user);
};

// Update Profile
const updateProfile = async (userId, data) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { ...data },
    { new: true, runValidators: true }
  );
  if (!user) throw ApiError.notFound('User not found');
  return formatUser(user);
};

// Change Password
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

  user.password = newPassword;
  await user.save();
};

// Get All Users (Admin)
const getAllUsers = async (query, { page, limit, skip }) => {
  const filter = {};

  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return getPaginatedResponse(users.map(formatUser), total, page, limit);
};

// Toggle User Status
const toggleUserStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (user.role === 'superadmin') {
    throw ApiError.forbidden('Cannot deactivate superadmin');
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  return formatUser(user);
};

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