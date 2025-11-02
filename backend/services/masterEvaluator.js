// ==========================================
// STIVAN 2.0 - MASTER EVALUATION ORCHESTRATOR
// ==========================================
// Combines all revolutionary features into one comprehensive evaluation

const { evaluateStartupIdea: advancedEvaluate } = require('./advancedEvaluator');
const { analyzeMarketInterest, generateMarketInsights } = require('./googleTrendsService');
const { generateFinancialProjections } = require('./financialProjections');
const { generateSWOTAnalysis } = require('./swotAnalysis');
const { generateExecutionRoadmap } = require('./executionRoadmap');
const { enhanceEvaluationVisually } = require('./visualEnhancer');

/**
 * MAIN ORCHESTRATOR - Runs all evaluation services
 * This is the brain of STIVAN 2.0
 */
const evaluateStartupIdea = async (ideaData) => {
  try {
    console.log('🚀 STIVAN 2.0 - Starting Revolutionary Evaluation...');
    
    // Step 1: Multi-dimensional evaluation (8 metrics)
    console.log('📊 Running 8-dimensional analysis...');
    const evaluation = await advancedEvaluate(ideaData);
    
    // Step 2: Google Trends market research
    console.log('🔍 Analyzing real market data...');
    const marketTrends = await analyzeMarketInterest(
      ideaData.title, 
      ideaData.description
    );
    const marketInsights = generateMarketInsights(marketTrends);
    
    // Step 3: Financial projections
    console.log('💰 Generating financial projections...');
    const financials = generateFinancialProjections(ideaData);
    
    // Step 4: SWOT analysis
    console.log('🎯 Creating SWOT analysis...');
    const swot = generateSWOTAnalysis(ideaData, evaluation);
    
    // Step 5: Execution roadmap
    console.log('🗺️ Building execution roadmap...');
    const roadmap = generateExecutionRoadmap(ideaData, evaluation);
    
    // Combine everything into comprehensive report
    const comprehensiveReport = {
      // Basic evaluation
      score: evaluation.score,
      verdict: evaluation.verdict,
      investmentReadiness: evaluation.investmentReadiness,
      
      // 8-dimensional breakdown
      breakdown: evaluation.breakdown,
      detailedAnalysis: evaluation.detailedAnalysis,
      
      // Real market data
      marketResearch: {
        trends: marketTrends,
        insights: marketInsights,
        validatedByRealData: true
      },
      
      // Financial projections
      financialProjections: financials,
      
      // Strategic analysis
      swot: swot,
      
      // Actionable roadmap
      executionRoadmap: roadmap,
      
      // Top recommendations (consolidated from all sources)
      topRecommendations: consolidateRecommendations(
        evaluation, 
        swot, 
        roadmap,
        financials
      ),
      
      // Executive summary
      executiveSummary: generateExecutiveSummary(
        ideaData,
        evaluation,
        marketInsights,
        financials,
        swot
      ),
      
      // Success probability
      successProbability: calculateSuccessProbability(
        evaluation,
        marketInsights,
        financials
      ),
      
      // Competitive positioning
      competitivePosition: swot?.competitivePositioning || null,
      
      // Next steps
      immediateNextSteps: getImmediateNextSteps(roadmap, evaluation),
      
      // Reasoning
      reasoning: evaluation.reasoning,
      
      // Metadata
      evaluationMetadata: {
        version: '2.0',
        evaluationType: 'Professional Multi-Dimensional',
        features: [
          '8-Dimensional Scoring',
          'Real Market Data',
          'Financial Projections',
          'SWOT Analysis',
          'Execution Roadmap'
        ],
        timestamp: new Date().toISOString()
      }
    };
    
    // 🎨 APPLY VISUAL ENHANCEMENTS
    console.log('🎨 Adding visual elements and animations...');
    const visuallyEnhancedReport = enhanceEvaluationVisually(comprehensiveReport);
    
    console.log('✅ STIVAN 2.0 - Evaluation Complete!');
    console.log(`📈 Overall Score: ${evaluation.score}/100`);
    console.log(`🎯 Verdict: ${evaluation.verdict}`);
    console.log(`💎 Investment Readiness: ${evaluation.investmentReadiness}`);
    
    return visuallyEnhancedReport;
    
  } catch (error) {
    console.error('❌ STIVAN 2.0 Evaluation Error:', error);
    
    // Fallback to basic evaluation if something fails
    console.log('⚠️ Falling back to basic evaluation...');
    return await advancedEvaluate(ideaData);
  }
};

/**
 * Consolidate recommendations from all sources
 */
function consolidateRecommendations(evaluation, swot, roadmap, financials) {
  const recommendations = [];
  
  // From evaluation (top 3 weakest areas)
  const dimensions = Object.entries(evaluation.breakdown)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3);
  
  dimensions.forEach(([dim, score]) => {
    if (score < 70) {
      recommendations.push({
        priority: 'High',
        category: dim,
        action: `Improve ${dim.replace(/([A-Z])/g, ' $1').trim()} (currently ${score}/100)`,
        source: 'Dimensional Analysis'
      });
    }
  });
  
  // From SWOT (priority actions)
  if (swot?.priorityActions) {
    swot.priorityActions.forEach(action => {
      recommendations.push({
        priority: action.impact,
        category: 'Strategic',
        action: action.action,
        timeframe: action.timeframe,
        source: 'SWOT Analysis'
      });
    });
  }
  
  // From roadmap (critical path)
  if (roadmap?.criticalPath) {
    roadmap.criticalPath.slice(0, 2).forEach(task => {
      recommendations.push({
        priority: 'Critical',
        category: 'Execution',
        action: task,
        source: 'Roadmap'
      });
    });
  }
  
  // From financials
  if (financials?.fundingRequirements) {
    recommendations.push({
      priority: 'High',
      category: 'Financial',
      action: `Secure $${Math.round(financials.fundingRequirements.recommended / 1000)}K in funding`,
      source: 'Financial Projections'
    });
  }
  
  // Limit to top 10 most important
  return recommendations
    .sort((a, b) => {
      const priorityOrder = { 'Critical': 0, 'Very High': 1, 'High': 2, 'Medium': 3 };
      return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
    })
    .slice(0, 10);
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(ideaData, evaluation, marketInsights, financials, swot) {
  const { title, description } = ideaData;
  const { score, verdict, breakdown } = evaluation;
  
  // Identify top strengths
  const topStrengths = Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim());
  
  // Identify areas needing work
  const weaknesses = Object.entries(breakdown)
    .filter(([, score]) => score < 60)
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim());
  
  const summary = {
    overview: `${title} has been evaluated with a score of ${score}/100, categorized as "${verdict}". ` +
              `The idea shows strength in ${topStrengths.join(' and ')}.` +
              (weaknesses.length > 0 ? ` Areas requiring attention include ${weaknesses.join(', ')}.` : ''),
    
    keyHighlights: [
      `Overall Score: ${score}/100 (${verdict})`,
      `Investment Readiness: ${evaluation.investmentReadiness}`,
      `Market Demand: ${marketInsights?.score || 'Moderate'}/100`,
      `3-Year Revenue Potential: $${Math.round((financials?.revenueProjections?.year3?.total || 0) / 1000)}K`,
      `Break-Even: ${financials?.breakEven?.month || 'TBD'} months`,
      `Success Probability: ${calculateSuccessProbability(evaluation, marketInsights, financials)}%`
    ],
    
    strengths: swot?.swot?.strengths?.slice(0, 3).map(s => s.description) || [],
    
    keyRisks: swot?.swot?.weaknesses?.filter(w => w.severity === 'High').slice(0, 3).map(w => w.description) || [],
    
    recommendation: score >= 75 
      ? 'Strongly recommend pursuing this opportunity with immediate action on roadmap.'
      : score >= 60
      ? 'Promising idea that requires validation and refinement before full commitment.'
      : score >= 40
      ? 'High-risk venture that needs significant work on identified weak areas.'
      : 'Not recommended in current form; consider pivoting or major restructuring.'
  };
  
  return summary;
}

/**
 * Calculate overall success probability
 */
function calculateSuccessProbability(evaluation, marketInsights, financials) {
  const { breakdown } = evaluation;
  
  // Base probability from overall score
  let probability = evaluation.score * 0.6; // 60% weight
  
  // Market validation boost
  if (marketInsights?.score) {
    probability += marketInsights.score * 0.2; // 20% weight
  }
  
  // Financial viability boost
  if (financials?.profitabilityScore) {
    probability += financials.profitabilityScore * 0.2; // 20% weight
  }
  
  // Penalties for critical weaknesses
  if (breakdown.marketViability < 40) probability -= 10;
  if (breakdown.financialPotential < 40) probability -= 10;
  if (breakdown.technicalFeasibility < 30) probability -= 15;
  
  // Cap between 5% and 95%
  return Math.max(5, Math.min(95, Math.round(probability)));
}

/**
 * Get immediate next steps
 */
function getImmediateNextSteps(roadmap, evaluation) {
  const steps = [];
  
  if (!roadmap) {
    return [
      'Complete comprehensive market research',
      'Build proof-of-concept or prototype',
      'Validate with target customers'
    ];
  }
  
  // Get tasks from current phase
  const currentPhase = roadmap.phases[roadmap.currentPhase.toLowerCase()];
  
  if (currentPhase?.tasks) {
    const firstTasks = Array.isArray(currentPhase.tasks) 
      ? currentPhase.tasks.slice(0, 3)
      : [currentPhase.tasks];
    
    firstTasks.forEach(task => {
      if (task.task) {
        steps.push(`${task.task}: ${task.activities?.[0] || task.description || 'Begin this phase'}`);
      }
    });
  }
  
  // Add critical path items
  if (roadmap.criticalPath) {
    steps.push(...roadmap.criticalPath.slice(0, 2));
  }
  
  return steps.slice(0, 5);
}

module.exports = {
  evaluateStartupIdea
};
