const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  requirePermission,
  requireSelfOrAdmin,
  adminOnly,
} = require('../middleware/auth');
const validate = require('../middleware/validate');
const authController = require('../controllers/authController');

const router = express.Router();

// ------------------- USER PROFILE ROUTES -------------------

// Read-only data (requires 'read' permission)
router.get('/data', auth, requirePermission('read'), (req, res) => {
  res.json({
    success: true,
    message: 'Data fetched successfully',
    data: {
      publicData: 'This is readable by all authenticated users',
      userRole: req.user.role,
      userPermissions: req.user.permissions,
    },
  });
});

// Create content (requires 'write' permission)
router.post(
  '/content',
  auth,
  requirePermission('write'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
  ],
  validate,
  (req, res) => {
    const { title, content } = req.body;
    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      content: {
        id: Date.now(),
        title,
        content,
        createdBy: req.user.userId,
        createdAt: new Date(),
      },
    });
  }
);

// Delete content (requires 'delete' permission)
router.delete('/content/:id', auth, requirePermission('delete'), (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: `Content ${id} deleted successfully`,
  });
});

// Private user data (self or admin access)
router.get('/:userId/private-data', auth, requireSelfOrAdmin, (req, res) => {
  const { userId } = req.params;
  res.json({
    success: true,
    message: 'Private data fetched',
    data: {
      userId,
      privateInfo: 'This is private user data',
      accessedBy: req.user.userId,
      isAdmin: req.user.role === 'admin',
    },
  });
});

// Update user settings (self or admin)
router.put(
  '/:userId/settings',
  auth,
  requireSelfOrAdmin,
  [
    body('theme').optional().isIn(['light', 'dark']).withMessage('Invalid theme'),
    body('notifications').optional().isBoolean().withMessage('Notifications must be boolean'),
    body('language').optional().isIn(['en', 'es', 'fr']).withMessage('Invalid language'),
  ],
  validate,
  (req, res) => {
    const { userId } = req.params;
    const { theme, notifications, language } = req.body;
    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        userId,
        theme,
        notifications,
        language,
        updatedBy: req.user.userId,
        updatedAt: new Date(),
      },
    });
  }
);

module.exports = router;
