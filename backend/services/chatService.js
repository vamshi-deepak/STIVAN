const genAI = require('../config/gemini');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const getChatReply = async (message) => {
  try {
    // Get model and generate a response
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `You are a helpful, professional startup advisor chatbot. ONLY answer queries that are specifically about startups, startup ideas, product enhancements, growth/traction experiments, fundraising, team building, product strategy, pricing, customer acquisition, or related doubts. If the user's request is off-topic (e.g., sexual, illegal, hateful, political, medical/legal advice unrelated to startups), respond with: "I'm sorry, I can only help with startup-related questions."\n\nUser message: ${message}\n\nRespond helpfully and concisely with actionable suggestions or steps. If giving a list, keep it short (3-6 items).`;

    const result = await model.generateContent(prompt);
    const text = result && result.response && typeof result.response.text === 'function'
      ? result.response.text()
      : '';
    return (typeof text === 'string' && text.trim().length > 0) ? text : '';
  } catch (error) {
    console.error('ChatService error:', error?.message || error);
    // Simple fallback
    return "Sorry, I'm having trouble reaching the assistant right now. Please try again later.";
  }
};

module.exports = { getChatReply };
