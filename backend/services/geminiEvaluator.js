const genAI = require('../config/gemini');

const evaluateStartupIdea = async (ideaData) => {
  try {
    // ✅ FIXED: Use the correct model name
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash"
    });
    
    const prompt = `
You are an expert startup advisor. Evaluate this startup idea and return ONLY a valid JSON response with no additional text.

Startup Idea Details:
- Title: ${ideaData.title}
- Description: ${ideaData.description}
- Market Size: ${ideaData.marketSize}
- Team Strength (1-10): ${ideaData.teamStrength}
- Current Traction: ${ideaData.traction}

Evaluate based on:
1. Market potential and size
2. Team capability and experience
3. Execution feasibility
4. Innovation and differentiation

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
  }
}

Score ranges: 0-40 = Risky, 41-70 = Promising, 71-100 = Viable
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
    if (!evaluation.score || !evaluation.verdict || !evaluation.suggestions || !evaluation.breakdown) {
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
    }
  };
};

module.exports = { evaluateStartupIdea };