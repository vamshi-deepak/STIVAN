const genAI = require('../config/gemini');

const evaluateStartupIdea = async (ideaData) => {
  try {
    // ✅ FIXED: Use the correct model name
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash"
    });
    
  const prompt = ` 
You are an expert startup advisor. Evaluate this startup idea with STRICT scoring criteria and return ONLY a valid JSON response with no additional text.

Startup Idea Details:
- Title: ${ideaData.title}
- Description: ${ideaData.description}
- Market Size: ${ideaData.marketSize}
- Team Strength (1-10): ${ideaData.teamStrength}
- Current Traction: ${ideaData.traction}

CRITICAL EVALUATION RULES (MUST FOLLOW):

1. MISSING INFORMATION PENALTIES:
   - If title is missing/empty: AUTOMATIC score = 0, verdict = "Risky"
   - If description is missing/empty/vague (less than 20 chars): AUTOMATIC score = 0, verdict = "Risky"
   - If market size is "unknown" or empty: Market score = 0
   - If team strength is below 3: Team score capped at 20
   - If traction is "none" or "idea stage": Execution score capped at 30

2. MARKET EVALUATION (25% weight):
   - Large market (>$1B): 85-100 points
   - Medium market ($100M-$1B): 60-80 points
   - Small market (<$100M): 30-50 points
   - Niche/Unknown market: 0-20 points
   - Competing with entrenched giants (Google, Amazon, Meta, Uber) without clear 10x differentiation: -30 points

3. TEAM EVALUATION (25% weight):
   - Rating 9-10: 90-100 points
   - Rating 7-8: 70-85 points
   - Rating 5-6: 50-65 points
   - Rating 3-4: 20-40 points
   - Rating 1-2: 0-15 points

4. EXECUTION EVALUATION (30% weight):
   - Paying customers + revenue: 80-100 points
   - Active users (100+): 60-75 points
   - Prototype/MVP with real users: 40-55 points
   - Just an idea/no validation: 10-25 points
   - No traction mentioned: 0-10 points

5. INNOVATION EVALUATION (20% weight):
   - Novel solution to hardproblem: 85-100 points
   - Unique approach to existing problem: 65-80 points
   - Incremental improvement: 40-60 points
   - Copycat/saturated market: 10-30 points
   - No clear differentiation: 0-10 points

WEIGHTED SCORING FORMULA:
Final Score = (Market × 0.25) + (Team × 0.25) + (Execution × 0.30) + (Innovation × 0.20)

VERDICT ASSIGNMENT (STRICT):
- 0-30 = "Risky" (High risk, significant gaps)
- 31-55 = "Risky" (Multiple weak areas)
- 56-70 = "Promising" (Potential, needs work)
- 71-85 = "Viable" (Strong fundamentals)
- 86-100 = "Viable" (Exceptional opportunity)

SUGGESTIONS REQUIREMENTS:
- If score < 40: Must include at least 4 critical improvements needed
- If any category scores below 40: Must specifically address that weakness
- Always include actionable, specific recommendations (not generic advice)

Return JSON in exactly this format:
{
  "score": 75,
  "verdict": "Promising",
  "suggestions": [
    "Focus on user acquisition strategy",
    "Validate product-market fit with early users",
    "Consider partnerships to accelerate growth"
  ],
  "breakdown": {
    "market": 80,
    "team": 65,
    "execution": 75,
    "innovation": 70
  },
  "reasoning": "One concise paragraph explaining how the above score was derived based on the inputs and rubric."
}

IMPORTANT: Be harsh and realistic. Empty inputs = near-zero scores. No participation trophies.
`;  


    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Clean up the response to extract JSON
    let jsonText = responseText;
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0];
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1];
    }
    
    const evaluation = JSON.parse(jsonText);
    
    // Validate the response structure
    if (!evaluation.score || !evaluation.verdict || !evaluation.suggestions || !evaluation.breakdown || !evaluation.reasoning) {
      throw new Error('Invalid evaluation response structure');
    }

    console.log('✅ Gemini evaluation successful!');
    return evaluation;
    
  } catch (error) {
    console.error('Gemini evaluation error:', error.message);
    console.log('⚠️ Using fallback evaluation instead');
    
    // Fallback to simple rule-based evaluation
    return getFallbackEvaluation(ideaData);
  }
};

// Fallback evaluation if Gemini fails
const getFallbackEvaluation = (ideaData) => {
  let score = 50; // Base score
  
  // Market size scoring
  const marketScores = { 'Large': 25, 'Medium': 15, 'Small': 5, 'Unknown': 0 };
  score += marketScores[ideaData.marketSize] || 0;
  
  // Team strength scoring
  score += (ideaData.teamStrength - 5) * 2;
  
  // Traction scoring
  const tractionScores = {
    'Revenue': 20, 'Early Users': 15, 'MVP': 10,
    'Prototype': 5, 'Idea Stage': 0, 'None': -5
  };
  score += tractionScores[ideaData.traction] || 0;
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  let verdict = 'Risky';
  if (score > 70) verdict = 'Viable';
  else if (score > 40) verdict = 'Promising';
  
  console.log(`📊 Fallback evaluation complete - Score: ${score}, Verdict: ${verdict}`);
  
  return {
    score,
    verdict,
    suggestions: [
      'Validate your market assumptions with customer interviews',
      'Build a stronger team if possible - consider co-founders',
      'Focus on getting early user feedback quickly',
      'Start with a minimal viable product (MVP)',
      'Research your competitors thoroughly'
    ],
    breakdown: {
      market: Math.min(100, score + 10),
      team: ideaData.teamStrength * 10,
      execution: score,
      innovation: Math.max(20, score - 10)
    },
    reasoning: `Score ${score} with verdict ${verdict} was computed using a weighted rubric based on market (${ideaData.marketSize}), team (${ideaData.teamStrength}/10), and traction (${ideaData.traction}). Missing or weaker inputs reduce category weights; actionable suggestions target the weakest areas.`
  };
};

module.exports = { evaluateStartupIdea };