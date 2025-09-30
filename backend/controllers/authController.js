const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { success, error } = require('../utils/response');
const { validationResult } = require('express-validator');

// Sign JWT token
const signToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

// Helper to format user response
const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  permissions: user.permissions,
  isActive: user.isActive,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
});

// ------------------- AUTH -------------------

// Signup
exports.signup = async (req, res, next) => {
  try {
    // Validation is now handled by the `validate` middleware in the route.
    const { email, password, name } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json(error('User already exists'));

    const user = new User({ name: name || email.split('@')[0], email: email.toLowerCase(), password });
    user.ensureDefaultPermissions();
    await user.save();

    const token = signToken(user);

    return res.status(201).json(success('User created successfully', { token, user: formatUserResponse(user) }));
  } catch (err) {
    next(err);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json(error('Invalid email or password'));

    if (user.isLocked)
      return res.status(401).json(error('Account temporarily locked. Try again later.'));
    if (!user.isActive)
      return res.status(401).json(error('Account is deactivated. Contact administrator.'));

    const valid = await user.comparePassword(password);
    if (!valid) {
      await user.incLoginAttempts();
      return res.status(401).json(error('Invalid email or password'));
    }

    await user.resetLoginAttempts();
    user.ensureDefaultPermissions();
    await user.save();

    const token = signToken(user);

    return res.json(success('Login successful', { token, user: formatUserResponse(user) }));
  } catch (err) {
    next(err);
  }
};

// ------------------- USER PROFILE -------------------

// Get logged-in profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json(error('User not found'));

    user.ensureDefaultPermissions();
    return res.json(success('Profile fetched', { user: formatUserResponse(user) }));
  } catch (err) {
    next(err);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json(error('User not found'));
    return res.json(success('Profile updated', { user: formatUserResponse(user) }));
  } catch (err) {
    next(err);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json(error('User not found'));

    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(401).json(error('Current password is incorrect'));

    user.password = newPassword;
    await user.save();

    return res.json(success('Password changed successfully'));
  } catch (err) {
    next(err);
  }
};

// ------------------- ADMIN FUNCTIONS -------------------

// Get all users (paginated)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return res.json(
      success('Users fetched successfully', {
        users: users.map(formatUserResponse),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      })
    );
  } catch (err) {
    next(err);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json(error('User not found'));
    return res.json(success('User fetched successfully', { user: formatUserResponse(user) }));
  } catch (err) {
    next(err);
  }
};

// Update user role & permissions
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role, permissions } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json(error('User not found'));

    if (req.user.userId.toString() === user._id.toString())
      return res.status(403).json(error('You cannot change your own role'));

    if (role) user.role = role;
    if (permissions) user.permissions = permissions;
    else user.ensureDefaultPermissions();

    await user.save();
    return res.json(success('User role updated successfully', { user: formatUserResponse(user) }));
  } catch (err) {
    next(err);
  }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json(error('User not found'));

    if (req.user.userId.toString() === user._id.toString())
      return res.status(403).json(error('You cannot deactivate your own account'));

    user.isActive = !user.isActive;
    await user.save();

    return res.json(
      success(`User ${user.isActive ? 'activated' : 'deactivated'} successfully`, { user: formatUserResponse(user) })
    );
  } catch (err) {
    next(err);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json(error('User not found'));

    if (req.user.userId.toString() === user._id.toString())
      return res.status(403).json(error('You cannot delete your own account'));

    await User.findByIdAndDelete(user._id);
    return res.json(success('User deleted successfully'));
  } catch (err) {
    next(err);
  }
};

// ------------------- HELPER -------------------

// Create admin user if needed
exports.createAdminUser = async (adminData) => {
  const existing = await User.findOne({ email: adminData.email });
  if (existing) return existing;
  const admin = await User.createAdmin(adminData);
  return admin;
};
