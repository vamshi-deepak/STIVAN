// ==========================================
// SWOT ANALYSIS GENERATOR
// ==========================================
// AI-Powered strategic analysis

/**
 * Generate professional SWOT analysis
 */
const generateSWOTAnalysis = (ideaData, evaluationResults) => {
  try {
    const { title, description, marketSize, teamStrength, traction } = ideaData;
    const { breakdown } = evaluationResults;
    
    const swot = {
      strengths: identifyStrengths(ideaData, breakdown),
      weaknesses: identifyWeaknesses(ideaData, breakdown),
      opportunities: identifyOpportunities(ideaData, breakdown),
      threats: identifyThreats(ideaData, breakdown)
    };
    
    const strategicRecommendations = generateStrategicRecommendations(swot, breakdown);
    
    return {
      swot,
      strategicRecommendations,
      priorityActions: identifyPriorityActions(swot),
      competitivePositioning: analyzeCompetitivePositioning(ideaData, breakdown)
    };
    
  } catch (error) {
    console.error('SWOT analysis error:', error);
    return null;
  }
};

/**
 * Identify Strengths
 */
function identifyStrengths(ideaData, breakdown) {
  const strengths = [];
  const { description = '', teamStrength, traction } = ideaData;
  const text = description.toLowerCase();
  
  // Innovation strengths
  if (breakdown.innovation > 70) {
    strengths.push({
      category: 'Innovation',
      description: 'Highly innovative solution with strong differentiation',
      impact: 'High'
    });
  }
  
  // Market strengths
  if (breakdown.marketViability > 70) {
    strengths.push({
      category: 'Market',
      description: 'Strong market demand and clear target audience',
      impact: 'High'
    });
  }
  
  // Technical strengths
  if (breakdown.technicalFeasibility > 75) {
    strengths.push({
      category: 'Technical',
      description: 'Technically feasible with clear implementation path',
      impact: 'Medium'
    });
  }
  
  // Team strengths
  if (teamStrength >= 7) {
    strengths.push({
      category: 'Team',
      description: 'Strong team with relevant expertise',
      impact: 'High'
    });
  }
  
  // Traction strengths
  if (String(traction).toLowerCase().includes('revenue')) {
    strengths.push({
      category: 'Traction',
      description: 'Proven revenue generation and market validation',
      impact: 'Very High'
    });
  } else if (String(traction).toLowerCase().includes('users')) {
    strengths.push({
      category: 'Traction',
      description: 'Active user base demonstrating product-market fit',
      impact: 'High'
    });
  }
  
  // Competitive strengths
  if (breakdown.competitiveAdvantage > 70) {
    strengths.push({
      category: 'Competitive',
      description: 'Strong competitive advantages and barriers to entry',
      impact: 'High'
    });
  }
  
  // Scalability strengths
  if (breakdown.scalability > 75) {
    strengths.push({
      category: 'Scalability',
      description: 'Highly scalable business model with growth potential',
      impact: 'High'
    });
  }
  
  // Financial strengths
  if (breakdown.financialPotential > 70) {
    strengths.push({
      category: 'Financial',
      description: 'Strong financial potential and clear revenue model',
      impact: 'High'
    });
  }
  
  // Social impact strengths
  if (breakdown.socialImpact > 70) {
    strengths.push({
      category: 'Social Impact',
      description: 'Positive societal impact attracts mission-driven customers',
      impact: 'Medium'
    });
  }
  
  // If no strengths, add generic one
  if (strengths.length === 0) {
    strengths.push({
      category: 'Foundation',
      description: 'Clear problem identification and solution approach',
      impact: 'Medium'
    });
  }
  
  return strengths;
}

/**
 * Identify Weaknesses
 */
function identifyWeaknesses(ideaData, breakdown) {
  const weaknesses = [];
  const { description = '', teamStrength, traction } = ideaData;
  
  // Innovation weaknesses
  if (breakdown.innovation < 50) {
    weaknesses.push({
      category: 'Innovation',
      description: 'Limited differentiation from existing solutions',
      severity: 'High'
    });
  }
  
  // Market weaknesses
  if (breakdown.marketViability < 50) {
    weaknesses.push({
      category: 'Market',
      description: 'Unclear market demand or target audience validation needed',
      severity: 'High'
    });
  }
  
  // Technical weaknesses
  if (breakdown.technicalFeasibility < 50) {
    weaknesses.push({
      category: 'Technical',
      description: 'High technical complexity or resource requirements',
      severity: 'Medium'
    });
  }
  
  // Team weaknesses
  if (teamStrength < 5) {
    weaknesses.push({
      category: 'Team',
      description: 'Team lacks critical skills or experience',
      severity: 'High'
    });
  }
  
  // Traction weaknesses
  if (String(traction).toLowerCase().includes('idea') || String(traction).toLowerCase().includes('none')) {
    weaknesses.push({
      category: 'Traction',
      description: 'No market validation or customer feedback yet',
      severity: 'Medium'
    });
  }
  
  // Competitive weaknesses
  if (breakdown.competitiveAdvantage < 50) {
    weaknesses.push({
      category: 'Competitive',
      description: 'Weak competitive positioning or strong incumbents',
      severity: 'High'
    });
  }
  
  // Financial weaknesses
  if (breakdown.financialPotential < 50) {
    weaknesses.push({
      category: 'Financial',
      description: 'Unclear monetization strategy or low margin business',
      severity: 'High'
    });
  }
  
  // Risk weaknesses
  if (breakdown.riskAssessment < 50) {
    weaknesses.push({
      category: 'Risk',
      description: 'High regulatory, technical, or market risks',
      severity: 'Medium'
    });
  }
  
  // Scalability weaknesses
  if (breakdown.scalability < 50) {
    weaknesses.push({
      category: 'Scalability',
      description: 'Limited scalability or high marginal costs',
      severity: 'Medium'
    });
  }
  
  return weaknesses;
}

/**
 * Identify Opportunities
 */
function identifyOpportunities(ideaData, breakdown) {
  const opportunities = [];
  const { description = '', marketSize } = ideaData;
  const text = description.toLowerCase();
  
  // Market opportunities
  if (String(marketSize).toLowerCase().includes('large')) {
    opportunities.push({
      category: 'Market Expansion',
      description: 'Large addressable market with room for growth',
      potential: 'High'
    });
  }
  
  // Technology opportunities
  const emergingTech = ['ai', 'blockchain', 'iot', 'vr', 'ar', 'quantum'];
  if (emergingTech.some(tech => text.includes(tech))) {
    opportunities.push({
      category: 'Technology',
      description: 'Leverage emerging technology trends for competitive advantage',
      potential: 'High'
    });
  }
  
  // Partnership opportunities
  if (breakdown.marketViability > 60) {
    opportunities.push({
      category: 'Partnerships',
      description: 'Form strategic partnerships to accelerate market entry',
      potential: 'Medium'
    });
  }
  
  // International expansion
  if (breakdown.scalability > 60) {
    opportunities.push({
      category: 'Geographic',
      description: 'Expand to international markets after domestic success',
      potential: 'High'
    });
  }
  
  // Product expansion
  opportunities.push({
    category: 'Product',
    description: 'Develop complementary products or features to increase value',
    potential: 'Medium'
  });
  
  // Funding opportunities
  if (breakdown.financialPotential > 60) {
    opportunities.push({
      category: 'Funding',
      description: 'Attract venture capital or strategic investors',
      potential: 'High'
    });
  }
  
  // Social impact opportunities
  if (breakdown.socialImpact > 50) {
    opportunities.push({
      category: 'Impact',
      description: 'Access impact investing and ESG-focused funding',
      potential: 'Medium'
    });
  }
  
  // M&A opportunities
  if (breakdown.innovation > 70) {
    opportunities.push({
      category: 'Acquisition',
      description: 'Potential acquisition target for larger companies',
      potential: 'High'
    });
  }
  
  return opportunities.slice(0, 8);
}

/**
 * Identify Threats
 */
function identifyThreats(ideaData, breakdown) {
  const threats = [];
  const { description = '' } = ideaData;
  const text = description.toLowerCase();
  
  // Competitive threats
  const bigTech = ['google', 'amazon', 'facebook', 'meta', 'apple', 'microsoft'];
  if (bigTech.some(company => text.includes(company))) {
    threats.push({
      category: 'Competition',
      description: 'Large tech companies could easily replicate your solution',
      severity: 'High'
    });
  }
  
  if (breakdown.competitiveAdvantage < 60) {
    threats.push({
      category: 'Competition',
      description: 'Low barriers to entry invite numerous competitors',
      severity: 'Medium'
    });
  }
  
  // Market threats
  if (text.includes('declining') || text.includes('saturated')) {
    threats.push({
      category: 'Market',
      description: 'Market saturation or declining demand',
      severity: 'High'
    });
  }
  
  // Regulatory threats
  const regulated = ['healthcare', 'finance', 'banking', 'insurance', 'legal'];
  if (regulated.some(industry => text.includes(industry))) {
    threats.push({
      category: 'Regulatory',
      description: 'Heavy regulation could slow growth or increase costs',
      severity: 'Medium'
    });
  }
  
  // Technology threats
  threats.push({
    category: 'Technology',
    description: 'Rapid technological changes could make solution obsolete',
    severity: 'Medium'
  });
  
  // Economic threats
  threats.push({
    category: 'Economic',
    description: 'Economic downturn could reduce customer spending',
    severity: 'Medium'
  });
  
  // Funding threats
  if (breakdown.financialPotential < 60) {
    threats.push({
      category: 'Funding',
      description: 'Difficulty raising capital in competitive funding environment',
      severity: 'High'
    });
  }
  
  // Execution threats
  if (breakdown.technicalFeasibility < 60) {
    threats.push({
      category: 'Execution',
      description: 'Technical challenges could delay product launch',
      severity: 'Medium'
    });
  }
  
  return threats.slice(0, 8);
}

/**
 * Generate strategic recommendations
 */
function generateStrategicRecommendations(swot, breakdown) {
  const recommendations = [];
  
  // Leverage strengths
  if (swot.strengths.length > 3) {
    recommendations.push({
      strategy: 'Leverage Strengths',
      action: 'Double down on your strongest areas to build competitive moat',
      priority: 'High'
    });
  }
  
  // Address weaknesses
  const criticalWeaknesses = swot.weaknesses.filter(w => w.severity === 'High');
  if (criticalWeaknesses.length > 0) {
    recommendations.push({
      strategy: 'Shore Up Weaknesses',
      action: `Immediately address: ${criticalWeaknesses.map(w => w.category).join(', ')}`,
      priority: 'Critical'
    });
  }
  
  // Seize opportunities
  const highOpportunities = swot.opportunities.filter(o => o.potential === 'High');
  if (highOpportunities.length > 0) {
    recommendations.push({
      strategy: 'Capture Opportunities',
      action: `Focus on: ${highOpportunities[0].description}`,
      priority: 'High'
    });
  }
  
  // Mitigate threats
  const highThreats = swot.threats.filter(t => t.severity === 'High');
  if (highThreats.length > 0) {
    recommendations.push({
      strategy: 'Mitigate Threats',
      action: `Build defenses against: ${highThreats.map(t => t.category).join(', ')}`,
      priority: 'High'
    });
  }
  
  return recommendations;
}

/**
 * Identify priority actions
 */
function identifyPriorityActions(swot) {
  const actions = [];
  
  // Top 3 critical actions based on SWOT
  const criticalWeaknesses = swot.weaknesses.filter(w => w.severity === 'High');
  if (criticalWeaknesses.length > 0) {
    actions.push({
      action: `Fix: ${criticalWeaknesses[0].description}`,
      timeframe: 'Immediate (0-30 days)',
      impact: 'Critical'
    });
  }
  
  const highOpportunities = swot.opportunities.filter(o => o.potential === 'High');
  if (highOpportunities.length > 0) {
    actions.push({
      action: `Pursue: ${highOpportunities[0].description}`,
      timeframe: 'Short-term (1-3 months)',
      impact: 'High'
    });
  }
  
  const highThreats = swot.threats.filter(t => t.severity === 'High');
  if (highThreats.length > 0) {
    actions.push({
      action: `Defend: ${highThreats[0].description}`,
      timeframe: 'Short-term (1-3 months)',
      impact: 'High'
    });
  }
  
  return actions.slice(0, 5);
}

/**
 * Analyze competitive positioning
 */
function analyzeCompetitivePositioning(ideaData, breakdown) {
  const positioning = {
    quadrant: '',
    strategy: '',
    focus: []
  };
  
  // Determine positioning based on innovation vs market viability
  if (breakdown.innovation > 65 && breakdown.marketViability > 65) {
    positioning.quadrant = 'Star (High Innovation, High Market)';
    positioning.strategy = 'Aggressive growth and market dominance';
    positioning.focus = ['Scale fast', 'Raise capital', 'Build moat'];
  } else if (breakdown.innovation > 65 && breakdown.marketViability <= 65) {
    positioning.quadrant = 'Innovator (High Innovation, Low Market)';
    positioning.strategy = 'Validate market fit before scaling';
    positioning.focus = ['Market research', 'Pivot if needed', 'Find product-market fit'];
  } else if (breakdown.innovation <= 65 && breakdown.marketViability > 65) {
    positioning.quadrant = 'Follower (Low Innovation, High Market)';
    positioning.strategy = 'Compete on execution and customer service';
    positioning.focus = ['Operational excellence', 'Customer retention', 'Cost leadership'];
  } else {
    positioning.quadrant = 'Challenger (Low Innovation, Low Market)';
    positioning.strategy = 'Find niche or pivot significantly';
    positioning.focus = ['Deep validation', 'Consider pivot', 'Find unique angle'];
  }
  
  return positioning;
}

module.exports = {
  generateSWOTAnalysis
};
