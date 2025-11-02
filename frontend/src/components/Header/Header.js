import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import Toast from '../Toast/Toast';

const Header = ({ setToken, onChatOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const itemRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.name) {
      setUserName(userData.name);
    }
  }, []);

  const [showLogoutToast, setShowLogoutToast] = useState(false);

  // Navigation items
  const navItems = [
    { label: 'Home', path: '/home', icon: 'fas fa-home' },
    { label: 'Vision', path: '/vision', icon: 'fas fa-brain' },
    { label: 'History', path: '/history', icon: 'fas fa-history' },
    { label: 'Chat', path: '/chat', icon: 'fas fa-comments' },
    { label: 'Community', path: '/community', icon: 'fas fa-users' },
    { label: 'About', path: '/about', icon: 'fas fa-info-circle' }
  ];

  // Sync active state with current route
  useEffect(() => {
    const activeIdx = navItems.findIndex(item => item.path === location.pathname);
    if (activeIdx !== -1) {
      setActiveIndex(activeIdx);
      updateIndicator(activeIdx);
    }
  }, [location.pathname]);

  // Update indicator position on mount and resize
  useEffect(() => {
    updateIndicator(activeIndex);
    window.addEventListener('resize', () => updateIndicator(activeIndex));
    return () => window.removeEventListener('resize', () => updateIndicator(activeIndex));
  }, [activeIndex]);

  const updateIndicator = (index) => {
    const item = itemRefs.current[index];
    if (item) {
      setIndicatorStyle({
        left: item.offsetLeft,
        width: item.offsetWidth
      });
    }
  };

  const handleNavClick = (path, index) => {
    setActiveIndex(index);
    navigate(path);
  };

  const handleLogout = () => {
    setShowLogoutToast(true);
    setDropdownOpen(false);
    setTimeout(() => {
      localStorage.clear();
      setToken(null);
      setShowLogoutToast(false);
      navigate('/login');
    }, 2000);
  };

  return (
    <header className="app-header">
      {showLogoutToast && (
        <Toast message="Logout successful" type="success" duration={2000} onClose={() => setShowLogoutToast(false)} />
      )}
      
      <div className="header-container">
        <NavLink to="/home" className="header-logo">
         <i className="fas fa-lightbulb"></i> STIVAN
        </NavLink>

        {/* Hamburger Icon for Mobile */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        {/* Desktop Navigation - Gooey Style */}
        <nav className="gooey-header-nav">
          <div className="gooey-header-indicator" style={indicatorStyle}></div>
          {navItems.map((item, index) => (
            <button
              key={item.path}
              ref={el => itemRefs.current[index] = el}
              className={`gooey-header-item ${activeIndex === index ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path, index)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Navigation Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <nav className="mobile-nav-list">
            <NavLink 
              to="/home" 
              className={`mobile-nav-item ${location.pathname === '/home' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-home"></i> Home
            </NavLink>
            <NavLink 
              to="/vision" 
              className={`mobile-nav-item ${location.pathname === '/vision' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-eye"></i> Vision AI
            </NavLink>
            <NavLink 
              to="/history" 
              className={`mobile-nav-item ${location.pathname === '/history' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-history"></i> History
            </NavLink>
            <NavLink 
              to="/chat" 
              className={`mobile-nav-item ${location.pathname === '/chat' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-comments"></i> Chat
            </NavLink>
            <NavLink 
              to="/community" 
              className={`mobile-nav-item ${location.pathname === '/community' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-users"></i> Community
            </NavLink>
            <NavLink 
              to="/about" 
              className={`mobile-nav-item ${location.pathname === '/about' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-info-circle"></i> About
            </NavLink>
            <div className="mobile-nav-divider"></div>
            <NavLink 
              to="/profile" 
              className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-user"></i> Profile
            </NavLink>
            <NavLink 
              to="/settings" 
              className={`mobile-nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-cog"></i> Settings
            </NavLink>
            <button onClick={handleLogout} className="mobile-nav-item logout">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </nav>
        </div>

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
        )}

        <div className="profile-section">
          <div className="profile-info" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span className="profile-name">{userName}</span>
            <i className="fas fa-chevron-down profile-arrow"></i>
          </div>
          {dropdownOpen && (
            <div className="profile-dropdown">
              <NavLink to="/profile" className="dropdown-item">Profile</NavLink>
              <NavLink to="/settings" className="dropdown-item">Settings</NavLink>
              <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;