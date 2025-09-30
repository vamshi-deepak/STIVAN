const Idea = require('../models/Idea');
const { evaluateStartupIdea } = require('../services/geminiEvaluator');

// Create and evaluate a new startup idea
const createAndEvaluateIdea = async (req, res) => {
  try {
    const { title, description, marketSize, teamStrength, traction } = req.body;
    
    // Basic validation
    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Title and description are required' 
      });
    }

    // Get evaluation from Gemini
    const ideaData = {
      title,
      description,
      marketSize: marketSize || 'Unknown',
      teamStrength: teamStrength || 5,
      traction: traction || 'Idea Stage'
    };

    console.log('Evaluating idea:', title);
    const evaluation = await evaluateStartupIdea(ideaData);
    
    // Save to database
    const newIdea = new Idea({
      ...ideaData,
      ...evaluation,
      userId: req.user.userId // FIXED: Changed from req.user._id to req.user.userId
    });

    const savedIdea = await newIdea.save();
    
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

module.exports = {
  createAndEvaluateIdea,
  getUserIdeas,
  getIdeaById,
  reEvaluateIdea,
  deleteIdea
};