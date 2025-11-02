import React, { useState, useEffect } from 'react';
import './CSS/Profile.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { API_ENDPOINTS } from '../config/api';
import Toast from '../components/Toast/Toast';
import GradientText from '../components/GradientText/GradientText';
import LoadingSpinner from '../components/Loading/LoadingSpinner';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState({ name: '', email: '', profilePicture: '' });
  const [editingName, setEditingName] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [editingProfilePicture, setEditingProfilePicture] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [stats, setStats] = useState({ count: 0, avg: 0, top: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Animated counters for stats
  const [animatedStats, setAnimatedStats] = useState({ count: 0, avg: 0, top: 0, sessions: 0 });

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData) {
      setUserData({ name: storedData.name, email: storedData.email, profilePicture: storedData.profilePicture || '' });
      setEditingName(storedData.name || '');
      setEditingEmail(storedData.email || '');
      setEditingProfilePicture(storedData.profilePicture || '');
    }
  }, []);

  // Animate stats when they change
  useEffect(() => {
    const duration = 1500;
    const steps = 50;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        count: Math.floor(stats.count * progress),
        avg: Math.floor(stats.avg * progress),
        top: Math.floor(stats.top * progress),
        sessions: Math.floor((stats.count * 1.5) * progress) // Simulated chat sessions
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats({
          count: stats.count,
          avg: stats.avg,
          top: stats.top,
          sessions: Math.floor(stats.count * 1.5)
        });
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats]);

  // Simple AOS (Animate On Scroll) Implementation
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('[data-aos]');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, [activeTab]); // Re-run when tab changes

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
      const existing = JSON.parse(localStorage.getItem('userData')) || {};
      existing.name = updated.name;
      existing.email = updated.email;
      existing.profilePicture = updated.profilePicture || '';
      localStorage.setItem('userData', JSON.stringify(existing));
      setIsEditing(false);
      showToast('success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Update failed', err);
      showToast('error', err.message || 'Failed to update profile');
    }
  };

  // Fetch user's ideas and stats
  useEffect(() => {
    const fetchIdeasAndStats = async () => {
      setStatsLoading(true);
      setIdeasLoading(true);
      setStatsError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setStats({ count: 0, avg: 0, top: 0 });
          setIdeas([]);
          setStatsLoading(false);
          setIdeasLoading(false);
          return;
        }
        const res = await fetch(`${API_ENDPOINTS.ideas}?page=1&limit=1000`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch ideas');
        const items = data.data || [];
        const count = items.length;
        const scores = items.map(i => typeof i.score === 'number' ? i.score : Number(i.score || 0)).filter(s => !isNaN(s));
        const avg = scores.length ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : 0;
        const top = scores.length ? Math.max(...scores) : 0;
        setStats({ count, avg, top });
        setIdeas(items.slice(0, 10)); // Show latest 10 ideas
      } catch (err) {
        console.error('Failed to load data', err);
        setStatsError(err.message || 'Failed to load data');
      } finally {
        setStatsLoading(false);
        setIdeasLoading(false);
      }
    };
    fetchIdeasAndStats();
  }, []);

  const getAchievements = () => {
    const achievements = [];
    if (stats.count > 0) achievements.push({ icon: '🎯', name: 'First Idea', desc: 'Submitted your first idea', unlocked: true });
    if (stats.top >= 70) achievements.push({ icon: '🔥', name: 'High Scorer', desc: 'Achieved 70+ score', unlocked: true });
    if (stats.count >= 10) achievements.push({ icon: '💡', name: 'Innovator', desc: 'Submitted 10+ ideas', unlocked: true });
    if (stats.avg >= 60) achievements.push({ icon: '⭐', name: 'Consistent', desc: 'Maintained 60+ avg score', unlocked: true });
    
    // Locked achievements
    if (stats.top < 90) achievements.push({ icon: '👑', name: 'Excellence', desc: 'Achieve 90+ score', unlocked: false, progress: Math.floor((stats.top / 90) * 100) });
    if (stats.count < 50) achievements.push({ icon: '🚀', name: 'Prolific', desc: 'Submit 50+ ideas', unlocked: false, progress: Math.floor((stats.count / 50) * 100) });
    
    return achievements;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="profile-page-container">
      {/* Profile Hero Section */}
      <div className="profile-hero">
        <div className="profile-hero-background"></div>
        <div className="profile-hero-content">
          <div className="profile-picture-wrapper">
            <div className="profile-picture">
              {userData.profilePicture ? (
                <img src={userData.profilePicture} alt="Profile" />
              ) : (
                <div className="profile-picture-placeholder">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="profile-status-badge">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
          <div className="profile-hero-info">
            <h1 className="profile-name">
              <GradientText colors={['#ffffff', '#a78bfa', '#ffffff']}>
                {userData.name || 'User'}
              </GradientText>
            </h1>
            <p className="profile-email">{userData.email}</p>
            <div className="profile-badges">
              <span className="badge">
                <i className="fas fa-star"></i> Member since 2024
              </span>
              {stats.count >= 10 && (
                <span className="badge badge-gold">
                  <i className="fas fa-trophy"></i> Top Contributor
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-th-large"></i>
          <span>Overview</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'ideas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ideas')}
        >
          <i className="fas fa-lightbulb"></i>
          <span>My Ideas</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <i className="fas fa-trophy"></i>
          <span>Achievements</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <i className="fas fa-cog"></i>
          <span>Settings</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {/* Stats Cards */}
            <div className="stats-overview">
              <div className="stat-card" data-aos="fade-up" data-aos-delay="0">
                <div className="stat-icon ideas">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{animatedStats.count}</div>
                  <div className="stat-label">Ideas Submitted</div>
                </div>
              </div>

              <div className="stat-card" data-aos="fade-up" data-aos-delay="100">
                <div className="stat-icon score">
                  <i className="fas fa-star"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{animatedStats.avg}</div>
                  <div className="stat-label">Average Score</div>
                </div>
              </div>

              <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
                <div className="stat-icon chat">
                  <i className="fas fa-comments"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{animatedStats.sessions}</div>
                  <div className="stat-label">Chat Sessions</div>
                </div>
              </div>

              <div className="stat-card" data-aos="fade-up" data-aos-delay="300">
                <div className="stat-icon top">
                  <i className="fas fa-crown"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{animatedStats.top}</div>
                  <div className="stat-label">Top Score</div>
                </div>
              </div>
            </div>

            {/* Recent Activity & Quick Stats */}
            <div className="overview-grid">
              <div className="glass-card recent-ideas" data-aos="fade-right">
                <h3><i className="fas fa-history"></i> Recent Ideas</h3>
                {ideasLoading ? (
                  <LoadingSpinner size="medium" message="Loading ideas..." />
                ) : ideas.length > 0 ? (
                  <div className="recent-ideas-list">
                    {ideas.slice(0, 5).map((idea, index) => (
                      <div key={idea._id || index} className="recent-idea-item">
                        <div className="idea-icon">
                          <i className="fas fa-lightbulb"></i>
                        </div>
                        <div className="idea-details">
                          <h4>{idea.title || 'Untitled Idea'}</h4>
                          <p>{new Date(idea.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="idea-score" style={{ color: getScoreColor(idea.score) }}>
                          {idea.score || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <p>No ideas submitted yet</p>
                    <a href="/" className="empty-action">Submit Your First Idea</a>
                  </div>
                )}
              </div>

              <div className="glass-card quick-actions" data-aos="fade-left">
                <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
                <div className="action-buttons">
                  <a href="/" className="action-button primary">
                    <i className="fas fa-plus-circle"></i>
                    <span>New Idea</span>
                  </a>
                  <a href="/chat" className="action-button">
                    <i className="fas fa-comments"></i>
                    <span>Start Chat</span>
                  </a>
                  <a href="/history" className="action-button">
                    <i className="fas fa-history"></i>
                    <span>View History</span>
                  </a>
                  <a href="/community" className="action-button">
                    <i className="fas fa-users"></i>
                    <span>Community</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IDEAS TAB */}
        {activeTab === 'ideas' && (
          <div className="tab-content">
            <div className="ideas-header">
              <h2>My Ideas Dashboard</h2>
              <div className="ideas-filters">
                <button className="filter-btn active">All</button>
                <button className="filter-btn">High Score (70+)</button>
                <button className="filter-btn">Recent</button>
              </div>
            </div>

            {ideasLoading ? (
              <LoadingSpinner size="large" message="Loading your ideas..." />
            ) : ideas.length > 0 ? (
              <div className="ideas-grid">
                {ideas.map((idea, index) => (
                  <div key={idea._id || index} className="idea-card" data-aos="zoom-in" data-aos-delay={index * 50}>
                    <div className="idea-card-header">
                      <div className="idea-score-badge" style={{ background: getScoreColor(idea.score) }}>
                        {idea.score || 0}
                      </div>
                      <div className="idea-date">
                        <i className="fas fa-calendar"></i>
                        {new Date(idea.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="idea-card-title">{idea.title || 'Untitled Idea'}</h3>
                    <p className="idea-card-desc">
                      {idea.description ? idea.description.substring(0, 100) + '...' : 'No description available'}
                    </p>
                    <div className="idea-card-actions">
                      <button className="card-action-btn view">
                        <i className="fas fa-eye"></i> View
                      </button>
                      <button className="card-action-btn chat">
                        <i className="fas fa-comments"></i> Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-large">
                <i className="fas fa-lightbulb"></i>
                <h3>No Ideas Yet</h3>
                <p>Start your innovation journey by submitting your first idea!</p>
                <a href="/" className="cta-button primary">
                  <i className="fas fa-plus"></i> Submit Idea
                </a>
              </div>
            )}
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === 'achievements' && (
          <div className="tab-content">
            <h2>Achievements & Badges</h2>
            <div className="achievements-grid">
              {getAchievements().map((achievement, index) => (
                <div 
                  key={index} 
                  className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                  data-aos="flip-left"
                  data-aos-delay={index * 100}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <h4>{achievement.name}</h4>
                  <p>{achievement.desc}</p>
                  {!achievement.unlocked && achievement.progress !== undefined && (
                    <div className="achievement-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{achievement.progress}%</span>
                    </div>
                  )}
                  {achievement.unlocked && (
                    <div className="achievement-unlocked">
                      <i className="fas fa-check-circle"></i> Unlocked
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="tab-content">
            <div className="settings-sections">
              {/* Profile Settings */}
              <div className="settings-card" data-aos="fade-up">
                <div className="settings-header">
                  <h3><i className="fas fa-user"></i> Profile Information</h3>
                  {!isEditing && (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                      <i className="fas fa-edit"></i> Edit
                    </button>
                  )}
                </div>
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={editingName} 
                      onChange={(e) => setEditingName(e.target.value)} 
                      disabled={!isEditing}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      value={editingEmail} 
                      onChange={(e) => setEditingEmail(e.target.value)} 
                      disabled={!isEditing}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Profile Picture URL</label>
                    <input 
                      type="url" 
                      value={editingProfilePicture} 
                      onChange={(e) => setEditingProfilePicture(e.target.value)} 
                      placeholder="https://..." 
                      disabled={!isEditing}
                    />
                  </div>
                  {isEditing && (
                    <div className="form-actions">
                      <button type="submit" className="save-btn">
                        <i className="fas fa-save"></i> Save Changes
                      </button>
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={() => {
                          setIsEditing(false);
                          setEditingName(userData.name);
                          setEditingEmail(userData.email);
                          setEditingProfilePicture(userData.profilePicture);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Security Settings */}
              <div className="settings-card" data-aos="fade-up" data-aos-delay="100">
                <div className="settings-header">
                  <h3><i className="fas fa-shield-alt"></i> Security</h3>
                </div>
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
                    setCurrentPassword(''); 
                    setNewPassword(''); 
                    setConfirmNewPassword('');
                    showToast('success', 'Password changed successfully');
                  } catch (err) {
                    showToast('error', err.message || 'Failed to change password');
                  }
                }}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmNewPassword} 
                      onChange={(e) => setConfirmNewPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <button type="submit" className="save-btn">
                    <i className="fas fa-key"></i> Change Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
    </div>
  );
};

export default Profile;