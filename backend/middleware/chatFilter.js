// Simple content filter middleware for chat messages
// Allows only startup-related queries: ideas, suggestions, enhancements, doubts
// Blocks adult, illegal, hateful, political, and other off-topic queries.

// NOTE: We no longer require specific "startup" keywords here. The LLM prompt
// in services/chatService.js enforces startup-only answers. This middleware
// only blocks clearly disallowed content.

const disallowedKeywords = [
  // adult/sexual
  'sex', 'porn', 'nude', 'nude', 'xxx', 'sexual', 'escort', 'pornography',
  // illegal
  'hack', 'hack into', 'illegal', 'bomb', 'drugs', 'how to steal', 'password',
  // hate/violent
  'kill', 'murder', 'rape', 'terrorist', 'hate',
  // political (optional)
  'vote', 'election', 'politic', 'president', 'congress',
];

function containsKeyword(text, list) {
  const lower = text.toLowerCase();
  return list.some(k => lower.includes(k));
}

const { incBlocked } = require('../services/chatMetrics');

module.exports = function chatFilter(req, res, next) {
  const message = (req.body && req.body.message) ? String(req.body.message) : '';

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'message is required' });
  }

  // Block clearly disallowed categories first
  if (containsKeyword(message, disallowedKeywords)) {
    incBlocked();
    return res.status(403).json({ success: false, message: 'Your message contains disallowed content and cannot be processed.' });
  }

  // Passed basic checks
  next();
};
