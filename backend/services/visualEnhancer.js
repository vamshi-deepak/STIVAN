// ==========================================
// VISUAL ENHANCEMENT SERVICE
// ==========================================
// Adds emojis, visual bars, speedometer data, and engaging presentation

/**
 * Generate visual score representation (speedometer/gauge data)
 */
const generateSpeedometerData = (score) => {
  let color, emoji, zone, message;
  
  if (score >= 86) {
    color = '#00C853'; // Green
    emoji = '🚀';
    zone = 'EXCEPTIONAL';
    message = 'Outstanding! You\'re in the top tier!';
  } else if (score >= 71) {
    color = '#64DD17'; // Light green
    emoji = '⭐';
    zone = 'VIABLE';
    message = 'Strong performance! You\'re on the right track!';
  } else if (score >= 56) {
    color = '#FFD600'; // Yellow
    emoji = '💡';
    zone = 'PROMISING';
    message = 'Good potential! Focus on key improvements!';
  } else if (score >= 40) {
    color = '#FF6D00'; // Orange
    emoji = '⚠️';
    zone = 'NEEDS WORK';
    message = 'Don\'t give up! Address the gaps and you can succeed!';
  } else {
    color = '#DD2C00'; // Red
    emoji = '#D32F2F';
    zone = 'EARLY STAGE';
    message = 'Every great startup started here. Let\'s build it right!';
  }
  
  return {
    score,
    color,
    emoji,
    zone,
    message,
    percentage: score,
    needle: {
      angle: (score / 100) * 180 - 90, // -90 to 90 degrees
      animationDuration: 2000 // 2 seconds
    },
    segments: [
      { min: 0, max: 40, color: '#DD2C00', label: 'Early Stage' },
      { min: 40, max: 56, color: '#FF6D00', label: 'Needs Work' },
      { min: 56, max: 71, color: '#FFD600', label: 'Promising' },
      { min: 71, max: 86, color: '#64DD17', label: 'Viable' },
      { min: 86, max: 100, color: '#00C853', label: 'Exceptional' }
    ]
  };
};

/**
 * Generate visual bar for dimension score
 */
const generateVisualBar = (score, maxWidth = 20) => {
  const filled = Math.round((score / 100) * maxWidth);
  const empty = maxWidth - filled;
  
  let color;
  if (score >= 70) color = '🟩'; // Green
  else if (score >= 50) color = '🟨'; // Yellow
  else color = '🟥'; // Red
  
  return {
    bar: color.repeat(filled) + '⬜'.repeat(empty),
    text: `${score}/100`,
    percentage: score,
    emoji: score >= 70 ? '✨' : score >= 50 ? '💫' : '🌟'
  };
};

/**
 * Get emoji for dimension based on score
 */
const getDimensionEmoji = (dimension, score) => {
  const emojiMap = {
    innovation: score >= 70 ? '💡✨' : score >= 50 ? '💡' : '🔍',
    marketViability: score >= 70 ? '📈💰' : score >= 50 ? '📊' : '🔎',
    technicalFeasibility: score >= 70 ? '⚡🚀' : score >= 50 ? '🛠️' : '🎓',
    financialPotential: score >= 70 ? '💎💵' : score >= 50 ? '💰' : '📊',
    competitiveAdvantage: score >= 70 ? '🏆⚔️' : score >= 50 ? '🎯' : '🤺',
    riskAssessment: score >= 70 ? '✅🛡️' : score >= 50 ? '⚖️' : '⚠️',
    scalability: score >= 70 ? '📈🌍' : score >= 50 ? '📊' : '🔄',
    socialImpact: score >= 70 ? '🌟🌍' : score >= 50 ? '🌱' : '🤝'
  };
  
  return emojiMap[dimension] || '⭐';
};

/**
 * Generate dimension visual card
 */
const generateDimensionCard = (dimension, data) => {
  const { score, reasoning, suggestions } = data;
  const emoji = getDimensionEmoji(dimension, score);
  const bar = generateVisualBar(score);
  
  let grade, gradeEmoji;
  if (score >= 90) { grade = 'A+'; gradeEmoji = '🏆'; }
  else if (score >= 80) { grade = 'A'; gradeEmoji = '⭐'; }
  else if (score >= 70) { grade = 'B+'; gradeEmoji = '💪'; }
  else if (score >= 60) { grade = 'B'; gradeEmoji = '👍'; }
  else if (score >= 50) { grade = 'C+'; gradeEmoji = '📈'; }
  else if (score >= 40) { grade = 'C'; gradeEmoji = '🎯'; }
  else { grade = 'D'; gradeEmoji = '💡'; }
  
  return {
    dimension: dimension.replace(/([A-Z])/g, ' $1').trim(),
    emoji,
    score,
    grade,
    gradeEmoji,
    visualBar: bar,
    reasoning,
    suggestions,
    status: score >= 70 ? 'strong' : score >= 50 ? 'moderate' : 'needs-improvement',
    improvementPotential: 100 - score,
    celebrationMessage: score >= 80 ? '🎉 Excellent work on this dimension!' : 
                        score >= 60 ? '✨ Strong foundation here!' :
                        score >= 40 ? '💪 Room for improvement!' :
                        '🚀 Great opportunity to level up!'
  };
};

/**
 * Generate investment readiness badge
 */
const generateInvestmentBadge = (readiness, score) => {
  const badges = {
    'Investor Ready': {
      emoji: '💎',
      color: '#00C853',
      icon: '🏆',
      message: 'Ready to pitch to investors!',
      action: 'Start reaching out to VCs and angels',
      confidence: 'Very High'
    },
    'Nearly Ready': {
      emoji: '⭐',
      color: '#64DD17',
      icon: '📈',
      message: 'Almost there! A few tweaks needed',
      action: 'Polish your pitch deck and financial projections',
      confidence: 'High'
    },
    'Needs Work': {
      emoji: '💪',
      color: '#FFD600',
      icon: '🎯',
      message: 'Build more traction before fundraising',
      action: 'Focus on customer validation and early revenue',
      confidence: 'Moderate'
    },
    'Early Stage': {
      emoji: '🌱',
      color: '#FF6D00',
      icon: '🚀',
      message: 'Perfect time to validate and build',
      action: 'Start with customer interviews and MVP',
      confidence: 'Building'
    },
    'Not Ready': {
      emoji: '💡',
      color: '#DD2C00',
      icon: '🔍',
      message: 'Focus on validation before fundraising',
      action: 'Prove product-market fit first',
      confidence: 'Early'
    }
  };
  
  return badges[readiness] || badges['Not Ready'];
};

/**
 * Generate success probability visualization
 */
const generateSuccessProbabilityViz = (probability) => {
  const segments = 20;
  const filled = Math.round((probability / 100) * segments);
  
  let emoji, message, color;
  if (probability >= 70) {
    emoji = '🎯';
    message = 'High probability of success!';
    color = '#00C853';
  } else if (probability >= 50) {
    emoji = '💪';
    message = 'Good chance with proper execution!';
    color = '#FFD600';
  } else if (probability >= 30) {
    emoji = '🚀';
    message = 'Challenging but achievable!';
    color = '#FF6D00';
  } else {
    emoji = '💡';
    message = 'Significant work needed!';
    color = '#DD2C00';
  }
  
  return {
    probability,
    emoji,
    message,
    color,
    visualBar: '▓'.repeat(filled) + '░'.repeat(segments - filled),
    confidenceLevel: probability >= 70 ? 'High' : probability >= 50 ? 'Moderate' : 'Low',
    recommendation: probability >= 60 ? 'Recommended to proceed' : 
                     probability >= 40 ? 'Proceed with caution and validation' :
                     'Focus on addressing key risks first'
  };
};

/**
 * Generate milestone celebration messages
 */
const generateMilestoneMessages = (evaluation) => {
  const messages = [];
  
  // Check for exceptional dimensions
  const exceptionalDims = Object.entries(evaluation.breakdown)
    .filter(([key, value]) => value >= 85)
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim());
  
  if (exceptionalDims.length > 0) {
    messages.push({
      type: 'celebration',
      emoji: '🎉',
      title: 'Outstanding Performance!',
      message: `Your idea excels in: ${exceptionalDims.join(', ')}!`,
      action: 'Leverage these strengths in your pitch and marketing'
    });
  }
  
  // Check for overall score milestones
  if (evaluation.score >= 80) {
    messages.push({
      type: 'achievement',
      emoji: '🏆',
      title: 'Top Tier Idea!',
      message: 'Your idea is in the top 10% of evaluations!',
      action: 'Consider applying to top startup accelerators'
    });
  }
  
  // Check for investment readiness
  if (evaluation.investmentReadiness === 'Investor Ready') {
    messages.push({
      type: 'milestone',
      emoji: '💎',
      title: 'Investor Ready!',
      message: 'You\'re ready to start raising capital!',
      action: 'Prepare your pitch deck and start networking'
    });
  }
  
  return messages;
};

/**
 * Generate encouraging next steps with emojis
 */
const generateEncouragingNextSteps = (steps) => {
  const emojis = ['🎯', '💪', '🚀', '⭐', '💡', '🔥', '✨', '📈'];
  
  return steps.map((step, index) => ({
    step: step,
    emoji: emojis[index % emojis.length],
    priority: index < 3 ? 'HIGH' : 'MEDIUM',
    timeframe: index === 0 ? 'This week' : index < 3 ? 'This month' : 'Next 90 days',
    motivationBoost: [
      'You\'ve got this! 💪',
      'One step closer to success! 🎯',
      'Keep the momentum going! 🚀',
      'Great progress ahead! ⭐'
    ][index % 4]
  }));
};

/**
 * Apply visual enhancements to evaluation result
 */
const enhanceEvaluationVisually = (evaluation) => {
  return {
    ...evaluation,
    
    // Main speedometer for overall score
    speedometer: generateSpeedometerData(evaluation.score),
    
    // Visual cards for each dimension
    dimensionCards: Object.entries(evaluation.detailedAnalysis || {}).map(([dim, data]) => 
      generateDimensionCard(dim, data)
    ),
    
    // Investment readiness badge
    investmentBadge: generateInvestmentBadge(
      evaluation.investmentReadiness, 
      evaluation.score
    ),
    
    // Success probability visualization
    successProbabilityViz: generateSuccessProbabilityViz(evaluation.successProbability),
    
    // Milestone messages
    milestoneMessages: generateMilestoneMessages(evaluation),
    
    // Enhanced next steps
    enhancedNextSteps: generateEncouragingNextSteps(evaluation.immediateNextSteps || []),
    
    // Overall encouragement
    encouragement: {
      emoji: evaluation.score >= 70 ? '🎉' : evaluation.score >= 50 ? '💪' : '🚀',
      title: evaluation.score >= 70 ? 'Fantastic Start!' : 
             evaluation.score >= 50 ? 'Great Potential!' : 
             'Exciting Journey Ahead!',
      message: evaluation.score >= 70 ? 
        'Your idea shows exceptional promise. Focus on execution and you\'ll go far!' :
        evaluation.score >= 50 ?
        'You have a solid foundation. Address the key gaps and you\'ll be unstoppable!' :
        'Every successful startup started exactly where you are. With focus and iteration, you can build something amazing!',
      motivationalQuote: evaluation.score >= 70 ?
        '"The best time to plant a tree was 20 years ago. The second best time is now." - Start building!' :
        evaluation.score >= 50 ?
        '"Success is not final, failure is not fatal: it is the courage to continue that counts." - Keep refining!' :
        '"Every expert was once a beginner. Every master was once a disaster." - Keep learning and iterating!'
    }
  };
};

module.exports = {
  generateSpeedometerData,
  generateVisualBar,
  getDimensionEmoji,
  generateDimensionCard,
  generateInvestmentBadge,
  generateSuccessProbabilityViz,
  generateMilestoneMessages,
  generateEncouragingNextSteps,
  enhanceEvaluationVisually
};
