import React, { useState } from "react";
import ChatPopup from '../components/Chat/ChatPopup';
import "./CSS/Home.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { API_ENDPOINTS } from "../config/api";
import Toast from "../components/Toast/Toast";

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
  // useNavigate was removed because Home opens a chat popup instead of navigating away
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [feedback, setFeedback] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatIdea, setChatIdea] = useState(null);
  // split pane state
  const [chatWidth, setChatWidth] = useState(420);
  const draggingRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const startWidthRef = React.useRef(420);
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
        var result = (function(){ try { return JSON.parse(text); } catch(e){ return { error: text }; } })();
      } catch (e) {
        console.log('Failed reading response body', e.message);
        var result = { error: 'Failed to read response' };
      }
      console.groupEnd();

      if (response.ok) {
        setFeedback(result.data);
        setShowForm(false);
        showToast('success', 'Feedback received successfully!');
        // Open chat popup for this idea (keep user on Home)
  // store chat idea but do not open chat automatically — user will open when ready
  setChatIdea(result.data);
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

  // drag handlers for splitter
  React.useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const dx = startXRef.current - e.clientX; // moving left increases width
      const newWidth = Math.min(Math.max(startWidthRef.current + dx, 260), window.innerWidth - 200);
      setChatWidth(newWidth);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mouseleave', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mouseleave', onUp);
    };
  }, []);

  const startDrag = (e) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = chatWidth;
  };

  const startTouchDrag = (e) => {
    draggingRef.current = true;
    startXRef.current = e.touches[0].clientX;
    startWidthRef.current = chatWidth;
  };

  return (
    <div className={`home-container split-layout ${chatOpen ? 'even' : ''}`}>
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className={`main-pane ${!chatOpen ? 'centered' : ''}`} style={{ flex: 1 }}>
        {showForm ? (
          <form onSubmit={handleSubmit} className="idea-form">
          <div className="form-header">
            <h2>AI-Powered Startup Idea Validator</h2>
            <p>Provide the details of your idea, and our AI will give you a comprehensive evaluation.</p>
          </div>
          
          <div className="form-section">
            <h4><i className="fas fa-lightbulb"></i> The Core Idea</h4>
            <div className="form-group">
              <label htmlFor="title">Idea Title</label>
              <input id="title" type="text" name="title" placeholder="What's the name of your idea?" value={formData.title} onChange={handleInputChange} required disabled={isSubmitting}/>
            </div>
            <div className="form-group">
              <label htmlFor="summary">One-Liner Summary</label>
              <input id="summary" type="text" name="summary" placeholder="Describe your idea in a single sentence." value={formData.summary} onChange={handleInputChange} required disabled={isSubmitting}/>
            </div>
            <div className="form-group">
              <label htmlFor="description">Brief Description (The "What")</label>
              <textarea id="description" name="description" placeholder="Briefly describe what your product or service is." value={formData.description} onChange={handleInputChange} required disabled={isSubmitting}/>
            </div>
            <div className="form-group">
              <label htmlFor="fullExplanation">Detailed Explanation (The "How")</label>
              <textarea id="fullExplanation" name="fullExplanation" placeholder="Explain how your idea works in detail." value={formData.fullExplanation} onChange={handleInputChange} required disabled={isSubmitting}/>
            </div>
          </div>

          <div className="form-section">
            <h4><i className="fas fa-users"></i> Market & Team</h4>
             <div className="form-group">
              <label htmlFor="targetAudience">Target Audience</label>
              <input id="targetAudience" type="text" name="targetAudience" placeholder="Who are your ideal customers?" value={formData.targetAudience} onChange={handleInputChange} required disabled={isSubmitting}/>
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

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (<><i className="fas fa-spinner fa-spin" /> Evaluating...</>) : "Validate My Idea"}
          </button>
        </form>
        ) : (
        feedback && (
          <div className="feedback-container">
            <h2>AI Feedback for "{feedback.title}"</h2>
            <div className="score-display">
              <div className="score-value" style={{ color: getScoreColor(feedback.score) }}>
                {feedback.score}
              </div>
              <div className="score-label">/ 100</div>
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
            <button onClick={handleNewIdea} className="submit-btn">Submit Another Idea</button>
          </div>
        )
        )}
      </div>

      {/* splitter (only when chat is open) */}
      {chatOpen && (
        <div className="splitter" onMouseDown={startDrag} onTouchStart={startTouchDrag} />
      )}

      {/* chat pane (render only when open) */}
      {chatOpen && (
        <div className="chat-pane">
          <ChatPopup open={chatOpen} onClose={() => setChatOpen(false)} ideaId={chatIdea?._id} ideaData={chatIdea} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* floating chat toggle button */}
      <button className={`chat-toggle-btn ${chatOpen ? 'close' : ''}`} onClick={() => setChatOpen(s => !s)} aria-label="Toggle chat">{chatOpen ? '×' : '💬'}</button>
    </div>
  );
}

export default Home;