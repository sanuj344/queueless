const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/errors');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Unauthorized: No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Bind decoded user to request
    next();
  } catch (error) {
    next(new ApiError(401, 'Unauthorized: Invalid or expired token'));
  }
};

const isVendor = (req, res, next) => {
  if (!req.user || req.user.role !== 'vendor') {
    return next(new ApiError(403, 'Forbidden: Vendor access required'));
  }
  next();
};

module.exports = { verifyToken, isVendor };
