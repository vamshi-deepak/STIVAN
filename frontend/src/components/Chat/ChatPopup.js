import React from 'react';
import './ChatPopup.css';
import Chat from '../../Pages/Chat';

const ChatPopup = ({ open, onClose, ideaId, ideaData, style }) => {
  if (!open) return null;

  return (
    <div className="chat-panel" style={style}>
      <div className="chat-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <strong>Chat about your idea</strong>
        </div>
        <div>
          <button onClick={onClose} className="chat-panel-close">×</button>
        </div>
      </div>

      <div className="chat-panel-body">
        <Chat ideaId={ideaId} ideaData={ideaData} />
      </div>
    </div>
  );
};

export default ChatPopup;
