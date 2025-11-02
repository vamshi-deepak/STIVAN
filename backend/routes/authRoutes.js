const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');
const { emailValidationMiddleware } = require('../services/emailValidator');

// Public: User Signup
router.post(
  '/signup',
  [
    body('name').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('confirmPassword')
      .custom((val, { req }) => val === req.body.password)
      .withMessage('Passwords do not match'),
  ],
  validate,
  emailValidationMiddleware({ checkMX: true, blockDisposable: true }), // Validate real email
  authController.signup
);

// Public: User Login
router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty().withMessage('Password is required')],
  validate,
  authController.login
);

// Public: Request OTP for passwordless login or password reset
router.post(
  '/request-otp',
  [body('email').isEmail().withMessage('Valid email is required')],
  validate,
  emailValidationMiddleware({ checkMX: true, blockDisposable: true }), // Validate real email
  authController.requestOtp
);

// Public: Verify OTP (login)
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  validate,
  authController.verifyOtp
);

// Public: Reset password using OTP
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
  ],
  validate,
  authController.resetPassword
);

// Protected: Get current user's profile
router.get('/me', authMiddleware, authController.getProfile);

// Protected: Update current user's profile (name etc.)
router.put(
  '/me',
  authMiddleware,
  [
    // allow updating name for now
  ],
  authController.updateProfile
);

// Protected: Change password
router.put(
  '/me/password',
  authMiddleware,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
  ],
  validate,
  authController.changePassword
);

module.exports = router;
