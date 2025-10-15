const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  profilePicture: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user',
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'manage_users', 'manage_roles']
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  // OTP for passwordless login / password reset
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  otpVerified: {
    type: Boolean,
    default: false,
  },
  otpVerifiedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    this.updatedAt = new Date();
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check permission
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Check role
userSchema.methods.hasRole = function(role) {
  return this.role === role;
};

// Check if has any role in array
userSchema.methods.hasAnyRole = function(roles) {
  return roles.includes(this.role);
};

// Default permissions based on role
userSchema.methods.getDefaultPermissions = function() {
  const rolePermissions = {
    user: ['read'],
    moderator: ['read', 'write', 'delete'],
    admin: ['read', 'write', 'delete', 'manage_users', 'manage_roles']
  };
  return rolePermissions[this.role] || ['read'];
};

// Ensure default permissions are set
userSchema.methods.ensureDefaultPermissions = function() {
  if (!this.permissions || this.permissions.length === 0) {
    this.permissions = this.getDefaultPermissions();
  }
  return this;
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // Read configuration from environment with safe fallbacks
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5;
  const lockTime = parseInt(process.env.ACCOUNT_LOCK_TIME, 10) || 2 * 60 * 60 * 1000; // ms (default 2 hours)

  // If previous lock has expired, reset it and set loginAttempts to 1 for this new failed attempt
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // If this failed attempt reaches/exceeds maxAttempts and the account isn't already locked, set lockUntil
  if ((this.loginAttempts || 0) + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Generate a numeric OTP and set expiry
userSchema.methods.generateOtp = async function() {
  const expiresMinutes = parseInt(process.env.OTP_EXPIRES_MINUTES, 10) || 10; // minutes
  const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
  
  // Update the instance directly and save
  this.otp = otp;
  this.otpExpires = expiresAt;
  await this.save();
  
  return { otp, otpExpires: expiresAt };
};

// Verify provided OTP; if valid, mark as verified and return true, else false
userSchema.methods.verifyOtp = async function(providedOtp) {
  if (!this.otp || !this.otpExpires) {
    console.log('❌ OTP verification failed: No OTP or expiry set');
    return false;
  }
  
  // Convert both to timestamps for comparison
  const expiryTime = new Date(this.otpExpires).getTime();
  const currentTime = Date.now();
  
  console.log('🔍 OTP Verification Debug:');
  console.log('  - Current time:', new Date(currentTime).toISOString());
  console.log('  - Expiry time:', new Date(expiryTime).toISOString());
  console.log('  - Time remaining (minutes):', Math.round((expiryTime - currentTime) / 60000));
  console.log('  - Stored OTP:', this.otp);
  console.log('  - Provided OTP:', providedOtp);
  
  if (expiryTime < currentTime) {
    console.log('❌ OTP expired');
    return false;
  }
  
  const match = this.otp === String(providedOtp);
  if (!match) {
    console.log('❌ OTP does not match');
    return false;
  }
  
  // Mark OTP as verified (don't clear yet - needed for resetPassword)
  this.otpVerified = true;
  this.otpVerifiedAt = new Date();
  await this.save();
  
  console.log('✅ OTP verified successfully');
  return true;
};

// Check if OTP was recently verified (within 10 minutes)
userSchema.methods.isOtpRecentlyVerified = function() {
  if (!this.otpVerified || !this.otpVerifiedAt) {
    console.log('❌ OTP not verified');
    return false;
  }
  
  const verifiedTime = new Date(this.otpVerifiedAt).getTime();
  const currentTime = Date.now();
  const tenMinutes = 10 * 60 * 1000;
  
  const isValid = (currentTime - verifiedTime) < tenMinutes;
  console.log('🔍 OTP Verified Check:');
  console.log('  - Verified at:', new Date(verifiedTime).toISOString());
  console.log('  - Current time:', new Date(currentTime).toISOString());
  console.log('  - Time since verification (minutes):', Math.round((currentTime - verifiedTime) / 60000));
  console.log('  - Is valid:', isValid);
  
  return isValid;
};

// Clear OTP after successful password reset
userSchema.methods.clearOtp = async function() {
  this.otp = undefined;
  this.otpExpires = undefined;
  this.otpVerified = false;
  this.otpVerifiedAt = undefined;
  await this.save();
  console.log('✅ OTP cleared');
};

// Static method to create an admin user
userSchema.statics.createAdmin = async function(adminData) {
  const admin = new this({
    ...adminData,
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'manage_users', 'manage_roles']
  });
  return await admin.save();
};

module.exports = mongoose.model('User', userSchema);
