import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dock.css';

const Dock = ({ items = [], onChatOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const dockRef = useRef(null);
  const itemRefs = useRef([]);

  // Default navigation items
  const defaultItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: 'fa-home', 
      href: '/home',
      color: '#667eea'
    },
    { 
      id: 'vision', 
      label: 'Vision AI', 
      icon: 'fa-brain', 
      href: '/vision',
      color: '#764ba2'
    },
    { 
      id: 'history', 
      label: 'History', 
      icon: 'fa-clock-rotate-left', 
      href: '/history',
      color: '#f093fb'
    },
    { 
      id: 'chat', 
      label: 'Chat', 
      icon: 'fa-comments', 
      href: '/chat',
      color: '#4facfe'
    },
    { 
      id: 'community', 
      label: 'Community', 
      icon: 'fa-users', 
      href: '/community',
      color: '#43e97b'
    },
    { 
      id: 'about', 
      label: 'About', 
      icon: 'fa-info-circle', 
      href: '/about',
      color: '#fa709a'
    }
  ];

  const navItems = items.length > 0 ? items : defaultItems;

  const handleMouseMove = (e) => {
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleItemClick = (item) => {
    if (item.isButton && onChatOpen) {
      onChatOpen();
    } else if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      navigate(item.href);
    }
  };

  const calculateScale = (index) => {
    if (hoveredIndex === null) return 1;
    
    const distance = Math.abs(index - hoveredIndex);
    const maxScale = 1.8;
    const minScale = 1;
    
    if (distance === 0) return maxScale;
    if (distance === 1) return maxScale * 0.75;
    if (distance === 2) return maxScale * 0.5;
    
    return minScale;
  };

  const calculateTranslateY = (index) => {
    if (hoveredIndex === null) return 0;
    
    const distance = Math.abs(index - hoveredIndex);
    
    if (distance === 0) return -20;
    if (distance === 1) return -10;
    if (distance === 2) return -5;
    
    return 0;
  };

  const isActive = (item) => {
    if (item.href) {
      return location.pathname === item.href;
    }
    return false;
  };

  return (
    <div className="dock-wrapper">
      <nav 
        ref={dockRef}
        className="dock-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="dock-items">
          {navItems.map((item, index) => {
            const scale = calculateScale(index);
            const translateY = calculateTranslateY(index);
            const active = isActive(item);

            return (
              <div
                key={item.id}
                ref={(el) => (itemRefs.current[index] = el)}
                className={`dock-item ${active ? 'active' : ''}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onClick={() => handleItemClick(item)}
                style={{
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <div className="dock-item-inner">
                  <div 
                    className="dock-icon-wrapper"
                    style={{
                      '--item-color': item.color || '#667eea'
                    }}
                  >
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <div className="dock-tooltip">
                    {item.label}
                  </div>
                </div>
                {active && <div className="dock-active-indicator"></div>}
              </div>
            );
          })}
        </div>
        <div className="dock-glass-reflection"></div>
      </nav>
    </div>
  );
};

export default Dock;
