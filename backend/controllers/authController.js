const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { success, error } = require('../utils/response');
const { validationResult } = require('express-validator');
const { sendMail } = require('../services/mailer');

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
  profilePicture: user.profilePicture || '',
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

// Request OTP for passwordless login / reset
exports.requestOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json(error('User not found'));

    const { otp, otpExpires } = await user.generateOtp();

    // Send OTP via email with HTML formatting
    const subject = 'Your STIVAN Password Reset Code';
    const expiryMinutes = Math.round((otpExpires - Date.now()) / 60000);
    
    const text = `Hello ${user.name},\n\nYour one-time password (OTP) for resetting your STIVAN account password is: ${otp}\n\nThis code will expire in ${expiryMinutes} minutes.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\nSTIVAN Support Team`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">STIVAN</h1>
            <p style="margin: 10px 0 0 0;">Password Reset Request</p>
          </div>
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>We received a request to reset your password. Use the following verification code to complete the process:</p>
            
            <div class="otp-box">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your verification code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for ${expiryMinutes} minutes</p>
            </div>
            
            <p>Enter this code on the password reset page to proceed with changing your password.</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account is secure and no changes have been made.
            </div>
            
            <p>Best regards,<br><strong>STIVAN Support Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message from STIVAN. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await sendMail({ to: user.email, subject, text, html });

    return res.json(success('OTP sent to your email. Please check your inbox (and spam folder if needed).'));
  } catch (err) {
    next(err);
  }
};

// Verify OTP and issue token (passwordless login)
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json(error('User not found'));

    const ok = await user.verifyOtp(otp);
    if (!ok) return res.status(400).json(error('Invalid or expired OTP'));

    await user.resetLoginAttempts();
    user.ensureDefaultPermissions();
    await user.save();

    const token = signToken(user);
    return res.json(success('OTP verified, login successful', { token, user: formatUserResponse(user) }));
  } catch (err) {
    next(err);
  }
};

// Reset password using OTP
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json(error('User not found'));

    // Check if OTP was recently verified (within 10 minutes of verification)
    if (!user.isOtpRecentlyVerified()) {
      return res.status(400).json(error('Invalid or expired OTP. Please request a new code.'));
    }

    // Update password and clear OTP
    user.password = newPassword;
    await user.clearOtp(); // Clear OTP data after successful reset
    
    return res.json(success('Password reset successfully'));
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
    const { name, email, profilePicture } = req.body;
    const updates = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
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
