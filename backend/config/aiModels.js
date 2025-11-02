/**
 * STIVAN Multi-Model AI Configuration
 * Supports multiple AI providers for comprehensive market analysis
 * Each model specializes in different aspects of startup evaluation
 */

const aiModels = {
  // Google Gemini - Primary creative analyst
  gemini: {
    name: 'Google Gemini',
    provider: 'google',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    apiKey: process.env.GEMINI_API_KEY,
    enabled: !!process.env.GEMINI_API_KEY,
    strengths: ['Creative analysis', 'Fast responses', 'General knowledge', 'Strategic thinking'],
    useCases: ['idea evaluation', 'suggestions', 'summaries', 'vision analysis'],
    temperature: 0.7,
    maxTokens: 4000
  },

  // Perplexity AI - Real-time market intelligence (RECOMMENDED!)
  perplexity: {
    name: 'Perplexity AI',
    provider: 'perplexity',
    model: 'sonar-pro', // ✅ WORKING MODEL (verified Oct 2025)
    apiKey: process.env.PERPLEXITY_API_KEY,
    endpoint: 'https://api.perplexity.ai/chat/completions',
    enabled: !!process.env.PERPLEXITY_API_KEY, // Auto-enable if key exists
    strengths: ['Real-time web data', 'Market research', 'Competitor analysis', 'Latest trends', 'Citations'],
    useCases: ['market scanning', 'competitor research', 'trend analysis', 'live data'],
    temperature: 0.3, // Lower for factual accuracy
    maxTokens: 4000,
    returnCitations: true
  },

  // OpenAI GPT-4 - Advanced business strategy
  gpt4: {
    name: 'GPT-4',
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    apiKey: process.env.OPENAI_API_KEY,
    endpoint: 'https://api.openai.com/v1/chat/completions',
    enabled: !!process.env.OPENAI_API_KEY,
    strengths: ['Business strategy', 'Financial modeling', 'Complex reasoning', 'Market forecasting'],
    useCases: ['business model analysis', 'financial projections', 'strategic planning', 'market outlook'],
    temperature: 0.6,
    maxTokens: 4000
  },

  // Anthropic Claude - Risk and safety analysis
  claude: {
    name: 'Claude',
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    apiKey: process.env.CLAUDE_API_KEY,
    endpoint: 'https://api.anthropic.com/v1/messages',
    enabled: !!process.env.CLAUDE_API_KEY,
    strengths: ['Risk assessment', 'Detailed analysis', 'Safety evaluation', 'Compliance'],
    useCases: ['risk analysis', 'legal review', 'compliance check', 'weakness identification'],
    temperature: 0.5,
    maxTokens: 4000
  },

  // Groq - Ultra-fast technical analysis
  groq: {
    name: 'Groq',
    provider: 'groq',
    model: 'mixtral-8x7b-32768',
    apiKey: process.env.GROQ_API_KEY,
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    enabled: !!process.env.GROQ_API_KEY,
    strengths: ['Fast responses', 'Technical analysis', 'Scalability assessment'],
    useCases: ['technical feasibility', 'architecture review', 'scalability analysis'],
    temperature: 0.5,
    maxTokens: 4000
  }
};

module.exports = aiModels;
