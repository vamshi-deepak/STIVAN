import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GooeyNav.css';

const GooeyNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const itemRefs = useRef([]);

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: 'fas fa-home', 
      path: '/home',
      color: '#667eea'
    },
    { 
      id: 'vision', 
      label: 'Vision', 
      icon: 'fas fa-brain', 
      path: '/vision',
      color: '#764ba2'
    },
    { 
      id: 'history', 
      label: 'History', 
      icon: 'fas fa-history', 
      path: '/history',
      color: '#f093fb'
    },
    { 
      id: 'chat', 
      label: 'Chat', 
      icon: 'fas fa-comments', 
      path: '/chat',
      color: '#4facfe'
    },
    { 
      id: 'community', 
      label: 'Community', 
      icon: 'fas fa-users', 
      path: '/community',
      color: '#43e97b'
    },
    { 
      id: 'about', 
      label: 'About', 
      icon: 'fas fa-info-circle', 
      path: '/about',
      color: '#fa709a'
    }
  ];

  useEffect(() => {
    // Find active index based on current path
    const activeIdx = navItems.findIndex(item => item.path === location.pathname);
    if (activeIdx !== -1) {
      setActiveIndex(activeIdx);
      updateIndicator(activeIdx);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Update indicator on mount and resize
    updateIndicator(activeIndex);
    window.addEventListener('resize', () => updateIndicator(activeIndex));
    return () => window.removeEventListener('resize', () => updateIndicator(activeIndex));
  }, [activeIndex]);

  const updateIndicator = (index) => {
    const item = itemRefs.current[index];
    if (item) {
      const { offsetLeft, offsetWidth } = item;
      setIndicatorStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`
      });
    }
  };

  const handleItemClick = (item, index) => {
    setActiveIndex(index);
    updateIndicator(index);
    navigate(item.path);
  };

  return (
    <nav className="gooey-nav">
      <svg style={{ display: 'none' }}>
        <defs>
          <filter id="gooey-effect">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" 
              result="gooey" 
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="gooey-nav-container">
        <div 
          className="gooey-indicator" 
          style={{
            ...indicatorStyle,
            '--active-color': navItems[activeIndex]?.color || '#667eea'
          }}
        />
        
        <div className="gooey-blob-container">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              ref={el => itemRefs.current[index] = el}
              className={`gooey-nav-item ${activeIndex === index ? 'active' : ''}`}
              onClick={() => handleItemClick(item, index)}
              style={{ '--item-color': item.color }}
            >
              <div className="gooey-icon-wrapper">
                <i className={item.icon}></i>
              </div>
              <span className="gooey-label">{item.label}</span>
              {activeIndex === index && (
                <div className="gooey-ripple">
                  <div className="ripple-circle"></div>
                  <div className="ripple-circle"></div>
                  <div className="ripple-circle"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default GooeyNav;
