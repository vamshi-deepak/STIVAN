const { getChatReply } = require('../services/chatService');
const ChatMessage = require('../models/ChatMessage');
const { incAccepted } = require('../services/chatMetrics');
const Idea = require('../models/Idea');
const { summarizeIdeasWithGemini } = require('../services/geminiSummarizer');

const handleChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'message (string) is required in body' });
    }

  // Debug: log whether user is attached
  if (req.user) console.log('handleChat: req.user present ->', req.user.userId);
  else console.log('handleChat: no req.user attached (anonymous)');

  // Save user message if authenticated (attach idea if supplied)
    let userId = null;
    const ideaId = req.body.ideaId || null;
    if (req.user && req.user.userId) {
      userId = req.user.userId;
      try { await ChatMessage.create({ user: userId, idea: ideaId, role: 'user', text: message }); } catch (e) { console.error('Failed to save user chat message:', e.message); }
    }

    // Memory recall: if user asks for score reasoning, return stored reasoning
    const normalized = message.trim().toLowerCase();
    const asksWhyScore = (
      /why\s+did\s+you\s+give\s+this\s+idea\s+this\s+score\??/.test(normalized) ||
      /why\s+this\s+score\??/.test(normalized) ||
      (/why/.test(normalized) && /score/.test(normalized)) ||
      /explain(ing)?\s+(the\s+)?score/.test(normalized)
    );
    if (asksWhyScore && userId) {
      // Find the relevant idea: prefer provided ideaId else latest idea for this user
      let idea = null;
      if (ideaId) {
        idea = await Idea.findOne({ _id: ideaId, userId }).lean();
      }
      if (!idea) {
        idea = await Idea.findOne({ userId }).sort({ createdAt: -1 }).lean();
      }
      if (idea) {
        const reasoning = idea.reasoning || 'No saved reasoning available for this idea.';
        const reply = `Reasoning for score ${idea.score} (${idea.verdict}) on "${idea.title}":\n${reasoning}`;
        try { await ChatMessage.create({ user: userId, idea: idea._id, role: 'bot', text: reply, metadata: { type: 'reasoning_recall' } }); } catch {}
        return res.json({ success: true, reply });
      }
    }

    // Revision & classification: summarize all previous ideas on user request
    const wantsRevision =
      /revise\s+me\s+about\s+all\s+of\s+my\s+previous\s+ideas/.test(normalized)
      || /summari(s|z)e\s+(all|my)\s+(previous\s+)?ideas/.test(normalized)
      || (/explain|recap|revise|review/.test(normalized) && /ideas?/.test(normalized) && /(previous|all|history)/.test(normalized))
      || /look\s+at\s+history/.test(normalized)
      || /brief\s+about\s+my\s+previous\s+ideas?/.test(normalized);

    if (wantsRevision && userId) {
      const ideas = await Idea.find({ userId }).sort({ createdAt: -1 }).lean();
      if (!ideas.length) {
        const msg = 'You have no saved ideas yet to revise.';
        try { await ChatMessage.create({ user: userId, role: 'bot', text: msg, metadata: { type: 'revision_summary' } }); } catch {}
        return res.json({ success: true, reply: msg });
      }
      // Try Gemini-powered summary first
      try {
        const revisionText = await summarizeIdeasWithGemini(ideas);
        try { await ChatMessage.create({ user: userId, role: 'bot', text: revisionText, metadata: { type: 'revision_summary', engine: 'gemini' } }); } catch {}
        return res.json({ success: true, reply: revisionText });
      } catch (e) {
        console.warn('Gemini summarizer failed, using fallback:', e.message);
        // Fallback: minimal rule-based overview
        const counts = ideas.reduce((acc, i) => {
          const s = typeof i.score === 'number' ? i.score : -1;
          if (s >= 71) acc.strong++; else if (s >= 56) acc.average++; else acc.weak++;
          return acc;
        }, { strong: 0, average: 0, weak: 0 });
        const fallback = `You have ${ideas.length} ideas. Strength buckets — Strong: ${counts.strong}, Average: ${counts.average}, Weak: ${counts.weak}. Ask for details on any bucket.`;
        try { await ChatMessage.create({ user: userId, role: 'bot', text: fallback, metadata: { type: 'revision_summary', engine: 'fallback' } }); } catch {}
        return res.json({ success: true, reply: fallback });
      }
    }

    const reply = await getChatReply(message);

    // Save bot reply if authenticated
    if (userId) {
      try { await ChatMessage.create({ user: userId, idea: ideaId, role: 'bot', text: reply }); } catch (e) { console.error('Failed to save bot chat message:', e.message); }
    }

    incAccepted();
    console.log(`Chat accepted${userId ? ' for user ' + userId : ''}`);

    res.json({ success: true, reply });
  } catch (err) {
    next(err);
  }
};

// Clear all chats for the authenticated user
const clearUserChats = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const result = await ChatMessage.deleteMany({ user: userId });
    res.json({ success: true, deletedCount: result.deletedCount || 0, message: 'All chats cleared' });
  } catch (err) {
    console.error('Failed to clear chats:', err.message);
    res.status(500).json({ success: false, message: 'Failed to clear chats' });
  }
};

module.exports = { handleChat, clearUserChats };
