import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast/Toast';
import { API_ENDPOINTS } from '../config/api';
import './CSS/Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);
  
  // Account Settings State
  const [accountData, setAccountData] = useState({
    username: ''
  });
  
  // Password Settings State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  


  const showToast = (type, message) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5050/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAccountData({ username: data.username || data.name || '' });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  const handleAccountSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // only send username for account updates
      const payload = { username: accountData.username };
      if (!payload.username || payload.username.trim().length < 3 || payload.username.trim().length > 30) {
        showToast('error', 'Username must be between 3 and 30 characters.');
        setLoading(false);
        return;
      }

      const res = await fetch(API_ENDPOINTS.me, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Update local user cache if returned
        if (data.data) {
          localStorage.setItem('user', JSON.stringify(data.data));
        } else if (data.username) {
          // some APIs return the updated field directly
          const existing = JSON.parse(localStorage.getItem('user') || '{}');
          existing.username = data.username;
          localStorage.setItem('user', JSON.stringify(existing));
        }
        showToast('success', data.message || 'Username updated successfully!');
      } else {
        showToast('error', data.message || 'Failed to update account settings.');
      }
    } catch (error) {
      console.error('Account save error:', error);
      showToast('error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('error', 'Passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showToast('error', 'Password must be at least 8 characters long.');
      return;
    }

    if (!passwordData.currentPassword) {
      showToast('error', 'Current password is required.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.changePassword, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast('success', data.message || 'Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast('error', data.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showToast('error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}

      {/* Hero Section */}
      <div className="settings-hero">
        <div className="settings-hero-content">
          <div className="settings-hero-badge">
            <i className="fas fa-cog"></i>
            <span>Account Settings</span>
          </div>
          <h1 className="settings-hero-title">
            Manage Your <span className="gradient-text">Preferences</span>
          </h1>
          <p className="settings-hero-subtitle">
            Customize your STIVAN experience and control your account settings
          </p>
        </div>
      </div>

      {/* Settings Container */}
      <div className="settings-container">
        <div className="settings-layout">
          {/* Sidebar Navigation */}
          <div className="settings-sidebar">
            <div className="settings-nav">
              <button
                className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <i className="fas fa-user"></i>
                <span>Account</span>
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <i className="fas fa-lock"></i>
                <span>Password</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="settings-content">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="settings-section" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className="section-header">
                  <h2 className="section-title">Account Information</h2>
                  <p className="section-subtitle">Update your personal information and profile details</p>
                </div>

                <div className="settings-card">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-user"></i>
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={accountData.username}
                      onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                      placeholder="Enter your username"
                      maxLength={30}
                    />
                    <span className="form-hint">
                      <i className="fas fa-info-circle"></i>
                      Username must be 3–30 characters. Change it anytime and click Save Changes.
                    </span>
                  </div>

                  <button
                    className="save-btn"
                    onClick={handleAccountSave}
                    disabled={loading}
                    style={{ marginTop: 8 }}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="settings-section" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <div className="section-header">
                  <h2 className="section-title">Change Password</h2>
                  <p className="section-subtitle">Update your password to keep your account secure</p>
                </div>

                <div className="settings-card">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-lock"></i>
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-key"></i>
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-check-circle"></i>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="password-requirements">
                    <div className="requirements-title">
                      <i className="fas fa-info-circle"></i>
                      Password Requirements:
                    </div>
                    <ul className="requirements-list">
                      <li className={passwordData.newPassword.length >= 6 ? 'valid' : ''}>
                        <i className="fas fa-check-circle"></i>
                        At least 6 characters long
                      </li>
                      <li className={passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? 'valid' : ''}>
                        <i className="fas fa-check-circle"></i>
                        Passwords match
                      </li>
                    </ul>
                  </div>

                  <button
                    className="save-btn"
                    onClick={handlePasswordChange}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-shield-alt"></i>
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
