import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./CSS/VisionAnalysis.css";
import Toast from "../components/Toast/Toast";
import { API_ENDPOINTS } from "../config/api";

function VisionAnalysis() {
  const [formData, setFormData] = useState({
    idea_title: "",
    idea_summary: "",
    idea_what: "",
    idea_how: "",
    idea_audience: "",
    idea_market_size: "",
    idea_team_strength: 5,
    idea_traction: "Idea Stage"
  });

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [activeTab, setActiveTab] = useState("overview"); // overview, competitors, insights, advice
  const navigate = useNavigate();

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const badPlaceholders = ['nothing', 'n/a', 'na', 'none', 'tbd', 'todo'];
    const normalize = (s='') => String(s || '').trim().toLowerCase();
    if (!formData.idea_title || !formData.idea_summary || !formData.idea_what) {
      showToast("error", "Please fill in all required fields");
      return;
    }
    if (normalize(formData.idea_what).length < 20 || badPlaceholders.includes(normalize(formData.idea_what))) {
      showToast('error', 'Please provide a concrete description of what your idea does (at least 20 characters, not placeholders).');
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.visionEvaluate, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAnalysis(result.data);
        // Persist a reference so History can open this idea right away
        try { localStorage.setItem('openIdeaId', result.data._id); } catch(e) { /* ignore */ }
        showToast("success", "🎉 Analysis complete! Scroll down to view results.");
        // Scroll to results
        setTimeout(() => {
          document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
        }, 500);
          // Optionally navigate user to History immediately if desired (comment this out if you prefer staying here)
          // navigate('/history');
      } else {
        showToast("error", result.error || "Analysis failed. Please try again.");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      showToast("error", "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case "Exceptional": return "#10b981";
      case "Viable": return "#3b82f6";
      case "Promising": return "#f59e0b";
      case "Risky": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getCompetitorStageColor = (stage) => {
    switch (stage) {
      case "Established": return "#8b5cf6";
      case "Growth": return "#3b82f6";
      case "Startup": return "#10b981";
      default: return "#6b7280";
    }
  };

  return (
    <div className="vision-analysis-page">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}

      {/* Hero Section */}
      <div className="vision-hero">
        <div className="vision-hero-content">
          <div className="vision-hero-badge">
            <i className="fas fa-brain"></i>
            <span>STIVAN Analyst Zero</span>
          </div>
          <h1 className="vision-hero-title">
            <span className="gradient-text">Vision Analysis</span>
          </h1>
          <p className="vision-hero-subtitle">
            Get legendary startup insights powered by Google Gemini + Perplexity AI
          </p>
          <div className="vision-hero-features">
            <div className="vision-feature-pill">
              <i className="fas fa-chart-line"></i>
              <span>Market Intelligence</span>
            </div>
            <div className="vision-feature-pill">
              <i className="fas fa-users"></i>
              <span>Competitor Analysis</span>
            </div>
            <div className="vision-feature-pill">
              <i className="fas fa-lightbulb"></i>
              <span>Strategic Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="vision-form-container">
        <form onSubmit={handleSubmit} className="vision-form">
          <div className="vision-form-header">
            <h2>
              <i className="fas fa-rocket"></i>
              Tell Us About Your Startup Idea
            </h2>
            <p>The more details you provide, the better our AI can analyze your opportunity</p>
          </div>

          <div className="vision-form-grid">
            {/* Idea Title */}
            <div className="vision-input-group full-width">
              <label htmlFor="idea_title">
                <i className="fas fa-star"></i>
                Idea Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="idea_title"
                name="idea_title"
                value={formData.idea_title}
                onChange={handleInputChange}
                placeholder="e.g., Nothing - Design-focused Android Smartphones"
                required
              />
            </div>

            {/* Idea Summary */}
            <div className="vision-input-group full-width">
              <label htmlFor="idea_summary">
                <i className="fas fa-align-left"></i>
                One-Line Summary <span className="required">*</span>
              </label>
              <input
                type="text"
                id="idea_summary"
                name="idea_summary"
                value={formData.idea_summary}
                onChange={handleInputChange}
                placeholder="e.g., Minimalist Android phones with unique design language"
                required
              />
            </div>

            {/* What it does */}
            <div className="vision-input-group full-width">
              <label htmlFor="idea_what">
                <i className="fas fa-question-circle"></i>
                What does it do? <span className="required">*</span>
              </label>
              <textarea
                id="idea_what"
                name="idea_what"
                value={formData.idea_what}
                onChange={handleInputChange}
                placeholder="Describe what your product/service does and the problem it solves..."
                rows="4"
                required
              />
            </div>

            {/* How it works */}
            <div className="vision-input-group full-width">
              <label htmlFor="idea_how">
                <i className="fas fa-cogs"></i>
                How does it work?
              </label>
              <textarea
                id="idea_how"
                name="idea_how"
                value={formData.idea_how}
                onChange={handleInputChange}
                placeholder="Explain the technology, process, or business model..."
                rows="4"
              />
            </div>

            {/* Target Audience */}
            <div className="vision-input-group">
              <label htmlFor="idea_audience">
                <i className="fas fa-users"></i>
                Target Audience
              </label>
              <input
                type="text"
                id="idea_audience"
                name="idea_audience"
                value={formData.idea_audience}
                onChange={handleInputChange}
                placeholder="e.g., Design-conscious millennials"
              />
            </div>

            {/* Market Size */}
            <div className="vision-input-group">
              <label htmlFor="idea_market_size">
                <i className="fas fa-globe"></i>
                Market Size
              </label>
              <input
                type="text"
                id="idea_market_size"
                name="idea_market_size"
                value={formData.idea_market_size}
                onChange={handleInputChange}
                placeholder="e.g., $500B global smartphone market"
              />
            </div>

            {/* Team Strength */}
            <div className="vision-input-group">
              <label htmlFor="idea_team_strength">
                <i className="fas fa-user-friends"></i>
                Team Strength: {formData.idea_team_strength}/10
              </label>
              <input
                type="range"
                id="idea_team_strength"
                name="idea_team_strength"
                value={formData.idea_team_strength}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="vision-slider"
              />
              <div className="slider-labels">
                <span>Weak</span>
                <span>Strong</span>
              </div>
            </div>

            {/* Traction */}
            <div className="vision-input-group">
              <label htmlFor="idea_traction">
                <i className="fas fa-chart-bar"></i>
                Current Traction
              </label>
              <select
                id="idea_traction"
                name="idea_traction"
                value={formData.idea_traction}
                onChange={handleInputChange}
              >
                <option value="Idea Stage">Idea Stage</option>
                <option value="Prototype">Prototype/MVP</option>
                <option value="Early Users">Early Users (1-100)</option>
                <option value="Growing">Growing (100+)</option>
                <option value="Scaling">Scaling (1000+)</option>
                <option value="Revenue">Generating Revenue</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="vision-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Analyzing with AI...</span>
              </>
            ) : (
              <>
                <i className="fas fa-brain"></i>
                <span>Analyze with STIVAN Analyst Zero</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {analysis && (
        <div id="results-section" className="vision-results">
          {/* Score Header */}
          <div className="vision-score-header">
            <div className="vision-score-main">
              <div className="vision-score-circle" style={{ borderColor: getVerdictColor(analysis.verdict) }}>
                <span className="vision-score-number">{analysis.score}</span>
                <span className="vision-score-total">/ 100</span>
              </div>
              <div className="vision-score-info">
                <h2>{analysis.title}</h2>
                <div className="vision-domain">{analysis.domain}</div>
                <div className="vision-tags">
                  {analysis.categoryTags?.map((tag, idx) => (
                    <span key={idx} className="vision-tag">#{tag}</span>
                  ))}
                </div>
                <div className="vision-verdict" style={{ color: getVerdictColor(analysis.verdict) }}>
                  <i className="fas fa-certificate"></i>
                  {analysis.verdict}
                </div>
              </div>
            </div>
            <div className="vision-analyst-badge">
              <i className="fas fa-brain"></i>
              <div>
                <strong>Analysis by STIVAN Analyst Zero</strong>
                <p>Powered by Google Gemini + Perplexity AI</p>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="vision-breakdown">
            <h3>
              <i className="fas fa-chart-pie"></i>
              Score Breakdown
            </h3>
            <div className="vision-metrics">
              {Object.entries(analysis.scores || {}).map(([key, value]) => {
                const safeValue = Number(value) || 0;
                const metricClass = key.toLowerCase().replace(/[^a-z0-9]/g, '_')
                  .replace(/(_index|_score)$/,'').split('_')[0];
                return (
                <div key={key} className={`vision-metric ${metricClass}`}>
                  <div className="vision-metric-header">
                    <span className="vision-metric-name">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="vision-metric-value">{safeValue}</span>
                  </div>
                  <div className="vision-metric-bar">
                    <div
                      className="vision-metric-fill"
                      style={{ width: `${safeValue}%` }}
                    />
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="vision-tabs">
            <button
              className={`vision-tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <i className="fas fa-eye"></i>
              Market Overview
            </button>
            <button
              className={`vision-tab ${activeTab === "competitors" ? "active" : ""}`}
              onClick={() => setActiveTab("competitors")}
            >
              <i className="fas fa-users"></i>
              Competitors ({analysis.competitors?.length || 0})
            </button>
            <button
              className={`vision-tab ${activeTab === "insights" ? "active" : ""}`}
              onClick={() => setActiveTab("insights")}
            >
              <i className="fas fa-lightbulb"></i>
              Strategic Insights
            </button>
            <button
              className={`vision-tab ${activeTab === "advice" ? "active" : ""}`}
              onClick={() => setActiveTab("advice")}
            >
              <i className="fas fa-bullseye"></i>
              Action Plan
            </button>
          </div>

          {/* Tab Content */}
          <div className="vision-tab-content">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="vision-overview">
                <div className="vision-content-card">
                  <h3>
                    <i className="fas fa-crystal-ball"></i>
                    Market Outlook (3-5 Years)
                  </h3>
                  <p className="vision-outlook-text">{analysis.marketOutlook}</p>
                </div>

                {analysis.stockMarketAnalysis && (
                  <div className="vision-content-card">
                    <h3>
                      <i className="fas fa-chart-line"></i>
                      Investment Perspective
                    </h3>
                    <div className="vision-stock-grid">
                      <div className="vision-stock-item">
                        <span className="vision-stock-label">Investor Appeal:</span>
                        <span className="vision-stock-value">{analysis.stockMarketAnalysis.investor_appeal}</span>
                      </div>
                      <div className="vision-stock-item">
                        <span className="vision-stock-label">Growth Trajectory:</span>
                        <span className="vision-stock-value">{analysis.stockMarketAnalysis.growth_trajectory}</span>
                      </div>
                      <div className="vision-stock-item">
                        <span className="vision-stock-label">Revenue Model Strength:</span>
                        <span className="vision-stock-value">{analysis.stockMarketAnalysis.revenue_model_strength}</span>
                      </div>
                      <div className="vision-stock-item">
                        <span className="vision-stock-label">Exit Potential:</span>
                        <span className="vision-stock-value">{analysis.stockMarketAnalysis.exit_potential}</span>
                      </div>
                      <div className="vision-stock-item">
                        <span className="vision-stock-label">Valuation Potential:</span>
                        <span className="vision-stock-value">{analysis.stockMarketAnalysis.valuation_potential}</span>
                      </div>
                    </div>

                    {analysis.stockMarketAnalysis.risk_factors && analysis.stockMarketAnalysis.risk_factors.length > 0 && (
                      <div className="vision-risk-factors">
                        <h4>
                          <i className="fas fa-exclamation-triangle"></i>
                          Risk Factors:
                        </h4>
                        <ul>
                          {analysis.stockMarketAnalysis.risk_factors.map((risk, idx) => (
                            <li key={idx}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {analysis.marketPositioning && (
                  <div className="vision-content-card">
                    <h3>
                      <i className="fas fa-map-marked-alt"></i>
                      Market Positioning
                    </h3>
                    <p className="vision-positioning-text">{analysis.marketPositioning}</p>
                  </div>
                )}
              </div>
            )}

            {/* Competitors Tab */}
            {activeTab === "competitors" && (
              <div className="vision-competitors">
                {analysis.competitors && analysis.competitors.length > 0 ? (
                  analysis.competitors.map((competitor, idx) => (
                    <div key={idx} className="vision-competitor-card">
                      <div className="vision-competitor-header">
                        <div className="vision-competitor-info">
                          <h4>{competitor.name}</h4>
                          <div className="vision-competitor-badges">
                            <span
                              className="vision-competitor-stage"
                              style={{ backgroundColor: getCompetitorStageColor(competitor.stage) }}
                            >
                              {competitor.stage}
                            </span>
                            {competitor.market_position && (
                              <span className="vision-competitor-position">
                                <i className="fas fa-trophy"></i>
                                {competitor.market_position}
                              </span>
                            )}
                          </div>
                        </div>
                        {competitor.funding && (
                          <div className="vision-competitor-funding">
                            <i className="fas fa-dollar-sign"></i>
                            {competitor.funding}
                          </div>
                        )}
                      </div>

                      <p className="vision-competitor-description">{competitor.description}</p>

                      <div className="vision-competitor-analysis">
                        <div className="vision-competitor-section">
                          <h5>
                            <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                            Strengths:
                          </h5>
                          <ul>
                            {competitor.strengths?.map((strength, i) => (
                              <li key={i}>{strength}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="vision-competitor-section">
                          <h5>
                            <i className="fas fa-times-circle" style={{ color: '#ef4444' }}></i>
                            Weaknesses:
                          </h5>
                          <ul>
                            {competitor.weaknesses?.map((weakness, i) => (
                              <li key={i}>{weakness}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="vision-empty-state">
                    <i className="fas fa-users"></i>
                    <p>No competitors identified</p>
                  </div>
                )}
              </div>
            )}

            {/* Insights Tab */}
            {activeTab === "insights" && (
              <div className="vision-insights">
                {analysis.competitiveAdvantages && analysis.competitiveAdvantages.length > 0 && (
                  <div className="vision-content-card vision-advantages">
                    <h3>
                      <i className="fas fa-trophy" style={{ color: '#10b981' }}></i>
                      Competitive Advantages
                    </h3>
                    <ul className="vision-insights-list">
                      {analysis.competitiveAdvantages.map((advantage, idx) => (
                        <li key={idx}>
                          <i className="fas fa-check"></i>
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.criticalWeaknesses && analysis.criticalWeaknesses.length > 0 && (
                  <div className="vision-content-card vision-weaknesses">
                    <h3>
                      <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
                      Critical Weaknesses
                    </h3>
                    <ul className="vision-insights-list">
                      {analysis.criticalWeaknesses.map((weakness, idx) => (
                        <li key={idx}>
                          <i className="fas fa-times"></i>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.verdictReasoning && (
                  <div className="vision-content-card">
                    <h3>
                      <i className="fas fa-gavel"></i>
                      Final Verdict: {analysis.finalVerdict}
                    </h3>
                    <p className="vision-verdict-reasoning">{analysis.verdictReasoning}</p>
                  </div>
                )}
              </div>
            )}

            {/* Advice Tab */}
            {activeTab === "advice" && (
              <div className="vision-advice">
                {analysis.actionableAdvice && analysis.actionableAdvice.length > 0 ? (
                  <div className="vision-action-plan">
                    {analysis.actionableAdvice.map((advice, idx) => (
                      <div key={idx} className="vision-action-item">
                        <div className="vision-action-number">{idx + 1}</div>
                        <div className="vision-action-content">
                          <p>{advice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="vision-empty-state">
                    <i className="fas fa-lightbulb"></i>
                    <p>No actionable advice available</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RAG Insights (if available) */}
          {analysis.ragInsights && (
            <div className="vision-rag-insights">
              <h3>
                <i className="fas fa-database"></i>
                Similar Ideas from Database
              </h3>
              <p className="vision-rag-info">
                STIVAN has analyzed {analysis.ragInsights.databaseSize} ideas and found patterns similar to yours
              </p>
              {analysis.ragInsights.insights && analysis.ragInsights.insights.length > 0 && (
                <ul className="vision-rag-list">
                  {analysis.ragInsights.insights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VisionAnalysis;
