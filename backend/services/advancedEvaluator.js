// ==========================================
// STIVAN 2.0 - REVOLUTIONARY EVALUATION ENGINE
// ==========================================
// Multi-dimensional, data-driven startup idea evaluation
// Goes beyond simple AI scoring to provide professional-grade analysis

// ==========================================
// 1. MULTI-DIMENSIONAL SCORING (8 Metrics)
// ==========================================

/**
 * Innovation Score (0-100)
 * Evaluates uniqueness, problem-solving, and differentiation
 */
const evaluateInnovation = (ideaData) => {
  const { title = '', description = '' } = ideaData;
  const text = `${title} ${description}`.toLowerCase();
  
  let score = 20; // Base score (lowered to allow very low scores)
  
  // Positive innovation signals
  const innovationKeywords = [
    'first', 'novel', 'unique', 'revolutionary', 'breakthrough', 'innovative',
    'patent', 'proprietary', 'disrupting', 'game-changing', 'never before',
    'ai-powered', 'blockchain', 'quantum', 'next-generation', 'cutting-edge'
  ];
  
  const problemSolvingKeywords = [
    'solves', 'addresses', 'fixes', 'eliminates', 'reduces', 'improves',
    'pain point', 'frustration', 'challenge', 'problem', 'inefficiency'
  ];
  
  // Negative signals (me-too products)
  const copycatKeywords = [
    'like uber', 'like airbnb', 'like facebook', 'clone', 'similar to',
    'copycat', 'me-too', 'just another'
  ];
  
  // Calculate score adjustments
  innovationKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 5;
  });
  
  problemSolvingKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 3;
  });
  
  copycatKeywords.forEach(keyword => {
    if (text.includes(keyword)) score -= 20;
  });
  
  // Penalty for empty/minimal content
  if (!title || title.length < 3) score -= 15;
  if (!description || description.length < 10) score -= 15;
  if (description.length < 50) score -= 10;
  
  // Bonus for detailed descriptions
  if (description.length > 200) score += 10;
  if (description.length > 500) score += 10;
  
  return {
    score: Math.max(0, Math.min(100, score)),
    reasoning: generateInnovationReasoning(score, text),
    suggestions: generateInnovationSuggestions(score)
  };
};

/**
 * Market Viability (0-100)
 * Analyzes market demand, target audience, and market size
 */
const evaluateMarketViability = (ideaData) => {
  const { marketSize = 'Unknown', description = '', targetAudience = '' } = ideaData;
  
  let score = 15; // Base score (lowered to allow very low scores)
  const text = `${description} ${targetAudience}`.toLowerCase();
  
  // Market size scoring
  const marketScores = {
    'large': 35,
    'enterprise': 30,
    'b2b': 25,
    'medium': 20,
    'small': 10,
    'niche': 5,
    'unknown': 0
  };
  
  const marketKey = Object.keys(marketScores).find(key => 
    String(marketSize).toLowerCase().includes(key) || text.includes(key)
  );
  if (marketKey) score += marketScores[marketKey];
  
  // Target audience clarity
  if (targetAudience && targetAudience.length > 20) score += 15;
  
  // Demand indicators
  const demandKeywords = [
    'growing market', 'high demand', 'trending', 'popular', 'needed',
    'customers want', 'market gap', 'unmet need', 'billion dollar'
  ];
  
  demandKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 3;
  });
  
  // Negative signals
  const negativeKeywords = [
    'saturated', 'declining', 'niche', 'limited market', 'small audience'
  ];
  
  negativeKeywords.forEach(keyword => {
    if (text.includes(keyword)) score -= 5;
  });
  
  // Penalty for empty/minimal market info
  if (!targetAudience || targetAudience.length < 5) score -= 20;
  if (marketSize === 'Unknown' || !marketSize) score -= 10;
  if (description.length < 30) score -= 15;
  
  return {
    score: Math.max(0, Math.min(100, score)),
    reasoning: generateMarketViabilityReasoning(score, marketSize),
    suggestions: generateMarketViabilitySuggestions(score)
  };
};

/**
 * Technical Feasibility (0-100)
 * Assesses buildability, technology requirements, and complexity
 */
const evaluateTechnicalFeasibility = (ideaData) => {
  const { description = '', teamStrength = 5 } = ideaData;
  const text = description.toLowerCase();
  
  let score = 30; // Base score (lowered to allow very low scores)
  
  // Technology complexity assessment
  const simpleSignals = [
    'web app', 'mobile app', 'website', 'platform', 'saas', 'simple'
  ];
  
  const complexSignals = [
    'ai', 'machine learning', 'blockchain', 'quantum', 'iot',
    'hardware', 'robotics', 'biotech', 'nanotech', 'crypto'
  ];
  
  const veryComplexSignals = [
    'nuclear', 'space', 'autonomous', 'brain-computer', 'genetic'
  ];
  
  // Adjust based on complexity
  if (simpleSignals.some(signal => text.includes(signal))) {
    score += 20;
  } else if (veryComplexSignals.some(signal => text.includes(signal))) {
    score -= 30;
  } else if (complexSignals.some(signal => text.includes(signal))) {
    score -= 10;
  }
  
  // Team strength adjustment
  score += (teamStrength - 5) * 3;
  
  // Implementation indicators
  if (text.includes('mvp') || text.includes('prototype')) score += 15;
  if (text.includes('proof of concept') || text.includes('demo')) score += 10;
  
  // Penalty for empty/minimal technical info
  if (!description || description.length < 20) score -= 25;
  if (teamStrength < 3) score -= 15;
  
  return {
    score: Math.max(0, Math.min(100, score)),
    reasoning: generateTechnicalFeasibilityReasoning(score, text),
    suggestions: generateTechnicalFeasibilitySuggestions(score)
  };
};

/**
 * Financial Potential (0-100)
 * Analyzes revenue model, profitability, and ROI
 */
const evaluateFinancialPotential = (ideaData) => {
  const { description = '', marketSize = '', traction = '' } = ideaData;
  const text = `${description} ${traction}`.toLowerCase();
  
  let score = 20; // Base score (lowered to allow very low scores)
  
  // Revenue model signals
  const revenueModels = [
    'subscription', 'saas', 'recurring revenue', 'monthly recurring',
    'freemium', 'enterprise sales', 'licensing', 'marketplace',
    'transaction fee', 'commission', 'advertising'
  ];
  
  revenueModels.forEach(model => {
    if (text.includes(model)) score += 5;
  });
  
  // Market size impact
  if (String(marketSize).toLowerCase().includes('large')) score += 20;
  if (String(marketSize).toLowerCase().includes('medium')) score += 10;
  
  // Traction signals
  if (text.includes('revenue') || text.includes('paying customers')) score += 25;
  if (text.includes('profit') || text.includes('profitable')) score += 15;
  
  // Pricing strategy
  if (text.includes('pricing') || text.includes('price point')) score += 5;
  
  // Cost structure
  if (text.includes('low cost') || text.includes('lean')) score += 10;
  if (text.includes('high margin') || text.includes('margins')) score += 10;
  
  // Penalty for no financial info
  if (!description || description.length < 20) score -= 20;
  if (traction === 'Idea Stage' || !traction) score -= 10;
  
  return {
    score: Math.max(0, Math.min(100, score)),
    reasoning: generateFinancialPotentialReasoning(score, text),
    suggestions: generateFinancialPotentialSuggestions(score)
  };
};

/**
 * Competitive Advantage (0-100)
 * Evaluates differentiation and barriers to entry
 */
const evaluateCompetitiveAdvantage = (ideaData) => {
  const { description = '' } = ideaData;
  const text = description.toLowerCase();
  
  let score = 20; // Base score (lowered to allow very low scores)
  
  // Competitive advantage signals
  const advantageKeywords = [
    'unique', 'differentiate', 'competitive advantage', 'moat',
    'barrier to entry', 'network effect', 'proprietary', 'exclusive',
    'patent pending', 'first mover', 'partnership', 'integration'
  ];
  
  advantageKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 5;
  });
  
  // Negative signals (strong competition)
  const competitorKeywords = [
    'google', 'amazon', 'facebook', 'meta', 'apple', 'microsoft',
    'uber', 'airbnb', 'netflix', 'spotify', 'many competitors'
  ];
  
  competitorKeywords.forEach(keyword => {
    if (text.includes(keyword)) score -= 10;
  });
  
  // USP indicators
  if (text.includes('only') || text.includes('exclusively')) score += 10;
  if (text.includes('better than') || text.includes('faster than')) score += 5;
  
  return {
    score: Math.max(0, Math.min(100, score)),
    reasoning: generateCompetitiveAdvantageReasoning(score, text),
    suggestions: generateCompetitiveAdvantageSuggestions(score)
  };
};

/**
 * Risk Assessment (0-100)
 * Higher score = Lower risk
 */
const evaluateRiskAssessment = (ideaData) => {
  const { description = '', traction = '', teamStrength = 5 } = ideaData;
  const text = description.toLowerCase();
  
  let score = 35; // Start with higher risk baseline (lowered to allow very low scores)
  
  // Risk factors (decrease score)
  const highRiskFactors = [
    'regulatory', 'compliance', 'legal', 'patent', 'license required',
    'government approval', 'fda', 'high cost', 'capital intensive'
  ];
  
  highRiskFactors.forEach(risk => {
    if (text.includes(risk)) score -= 8;
  });
  
  // Traction reduces risk
  if (String(traction).toLowerCase().includes('revenue')) score += 15;
  if (String(traction).toLowerCase().includes('users')) score += 10;
  if (String(traction).toLowerCase().includes('mvp')) score += 5;
  
  // Team strength reduces risk
  score += (teamStrength - 5) * 2;
  
  // Proven model reduces risk
  if (text.includes('proven') || text.includes('validated')) score += 10;
  
  // Penalty for empty/minimal info (increases risk)
  if (!description || description.length < 20) score -= 25;
  if (traction === 'Idea Stage' || !traction) score -= 10;
  if (teamStrength < 3) score -= 10;
  
  return {
    score: Math.max(0, Math.min(100, score)),
    reasoning: generateRiskAssessmentReasoning(score, text),
    suggestions: generateRiskAssessmentSuggestions(score)
  };
};

/**
 * Scalability (0-100)
 * Can it grow from 100 to 1M users?
 */
const evaluateScalability = (ideaData) => {
  const { description = '' } = ideaData;
  const text = description.toLowerCase();
  
  let score = 25; // Base score (lowered to allow very low scores)
  
  // High scalability signals
  const scalableModels = [
    'saas', 'software', 'platform', 'digital', 'online', 'cloud',
    'automated', 'self-service', 'api', 'marketplace'
  ];
  
  scalableModels.forEach(model => {
    if (text.includes(model)) score += 5;
  });
  
  // Low scalability signals
  const nonScalable = [
    'consulting', 'service-based', 'manual', 'custom', 'bespoke',
    'one-on-one', 'hardware', 'physical product'
  ];
  
  nonScalable.forEach(signal => {
    if (text.includes(signal)) score -= 10;
  });
  
  // Network effects
  if (text.includes('network effect') || text.includes('viral')) score += 15;
  
  // International potential
  if (text.includes('global') || text.includes('international')) score += 10;
  
  // Penalty for empty/minimal scalability info
  if (!description || description.length < 20) score -= 20;
  
  return {
    score: Math.max(0, Math.min(100, score)),
    reasoning: generateScalabilityReasoning(score, text),
    suggestions: generateScalabilitySuggestions(score)
  };
};

/**
 * Social Impact (0-100)
 * Does it help society?
 */
const evaluateSocialImpact = (ideaData) => {
  const { description = '' } = ideaData;
  const text = description.toLowerCase();
  
  let score = 15; // Base score (lowered to allow very low scores)
  
  // Positive impact signals
  const impactKeywords = [
    'healthcare', 'education', 'environment', 'sustainability', 'green',
    'social good', 'nonprofit', 'charity', 'helping', 'accessibility',
    'disability', 'poverty', 'climate', 'renewable', 'clean energy',
    'social impact', 'community', 'equality', 'diversity', 'inclusion'
  ];
  
  impactKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 4;
  });
  
  // Negative impact signals
  const negativeImpact = [
    'gambling', 'tobacco', 'alcohol', 'weapons', 'surveillance'
  ];
  
  negativeImpact.forEach(keyword => {
    if (text.includes(keyword)) score -= 15;
  });
  
  // B-Corp / Mission-driven
  if (text.includes('b-corp') || text.includes('mission-driven')) score += 10;
  
  // Penalty for empty/no social impact info
  if (!description || description.length < 20) score -= 15;
  
  return {
    score: Math.max(0, Math.min(100, score)),
    reasoning: generateSocialImpactReasoning(score, text),
    suggestions: generateSocialImpactSuggestions(score)
  };
};

// ==========================================
// REASONING GENERATORS
// ==========================================

function generateInnovationReasoning(score, text) {
  if (score >= 80) {
    return "🌟 **Exceptional Innovation!** Your idea demonstrates outstanding originality and breakthrough potential. " +
           "You're solving problems in ways that haven't been done before, which gives you a significant competitive edge. " +
           "The market loves novel solutions, and you're positioned to capture attention. " +
           "**Why this matters:** Innovative ideas attract investors, media coverage, and early adopters. " +
           "**Keep pushing:** Continue refining your unique approach and consider intellectual property protection.";
  }
  if (score >= 60) {
    return "💡 **Solid Innovation Foundation!** Your idea has promising unique elements that set it apart. " +
           "You're on the right track with creative problem-solving. " +
           "**What's working:** You've identified a real problem and have a fresh perspective. " +
           "**Opportunity to improve:** To stand out more, emphasize what makes your solution 10x better than alternatives. " +
           "**Next step:** Talk to potential users and highlight the specific features they can't get elsewhere.";
  }
  if (score >= 40) {
    return "🔍 **Good Foundation, Needs Differentiation.** Your core idea is sound, but the market has similar solutions. " +
           "Don't worry—this is common! Many successful startups started with 'another X' and found their unique angle. " +
           "**What to do:** Identify your unfair advantage. Is it better UX? Faster? Cheaper? Specialized for a niche? " +
           "**Example:** Zoom wasn't the first video tool, but it was easier and more reliable. Find YOUR 'it just works' factor. " +
           "**Action:** Survey 20 potential users and ask 'What frustrates you about current solutions?'";
  }
  return "🎯 **Let's Find Your Unique Angle!** Right now, your idea might overlap with existing solutions. " +
         "But here's the good news: every successful product found its differentiation story. " +
         "**The opportunity:** Instead of competing head-on, find an underserved niche or a specific pain point others ignore. " +
         "**Examples:** Instagram focused on mobile photos when everyone else did desktop. Slack made work chat actually enjoyable. " +
         "**Your task:** Interview 30 people in your target market. Find the ONE thing they desperately wish existed but doesn't. " +
         "**Remember:** Innovation isn't always about being first—it's about being better in a way that matters to users.";
}

function generateMarketViabilityReasoning(score, marketSize) {
  if (score >= 80) {
    return "📈 **Outstanding Market Opportunity!** You're targeting a large, validated market with clear demand signals. " +
           "This is exactly what investors want to see—a big addressable market with hungry customers. " +
           "**Why this is powerful:** Large markets mean room for multiple winners. Even capturing 1% could be huge. " +
           "**The data shows:** People are actively searching for solutions like yours. The timing is right. " +
           "**Next level:** Segment your market into beachheads. Which specific group will you win first? " +
           "**Pro tip:** Start with a niche, dominate it, then expand. Facebook started with Harvard students, not everyone.";
  }
  if (score >= 60) {
    return "✅ **Promising Market Validation!** Your market shows potential with ${marketSize} size and decent indicators. " +
           "You're in the 'good zone' where success is achievable with proper execution. " +
           "**What's encouraging:** There's genuine interest in this space. People have the problem you're solving. " +
           "**To strengthen:** Get more specific data. How many potential customers? What do they spend now? " +
           "**Action plan:** Create a simple landing page and run $200 in ads. If people click and sign up, you're onto something! " +
           "**Reality check:** Market size matters less than market access. Can you actually reach these customers?";
  }
  if (score >= 40) {
    return "🔎 **Market Needs More Validation.** You have an idea of who might buy, but we need stronger proof. " +
           "This is actually a GOOD place to be—you're not too late, but you need to validate before building. " +
           "**Common mistake to avoid:** Building first, validating later. Reverse this! " +
           "**What to do NOW:** Spend 2 weeks talking to 50 potential customers. Ask: 'How do you solve this problem today?' " +
           "**Look for:** People who say 'I hate my current solution' or 'I'd pay for something better.' " +
           "**Green flag:** If 30%+ say they'd buy immediately, you have a market. If not, pivot or refine. " +
           "**Remember:** No market = no business, regardless of how cool your solution is.";
  }
  return "🎯 **Let's Discover Your Market Together!** Right now, market demand isn't clear. But don't panic—this is solvable! " +
         "**The truth:** Most startups begin with unclear markets. The successful ones figure it out before spending $100K on development. " +
         "**Your opportunity:** You're at the perfect stage to do customer discovery RIGHT. " +
         "**The 30-Day Market Validation Challenge:** " +
         "Week 1: Interview 20 people you think are customers. Ask about their biggest frustrations. " +
         "Week 2: Interview 20 MORE people (different profiles). Look for patterns. " +
         "Week 3: Create a fake 'coming soon' page. Drive 500 visitors. Track email signups. " +
         "Week 4: Call 10 people who signed up. Ask: 'If this launched tomorrow at $X/month, would you buy?' " +
         "**If 50%+ say yes:** You have a market! Build it. " +
         "**If less:** Either wrong audience or wrong solution. Iterate. " +
         "**Success story:** Dropbox validated with a simple video before building anything. Got 75,000 signups overnight!";
}

function generateTechnicalFeasibilityReasoning(score, text) {
  if (score >= 80) {
    return "⚡ **Highly Feasible to Build!** Your idea has a clear technical path forward with manageable complexity. " +
           "This is fantastic news—you can actually ship this without getting stuck in development hell. " +
           "**Why this matters:** Many great ideas die because they're technically impossible or take 5 years to build. You don't have that problem! " +
           "**Your advantage:** You can get to market fast, validate quickly, and iterate based on real feedback. " +
           "**Timeline estimate:** With the right team, you could have an MVP in 3-4 months. " +
           "**Pro move:** Use existing tools/platforms where possible. Don't reinvent the wheel. " +
           "**Example:** Airbnb started with a WordPress site and photos. They didn't build custom software until they had traction.";
  }
  if (score >= 60) {
    return "🛠️ **Achievable with Right Resources!** Your idea is technically doable but requires some specialized skills. " +
           "Good news: This isn't rocket science. Challenging news: You'll need the right team or partners. " +
           "**What this means:** If you're non-technical, find a technical co-founder or outsource MVP development. " +
           "If you're technical, identify what skills you're missing (backend? ML? mobile?) and fill those gaps. " +
           "**Budget reality:** Expect $30-80K for MVP if outsourcing, or 4-6 months if building in-house. " +
           "**Risk mitigation:** Build a proof-of-concept first. Spend 2 weeks proving the hardest technical part works. " +
           "**Example:** If it's an AI feature, build just that in a weekend. Does it work? Great! If not, pivot before investing more.";
  }
  if (score >= 40) {
    return "🎓 **Complex but Not Impossible!** Your idea has significant technical challenges. That's actually okay—hard problems can mean fewer competitors! " +
           "**The reality:** You're looking at 6-12 months of development and need experienced engineers. " +
           "**Two paths forward:** " +
           "1. **Simplify:** What's the 20% of features that delivers 80% of value? Build ONLY that first. " +
           "2. **Partner up:** Find someone who's already solved similar problems. Maybe they'll join as co-founder or advisor. " +
           "**Critical question:** What's the HARDEST technical part? (AI algorithm? Hardware integration? Scale?) " +
           "**De-risk strategy:** Spend 1 month proving ONLY that hard part is possible. Don't touch the easy stuff yet. " +
           "**Remember:** Instagram was supposed to be a location check-in app. They pivoted to photo-sharing because it was easier to build and more loved by users.";
  }
  return "🚀 **Let's Make This Buildable!** Currently, your idea might be over-engineered or require technologies that aren't ready yet. " +
         "But here's the opportunity: Can you achieve the same outcome with simpler tech? " +
         "**Common trap:** 'I need AI/blockchain/VR!' Ask: 'Could a smart spreadsheet do this first?' " +
         "**The Wizard of Oz approach:** Manually deliver your service to 10 customers before automating anything. " +
         "**Example:** Food delivery apps started with people literally calling restaurants and placing orders manually. Once they had 100 orders/day, they built software. " +
         "**Your action plan:** " +
         "• Describe your idea to 3 developers and ask: 'How would YOU build this?' " +
         "• Whatever they suggest, cut scope in half. Then cut it in half again. That's your MVP. " +
         "• Find the one feature users CANNOT live without. Build only that. " +
         "**Mindset shift:** You're not building the final product. You're building the minimum thing that proves customers will pay.";
}

function generateFinancialPotentialReasoning(score, text) {
  if (score >= 80) return "Strong financial potential with clear revenue model and path to profitability.";
  if (score >= 60) return "Good monetization opportunity; refine your pricing and revenue strategy.";
  if (score >= 40) return "Moderate financial potential; need clearer path to revenue.";
  return "Weak financial model; rethink how you'll make money from this idea.";
}

function generateCompetitiveAdvantageReasoning(score, text) {
  if (score >= 80) return "Strong competitive advantages with clear differentiation and barriers to entry.";
  if (score >= 60) return "Some competitive advantages identified; strengthen your unique value proposition.";
  if (score >= 40) return "Limited differentiation from competitors; define what makes you different.";
  return "Weak competitive position; facing strong competitors without clear advantage.";
}

function generateRiskAssessmentReasoning(score, text) {
  if (score >= 80) return "Low-risk opportunity with proven validation and manageable challenges.";
  if (score >= 60) return "Moderate risk profile; some challenges to overcome but manageable.";
  if (score >= 40) return "Higher risk level; significant challenges in execution or market.";
  return "High-risk venture; major obstacles in legal, technical, or market domains.";
}

function generateScalabilityReasoning(score, text) {
  if (score >= 80) return "Highly scalable model that can grow exponentially with minimal friction.";
  if (score >= 60) return "Good scalability potential with some infrastructure requirements.";
  if (score >= 40) return "Moderate scalability; may face constraints as you grow.";
  return "Limited scalability; business model may require significant resources to grow.";
}

function generateSocialImpactReasoning(score, text) {
  if (score >= 80) return "Exceptional social impact with potential to significantly benefit society.";
  if (score >= 60) return "Positive social impact in specific areas; consider expanding your mission.";
  if (score >= 40) return "Neutral social impact; primarily a commercial venture.";
  return "Limited or potentially negative social impact considerations.";
}

// ==========================================
// SUGGESTION GENERATORS
// ==========================================

function generateInnovationSuggestions(score) {
  if (score < 60) {
    return [
      "Research existing solutions and identify specific gaps you can fill",
      "Define your unique value proposition in one clear sentence",
      "Consider filing for provisional patent if truly novel"
    ];
  }
  return [
    "Document your innovation thoroughly for IP protection",
    "Build prototypes to validate your unique approach"
  ];
}

function generateMarketViabilitySuggestions(score) {
  if (score < 60) {
    return [
      "Conduct 20+ customer interviews to validate demand",
      "Use Google Trends to analyze search interest in your category",
      "Calculate your Total Addressable Market (TAM) with data"
    ];
  }
  return [
    "Expand to adjacent market segments",
    "Build partnerships with key market players"
  ];
}

function generateTechnicalFeasibilitySuggestions(score) {
  if (score < 60) {
    return [
      "Break down technical requirements into specific milestones",
      "Identify skill gaps and recruit technical co-founder or advisors",
      "Build a proof-of-concept before committing to full development"
    ];
  }
  return [
    "Document technical architecture for scalability",
    "Plan for technical debt and ongoing maintenance"
  ];
}

function generateFinancialPotentialSuggestions(score) {
  if (score < 60) {
    return [
      "Define clear revenue streams and pricing strategy",
      "Calculate unit economics: CAC, LTV, and payback period",
      "Create 3-year financial projections with conservative estimates"
    ];
  }
  return [
    "Optimize pricing based on value delivered",
    "Explore additional revenue streams"
  ];
}

function generateCompetitiveAdvantageSuggestions(score) {
  if (score < 60) {
    return [
      "Conduct competitive analysis of top 5 players in your space",
      "Identify and build around your unfair advantage",
      "Create barriers to entry through network effects or proprietary tech"
    ];
  }
  return [
    "Strengthen your moat through strategic partnerships",
    "Consider vertical integration opportunities"
  ];
}

function generateRiskAssessmentSuggestions(score) {
  if (score < 60) {
    return [
      "Identify top 5 risks and create mitigation strategies",
      "Consult legal expert if regulatory risks exist",
      "Build financial runway of at least 12 months"
    ];
  }
  return [
    "Continue de-risking through customer validation",
    "Build contingency plans for key risks"
  ];
}

function generateScalabilitySuggestions(score) {
  if (score < 60) {
    return [
      "Identify scalability bottlenecks in your business model",
      "Automate processes where possible to reduce marginal costs",
      "Design infrastructure that can handle 100x growth"
    ];
  }
  return [
    "Plan international expansion strategy",
    "Build platform partnerships for distribution"
  ];
}

function generateSocialImpactSuggestions(score) {
  return [
    "Consider B-Corp certification if mission-driven",
    "Measure and report social impact metrics",
    "Explore grants and impact investment opportunities"
  ];
}

// ==========================================
// MAIN EVALUATION FUNCTION
// ==========================================

const evaluateStartupIdea = async (ideaData) => {
  try {
    // Run all 8 dimensional evaluations
    const innovation = evaluateInnovation(ideaData);
    const marketViability = evaluateMarketViability(ideaData);
    const technicalFeasibility = evaluateTechnicalFeasibility(ideaData);
    const financialPotential = evaluateFinancialPotential(ideaData);
    const competitiveAdvantage = evaluateCompetitiveAdvantage(ideaData);
    const riskAssessment = evaluateRiskAssessment(ideaData);
    const scalability = evaluateScalability(ideaData);
    const socialImpact = evaluateSocialImpact(ideaData);

    // Calculate weighted overall score
    // Innovation (15%), Market (20%), Technical (15%), Financial (20%)
    // Competitive (10%), Risk (10%), Scalability (5%), Social (5%)
    const overallScore = Math.round(
      innovation.score * 0.15 +
      marketViability.score * 0.20 +
      technicalFeasibility.score * 0.15 +
      financialPotential.score * 0.20 +
      competitiveAdvantage.score * 0.10 +
      riskAssessment.score * 0.10 +
      scalability.score * 0.05 +
      socialImpact.score * 0.05
    );

    // Determine verdict
    let verdict = 'Risky';
    let investmentReadiness = 'Not Ready';
    
    if (overallScore >= 85) {
      verdict = 'Exceptional';
      investmentReadiness = 'Investor Ready';
    } else if (overallScore >= 75) {
      verdict = 'Viable';
      investmentReadiness = 'Nearly Ready';
    } else if (overallScore >= 60) {
      verdict = 'Promising';
      investmentReadiness = 'Needs Work';
    } else if (overallScore >= 40) {
      verdict = 'Risky';
      investmentReadiness = 'Early Stage';
    }

    // Combine all suggestions (prioritize lowest scoring dimensions)
    const allDimensions = [
      { name: 'Innovation', ...innovation },
      { name: 'Market Viability', ...marketViability },
      { name: 'Technical Feasibility', ...technicalFeasibility },
      { name: 'Financial Potential', ...financialPotential },
      { name: 'Competitive Advantage', ...competitiveAdvantage },
      { name: 'Risk Assessment', ...riskAssessment },
      { name: 'Scalability', ...scalability },
      { name: 'Social Impact', ...socialImpact }
    ];

    // Sort by lowest score and collect suggestions
    const sortedDimensions = allDimensions.sort((a, b) => a.score - b.score);
    const topSuggestions = [];
    
    sortedDimensions.forEach(dim => {
      if (dim.score < 70 && topSuggestions.length < 10) {
        topSuggestions.push(...dim.suggestions);
      }
    });

    return {
      score: overallScore,
      verdict,
      investmentReadiness,
      breakdown: {
        innovation: innovation.score,
        marketViability: marketViability.score,
        technicalFeasibility: technicalFeasibility.score,
        financialPotential: financialPotential.score,
        competitiveAdvantage: competitiveAdvantage.score,
        riskAssessment: riskAssessment.score,
        scalability: scalability.score,
        socialImpact: socialImpact.score
      },
      detailedAnalysis: {
        innovation: { ...innovation },
        marketViability: { ...marketViability },
        technicalFeasibility: { ...technicalFeasibility },
        financialPotential: { ...financialPotential },
        competitiveAdvantage: { ...competitiveAdvantage },
        riskAssessment: { ...riskAssessment },
        scalability: { ...scalability },
        socialImpact: { ...socialImpact }
      },
      suggestions: topSuggestions.slice(0, 10),
      reasoning: `Evaluated across 8 professional dimensions. Overall score: ${overallScore}/100. Strongest areas: ${sortedDimensions.slice(-2).map(d => d.name).join(', ')}. Areas needing attention: ${sortedDimensions.slice(0, 2).map(d => d.name).join(', ')}.`
    };

  } catch (error) {
    console.error('Advanced evaluation error:', error);
    throw error;
  }
};

module.exports = { evaluateStartupIdea };
