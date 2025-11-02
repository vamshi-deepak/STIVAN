import React from 'react';
import './LoadingSpinner.css';

/**
 * LoadingSpinner Component
 * 
 * Displays an animated loading spinner with optional message.
 * Used across the app for loading states during API calls.
 * 
 * @param {string} size - Spinner size: 'small', 'medium', 'large' (default: 'medium')
 * @param {string} message - Optional loading message to display
 * @param {string} className - Optional additional CSS class
 */
const LoadingSpinner = ({ size = 'medium', message, className = '' }) => {
  return (
    <div className={`loading-spinner-container ${className}`}>
      <div className={`loading-spinner ${size}`}>
        <div className="spinner"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
