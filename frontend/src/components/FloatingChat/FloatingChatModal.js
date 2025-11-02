import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import './FloatingChatModal.css';

const FloatingChatModal = forwardRef(({ isOpen, onClose }, ref) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [position, setPosition] = useState({ x: 40, y: '50%' });
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const modalRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });

  // Drag functionality
  const handleMouseDown = (e) => {
    if (e.target.closest('.floating-chat-header') && 
        !e.target.closest('.floating-chat-close') && 
        !e.target.closest('.clear-chat-btn')) {
      setIsDragging(true);
      const rect = modalRef.current.getBoundingClientRect();
      dragStart.current = {
        x: e.clientX - rect.right + window.innerWidth,
        y: e.clientY - rect.top
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && modalRef.current) {
      const newX = window.innerWidth - e.clientX + dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      setPosition({ x: Math.max(20, newX), y: Math.max(20, newY) });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  // Load chat history on mount
  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_ENDPOINTS.CHAT_HISTORY}?excludeSummaries=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const formattedMessages = data.data.map(msg => ({
            type: msg.role === 'user' ? 'user' : 'bot',
            text: msg.text,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message immediately
    const userMessage = {
      type: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputMessage(''); // Clear input after sending

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.CHAT.SEND, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      if (data.success && data.reply) {
        const botMessage = {
          type: 'bot',
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      sendMessage(inputMessage);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.CHAT_CLEAR, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to clear chat:', error);
    }
  };

  // Expose sendMessage to parent via ref
  useImperativeHandle(ref, () => ({
    sendMessage
  }));

  if (!isOpen) return null;

  return (
    <>
      <div className="floating-chat-overlay"></div>
      <div 
        ref={modalRef}
        className="floating-chat-modal" 
        style={{
          right: `${position.x}px`,
          top: typeof position.y === 'number' ? `${position.y}px` : position.y,
          transform: typeof position.y === 'number' ? 'none' : 'translateY(-50%)',
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Close Button */}
        <button className="floating-chat-close" onClick={onClose} aria-label="Close chat">
          <i className="fas fa-times"></i>
        </button>

        {/* Modal Header */}
        <div className="floating-chat-header" title="Drag to move">
          <div className="header-icon">
            <i className="fas fa-robot"></i>
          </div>
          <div className="header-content">
            <h2>AI Chatbot <i className="fas fa-grip-vertical" style={{ fontSize: '0.7rem', opacity: 0.4, marginLeft: '8px' }}></i></h2>
            <p>Ask anything about your startup idea...</p>
          </div>
          <button 
            className="clear-chat-btn" 
            onClick={handleClearChat}
            title="Clear chat history"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>

        {/* Modal Content - Conversation Only */}
        <div className="floating-chat-content">
          <div className="conversation-area-full">
            {messages.length === 0 ? (
              <div className="no-messages">
                <i className="fas fa-comment-dots"></i>
                <p>No conversations yet</p>
                <span>Start by typing a message below!</span>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.type}`}>
                    <div className="message-avatar">
                      <i className={msg.type === 'user' ? 'fas fa-user' : 'fas fa-robot'}></i>
                    </div>
                    <div className="message-content">
                      <p>{msg.text}</p>
                      <span className="message-time">{msg.time}</span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message bot">
                    <div className="message-avatar">
                      <i className="fas fa-robot"></i>
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Bar - Inside Modal */}
        <div className="floating-chat-input-container">
          <form onSubmit={handleSubmit} className="floating-chat-input-form">
            <div className="input-icon">
              <i className="fas fa-lightbulb"></i>
            </div>
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about your startup idea..."
              disabled={isLoading}
              rows={1}
            />
            <button 
              type="submit" 
              disabled={!inputMessage.trim() || isLoading}
              className="send-btn"
            >
              <i className="fas fa-paper-plane"></i> Ask!
            </button>
          </form>
        </div>
      </div>
    </>
  );
});

FloatingChatModal.displayName = 'FloatingChatModal';

export default FloatingChatModal;
