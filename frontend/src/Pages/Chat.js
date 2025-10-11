import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import './CSS/PageStyles.css';
import './CSS/Auth.css';
import './CSS/Home.css';
import './Chat.css';

function Chat({ ideaId: ideaIdProp, ideaData: ideaDataProp, loadHistory = false }) {
  // Read optional ideaId from prop or query string so users can chat about a specific idea
  const params = new URLSearchParams(window.location.search);
  const ideaId = ideaIdProp || params.get('ideaId');
  const [messages, setMessages] = useState([]);
  const windowRef = useRef(null);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaData, setIdeaData] = useState(ideaDataProp || null);
  const [showSummaryInChat, setShowSummaryInChat] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

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
      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error contacting chatbot' }]);
    } finally {
      setLoading(false);
      // scroll to bottom
      setTimeout(() => windowRef.current?.scrollTo(0, windowRef.current.scrollHeight), 100);
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
      <div className="chat-card">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width:40, height:40, borderRadius:20, background:'#fff', display:'grid', placeItems:'center', color:'#075E54', fontWeight:700 }}>{ideaTitle?.charAt(0) || 'S'}</div>
          <div style={{ flex: 1 }}>
            <div className="title">{ideaTitle || 'Startup Advisor'}</div>
            <div style={{ fontSize:12, opacity:0.9 }}>{ideaData ? `${ideaData.score} • ${ideaData.verdict}` : 'Ask questions about your idea'}</div>
          </div>
          {ideaData && (
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button className="secondary-cta" onClick={() => setShowSummaryInChat(s => !s)}>{showSummaryInChat ? 'Hide Summary' : 'Show Summary'}</button>
              <button className="secondary-cta" onClick={() => setMessages([])}>New chat</button>
            </div>
          )}
        </div>
      </div>

      <div className="chat-area" ref={windowRef}>
        {messages.length === 0 ? (
          <div className="welcome-container">
            <div className="welcome-card">
              <div className="welcome-title">Hi, I'm your Startup Advisor</div>
              <div className="welcome-subtext">How can I help you improve your idea today? Try: "How can I grow my user base?" or "Give 3 low-cost growth experiments."</div>
            </div>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={`message-row ${m.sender}`}>
              <div className={`bubble ${m.sender}`}>
                <div>{m.text}</div>
                <div className="meta"><span className="timestamp">{m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}</span></div>
              </div>
            </div>
          ))
        )}

        {showSummaryInChat && ideaData && (
          <div className={`message-row bot`}>
            <div className={`bubble bot`}>
              <div>{`Evaluation Score: ${ideaData.score} Verdict: ${ideaData.verdict} Suggestions: ${ideaData.suggestions?.join(' - ') || ''}`}</div>
              <div className="meta"><span className="timestamp">{new Date().toLocaleTimeString()}</span></div>
            </div>
          </div>
        )}

        {loading && (
          <div className="message-row bot"><div className="bubble bot">...</div></div>
        )}
      </div>

      <form className="chat-input-area" onSubmit={sendMessage}>
        <input className="chat-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message" />
        <button className="chat-send-btn" type="submit" disabled={loading || !input.trim()}>➤</button>
      </form>
      </div>
    </div>
  );
}

export default Chat;
