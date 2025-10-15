import React, { useState, useEffect } from 'react';
import './CSS/Profile.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { API_ENDPOINTS } from '../config/api';
import Toast from '../components/Toast/Toast';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('details');
  const [userData, setUserData] = useState({ name: '', email: '', profilePicture: '' });
  const [editingName, setEditingName] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [editingProfilePicture, setEditingProfilePicture] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [stats, setStats] = useState({ count: 0, avg: 0, top: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  // change password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData) {
      setUserData({ name: storedData.name, email: storedData.email, profilePicture: storedData.profilePicture || '' });
      setEditingName(storedData.name || '');
      setEditingEmail(storedData.email || '');
      setEditingProfilePicture(storedData.profilePicture || '');
    }
  }, []);

  const showToast = (type, message) => setToast({ show: true, type, message });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`${API_ENDPOINTS.me}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: editingName, email: editingEmail, profilePicture: editingProfilePicture })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      const updated = data.data.user;
      setUserData({ name: updated.name, email: updated.email, profilePicture: updated.profilePicture || '' });
      // persist to localStorage
      const existing = JSON.parse(localStorage.getItem('userData')) || {};
      existing.name = updated.name;
      existing.email = updated.email;
      existing.profilePicture = updated.profilePicture || '';
      localStorage.setItem('userData', JSON.stringify(existing));
      showToast('success', 'Profile updated');
    } catch (err) {
      console.error('Update failed', err);
      showToast('error', err.message || 'Failed to update profile');
    }
  };

  // Fetch user's ideas to compute stats
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setStats({ count: 0, avg: 0, top: 0 });
          setStatsLoading(false);
          return;
        }
        // request many items; backend supports ?limit
        const res = await fetch(`${API_ENDPOINTS.ideas}?page=1&limit=1000`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch ideas');
        const items = data.data || [];
        const count = items.length;
        const scores = items.map(i => typeof i.score === 'number' ? i.score : Number(i.score || 0)).filter(s => !isNaN(s));
        const avg = scores.length ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : 0;
        const top = scores.length ? Math.max(...scores) : 0;
        setStats({ count, avg, top });
      } catch (err) {
        console.error('Failed to load stats', err);
        setStatsError(err.message || 'Failed to load stats');
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            {userData.profilePicture ? (
              <img src={userData.profilePicture} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              userData.name ? userData.name.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          <h3>{userData.name}</h3>
          <p>{userData.email}</p>
          <nav className="profile-nav">
            <button onClick={() => setActiveTab('details')} className={activeTab === 'details' ? 'active' : ''}>
              <i className="fas fa-user-edit"></i> Account Details
            </button>
            <button onClick={() => setActiveTab('security')} className={activeTab === 'security' ? 'active' : ''}>
              <i className="fas fa-shield-alt"></i> Security
            </button>
            <button onClick={() => setActiveTab('stats')} className={activeTab === 'stats' ? 'active' : ''}>
              <i className="fas fa-chart-pie"></i> My Stats
            </button>
          </nav>
        </div>
        <div className="profile-content">
          {activeTab === 'details' && (
            <div className="content-section">
              <h2>Account Details</h2>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={editingEmail} onChange={(e) => setEditingEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Profile Picture URL</label>
                  <input type="url" value={editingProfilePicture} onChange={(e) => setEditingProfilePicture(e.target.value)} placeholder="https://..." />
                </div>
                <button type="submit" className="profile-submit-btn">Update Profile</button>
              </form>
            </div>
          )}
          {activeTab === 'security' && (
            <div className="content-section">
              <h2>Change Password</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (newPassword !== confirmNewPassword) {
                  showToast('error', 'New password and confirmation do not match');
                  return;
                }
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch(API_ENDPOINTS.changePassword, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ currentPassword, newPassword })
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.message || 'Failed to change password');
                  setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
                  showToast('success', 'Password changed successfully');
                } catch (err) {
                  showToast('error', err.message || 'Failed to change password');
                }
              }}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="••••••••" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                </div>
                <button type="submit" className="profile-submit-btn">Change Password</button>
              </form>
            </div>
          )}
          {activeTab === 'stats' && (
             <div className="content-section">
              <h2>My Stats</h2>
              {statsLoading ? (
                <p>Loading stats...</p>
              ) : statsError ? (
                <p className="error">{statsError}</p>
              ) : (
                <div className="stats-grid">
                  <div className="stat-item">
                    <h4>Ideas Submitted</h4>
                    <p>{stats.count}</p>
                  </div>
                  <div className="stat-item">
                    <h4>Average Score</h4>
                    <p>{stats.avg}</p>
                  </div>
                  <div className="stat-item">
                    <h4>Top Score</h4>
                    <p>{stats.top}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
    </div>
  );
};

export default Profile;