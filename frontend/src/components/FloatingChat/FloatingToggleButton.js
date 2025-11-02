import React, { useState, useEffect, useRef } from 'react';
import './FloatingToggleButton.css';

const FloatingToggleButton = ({ isOpen, onClick, unreadCount = 0 }) => {
  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const buttonRef = useRef(null);
  const DRAG_THRESHOLD = 5; // pixels to move before considering it a drag

  // Load saved position from localStorage on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('chatTogglePosition');
    if (savedPosition) {
      const parsed = JSON.parse(savedPosition);
      setPosition(parsed);
    } else {
      // Default position (bottom right)
      setPosition({ x: window.innerWidth - 94, y: window.innerHeight - 184 });
    }
  }, []);

  // Save position to localStorage whenever it changes
  useEffect(() => {
    if (position.x !== null && position.y !== null) {
      localStorage.setItem('chatTogglePosition', JSON.stringify(position));
    }
  }, [position]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = Math.abs(e.clientX - (position.x + dragStart.x));
    const deltaY = Math.abs(e.clientY - (position.y + dragStart.y));

    // Check if movement exceeds threshold
    if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
      setHasMoved(true);
    }

    if (hasMoved || deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
      const buttonWidth = buttonRef.current?.offsetWidth || 64;
      const buttonHeight = buttonRef.current?.offsetHeight || 64;

      // Calculate new position
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;

      // Enforce viewport boundaries
      newX = Math.max(0, Math.min(newX, window.innerWidth - buttonWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - buttonHeight));

      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      
      // Only trigger onClick if the button wasn't dragged
      if (!hasMoved) {
        onClick(e);
      }
    }
  };

  // Add global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, position, dragStart, hasMoved]);

  // Handle window resize to keep button in bounds
  useEffect(() => {
    const handleResize = () => {
      if (position.x !== null && position.y !== null) {
        const buttonWidth = buttonRef.current?.offsetWidth || 64;
        const buttonHeight = buttonRef.current?.offsetHeight || 64;
        
        const newX = Math.min(position.x, window.innerWidth - buttonWidth);
        const newY = Math.min(position.y, window.innerHeight - buttonHeight);
        
        if (newX !== position.x || newY !== position.y) {
          setPosition({ x: newX, y: newY });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  return (
    <button 
      ref={buttonRef}
      className={`floating-toggle-button ${isOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      style={{
        left: position.x !== null ? `${position.x}px` : undefined,
        top: position.y !== null ? `${position.y}px` : undefined,
        right: position.x !== null ? 'auto' : undefined,
        bottom: position.y !== null ? 'auto' : undefined,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      aria-label="Toggle chat panel (draggable)"
      title="Drag to reposition or click to open chat"
    >
      <div className="toggle-icon-wrapper">
        {isOpen ? (
          <i className="fas fa-times"></i>
        ) : (
          <>
            <i className="fas fa-comments"></i>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </>
        )}
      </div>
      {!isDragging && <div className="pulse-ring"></div>}
    </button>
  );
};

export default FloatingToggleButton;
