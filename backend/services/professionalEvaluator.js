// Deterministic, professional-grade evaluator for startup ideas.
// Produces reproducible scores, actionable suggestions, and concise reasoning
// without relying on external generative models for numeric scoring.

const normalizeText = (t = '') => t.toLowerCase();

const mapMarketSizeToScore = (marketSize) => {
  if (!marketSize) return 0;
  const m = String(marketSize).toLowerCase();
  if (m.includes('large') || m.includes('enterprise') || m.includes('b2b')) return 90;
  if (m.includes('medium') || m.includes('mid')) return 70;
  if (m.includes('small') || m.includes('niche') || m.includes('local')) return 45;
  if (m.includes('unknown') || m.includes('unspecified')) return 10;
  return 50; // fallback neutral
};

const mapTeamStrengthToScore = (teamStrength) => {
  const t = Number(teamStrength) || 0;
  if (t >= 9) return 95;
  if (t >= 7) return 80;
  if (t >= 5) return 60;
  if (t >= 3) return 30;
  if (t > 0) return 10;
  return 5;
};

const mapTractionToScore = (traction, description = '') => {
  const t = String(traction || '').toLowerCase();
  if (t.includes('revenue') || t.includes('paying')) return 95;
  if (t.includes('early users') || t.includes('beta')) return 70;
  if (t.includes('mvp') || t.includes('prototype') || description.includes('mvp')) return 50;
  if (t.includes('idea') || t.includes('none') || !t) return 10;
  return 30;
};

const detectInnovationScore = (description = '') => {
  const d = normalizeText(description || '');
  // Positive signals
  const positive = ['novel', 'first', 'unique', 'patent', 'patents', 'unicorn', 'breakthrough', 'proprietary', 'proprietary algorithm'];
  const heuristicPos = positive.reduce((acc, kw) => acc + (d.includes(kw) ? 1 : 0), 0);

  // Negative signals (copycat, similar to, like X)
  const negative = ['like ', 'similar to', 'copy', 'clone', 'me too', 'copycat', 'competitor'];
  const heuristicNeg = negative.reduce((acc, kw) => acc + (d.includes(kw) ? 1 : 0), 0);

  const score = Math.max(0, Math.min(100, 60 + heuristicPos * 12 - heuristicNeg * 20));
  return score;
};

const detectCompetitivePenalty = (description = '') => {
  const giants = ['google', 'amazon', 'meta', 'facebook', 'uber', 'microsoft', 'apple'];
  const d = normalizeText(description || '');
  return giants.some(g => d.includes(g)) ? -25 : 0;
};

const generateSuggestions = (breakdown) => {
  const suggestions = [];
  if (breakdown.market < 40) {
    suggestions.push('Validate and quantify your total addressable market (TAM) with concrete estimates and references.');
    suggestions.push('Run at least 15 customer interviews to confirm demand and pricing sensitivity.');
  }
  if (breakdown.team < 40) {
    suggestions.push('Document the key roles missing on your team and recruit a technical or go-to-market co-founder or advisor.');
    suggestions.push('Create a one-page skill map that lists current skills and gaps and a 60-day hiring/advisory plan.');
  }
  if (breakdown.execution < 40) {
    suggestions.push('Build a focused MVP that validates the core riskiest assumption; deploy to a small pilot group within 30 days.');
    suggestions.push('Define one metric (e.g., conversion or retention) and a 90-day experiment plan to move that metric.');
  }
  if (breakdown.innovation < 40) {
    suggestions.push('Clearly articulate 2–3 differentiators vs competitors and, where possible, identify defensible advantages (IP, unique data, distribution).');
    suggestions.push('Prototype the most differentiated feature and collect qualitative feedback from target users.');
  }

  // If none of the categories were weak, provide growth-oriented suggestions
  if (suggestions.length === 0) {
    suggestions.push('Run a paid user acquisition pilot to validate CAC and early LTV.');
    suggestions.push('Prepare a one-page GTM plan focused on the top 2 channels for early adopters.');
  }

  // Limit suggestions to 6 concise items
  return suggestions.slice(0, 6);
};

const buildReasoning = (finalScore, breakdown) => {
  const parts = [];
  parts.push(`Final score ${finalScore} derived from weighted categories: Market ${breakdown.market}, Team ${breakdown.team}, Execution ${breakdown.execution}, Innovation ${breakdown.innovation}.`);
  // One-sentence assessment
  if (finalScore >= 86) parts.push('This idea shows exceptional potential with strong market and execution signals.');
  else if (finalScore >= 71) parts.push('This idea is viable with solid fundamentals but still has areas to validate.');
  else if (finalScore >= 56) parts.push('This is promising but requires focused validation of key risks.');
  else parts.push('This idea is risky; address the highlighted gaps before scaling.');
  return parts.join(' ');
};

const evaluateStartupIdea = async (ideaData) => {
  try {
    const title = ideaData.title || '';
    const description = ideaData.description || '';
    const marketSize = ideaData.marketSize || 'Unknown';
    const teamStrength = ideaData.teamStrength || 0;
    const traction = ideaData.traction || '';

    // Quick validation rules (deterministic)
    if (!title || !description || description.length < 20) {
      return {
        score: 0,
        verdict: 'Risky',
        suggestions: [
          'Provide a clear, concise description (>= 20 characters).',
          'Add details about the target market and any early traction or prototypes.'
        ],
        breakdown: { market: 0, team: mapTeamStrengthToScore(teamStrength), execution: 0, innovation: 0 },
        reasoning: 'Missing or insufficient title/description resulted in automatic low evaluation.'
      };
    }

    // Compute category scores
    let market = mapMarketSizeToScore(marketSize);
    let team = mapTeamStrengthToScore(teamStrength);
    let execution = mapTractionToScore(traction, description);
    let innovation = detectInnovationScore(description);

    // Competitive penalty for confronting giants without clear differentiation
    const penalty = detectCompetitivePenalty(description);
    market = Math.max(0, Math.min(100, market + penalty));

    // Weighted scoring
    const finalScore = Math.round((market * 0.25) + (team * 0.25) + (execution * 0.30) + (innovation * 0.20));

    let verdict = 'Risky';
    if (finalScore > 85) verdict = 'Viable';
    else if (finalScore >= 71) verdict = 'Viable';
    else if (finalScore >= 56) verdict = 'Promising';
    else verdict = 'Risky';

    const breakdown = { market, team, execution, innovation };
    const suggestions = generateSuggestions(breakdown);
    const reasoning = buildReasoning(finalScore, breakdown);

    return {
      score: finalScore,
      verdict,
      suggestions,
      breakdown,
      reasoning
    };
  } catch (err) {
    console.error('Professional evaluator error:', err.message);
    // As a last resort, return a safe fallback
    return {
      score: 40,
      verdict: 'Promising',
      suggestions: ['Provide more details so the evaluator can produce a deterministic assessment.'],
      breakdown: { market: 40, team: 40, execution: 40, innovation: 40 },
      reasoning: 'Fallback deterministic evaluation due to internal error.'
    };
  }
};

module.exports = { evaluateStartupIdea };
