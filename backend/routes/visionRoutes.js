/**
 * STIVAN Vision Routes
 * Routes for legendary market analysis with STIVAN Analyst Zero
 */

const express = require('express');
const router = express.Router();
const visionController = require('../controllers/visionController');
const optionalAuth = require('../middleware/optionalAuth');

/**
 * @route   POST /api/vision/evaluate
 * @desc    Evaluate startup idea with STIVAN Analyst Zero (with real-world market intelligence)
 * @access  Public (optionalAuth = works with or without login)
 * @body    {
 *   idea_title: string (required),
 *   idea_summary: string (required),
 *   idea_what: string (required),
 *   idea_how: string,
 *   idea_audience: string,
 *   idea_market_size: string,
 *   idea_team_strength: number (1-10),
 *   idea_traction: string
 * }
 */
router.post('/evaluate', optionalAuth, visionController.evaluateWithVision);

/**
 * @route   GET /api/vision/analysis/:id
 * @desc    Get specific analysis by ID
 * @access  Public
 */
router.get('/analysis/:id', visionController.getAnalysis);

/**
 * @route   GET /api/vision/analyses
 * @desc    Get all analyses for current user
 * @access  Public (shows all if not logged in)
 */
router.get('/analyses', optionalAuth, visionController.getUserAnalyses);

module.exports = router;
