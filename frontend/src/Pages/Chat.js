import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import './CSS/PageStyles.css';
import './CSS/Auth.css';
import './CSS/Home.css';
import './Chat.css';
import Toast from '../components/Toast/Toast';

function Chat({ ideaId: ideaIdProp, ideaData: ideaDataProp, loadHistory = false }) {
  // Read optional ideaId from prop or query string so users can chat about a specific idea
  const params = new URLSearchParams(window.location.search);
  const ideaId = ideaIdProp || params.get('ideaId');
  const [messages, setMessages] = useState([]);
  const windowRef = useRef(null);
  const inputRef = useRef(null);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaData, setIdeaData] = useState(ideaDataProp || null);
  const [showSummaryInChat, setShowSummaryInChat] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = { sender: 'user', text: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const body = { message: userMsg.text };
      if (ideaId) body.ideaId = ideaId;
      
      const res = await fetch(`${API_ENDPOINTS.chat}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      const botText = data?.reply || 'No response';
      
      // Simulate typing delay for better UX
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { sender: 'bot', text: botText, timestamp: new Date().toISOString() }]);
      }, 500);
      
    } catch (err) {
      setIsTyping(false);
      showToast('error', 'Failed to send message. Please try again.');
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error contacting chatbot', timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
      // scroll to bottom
      setTimeout(() => {
        windowRef.current?.scrollTo({ top: windowRef.current.scrollHeight, behavior: 'smooth' });
        inputRef.current?.focus();
      }, 600);
    }
  };

  useEffect(() => {
    // If loadHistory is true, fetch chat history for authenticated user
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const base = API_ENDPOINTS.chatHistory;
        const historyUrl = ideaId 
          ? `${base}?ideaId=${ideaId}&excludeSummaries=1` 
          : `${base}?excludeSummaries=1`;
        const res = await fetch(historyUrl, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.data) {
          // map stored messages to UI format (include timestamp if present)
          const msgs = data.data.map(m => ({ sender: m.role === 'user' ? 'user' : 'bot', text: m.text, timestamp: m.createdAt }));
          setMessages(msgs);
          setTimeout(() => windowRef.current?.scrollTo(0, windowRef.current.scrollHeight), 100);
        }
      } catch (err) {
        // ignore silently
      }
    };
    if (loadHistory) {
      fetchHistory();
    } else if (ideaDataProp) {
      // Do not prepopulate the chat with the full evaluation.
      // Instead we set idea context and allow user to optionally show the summary in-chat.
      setIdeaTitle(ideaDataProp.title || '');
      setIdeaData(ideaDataProp);
      setShowSummaryInChat(false);
    }

    // If ideaId provided (and no initial prop data), fetch idea details for context
    const fetchIdea = async () => {
      try {
        if (!ideaId) return;
        if (ideaDataProp) {
          // already provided
          setIdeaTitle(ideaDataProp.title || '');
          return;
        }
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/ideas/${ideaId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.data) {
          setIdeaTitle(data.data.title || '');
          setIdeaData(data.data);
        }
      } catch (err) {}
    };
    fetchIdea();
  }, []);

  return (
    <div className="chat-page">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}

      {/* Hero Section */}
      <div className="chat-hero">
        <div className="chat-hero-content">
          <div className="chat-hero-badge">
            <i className="fas fa-comments"></i>
            <span>AI Chat Assistant</span>
          </div>
          <h1 className="chat-hero-title">
            Chat with <span className="gradient-text">STIVAN</span>
          </h1>
          <p className="chat-hero-subtitle">
            Get instant answers, brainstorm ideas, and refine your startup strategy
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        {/* Sidebar Toggle Button (Mobile) */}
        <button 
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <i className="fas fa-bars"></i>
        </button>

        {/* Sidebar Overlay (Mobile) */}
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        <div className="chat-layout">
          {/* Chat Sidebar */}
          <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <div className="sidebar-title">
                <i className="fas fa-history"></i>
                Conversations
              </div>
              <button 
                className="new-chat-btn"
                onClick={() => {
                  setMessages([]);
                  setSidebarOpen(false);
                  showToast('success', 'Started new chat');
                }}
              >
                <i className="fas fa-plus"></i>
                New Chat
              </button>
              <div className="sidebar-search">
                <i className="fas fa-search"></i>
                <input 
                  type="text" 
                  placeholder="Search conversations..."
                />
              </div>
            </div>

            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div className="conversations-empty">
                  <i className="fas fa-comment-slash"></i>
                  <p>No conversations yet.<br />Start chatting to see your history here.</p>
                </div>
              ) : (
                conversations.map((conv, idx) => (
                  <div 
                    key={idx}
                    className={`conversation-item ${idx === 0 ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="conversation-title">{conv.title}</div>
                    <div className="conversation-preview">{conv.preview}</div>
                    <div className="conversation-meta">
                      <span className="conversation-time">{conv.time}</span>
                      {conv.badge && (
                        <span className="conversation-badge">
                          <i className="fas fa-lightbulb"></i>
                          {conv.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Card */}
          <div className="chat-card">
            {/* Chat Header */}
            <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">
                <i className="fas fa-robot"></i>
              </div>
              <div className="chat-header-info">
                <div className="chat-header-title">
                  {ideaTitle || 'STIVAN Assistant'}
                </div>
                <div className="chat-header-status">
                  <span className="status-dot"></span>
                  {isTyping ? 'Typing...' : 'Online'}
                </div>
              </div>
            </div>
            
            <div className="chat-header-actions">
              {ideaData && (
                <>
                  <button 
                    className="chat-action-btn"
                    onClick={() => setShowSummaryInChat(s => !s)}
                    title={showSummaryInChat ? 'Hide Summary' : 'Show Summary'}
                  >
                    <i className={`fas fa-${showSummaryInChat ? 'eye-slash' : 'eye'}`}></i>
                    <span>{showSummaryInChat ? 'Hide' : 'Show'} Summary</span>
                  </button>
                </>
              )}
              <button 
                className="chat-action-btn"
                onClick={() => {
                  setMessages([]);
                  showToast('success', 'Chat cleared');
                }}
                title="Clear Chat"
              >
                <i className="fas fa-trash-alt"></i>
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="chat-messages" ref={windowRef}>
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="welcome-icon">
                  <i className="fas fa-comments"></i>
                </div>
                <h2 className="welcome-title">Start a Conversation</h2>
                <p className="welcome-subtitle">
                  Ask me anything about your startup idea, market research, or growth strategies
                </p>
                
                {/* Quick Suggestions */}
                <div className="quick-suggestions">
                  <div className="suggestions-label">Quick suggestions:</div>
                  <div className="suggestions-grid">
                    <button 
                      className="suggestion-chip"
                      onClick={() => setInput("How can I validate my idea?")}
                    >
                      <i className="fas fa-check-circle"></i>
                      Validate my idea
                    </button>
                    <button 
                      className="suggestion-chip"
                      onClick={() => setInput("What are the best growth strategies?")}
                    >
                      <i className="fas fa-chart-line"></i>
                      Growth strategies
                    </button>
                    <button 
                      className="suggestion-chip"
                      onClick={() => setInput("How do I find my target audience?")}
                    >
                      <i className="fas fa-users"></i>
                      Find audience
                    </button>
                    <button 
                      className="suggestion-chip"
                      onClick={() => setInput("What's the best MVP approach?")}
                    >
                      <i className="fas fa-rocket"></i>
                      MVP approach
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, idx) => (
                  <div key={idx} className={`message-wrapper ${m.sender}`}>
                    {m.sender === 'bot' && (
                      <div className="message-avatar">
                        <i className="fas fa-robot"></i>
                      </div>
                    )}
                    <div className={`message-bubble ${m.sender}`}>
                      <div className="message-text">{m.text}</div>
                      <div className="message-meta">
                        <span className="message-time">
                          {m.timestamp 
                            ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          }
                        </span>
                        {m.sender === 'user' && (
                          <i className="fas fa-check message-status"></i>
                        )}
                      </div>
                    </div>
                    {m.sender === 'user' && (
                      <div className="message-avatar user">
                        <i className="fas fa-user"></i>
                      </div>
                    )}
                  </div>
                ))}

                {/* Show Summary Card */}
                {showSummaryInChat && ideaData && (
                  <div className="message-wrapper bot">
                    <div className="message-avatar">
                      <i className="fas fa-chart-bar"></i>
                    </div>
                    <div className="summary-card">
                      <div className="summary-header">
                        <i className="fas fa-file-alt"></i>
                        <span>Evaluation Summary</span>
                      </div>
                      <div className="summary-content">
                        <div className="summary-item">
                          <span className="summary-label">Score:</span>
                          <span className="summary-value">{ideaData.score}/100</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Verdict:</span>
                          <span className={`summary-verdict ${ideaData.verdict?.toLowerCase()}`}>
                            {ideaData.verdict}
                          </span>
                        </div>
                        {ideaData.suggestions && ideaData.suggestions.length > 0 && (
                          <div className="summary-suggestions">
                            <div className="summary-label">Key Suggestions:</div>
                            <ul>
                              {ideaData.suggestions.slice(0, 3).map((sug, i) => (
                                <li key={i}>{sug}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="message-wrapper bot">
                    <div className="message-avatar">
                      <i className="fas fa-robot"></i>
                    </div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Chat Input Area */}
          <div className="chat-input-container">
            <form className="chat-input-form" onSubmit={sendMessage}>
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </button>
            </form>
            <div className="chat-input-hint">
              <i className="fas fa-info-circle"></i>
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
