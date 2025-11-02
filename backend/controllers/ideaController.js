const Idea = require('../models/Idea');
// STIVAN 2.0 - Revolutionary Multi-Dimensional Evaluator
// Combines 8-dimensional scoring, market research, financial projections, SWOT, and roadmap
const { evaluateStartupIdea } = require('../services/masterEvaluator');

// --- Helper heuristics for backward compatibility ---
const inferMarketSizeFromAudience = (audience) => {
  if (!audience) return null;
  const a = audience.toLowerCase();
  if (a.includes('enterprise') || a.includes('b2b') || a.includes('small business') || a.includes('smb')) return 'Large';
  if (a.includes('startup') || a.includes('local') || a.includes('community')) return 'Small';
  if (a.includes('consumer') || a.includes('market') || a.includes('mid')) return 'Medium';
  return null;
};

const inferTractionFromSummaryOrExplanation = (text) => {
  if (!text) return null;
  const t = text.toLowerCase();
  if (t.includes('revenue') || t.includes('making money') || t.includes('customers paying')) return 'Revenue';
  if (t.includes('early users') || t.includes('beta users') || t.includes('pilot')) return 'Early Users';
  if (t.includes('mvp') || t.includes('minimum viable product')) return 'MVP';
  if (t.includes('prototype') || t.includes('demo')) return 'Prototype';
  return null;
};

// Create and evaluate a new startup idea
const createAndEvaluateIdea = async (req, res) => {
  try {
    const {
      title,
      description,
      marketSize,
      teamStrength,
      traction,
      targetAudience,
      fullExplanation,
      summary
    } = req.body;
    
    // Basic validation
    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Title and description are required' 
      });
    }

    // Prefer explicit fields but allow compatibility with older frontend keys
    const resolvedMarketSize = marketSize || inferMarketSizeFromAudience(targetAudience) || 'Unknown';
    const resolvedTeamStrength = (typeof teamStrength === 'number' || typeof teamStrength === 'string') ? Number(teamStrength) : 5;
    const resolvedTraction = traction || inferTractionFromSummaryOrExplanation(fullExplanation || summary) || 'Idea Stage';

    // Build ideaData to send to evaluator
    const ideaData = {
      title,
      description: fullExplanation || description,
      marketSize: resolvedMarketSize,
      teamStrength: resolvedTeamStrength,
      traction: resolvedTraction,
      // keep original fields for storage
      raw: {
        targetAudience,
        summary
      }
    };

    console.log('🚀 STIVAN 2.0 - Evaluating idea:', title);
    const evaluation = await evaluateStartupIdea(ideaData);
    
    // Save to database with all comprehensive data
    const newIdea = new Idea({
      // Original input data
      title: ideaData.title,
      description: ideaData.description,
      marketSize: ideaData.marketSize,
      teamStrength: ideaData.teamStrength,
      traction: ideaData.traction,
      
      // Core evaluation results
      score: evaluation.score,
      verdict: evaluation.verdict,
      investmentReadiness: evaluation.investmentReadiness,
      reasoning: evaluation.reasoning,
      suggestions: evaluation.topRecommendations?.map(r => r.action) || evaluation.suggestions || [],
      
      // 8-dimensional breakdown
      breakdown: evaluation.breakdown,
      detailedAnalysis: evaluation.detailedAnalysis,
      
      // Revolutionary features
      marketResearch: evaluation.marketResearch,
      financialProjections: evaluation.financialProjections,
      swot: evaluation.swot,
      executionRoadmap: evaluation.executionRoadmap,
      topRecommendations: evaluation.topRecommendations,
      executiveSummary: evaluation.executiveSummary,
      successProbability: evaluation.successProbability,
      competitivePosition: evaluation.competitivePosition,
      immediateNextSteps: evaluation.immediateNextSteps,
      evaluationMetadata: evaluation.evaluationMetadata,
      
      // User ID
      userId: req.user.userId
    });

    const savedIdea = await newIdea.save();
        // Persist the evaluation as a bot chat message linked to this idea
        try {
          const ChatMessage = require('../models/ChatMessage');
          const botText = `Evaluation Summary for "${savedIdea.title}":\nScore: ${evaluation.score}\nVerdict: ${evaluation.verdict}`;
          await ChatMessage.create({ 
            user: req.user.userId, 
            idea: savedIdea._id, 
            role: 'bot', 
            text: botText,
            metadata: { type: 'evaluation_summary', ideaId: String(savedIdea._id) }
          });
        } catch (e) {
          console.error('Failed to save idea evaluation chat message:', e.message);
        }
    
    res.status(201).json({
      success: true,
      data: savedIdea,
      message: 'Idea evaluated successfully'
    });

  } catch (error) {
    console.error('Error evaluating idea:', error);
    res.status(500).json({ 
      error: 'Failed to evaluate idea',
      details: error.message 
    });
  }
};

// Get user's idea history
const getUserIdeas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const ideas = await Idea.find({ userId: req.user.userId }) // FIXED
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-userId');

    const total = await Idea.countDocuments({ userId: req.user.userId }); // FIXED

    res.json({
      success: true,
      data: ideas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user ideas:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ideas' 
    });
  }
};

// Get specific idea by ID
const getIdeaById = async (req, res) => {
  try {
    const idea = await Idea.findOne({
      _id: req.params.id,
      userId: req.user.userId // FIXED
    });

    if (!idea) {
      return res.status(404).json({ 
        error: 'Idea not found' 
      });
    }

    res.json({
      success: true,
      data: idea
    });

  } catch (error) {
    console.error('Error fetching idea:', error);
    res.status(500).json({ 
      error: 'Failed to fetch idea' 
    });
  }
};

// Re-evaluate an existing idea
const reEvaluateIdea = async (req, res) => {
  try {
    const idea = await Idea.findOne({
      _id: req.params.id,
      userId: req.user.userId // FIXED
    });

    if (!idea) {
      return res.status(404).json({ 
        error: 'Idea not found' 
      });
    }

    // Re-evaluate with current data
    const ideaData = {
      title: idea.title,
      description: idea.description,
      marketSize: idea.marketSize,
      teamStrength: idea.teamStrength,
      traction: idea.traction
    };

    const evaluation = await evaluateStartupIdea(ideaData);
    
    // Update the idea with new evaluation
    idea.score = evaluation.score;
    idea.verdict = evaluation.verdict;
    idea.suggestions = evaluation.suggestions;
    idea.breakdown = evaluation.breakdown;
    
    const updatedIdea = await idea.save();
    
    res.json({
      success: true,
      data: updatedIdea,
      message: 'Idea re-evaluated successfully'
    });

  } catch (error) {
    console.error('Error re-evaluating idea:', error);
    res.status(500).json({ 
      error: 'Failed to re-evaluate idea' 
    });
  }
};

// Delete an idea
const deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId // FIXED
    });

    if (!idea) {
      return res.status(404).json({ 
        error: 'Idea not found' 
      });
    }

    res.json({
      success: true,
      message: 'Idea deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting idea:', error);
    res.status(500).json({ 
      error: 'Failed to delete idea' 
    });
  }
};

  // Clear all ideas for the authenticated user
  const clearUserIdeas = async (req, res) => {
    try {
      const result = await Idea.deleteMany({ userId: req.user.userId });
      res.json({
        success: true,
        deletedCount: result.deletedCount || 0,
        message: 'All user ideas deleted successfully'
      });
    } catch (error) {
      console.error('Error clearing user ideas:', error);
      res.status(500).json({ error: 'Failed to clear ideas' });
    }
  };
module.exports = {
  createAndEvaluateIdea,
  getUserIdeas,
  getIdeaById,
  reEvaluateIdea,
  deleteIdea
    , clearUserIdeas
};