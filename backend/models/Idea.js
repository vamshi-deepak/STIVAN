const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  marketSize: {
    type: String,
    enum: ['Small', 'Medium', 'Large', 'Unknown'],
    default: 'Unknown'
  },
  teamStrength: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  traction: {
    type: String,
    enum: ['None', 'Idea Stage', 'Prototype', 'MVP', 'Early Users', 'Revenue'],
    default: 'Idea Stage'
  },
  // Evaluation Results - STIVAN 2.0
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  verdict: {
    type: String,
    enum: ['Risky', 'Promising', 'Viable', 'Exceptional']
  },
  investmentReadiness: {
    type: String,
    enum: ['Not Ready', 'Early Stage', 'Needs Work', 'Nearly Ready', 'Investor Ready']
  },
  suggestions: [{
    type: String
  }],
  // 8-Dimensional Breakdown
  breakdown: {
    innovation: Number,
    marketViability: Number,
    technicalFeasibility: Number,
    financialPotential: Number,
    competitiveAdvantage: Number,
    riskAssessment: Number,
    scalability: Number,
    socialImpact: Number,
    // Legacy fields for backwards compatibility
    market: Number,
    team: Number,
    execution: Number
  },
  // Detailed analysis for each dimension
  detailedAnalysis: {
    type: mongoose.Schema.Types.Mixed
  },
  // Market research data
  marketResearch: {
    type: mongoose.Schema.Types.Mixed
  },
  // Financial projections
  financialProjections: {
    type: mongoose.Schema.Types.Mixed
  },
  // SWOT analysis
  swot: {
    type: mongoose.Schema.Types.Mixed
  },
  // Execution roadmap
  executionRoadmap: {
    type: mongoose.Schema.Types.Mixed
  },
  // Top recommendations
  topRecommendations: [{
    priority: String,
    category: String,
    action: String,
    timeframe: String,
    source: String
  }],
  // Executive summary
  executiveSummary: {
    type: mongoose.Schema.Types.Mixed
  },
  // Success probability
  successProbability: {
    type: Number,
    min: 0,
    max: 100
  },
  // Competitive positioning
  competitivePosition: {
    type: mongoose.Schema.Types.Mixed
  },
  // Immediate next steps
  immediateNextSteps: [{
    type: String
  }],
  // Optional reasoning text explaining how the score was derived
  reasoning: {
    type: String
  },
  // Evaluation metadata
  evaluationMetadata: {
    version: String,
    evaluationType: String,
    features: [String],
    timestamp: Date
  },
  // STIVAN Vision Analysis (Analyst Zero) - Real-world market intelligence
  visionAnalysis: {
    domain: String,
    categoryTags: [String],
    competitors: [{
      name: String,
      description: String,
      strengths: [String],
      weaknesses: [String],
      stage: String,
      funding: String,
      market_position: String
    }],
    marketOutlook: String,
    stockMarketAnalysis: {
      investor_appeal: String,
      growth_trajectory: String,
      revenue_model_strength: String,
      exit_potential: String,
      valuation_potential: String,
      risk_factors: [String]
    },
    competitiveAdvantages: [String],
    criticalWeaknesses: [String],
    marketPositioning: String,
    actionableAdvice: [String],
    verdictReasoning: String,
    analyst: String,
    analysisTimestamp: Date,
    modelsUsed: [mongoose.Schema.Types.Mixed],
    marketIntelligence: {
      sources_consulted: Number,
      research_timestamp: Date,
      live_data_included: Boolean
    }
  },
  // Additional fields
  summary: String,
  fullExplanation: String,
  targetAudience: String,
  evaluation: String,
  evaluationDate: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Changed to false for optional auth
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Idea', ideaSchema);