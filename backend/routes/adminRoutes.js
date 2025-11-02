const express = require('express');
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const { adminOnly, requirePermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { success, error } = require('../utils/response');
const { 
  getAllUsers, 
  getUserById, 
  updateUserRole, 
  toggleUserStatus, 
  deleteUser 
} = require('../controllers/authController');

const router = express.Router();

// ------------------- USER MANAGEMENT -------------------

// Get all users (Admin only)
router.get(
  '/users',
  auth,
  adminOnly,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(['user', 'moderator', 'admin']).withMessage('Invalid role'),
    query('isActive').optional().isBoolean().withMessage('isActive must be boolean')
  ],
  validate,
  getAllUsers
);

// Get user by ID (Admin only)
router.get(
  '/users/:userId',
  auth,
  adminOnly,
  [
    param('userId').isMongoId().withMessage('Invalid user ID')
  ],
  validate,
  getUserById
);

// Update user role & permissions (Admin only, requires manage_users permission)
router.put(
  '/users/:userId/role',
  auth,
  requirePermission('manage_users'),
  [
    param('userId').isMongoId().withMessage('Invalid user ID'),
    body('role').optional().isIn(['user', 'moderator', 'admin']).withMessage('Invalid role'),
    body('permissions').optional().isArray().withMessage('Permissions must be an array'),
    body('permissions.*').isIn(['read', 'write', 'delete', 'manage_users', 'manage_roles'])
      .withMessage('Invalid permission')
  ],
  validate,
  updateUserRole
);

// Toggle user active status (Admin only)
router.put(
  '/users/:userId/status',
  auth,
  adminOnly,
  [
    param('userId').isMongoId().withMessage('Invalid user ID')
  ],
  validate,
  toggleUserStatus
);

// Delete user (Admin only)
router.delete(
  '/users/:userId',
  auth,
  adminOnly,
  [
    param('userId').isMongoId().withMessage('Invalid user ID')
  ],
  validate,
  deleteUser
);

// ------------------- DASHBOARD -------------------

// Dashboard stats (Admin only)
router.get(
  '/dashboard/stats',
  auth,
  adminOnly,
  async (req, res, next) => {
    try {
      const User = require('../models/User');

      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const usersByRole = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);

      const recentUsers = await User.find()
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

      res.json(success('Dashboard stats fetched', {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentUsers
      }));
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
