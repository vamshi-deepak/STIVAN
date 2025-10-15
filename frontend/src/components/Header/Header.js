import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';
import Toast from '../Toast/Toast';

const Header = ({ setToken }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.name) {
      setUserName(userData.name);
    }
  }, []);

  const [showLogoutToast, setShowLogoutToast] = useState(false);

  const handleLogout = () => {
    // Show logout toast first, then clear auth and redirect after 2s
    setShowLogoutToast(true);
    // close dropdown immediately
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
        <nav className="header-nav">
          <NavLink to="/home" className="nav-link">Home</NavLink>
          <NavLink to="/history" className="nav-link">History</NavLink>
          <NavLink to="/chat" className="nav-link">Chat</NavLink>
          <NavLink to="/community" className="nav-link">Community</NavLink>
          <NavLink to="/about" className="nav-link">About Us</NavLink>
        </nav>
        <div className="profile-section">
          <div className="profile-info" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span className="profile-name">{userName}</span>
            <i className="fas fa-chevron-down profile-arrow"></i>
          </div>
          {dropdownOpen && (
            <div className="profile-dropdown">
              <NavLink to="/profile" className="dropdown-item">Profile</NavLink>
              <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;