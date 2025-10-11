const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth middleware: if Authorization header with Bearer token is present
// it will verify and attach req.user. If token is missing or invalid, it will
// NOT block the request and will simply proceed without req.user.
module.exports = async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return next();

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        user.ensureDefaultPermissions && user.ensureDefaultPermissions();
        req.user = {
          userId: user._id,
          role: user.role,
          permissions: user.permissions,
          email: user.email,
          name: user.name,
        };
      }
    } catch (e) {
      // invalid token - ignore and continue as anonymous
    }

    return next();
  } catch (err) {
    // In case of unexpected error, don't block the chat; log and continue
    console.error('optionalAuth error:', err && err.message);
    return next();
  }
};
