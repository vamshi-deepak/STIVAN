import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/Home.css";
import logo1 from "./Images/logo1.png";

function Home({ setToken }) {
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [showSubmitMessage, setShowSubmitMessage] = useState(false);
  const [submitMessageType, setSubmitMessageType] = useState('');
  const [submitMessageText, setSubmitMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    ideaTitle: '',
    targetAudience: '',
    description: '',
    explanation: '',
    summary: ''
  });
  const [feedback, setFeedback] = useState(null);
  
  const navigate = useNavigate();

  // Scroll to feedback when it appears
  useEffect(() => {
    if (feedback && !showForm) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [feedback, showForm]);

  const handleLogout = () => {
    // Show logout message first
    setShowLogoutMessage(true);

    // After 2 seconds, clear storage, update App state, and navigate
    setTimeout(() => {
      localStorage.clear();
      try { 
        if (typeof setToken === 'function') setToken(null); 
      } catch (err) { 
        console.warn('setToken error', err); 
      }
      navigate('/login', { replace: true });
      setShowLogoutMessage(false);
    }, 2000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showMessage = (type, message) => {
    setSubmitMessageType(type);
    setSubmitMessageText(message);
    setShowSubmitMessage(true);
    
    setTimeout(() => {
      setShowSubmitMessage(false);
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const ideaData = {
        title: formData.ideaTitle,
        targetAudience: formData.targetAudience,
        description: formData.description,
        fullExplanation: formData.explanation,
        summary: formData.summary
      };

      const response = await fetch('http://localhost:5050/api/ideas/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
        body: JSON.stringify(ideaData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFeedback(result.data);
        setShowForm(false); // Hide form when feedback is received
        showMessage('success', 'Idea submitted successfully!');
      } else {
        showMessage('error', result.message || 'Failed to submit idea. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting idea:', error);
      showMessage('error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewIdea = () => {
    setShowForm(true);
    setFeedback(null);
    setFormData({
      ideaTitle: '',
      targetAudience: '',
      description: '',
      explanation: '',
      summary: ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="stivan-body">
      {/* Logout Success Message */}
      {showLogoutMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          zIndex: 9999,
          fontWeight: '600',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          animation: 'slideIn 0.3s ease-out',
          fontSize: '16px'
        }}>
          🎉 Logout Successful! Redirecting...
        </div>
      )}

      {/* Submit Message */}
      {showSubmitMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: submitMessageType === 'success' ? '#4CAF50' : '#f44336',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          zIndex: 9999,
          fontWeight: '600',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxWidth: '300px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {submitMessageText}
        </div>
      )}

      {/* Header */}
      <header>
        <div className="logo-container">
          <div className="logo-text">S T I V A N</div>
          <img src={logo1} alt="Logo" className="logo-img" />
        </div>

        <div className="account-container">
          <div className="account-logo"></div>
          <div className="account-name">@User-Name</div>
        </div>
        <div className="header-line"></div>
      </header>

      {/* Navigation */}
      <nav>
        |<Link to="/home">Home</Link>|
        <a href="#" onClick={(e) => e.preventDefault()}>History</a>|
        <a href="#" onClick={(e) => e.preventDefault()}>About Us</a>|
        <Link to="/profile">Profile</Link>|
        <button 
          onClick={handleLogout}
          disabled={showLogoutMessage}
          style={{
            background: 'none',
            border: 'none',
            color: showLogoutMessage ? '#999' : 'inherit',
            textDecoration: 'underline',
            cursor: showLogoutMessage ? 'not-allowed' : 'pointer',
            fontSize: 'inherit',
            fontFamily: 'inherit',
            opacity: showLogoutMessage ? 0.6 : 1
          }}
        >
          Logout
        </button>|
      </nav>

      {/* Main Content */}
      <main>
        <div className="container">
          {/* Show Form */}
          {showForm && (
            <form onSubmit={handleSubmit}>
              <h2 style={{ color: "black" }}>Input your Idea Here</h2>
              
              <input 
                type="text" 
                name="ideaTitle"
                placeholder="Idea Title" 
                value={formData.ideaTitle}
                onChange={handleInputChange}
                required 
                disabled={isSubmitting}
              />
              
              <input 
                type="text" 
                name="targetAudience"
                placeholder="Target Audience" 
                value={formData.targetAudience}
                onChange={handleInputChange}
                required 
                disabled={isSubmitting}
              />
              
              <input
                type="text"
                name="description"
                placeholder="Description (What's Your Unique solution compared to other companies)"
                value={formData.description}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
              
              <input 
                type="text" 
                name="explanation"
                placeholder="Whole Explanation of Idea" 
                value={formData.explanation}
                onChange={handleInputChange}
                required 
                disabled={isSubmitting}
              />
              
              <input 
                type="text" 
                name="summary"
                placeholder="Summary" 
                value={formData.summary}
                onChange={handleInputChange}
                required 
                disabled={isSubmitting}
              />
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                  opacity: isSubmitting ? 0.6 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          )}

          {/* Show Feedback */}
          {!showForm && feedback && (
            <div style={{
              marginTop: '20px',
              padding: '30px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '2px solid #e9ecef',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              minHeight: '400px'
            }}>
              <h2 style={{ 
                color: '#343a40', 
                marginBottom: '25px',
                textAlign: 'center',
                fontSize: '28px'
              }}>
                AI Feedback for Your Idea
              </h2>
              
              {feedback.score !== undefined && (
                <div style={{ 
                  marginBottom: '25px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <strong style={{ fontSize: '18px' }}>Overall Score: </strong>
                  <span style={{ 
                    color: feedback.score >= 70 ? '#28a745' : feedback.score >= 50 ? '#ffc107' : '#dc3545',
                    fontSize: '36px',
                    fontWeight: 'bold',
                    marginLeft: '10px'
                  }}>
                    {feedback.score}/100
                  </span>
                </div>
              )}

              {feedback.evaluation && (
                <div style={{ marginBottom: '25px' }}>
                  <strong style={{ fontSize: '18px', color: '#495057' }}>Evaluation: </strong>
                  <p style={{ 
                    marginTop: '10px', 
                    lineHeight: '1.8',
                    color: '#6c757d',
                    fontSize: '16px'
                  }}>
                    {feedback.evaluation}
                  </p>
                </div>
              )}

              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <div style={{ marginBottom: '25px' }}>
                  <strong style={{ fontSize: '18px', color: '#495057' }}>Suggestions for Improvement:</strong>
                  <ul style={{ 
                    marginTop: '10px', 
                    paddingLeft: '25px',
                    lineHeight: '1.8'
                  }}>
                    {feedback.suggestions.map((suggestion, index) => (
                      <li key={index} style={{ 
                        marginBottom: '10px',
                        color: '#6c757d',
                        fontSize: '16px'
                      }}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.marketPotential && (
                <div style={{ marginBottom: '25px' }}>
                  <strong style={{ fontSize: '18px', color: '#495057' }}>Market Potential: </strong>
                  <p style={{ 
                    marginTop: '10px',
                    color: '#6c757d',
                    fontSize: '16px',
                    lineHeight: '1.8'
                  }}>
                    {feedback.marketPotential}
                  </p>
                </div>
              )}

              {feedback.feasibility && (
                <div style={{ marginBottom: '25px' }}>
                  <strong style={{ fontSize: '18px', color: '#495057' }}>Feasibility: </strong>
                  <p style={{ 
                    marginTop: '10px',
                    color: '#6c757d',
                    fontSize: '16px',
                    lineHeight: '1.8'
                  }}>
                    {feedback.feasibility}
                  </p>
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button
                  onClick={handleNewIdea}
                  style={{
                    padding: '12px 30px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                >
                  Submit Another Idea
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer>
        &copy; 2025 STIVAN |
        <Link to="/home">Home</Link> |
        <a href="#" onClick={(e) => e.preventDefault()}>About Us</a> |
        <a href="#" onClick={(e) => e.preventDefault()}>History</a> |
        <a href="#" onClick={(e) => e.preventDefault()}>Contact Us</a>
      </footer>

      <style>{`
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateX(100px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
      `}</style>
    </div>
  );
}

export default Home;