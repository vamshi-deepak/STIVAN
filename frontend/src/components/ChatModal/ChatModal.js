import React from 'react';
import Chat from '../../Pages/Chat';
import './ChatModal.css';

const ChatModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div className="chat-modal-overlay" onClick={onClose}></div>
      
      {/* Modal container */}
      <div className="chat-modal-container">
        {/* Close button */}
        <button 
          className="chat-modal-close"
          onClick={onClose}
          aria-label="Close chat"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Chat component */}
        <div className="chat-modal-content">
          <Chat loadHistory={true} />
        </div>
      </div>
    </>
  );
};

export default ChatModal;
