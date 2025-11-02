import React, { useState } from 'react';
import './FloatingInputBar.css';

const FloatingInputBar = ({ onSendMessage, isProcessing }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isProcessing) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="floating-input-bar">
      <form onSubmit={handleSubmit} className="input-bar-form">
        <div className="input-wrapper">
          <i className="fas fa-lightbulb input-icon"></i>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything about your startup idea..."
            className="floating-input"
            rows="1"
            disabled={isProcessing}
          />
          <button 
            type="submit" 
            className="ask-button"
            disabled={!message.trim() || isProcessing}
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                <span>Ask!</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FloatingInputBar;
