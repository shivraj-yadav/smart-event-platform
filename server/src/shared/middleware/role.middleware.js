const ApiError = require('../utils/ApiError');

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Please login to access this resource.');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

// Check if user is owner or admin
const authorizeOwnerOrAdmin = (resourceUserIdField = 'createdBy') => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Please login to access this resource.');
    }

    const isAdmin = req.user.role === 'superadmin';
    const isOwner =
      req.resource &&
      req.resource[resourceUserIdField]?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      throw ApiError.forbidden('You are not authorized to perform this action.');
    }

    next();
  };
};

module.exports = { authorize, authorizeOwnerOrAdmin };