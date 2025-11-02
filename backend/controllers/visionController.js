/**
 * STIVAN Vision Controller
 * Handles analyst-level startup idea evaluation with real-world market intelligence
 * Enhanced with RAG (Retrieval-Augmented Generation) for learning from past analyses
 */

const stivanAnalystZero = require('../services/stivanAnalystZero');
const stivanRAG = require('../services/stivanRAG');
const Idea = require('../models/Idea');

/**
 * Evaluate startup idea with STIVAN Analyst Zero
 * This uses AI + real-time market data to provide legendary analysis
 */
exports.evaluateWithVision = async (req, res) => {
  try {
    console.log('\n📊 Vision Evaluation Request Received');
    
    // Extract and validate input
    const {
      idea_title,
      idea_summary,
      idea_what,
      idea_how,
      idea_audience,
      idea_market_size = 'Unknown',
      idea_team_strength = 5,
      idea_traction = 'Idea Stage'
    } = req.body;

    // Validation
    if (!idea_title || !idea_summary || !idea_what) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: idea_title, idea_summary, idea_what'
      });
    }

    // Reject placeholder or too-short descriptions to ensure meaningful analysis
    const badPlaceholders = ['nothing', 'n/a', 'na', 'none', 'tbd', 'todo'];
    const normalizedWhat = String(idea_what || '').trim().toLowerCase();
    if (normalizedWhat.length < 20 || badPlaceholders.includes(normalizedWhat)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a concrete, non-placeholder description for what the idea does (at least 20 characters).'
      });
    }

    // Prepare data for analysis
    const ideaData = {
      idea_title,
      idea_summary,
      idea_what,
      idea_how: idea_how || idea_what, // Fallback to what if how not provided
      idea_audience,
      idea_market_size,
      idea_team_strength,
      idea_traction
    };

    // 🆕 RAG STEP 1: Get similar ideas from past analyses
    console.log('🔍 RAG: Searching for similar ideas...');
    const ragContext = await stivanRAG.getEnhancedContext({
      title: idea_title,
      summary: idea_summary,
      description: idea_what,
      audience: idea_audience
    });

    // Call STIVAN Analyst Zero for legendary analysis
    console.log('🧠 Calling STIVAN Analyst Zero...');
    const analysis = await stivanAnalystZero.analyzeIdea(ideaData);

    // Calculate overall score from sub-scores
    const scores = analysis.scores || {};
    const scoreValues = Object.values(scores);
    const overallScore = scoreValues.length > 0 
      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
      : 50;

    // Determine verdict badge (must match Idea schema enum: Risky, Promising, Viable, Exceptional)
    let verdict;
    if (overallScore >= 80) verdict = 'Exceptional';
    else if (overallScore >= 65) verdict = 'Viable';
    else if (overallScore >= 45) verdict = 'Promising';
    else verdict = 'Risky';

    // Convert free-text market size to enum value for database
    let marketSizeEnum = 'Unknown';
    if (idea_market_size && typeof idea_market_size === 'string') {
      const marketSizeLower = idea_market_size.toLowerCase();
      if (marketSizeLower.includes('billion') || marketSizeLower.includes('$1b') || marketSizeLower.includes('>$1')) {
        marketSizeEnum = 'Large';
      } else if (marketSizeLower.includes('million') || marketSizeLower.includes('$100m')) {
        marketSizeEnum = 'Medium';
      } else if (marketSizeLower.includes('small') || marketSizeLower.includes('niche')) {
        marketSizeEnum = 'Small';
      }
    }

    // Convert free-text traction to enum value for database
    let tractionEnum = 'Idea Stage';
    if (idea_traction && typeof idea_traction === 'string') {
      const tractionLower = idea_traction.toLowerCase();
      if (tractionLower.includes('revenue') || tractionLower.includes('paying')) {
        tractionEnum = 'Revenue';
      } else if (tractionLower.includes('early') || tractionLower.includes('user')) {
        tractionEnum = 'Early Users';
      } else if (tractionLower.includes('mvp')) {
        tractionEnum = 'MVP';
      } else if (tractionLower.includes('prototype')) {
        tractionEnum = 'Prototype';
      } else if (tractionLower.includes('none')) {
        tractionEnum = 'None';
      }
    }

    // Determine authenticated user id (support different token shapes)
    const authUserId = req.user?._id || req.user?.userId || req.user?.id || null;

    // Store in database
    const ideaRecord = new Idea({
      // Save user references in both fields to maximize compatibility with queries
      user: authUserId,
      userId: authUserId,
      title: idea_title,
      summary: idea_summary,
      description: idea_what,
      fullExplanation: idea_how,
      targetAudience: idea_audience,
      marketSize: marketSizeEnum, // Use enum value instead of free text
      teamStrength: idea_team_strength,
      traction: tractionEnum, // Use enum value instead of free text
      
      // Scores
      score: overallScore,
      verdict: verdict,
      breakdown: {
        marketViability: scores.market_viability || 50,
        innovationIndex: scores.innovation_index || 50,
        competitionIntensity: scores.competition_intensity || 50,
        scalabilityPotential: scores.scalability_potential || 50,
        executionFeasibility: scores.execution_feasibility || 50
      },
      
      // STIVAN Vision Analysis
      visionAnalysis: {
        domain: analysis.domain,
        categoryTags: analysis.category_tags || [],
        competitors: analysis.competitors || [],
        marketOutlook: analysis.market_outlook_3yr,
        stockMarketAnalysis: analysis.stock_market_analysis,
        competitiveAdvantages: analysis.competitive_advantages || [],
        criticalWeaknesses: analysis.critical_weaknesses || [],
        marketPositioning: analysis.market_positioning,
        actionableAdvice: analysis.actionable_advice || [],
        verdictReasoning: analysis.verdict_reasoning,
        analyst: analysis.analyst,
        analysisTimestamp: analysis.analysis_timestamp,
        modelsUsed: analysis.models_used,
        marketIntelligence: analysis.market_intelligence
      },
      
      // Legacy format for compatibility
      suggestions: analysis.actionable_advice || [],
      evaluation: analysis.verdict_reasoning || '',
      
      evaluationDate: new Date()
    });

    await ideaRecord.save();
    console.log('💾 Analysis saved to database');

    // 🆕 RAG STEP 2: Store this analysis for future retrieval
    await stivanRAG.storeAnalysis({
      id: ideaRecord._id.toString(),
      title: idea_title,
      summary: idea_summary,
      description: idea_what,
      audience: idea_audience,
      domain: analysis.domain,
      score: overallScore,
      verdict: verdict,
      market_size: idea_market_size,
      team_strength: idea_team_strength,
      traction: idea_traction,
      competitors_count: (analysis.competitors || []).length
    });

    // Return comprehensive response
    res.json({
      success: true,
      data: {
        _id: ideaRecord._id,
        title: idea_title,
        score: overallScore,
        verdict: verdict,
        user: authUserId,
        userId: authUserId,

        // Core analysis
        domain: analysis.domain,
        categoryTags: analysis.category_tags || [],
        competitors: analysis.competitors || [],
        scores: analysis.scores,

        // Market insights
        marketOutlook: analysis.market_outlook_3yr,
        stockMarketAnalysis: analysis.stock_market_analysis,
        marketPositioning: analysis.market_positioning,

        // Strategic insights
        competitiveAdvantages: analysis.competitive_advantages || [],
        criticalWeaknesses: analysis.critical_weaknesses || [],
        actionableAdvice: analysis.actionable_advice || [],

        // Verdict
        finalVerdict: analysis.final_verdict,
        verdictReasoning: analysis.verdict_reasoning,

        // Metadata
        analyst: 'STIVAN Analyst Zero',
        analysisTimestamp: analysis.analysis_timestamp,
        modelsUsed: analysis.models_used,
        marketIntelligence: analysis.market_intelligence,

        // 🆕 RAG Insights
        ragInsights: ragContext.has_similar_ideas ? {
          similarIdeas: ragContext.similar_ideas,
          patterns: ragContext.patterns,
          insights: ragContext.insights,
          databaseSize: ragContext.database_size
        } : null,

        // Legacy compatibility
        breakdown: {
          marketViability: scores.market_viability,
          innovationIndex: scores.innovation_index,
          competitionIntensity: scores.competition_intensity,
          scalabilityPotential: scores.scalability_potential,
          executionFeasibility: scores.execution_feasibility
        },
        suggestions: analysis.actionable_advice || []
      }
    });

  } catch (error) {
    console.error('❌ Vision Evaluation Error:', error);
    
    // Provide user-friendly error messages
    let userMessage = 'Analysis failed. Please try again later.';
    let statusCode = 500;
    
    if (error.message.includes('503') || error.message.includes('overloaded')) {
      userMessage = 'AI service is temporarily overloaded. Please try again in a few seconds.';
      statusCode = 503;
    } else if (error.message.includes('No AI models available')) {
      userMessage = 'Analysis service is not properly configured. Please contact support.';
      statusCode = 503;
    } else if (error.message.includes('API key')) {
      userMessage = 'Analysis service configuration error. Please contact support.';
      statusCode = 503;
    } else if (error.message.includes('network') || error.message.includes('Network')) {
      userMessage = 'Network error. Please check your connection and try again.';
      statusCode = 503;
    } else if (error.message.includes('timeout')) {
      userMessage = 'Request timed out. Please try again.';
      statusCode = 504;
    }
    
    res.status(statusCode).json({
      success: false,
      error: userMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      debugStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get analysis by ID
 */
exports.getAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    
    const idea = await Idea.findById(id);
    
    if (!idea) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      data: idea
    });

  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analysis'
    });
  }
};

/**
 * Get all analyses for current user
 */
exports.getUserAnalyses = async (req, res) => {
  try {
    const userId = req.user?._id;
    
    const ideas = await Idea.find(userId ? { user: userId } : {})
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: ideas,
      count: ideas.length
    });

  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analyses'
    });
  }
};
