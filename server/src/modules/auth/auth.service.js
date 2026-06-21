const jwt = require('jsonwebtoken');
const User = require('./auth.model');
const ApiError = require('../../shared/utils/ApiError');

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

// Register
const register = async ({ name, email, password, role, phone }) => {
  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  // Prevent creating superadmin via API
  if (role === 'superadmin') {
    throw ApiError.forbidden('Cannot create superadmin via registration');
  }

  // Create user
  const user = await User.create({ name, email, password, role, phone });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
    refreshToken,
  };
};

// Login
const login = async ({ email, password }) => {
  // Find user with password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check if active
  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated');
  }

  // Update last login
  user.lastLogin = new Date();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
    },
    accessToken,
    refreshToken,
  };
};

// Refresh Token
const refreshToken = async (token) => {
  if (!token) {
    throw ApiError.unauthorized('Refresh token required');
  }

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
const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

module.exports = { register, login, refreshToken, logout };