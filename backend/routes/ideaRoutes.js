const express = require('express');
const router = express.Router();
const {
  createAndEvaluateIdea,
  getUserIdeas,
  getIdeaById,
  reEvaluateIdea,
  deleteIdea
  , clearUserIdeas
} = require('../controllers/ideaController');

// Assuming you have auth middleware
const auth = require('../middleware/auth'); // Adjust path if needed

// POST /api/ideas/evaluate - Create and evaluate new idea
router.post('/evaluate', auth, createAndEvaluateIdea);

// GET /api/ideas - Get user's idea history
router.get('/', auth, getUserIdeas);
// DELETE /api/ideas/clear - Clear all ideas for the authenticated user
// Must be declared before parameterized routes so 'clear' doesn't match ':id'
router.delete('/clear', auth, clearUserIdeas);

// GET /api/ideas/:id - Get specific idea
router.get('/:id', auth, getIdeaById);

// PUT /api/ideas/:id/re-evaluate - Re-evaluate existing idea
router.put('/:id/re-evaluate', auth, reEvaluateIdea);

// DELETE /api/ideas/:id - Delete idea
router.delete('/:id', auth, deleteIdea);

module.exports = router;