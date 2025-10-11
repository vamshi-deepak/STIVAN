const genAI = require('../config/gemini');

async function summarizeIdeasWithGemini(ideas) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Prepare a compact JSON payload to keep prompt small
  const compact = ideas.map(i => ({
    title: i.title,
    description: i.description?.slice(0, 600) || '',
    score: typeof i.score === 'number' ? i.score : null,
    verdict: i.verdict || null,
    suggestions: Array.isArray(i.suggestions) ? i.suggestions.slice(0, 5) : [],
    createdAt: i.createdAt
  }));

  const prompt = `You are an expert startup advisor. Given a user's previously evaluated startup ideas, produce a concise revision and classification. Be specific and rely ONLY on the provided data. Output plain text with clear sections.

INPUT IDEAS (JSON):\n${JSON.stringify(compact)}\n\nREQUIREMENTS:\n1) Start with a one-paragraph high-level summary (how many ideas, general quality).\n2) Strength buckets by score using this rubric: Strong (>=71), Average (56-70), Weak (<=55). List up to 5 examples under each with title and score.\n3) Domain buckets by content: Tech, Business, Creative, Other. Provide counts for each and up to 3 examples with title.\n4) Common strengths and weaknesses observed across the portfolio.\n5) Actionable next steps (3-5 concise bullets).\n\nTone: concise, helpful, and practical.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  if (!text || text.length < 10) throw new Error('Empty Gemini summary');
  return text;
}

module.exports = { summarizeIdeasWithGemini };
