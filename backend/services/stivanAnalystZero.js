/**
 * STIVAN Analyst Zero - Master AI Service
 * The legendary market analyst who sees the entire competitive landscape
 * Combines multiple AI models with real-time market data for unparalleled analysis
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const aiModels = require('../config/aiModels');

class StivanAnalystZero {
  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.models = aiModels;
  }

  /**
   * MASTER PROMPT - The Vision That Defines STIVAN
   * This is the personality and expertise of Analyst Zero
   */
  getMasterPrompt() {
    return `You are STIVAN Analyst Zero, a world-class venture strategist and market visionary.

YOUR ESSENCE:
You combine the precision of an economist, the pattern-spotting of a futurist, and the instinct of a top-tier investor. You do not guess — you observe, reason, and synthesize like someone who has seen thousands of markets rise and fall.

YOUR SUPERPOWER:
You can look at any startup idea and instantly map it against the real world — seeing its competitors, understanding its market position, predicting its trajectory, and judging its potential with the clarity of someone who has witnessed every market cycle.

YOUR MISSION:
Evaluate this startup idea by connecting it to reality. Look at the world map of innovation and tell the founder exactly where their idea stands — with brutal honesty, strategic insight, and actionable wisdom.

ANALYSIS FRAMEWORK:

1. CATEGORIZATION
   - Industry, sub-domain, innovation theme
   - Example: "Fintech → Micro-lending → Rural credit access"

2. COMPETITIVE LANDSCAPE SCAN
   - Identify 3-5 real competitors or analogs
   - For each competitor analyze:
     * What they do and how they do it
     * Their strengths (moats, advantages, traction)
     * Their weaknesses (gaps, vulnerabilities)
     * Current stage (startup / growth / established)
     * Funding and market position

3. DIFFERENTIATION ANALYSIS
   - How does THIS idea differ from competitors?
   - What's the unique angle (technology, audience, timing, execution)?
   - Hidden overlaps or missed positioning opportunities
   - Is this differentiation sustainable or easily copied?

4. MARKET DYNAMICS FORECAST
   - How will this domain evolve in 3-5 years?
   - Technological trends (AI, blockchain, web3, etc.)
   - Cultural shifts (consumer behavior, values)
   - Regulatory changes (laws, compliance)
   - Can this idea lead, survive, or get crushed by these shifts?

5. STOCK MARKET LENS
   - If this were a public company, what would investors think?
   - Growth potential, revenue model viability
   - Scalability and unit economics
   - Exit potential (IPO, acquisition, sustainable business)

SCORING CRITERIA (0-100):

- Market Viability: Real demand, market size, accessibility
- Innovation Index: Uniqueness, disruption potential, technological edge
- Competition Intensity: How crowded, how strong are competitors
- Scalability Potential: Can it grow 10x, 100x, 1000x?
- Execution Feasibility: Team, resources, timeline realism

TONE & STYLE:
- Write like you're advising an intelligent founder, not teaching a student
- Be decisive, insightful, and grounded — no speculation
- Use vivid analogies that capture market realities
- Example: "This idea is swimming in a red ocean with sharks that haven't slept in years"
- Justify every score with concrete reasoning
- Deliver harsh truths respectfully but clearly

BEHAVIOR RULES:
1. Always explain WHY you scored something
2. Never fabricate competitor names without data
3. Integrate external market context when provided
4. If idea is weak, say so clearly but constructively
5. Provide specific, actionable next steps

OUTPUT FORMAT:
Return a structured JSON response (no markdown formatting, pure JSON):

{
  "idea_title": "...",
  "domain": "Primary industry → Sub-category → Specific niche",
  "category_tags": ["tag1", "tag2", "tag3"],
  
  "competitors": [
    {
      "name": "Competitor Name",
      "description": "What they do",
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "stage": "Startup/Growth/Established",
      "funding": "Series A, $10M" or "Unknown",
      "market_position": "Leader/Challenger/Niche"
    }
  ],
  
  "scores": {
    "market_viability": 85,
    "innovation_index": 92,
    "competition_intensity": 68,
    "scalability_potential": 77,
    "execution_feasibility": 81
  },
  
  "market_outlook_3yr": "Detailed paragraph predicting market evolution, trends, opportunities, and threats over next 3-5 years",
  
  "stock_market_analysis": {
    "investor_appeal": "High/Medium/Low",
    "growth_trajectory": "Exponential/Linear/Uncertain",
    "revenue_model_strength": "Strong/Moderate/Weak",
    "exit_potential": "IPO candidate/Acquisition target/Sustainable business/Questionable",
    "valuation_potential": "Unicorn potential/Strong growth/Modest/Limited",
    "risk_factors": ["Risk 1", "Risk 2", "Risk 3"]
  },
  
  "competitive_advantages": [
    "Specific advantage with explanation of why it matters"
  ],
  
  "critical_weaknesses": [
    "Specific weakness with explanation of impact"
  ],
  
  "market_positioning": "Where this idea sits in the competitive landscape - detailed analysis",
  
  "actionable_advice": [
    "Specific action 1: Why and how to do it",
    "Specific action 2: Why and how to do it",
    "Specific action 3: Why and how to do it"
  ],
  
  "final_verdict": "LAUNCH / PIVOT / VALIDATE / DROP",
  "verdict_reasoning": "1-2 paragraph explanation of the verdict with specific reasons"
}

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanations outside JSON.`;
  }

  /**
   * Call Perplexity AI for Real-Time Market Intelligence
   * This gives STIVAN real-world vision - live competitor data, trends, news
   */
  async getMarketIntelligence(ideaData) {
    const config = this.models.perplexity;
    
    if (!config.enabled || !config.apiKey) {
      console.log('⚠️  Perplexity not available - using base knowledge');
      return null;
    }

    const query = `Research the market for: "${ideaData.idea_title}" - ${ideaData.idea_summary}

Provide current market intelligence:
1. Top 5 competitors in this space with their features, strengths, and market position
2. Recent funding rounds or acquisitions in this domain (last 12 months)
3. Market size and growth rate (current year data)
4. Latest trends and developments (last 6 months)
5. Key challenges and opportunities in this market

Focus on factual, recent data with sources.`;

    try {
      console.log('🔍 Perplexity: Scanning real-world market...');
      
      const response = await axios.post(
        config.endpoint,
        {
          model: config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a market research analyst providing factual, current market data with citations.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens
          // Removed: return_citations, return_images (not supported in current API)
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      return {
        content: response.data.choices[0].message.content,
        citations: response.data.citations || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('⚠️  Perplexity API Error:', error.message);
      if (error.response) {
        console.error('⚠️  Response status:', error.response.status);
        console.error('⚠️  Response data:', JSON.stringify(error.response.data).substring(0, 200));
      }
      return null;
    }
  }

  /**
   * Main Analysis Method - STIVAN's Brain
   * Combines AI vision with real-time market data
   */
  async analyzeIdea(ideaData) {
    console.log('\n🧠 STIVAN Analyst Zero - Activating...\n');

    // Step 1: Get real-time market intelligence (if available)
    const marketIntel = await this.getMarketIntelligence(ideaData);
    
    // Step 2: Build comprehensive prompt with all context
    const analysisPrompt = this.buildAnalysisPrompt(ideaData, marketIntel);
    
    // Step 3: Call primary AI model (Gemini or GPT-4)
    const analysis = await this.callPrimaryModel(analysisPrompt);
    
    // Step 4: Enrich with market intelligence metadata
    if (marketIntel) {
      analysis.market_intelligence = {
        sources_consulted: marketIntel.citations?.length || 0,
        research_timestamp: marketIntel.timestamp,
        live_data_included: true
      };
    }

    // Step 5: Add STIVAN signature
    analysis.analyst = 'STIVAN Analyst Zero';
    analysis.analysis_timestamp = new Date().toISOString();
    analysis.models_used = this.getActiveModels();

    console.log('✅ Analysis Complete!\n');
    return analysis;
  }

  /**
   * Build Comprehensive Analysis Prompt
   * Combines user input with market intelligence
   */
  buildAnalysisPrompt(ideaData, marketIntel) {
    let prompt = `${this.getMasterPrompt()}

STARTUP IDEA TO ANALYZE:

Title: ${ideaData.idea_title}
Summary: ${ideaData.idea_summary}
What it does: ${ideaData.idea_what}
How it works: ${ideaData.idea_how}
Target Audience: ${ideaData.idea_audience}
Market Size: ${ideaData.idea_market_size}
Team Strength: ${ideaData.idea_team_strength}/10
Current Traction: ${ideaData.idea_traction}
`;

    // Add real-time market intelligence if available
    if (marketIntel) {
      prompt += `

REAL-TIME MARKET INTELLIGENCE:
${marketIntel.content}

Sources: ${marketIntel.citations?.length || 0} citations from live web data
Retrieved: ${marketIntel.timestamp}

Use this current market data to inform your competitive analysis and market outlook.
`;
    }

    prompt += `

Now, analyze this idea with the vision of someone who has seen every market cycle.
Return your analysis in the exact JSON format specified above.
Remember: Be decisive, insightful, and grounded in reality.`;

    return prompt;
  }

  /**
   * Call Primary AI Model with Retry Logic
   * Uses Gemini with exponential backoff for 503 errors, falls back to GPT-4
   */
  async callPrimaryModel(prompt, retryCount = 0, maxRetries = 3) {
    // Try Gemini first (fastest and most creative)
    if (this.models.gemini.enabled) {
      try {
        console.log('🤖 Gemini: Analyzing with vision...');
        
        const model = this.gemini.getGenerativeModel({ 
          model: this.models.gemini.model,
          generationConfig: {
            temperature: this.models.gemini.temperature,
            maxOutputTokens: this.models.gemini.maxTokens
          }
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Clean response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        return JSON.parse(text);
      } catch (error) {
        console.error('⚠️  Gemini error:', error.message);
        
        // Check if it's a 503 Service Unavailable error
        if (error.message && error.message.includes('503') && retryCount < maxRetries) {
          console.log(`⏳ Gemini overloaded. Retrying in ${2 ** retryCount} seconds... (Attempt ${retryCount + 1}/${maxRetries})`);
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, (2 ** retryCount) * 1000));
          return this.callPrimaryModel(prompt, retryCount + 1, maxRetries);
        }
        
        // Fall through to GPT-4 if available
        if (this.models.gpt4.enabled) {
          console.log('📊 Falling back to GPT-4...');
        }
      }
    }

    // Fallback to GPT-4 if available
    if (this.models.gpt4.enabled) {
      try {
        console.log('🤖 GPT-4: Analyzing with strategic depth...');
        
        const response = await axios.post(
          this.models.gpt4.endpoint,
          {
            model: this.models.gpt4.model,
            messages: [
              {
                role: 'system',
                content: 'You are STIVAN Analyst Zero. Return only valid JSON, no markdown.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: this.models.gpt4.temperature,
            max_tokens: this.models.gpt4.maxTokens,
            response_format: { type: 'json_object' }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.models.gpt4.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        return JSON.parse(response.data.choices[0].message.content);
      } catch (error) {
        console.error('⚠️  GPT-4 error:', error.message);
        throw new Error('All AI models failed. Please check API keys and try again.');
      }
    }

    throw new Error('No AI models available. Please configure at least one model (Gemini or GPT-4).');
  }

  /**
   * Get list of active models
   */
  getActiveModels() {
    return Object.entries(this.models)
      .filter(([_, config]) => config.enabled && config.apiKey)
      .map(([key, config]) => ({
        id: key,
        name: config.name,
        role: config.useCases[0]
      }));
  }
}

module.exports = new StivanAnalystZero();
