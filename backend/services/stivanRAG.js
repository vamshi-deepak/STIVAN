/**
 * STIVAN RAG (Retrieval-Augmented Generation) Service
 * Phase 1: Simple similarity search using in-memory vector store
 * 
 * This service stores past evaluations and finds similar ideas to provide context
 */

const OpenAI = require('openai');

class StivanRAG {
  constructor() {
    // Initialize OpenAI for embeddings
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;
    
    // In-memory vector store (Phase 1 - simple approach)
    // Later: Migrate to Pinecone/Weaviate for production
    this.vectorStore = [];
    
    console.log('🧠 RAG Service initialized');
    if (!this.openai) {
      console.log('⚠️  RAG running in limited mode (no OpenAI key)');
    }
  }

  /**
   * Generate embedding for text using OpenAI
   */
  async generateEmbedding(text) {
    if (!this.openai) {
      // Fallback: Use simple keyword-based similarity
      return this.simpleEmbedding(text);
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000) // Limit to 8k chars
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('⚠️  OpenAI embedding error:', error.message);
      return this.simpleEmbedding(text);
    }
  }

  /**
   * Fallback: Simple keyword-based embedding
   */
  simpleEmbedding(text) {
    // Create a simple numeric representation based on keywords
    const keywords = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // Smaller dimension for fallback
    
    keywords.forEach((word, idx) => {
      const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      embedding[hash % 384] += 1;
    });
    
    return embedding;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Store an idea analysis in the vector store
   */
  async storeAnalysis(data) {
    try {
      // Create text representation for embedding
      const textToEmbed = `${data.title}: ${data.summary}. ${data.description}. Target: ${data.audience}`;
      
      // Generate embedding
      const embedding = await this.generateEmbedding(textToEmbed);
      
      // Store in vector database
      const record = {
        id: data.id,
        embedding: embedding,
        metadata: {
          title: data.title,
          summary: data.summary,
          domain: data.domain,
          score: data.score,
          verdict: data.verdict,
          market_size: data.market_size,
          team_strength: data.team_strength,
          traction: data.traction,
          competitors_count: data.competitors_count || 0,
          stored_at: new Date().toISOString()
        }
      };
      
      this.vectorStore.push(record);
      
      // Keep only last 1000 records in memory (Phase 1 limitation)
      if (this.vectorStore.length > 1000) {
        this.vectorStore.shift();
      }
      
      console.log(`💾 RAG: Stored analysis for "${data.title}" (Store size: ${this.vectorStore.length})`);
      
      return true;
    } catch (error) {
      console.error('❌ RAG storage error:', error.message);
      return false;
    }
  }

  /**
   * Find similar ideas from past analyses
   */
  async findSimilarIdeas(idea, topK = 5) {
    try {
      // If no data in store yet, return empty
      if (this.vectorStore.length === 0) {
        console.log('ℹ️  RAG: No past analyses yet');
        return [];
      }

      // Create text representation
      const textToEmbed = `${idea.title}: ${idea.summary}. ${idea.description}. Target: ${idea.audience}`;
      
      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(textToEmbed);
      
      // Calculate similarities
      const similarities = this.vectorStore.map(record => ({
        ...record,
        similarity: this.cosineSimilarity(queryEmbedding, record.embedding)
      }));
      
      // Sort by similarity and get top K
      similarities.sort((a, b) => b.similarity - a.similarity);
      const topMatches = similarities.slice(0, topK);
      
      // Filter out very low similarity matches (< 0.3) - LOWERED threshold for better demo
      const relevantMatches = topMatches.filter(m => m.similarity > 0.3);
      
      console.log(`🔍 RAG: Found ${relevantMatches.length} similar ideas (searched ${this.vectorStore.length} records)`);
      
      return relevantMatches.map(match => ({
        title: match.metadata.title,
        summary: match.metadata.summary,
        domain: match.metadata.domain,
        score: match.metadata.score,
        verdict: match.metadata.verdict,
        similarity: Math.round(match.similarity * 100),
        market_size: match.metadata.market_size,
        team_strength: match.metadata.team_strength,
        traction: match.metadata.traction,
        competitors_found: match.metadata.competitors_count
      }));
    } catch (error) {
      console.error('❌ RAG retrieval error:', error.message);
      return [];
    }
  }

  /**
   * Detect patterns from similar ideas
   */
  detectPatterns(similarIdeas) {
    if (similarIdeas.length === 0) return [];
    
    const patterns = [];
    
    // Calculate average score
    const avgScore = similarIdeas.reduce((sum, idea) => sum + idea.score, 0) / similarIdeas.length;
    patterns.push(`Similar ideas averaged ${Math.round(avgScore)}/100 score`);
    
    // Count verdicts
    const verdictCounts = {};
    similarIdeas.forEach(idea => {
      verdictCounts[idea.verdict] = (verdictCounts[idea.verdict] || 0) + 1;
    });
    const mostCommonVerdict = Object.keys(verdictCounts).sort((a, b) => verdictCounts[b] - verdictCounts[a])[0];
    patterns.push(`Most similar ideas were rated as "${mostCommonVerdict}"`);
    
    // Check traction stages
    const withMVP = similarIdeas.filter(i => i.traction === 'MVP' || i.traction === 'Early Users' || i.traction === 'Revenue').length;
    if (withMVP > 0) {
      patterns.push(`${withMVP}/${similarIdeas.length} similar ideas had working products`);
    }
    
    // Check team strength
    const avgTeamStrength = similarIdeas.reduce((sum, idea) => sum + (idea.team_strength || 5), 0) / similarIdeas.length;
    if (avgTeamStrength >= 7) {
      patterns.push(`Similar ideas had strong teams (avg ${avgTeamStrength.toFixed(1)}/10)`);
    } else if (avgTeamStrength <= 4) {
      patterns.push(`Similar ideas had weaker teams (avg ${avgTeamStrength.toFixed(1)}/10) - consider strengthening your team`);
    }
    
    return patterns;
  }

  /**
   * Get RAG-enhanced context for analysis
   */
  async getEnhancedContext(idea) {
    try {
      console.log('🧠 RAG: Retrieving similar ideas...');
      
      // Find similar ideas
      const similarIdeas = await this.findSimilarIdeas(idea, 5);
      
      if (similarIdeas.length === 0) {
        return {
          has_similar_ideas: false,
          similar_ideas: [],
          patterns: [],
          insights: 'This is a unique concept - no similar ideas found in our database yet.'
        };
      }
      
      // Detect patterns
      const patterns = this.detectPatterns(similarIdeas);
      
      // Generate insights
      const insights = this.generateInsights(similarIdeas, patterns);
      
      return {
        has_similar_ideas: true,
        similar_ideas: similarIdeas,
        patterns: patterns,
        insights: insights,
        database_size: this.vectorStore.length
      };
    } catch (error) {
      console.error('❌ RAG context error:', error.message);
      return {
        has_similar_ideas: false,
        similar_ideas: [],
        patterns: [],
        insights: 'RAG analysis unavailable'
      };
    }
  }

  /**
   * Generate actionable insights from similar ideas
   */
  generateInsights(similarIdeas, patterns) {
    if (similarIdeas.length === 0) return 'No similar ideas found yet.';
    
    const avgScore = similarIdeas.reduce((sum, idea) => sum + idea.score, 0) / similarIdeas.length;
    const highScorers = similarIdeas.filter(i => i.score >= 70).length;
    
    let insight = `We've analyzed ${similarIdeas.length} similar ideas. `;
    
    if (avgScore >= 70) {
      insight += `This is a promising space - similar ideas averaged ${Math.round(avgScore)}/100. `;
    } else if (avgScore < 50) {
      insight += `This space is challenging - similar ideas averaged only ${Math.round(avgScore)}/100. Consider what makes your approach different. `;
    } else {
      insight += `This space shows moderate potential - similar ideas averaged ${Math.round(avgScore)}/100. `;
    }
    
    if (highScorers > 0) {
      insight += `${highScorers} out of ${similarIdeas.length} achieved strong scores (70+). `;
    }
    
    // Add top similar idea as reference
    if (similarIdeas[0]) {
      insight += `Most similar: "${similarIdeas[0].title}" (${similarIdeas[0].score}/100, ${similarIdeas[0].similarity}% match).`;
    }
    
    return insight;
  }

  /**
   * Get statistics about the RAG database
   */
  getStats() {
    if (this.vectorStore.length === 0) {
      return {
        total_analyses: 0,
        status: 'Empty - waiting for first analysis'
      };
    }

    const scores = this.vectorStore.map(r => r.metadata.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    const verdicts = {};
    this.vectorStore.forEach(r => {
      verdicts[r.metadata.verdict] = (verdicts[r.metadata.verdict] || 0) + 1;
    });

    return {
      total_analyses: this.vectorStore.length,
      average_score: Math.round(avgScore),
      verdict_distribution: verdicts,
      status: 'Active',
      mode: this.openai ? 'AI Embeddings' : 'Keyword-based'
    };
  }
}

// Export singleton instance
module.exports = new StivanRAG();
