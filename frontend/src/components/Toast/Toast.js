import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {type === 'success' ? '✓' : '!'}
      </div>
      <p>{message}</p>
      <button onClick={onClose} className="toast-close-btn">&times;</button>
    </div>
  );
};

export default Toast;