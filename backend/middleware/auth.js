const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/response');

// Enhanced auth middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json(error('Access token required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json(error('User not found'));
    if (!user.isActive) return res.status(401).json(error('Account is deactivated'));
    if (user.isLocked) return res.status(401).json(error('Account temporarily locked'));

    user.ensureDefaultPermissions();

    req.user = {
      userId: user._id,
      role: user.role,
      permissions: user.permissions,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return res.status(403).json(error('Invalid token'));
    if (err.name === 'TokenExpiredError') return res.status(403).json(error('Token has expired'));
    return res.status(500).json(error('Authentication error'));
  }
};

// Role-based access
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json(error('Authentication required'));
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json(error('Insufficient permissions - role required: ' + allowedRoles.join(' or ')));
    next();
  };
};

// Permission-based access
const requirePermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json(error('Authentication required'));
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    const hasPermission = requiredPermissions.some(p => req.user.permissions.includes(p));
    if (!hasPermission) return res.status(403).json(error('Insufficient permissions - required: ' + requiredPermissions.join(' or ')));
    next();
  };
};

// Check all permissions
const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json(error('Authentication required'));
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    const hasAllPermissions = requiredPermissions.every(p => req.user.permissions.includes(p));
    if (!hasAllPermissions) {
      const missing = requiredPermissions.filter(p => !req.user.permissions.includes(p));
      return res.status(403).json(error('Missing required permissions: ' + missing.join(', ')));
    }
    next();
  };
};

// Self or admin access
const requireSelfOrAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json(error('Authentication required'));
  const targetUserId = req.params.userId || req.params.id;
  if (req.user.userId.toString() === targetUserId || req.user.role === 'admin') return next();
  return res.status(403).json(error('You can only access your own resources'));
};

// Convenience
const adminOnly = requireRole('admin');
const moderatorOrAdmin = requireRole(['moderator', 'admin']);
const canManageUsers = requirePermission('manage_users');

module.exports = auth; // default
module.exports.requireRole = requireRole;
module.exports.requirePermission = requirePermission;
module.exports.requireAllPermissions = requireAllPermissions;
module.exports.requireSelfOrAdmin = requireSelfOrAdmin;
module.exports.adminOnly = adminOnly;
module.exports.moderatorOrAdmin = moderatorOrAdmin;
module.exports.canManageUsers = canManageUsers;
