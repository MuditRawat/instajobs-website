/**
 * Admin Authorization Middleware
 * Enforces that the server-side authenticated user (from unifiedAuthMiddleware)
 * possesses the 'admin' role.
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication is required to access admin resources.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'ADMIN_ACCESS_REQUIRED',
      message: 'Admin access is required to access this resource.'
    });
  }

  return next();
};

module.exports = adminMiddleware;
