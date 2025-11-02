import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/Home.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { API_ENDPOINTS } from "../config/api";
import Toast from "../components/Toast/Toast";
import AnimatedInput from '../components/Forms/AnimatedInput';
import '../theme/theme.css';
import AnimatedButton from '../components/Buttons/AnimatedButton';
import Hyperspeed from '../components/Hyperspeed/Hyperspeed';
import GradientBlinds from '../components/GradientBlinds/GradientBlinds';
import GradientText from '../components/GradientText/GradientText';
import LoadingSpinner from '../components/Loading/LoadingSpinner';

const initialFormData = {
  title: '',
  description: '',
  targetAudience: '',
  fullExplanation: '',
  summary: '',
  marketSize: 'Unknown',
  teamStrength: 5,
  traction: 'Idea Stage',
};

function Home() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [feedback, setFeedback] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const token = localStorage.getItem('token');
      // Add a small debug header so it's easy to filter this request in browser Network tab
      const response = await fetch(API_ENDPOINTS.evaluate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Debug': '1'
        },
        body: JSON.stringify(formData)
      });

      // Log response details to console for easy debugging
      console.groupCollapsed('Idea evaluate API response');
      console.log('URL:', API_ENDPOINTS.evaluate);
      console.log('Status:', response.status, response.statusText);
      let result;
      try {
        const text = await response.text();
        // Try parse JSON safely (useful if the backend returns non-json on error)
        try {
          const parsed = JSON.parse(text);
          console.log('Response JSON:', parsed);
        } catch (e) {
          console.log('Response Text (non-JSON):', text);
        }
        // Re-create a Response-like object for downstream code
        result = (function(){ try { return JSON.parse(text); } catch(e){ return { error: text }; } })();
      } catch (e) {
        console.log('Failed reading response body', e.message);
        result = { error: 'Failed to read response' };
      }
      console.groupEnd();

      if (response.ok) {
        setFeedback(result.data);
        setShowForm(false);
        showToast('success', 'Feedback received successfully!');
      } else {
        showToast('error', result.error || 'Failed to submit idea.');
      }
    } catch (error) {
      console.error('Evaluate request failed:', error);
      showToast('error', error.message || 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewIdea = () => {
    setShowForm(true);
    setFeedback(null);
    setFormData(initialFormData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#27ae60';
    if (score >= 50) return '#f39c12';
    return '#e74c3c';
  };

  const getVerdictColor = (verdict) => {
    if (!verdict) return '#777';
    const v = verdict.toString().toLowerCase();
    if (v.includes('viable')) return '#2ecc71';
    if (v.includes('promising')) return '#f1c40f';
    if (v.includes('risky')) return '#e74c3c';
    return '#3498db';
  };

  return (
    <div className="home-container"
      style={{
        background: '#0a0a14',
        minHeight: '100vh'
      }}
    >
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      {/* HERO SECTION - Always visible at top */}
      {!isSubmitting && showForm && (
        <section className="hero-section">
          <div className="hero-background">
            <GradientBlinds
              gradientColors={['#6a11cb', '#2575fc', '#6a11cb']}
                angle={45}
                noise={0.2}
                blindCount={16}
                blindMinWidth={50}
                spotlightRadius={0.6}
                spotlightSoftness={1.2}
                spotlightOpacity={0.8}
                mouseDampening={0.15}
                distortAmount={0}
                shineDirection="left"
                mixBlendMode="normal"
              />
            </div>
            <div className="hero-content">
              <GradientText
                colors={["#ffffff", "#a8daff", "#ffffff", "#ffb6f7", "#ffffff"]}
                animationSpeed={5}
                showBorder={false}
                className="hero-title"
              >
                STIVAN
              </GradientText>
              <h2 className="hero-subtitle">AI-Powered Startup Idea Validator</h2>
              <p className="hero-description">
                Transform your startup idea into reality with comprehensive AI analysis, 
                real-time feedback, and actionable insights
              </p>
              <div className="hero-cta">
                <AnimatedButton 
                  onClick={() => {
                    document.querySelector('.validate-section').scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                  style={{ 
                    padding: '16px 40px', 
                    fontSize: '18px',
                    background: 'linear-gradient(135deg, #6a11cb, #2575fc)'
                  }}
                >
                  <i className="fas fa-rocket"></i> Validate Your Idea
                </AnimatedButton>
              </div>
              <div className="scroll-indicator">
                <i className="fas fa-chevron-down"></i>
                <span>Scroll to explore</span>
              </div>
            </div>
          </section>
        )}

        {/* FEATURES SECTION */}
        {!isSubmitting && showForm && (
          <section className="features-section">
            <h2 className="section-title">
              <i className="fas fa-star"></i> How STIVAN Works
            </h2>
            <p className="section-description">
              Our AI-powered platform provides comprehensive validation in four key areas
            </p>
            <div className="features-grid">
              <div className="feature-card feature-card-highlight" onClick={() => navigate('/vision')}>
                <div className="feature-icon feature-icon-glow">
                  <i className="fas fa-brain"></i>
                </div>
                <div className="feature-badge">NEW</div>
                <h3>🚀 Vision AI Analysis</h3>
                <p>Get legendary market insights with STIVAN Analyst Zero - powered by Gemini + Perplexity AI</p>
                <AnimatedButton 
                  onClick={() => navigate('/vision')}
                  style={{ 
                    marginTop: '1rem',
                    fontSize: '14px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)'
                  }}
                >
                  Try Vision AI <i className="fas fa-arrow-right"></i>
                </AnimatedButton>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-robot"></i>
                </div>
                <h3>AI Analysis</h3>
                <p>Advanced machine learning algorithms analyze your idea against market trends and success patterns</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h3>Score Calculation</h3>
                <p>Get detailed scoring across market potential, team strength, execution feasibility, and innovation</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <h3>Smart Suggestions</h3>
                <p>Receive actionable recommendations to improve your idea and increase success probability</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-comments"></i>
                </div>
                <h3>Interactive Chat</h3>
                <p>Continue the conversation with our AI chatbot for deeper insights and clarifications</p>
              </div>
            </div>
          </section>
        )}

        {/* STATS SECTION */}
        {!isSubmitting && showForm && (
          <section className="stats-section">
            <h2 className="section-title">
              <i className="fas fa-trophy"></i> Our Impact
            </h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">10,000+</div>
                <div className="stat-label">Ideas Validated</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">87%</div>
                <div className="stat-label">Success Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">95%</div>
                <div className="stat-label">AI Accuracy</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">&lt;2s</div>
                <div className="stat-label">Response Time</div>
              </div>
            </div>
          </section>
        )}
        
        {/* Show Hyperspeed during submission */}
        {isSubmitting && (
          <div className="hyperspeed-fullscreen">
            <Hyperspeed
              effectOptions={{
                distortion: 'deepDistortion',
                length: 400,
                roadWidth: 10,
                islandWidth: 2,
                lanesPerRoad: 3,
                fov: 90,
                fovSpeedUp: 150,
                speedUp: 3,
                carLightsFade: 0.4,
                totalSideLightSticks: 60,
                lightPairsPerRoadWay: 60,
                colors: {
                  roadColor: 0x080808,
                  islandColor: 0x0a0a0a,
                  background: 0x000000,
                  shoulderLines: 0x131318,
                  brokenLines: 0x131318,
                  leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
                  rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
                  sticks: 0x03B3C3,
                },
              }}
            />
            <div className="loading-overlay">
              <LoadingSpinner size="large" message="Analyzing Your Idea... Our AI is processing your submission" />
            </div>
          </div>
        )}

        {/* VALIDATE SECTION - Form */}
        {!isSubmitting && showForm && (
          <section className="validate-section">
            <h2 className="section-title">
              <i className="fas fa-clipboard-check"></i> Validate Your Idea
            </h2>
            <p className="section-description">
              Fill in the details below and let our AI provide comprehensive feedback
            </p>
            <div className="idea-form-wrapper">
              <form onSubmit={handleSubmit} className="idea-form">
          <div className="form-header">
            <h3>Tell Us About Your Idea</h3>
            <p>Provide detailed information for the best AI analysis</p>
          </div>
          
          <div className="form-section">
            <h4><i className="fas fa-lightbulb"></i> The Core Idea</h4>
            <div className="form-group">
              <AnimatedInput id="title" name="title" placeholder="Idea Title" value={formData.title} onChange={handleInputChange} required disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <AnimatedInput id="summary" name="summary" placeholder="One-Liner Summary" value={formData.summary} onChange={handleInputChange} required disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <AnimatedInput as="textarea" id="description" name="description" placeholder={`Brief Description (The "What")`} value={formData.description} onChange={handleInputChange} required disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <AnimatedInput as="textarea" id="fullExplanation" name="fullExplanation" placeholder={`Detailed Explanation (The "How")`} value={formData.fullExplanation} onChange={handleInputChange} required disabled={isSubmitting} />
            </div>
          </div>

          <div className="form-section">
            <h4><i className="fas fa-users"></i> Market & Team</h4>
             <div className="form-group">
              <AnimatedInput id="targetAudience" name="targetAudience" placeholder="Target Audience" value={formData.targetAudience} onChange={handleInputChange} required disabled={isSubmitting} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="marketSize">Estimated Market Size</label>
                <select id="marketSize" name="marketSize" value={formData.marketSize} onChange={handleInputChange} disabled={isSubmitting}>
                  <option value="Unknown">Unknown</option>
                  <option value="Small">Small (Niche)</option>
                  <option value="Medium">Medium (Growing)</option>
                  <option value="Large">Large (Mainstream)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="teamStrength">Team Strength (1-10)</label>
                <input id="teamStrength" type="number" name="teamStrength" min="1" max="10" value={formData.teamStrength} onChange={handleInputChange} disabled={isSubmitting}/>
              </div>
              <div className="form-group">
                 <label htmlFor="traction">Current Traction</label>
                 <select id="traction" name="traction" value={formData.traction} onChange={handleInputChange} disabled={isSubmitting}>
                    <option value="Idea Stage">Idea Stage</option>
                    <option value="Prototype">Prototype</option>
                    <option value="MVP">MVP Ready</option>
                    <option value="Early Users">Have Early Users</option>
                    <option value="Revenue">Generating Revenue</option>
                 </select>
              </div>
            </div>
          </div>

          <AnimatedButton type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
            {isSubmitting ? (<><i className="fas fa-spinner fa-spin" /> Evaluating...</>) : "Validate My Idea"}
          </AnimatedButton>
        </form>
          </div>
        </section>
        )}

        {/* Show feedback wrapped in GlassSurface */}
        {!isSubmitting && feedback && (
          <div className="feedback-wrapper">
            <div className="feedback-container">
            <h2>AI Feedback for "{feedback.title}"</h2>
            
            {/* Score Display - Simple version without TiltedCard */}
            <div className="score-card">
              <div className="score-display">
                <div className="score-value" style={{ color: getScoreColor(feedback.score) }}>
                  {feedback.score}
                </div>
                <div className="score-label">/ 100</div>
              </div>
            </div>

            {/* Viability / Verdict */}
            {((feedback.verdict || feedback.viability)) && (
              <div className="feedback-section">
                <h3>Viability</h3>
                <div className="viability-badge" style={{ background: getVerdictColor(feedback.verdict || feedback.viability) }}>
                  {feedback.verdict || feedback.viability}
                </div>
              </div>
            )}

            {/* Optional evaluation text if provided by backend */}
            {feedback.evaluation && (
              <div className="feedback-section"><h3>Evaluation</h3><p>{feedback.evaluation}</p></div>
            )}

            {/* Score breakdown (market/team/execution/innovation) */}
            {feedback.breakdown && Object.keys(feedback.breakdown).length > 0 && (
              <div className="feedback-section">
                <h3>Score Breakdown</h3>
                <div className="breakdown-list">
                  {Object.entries(feedback.breakdown).map(([key, val]) => (
                    <div className="breakdown-item" key={key}>
                      <div className="breakdown-row">
                        <div className="breakdown-label">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                        <div className="breakdown-value">{val}</div>
                      </div>
                      <div className="breakdown-bar-wrap">
                        <div className="breakdown-bar" style={{ width: `${Math.max(0, Math.min(100, val))}%`, background: getScoreColor(val) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="feedback-section"><h3>Suggestions for Improvement</h3><ul>{feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            <AnimatedButton onClick={handleNewIdea}>Submit Another Idea</AnimatedButton>
          </div>
          </div>
        )}
    </div>
  );
}

export default Home;