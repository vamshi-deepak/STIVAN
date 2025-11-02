import React, { useEffect, useState } from 'react';
import Toast from '../components/Toast/Toast';
import { API_ENDPOINTS } from '../config/api';
import './CSS/Settings.css';

const AccountUsername = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (type, message) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(API_ENDPOINTS.me, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        setUsername(data.username || data.name || (JSON.parse(localStorage.getItem('user') || '{}').username) || '');
      } catch (err) {
        console.error('Failed to load username', err);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    const trimmed = (username || '').trim();
    if (!trimmed || trimmed.length < 3 || trimmed.length > 30) {
      showToast('error', 'Username must be between 3 and 30 characters.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.me, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: trimmed })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // update cached user
        if (data.data) {
          localStorage.setItem('user', JSON.stringify(data.data));
        } else if (data.username) {
          const existing = JSON.parse(localStorage.getItem('user') || '{}');
          existing.username = data.username;
          localStorage.setItem('user', JSON.stringify(existing));
        } else {
          // if API returned full user in different key, try to merge
          try {
            const parsed = JSON.parse(localStorage.getItem('user') || '{}');
            parsed.username = trimmed;
            localStorage.setItem('user', JSON.stringify(parsed));
          } catch (_) {}
        }
        showToast('success', data.message || 'Username updated successfully');
      } else {
        showToast('error', data.message || 'Failed to update username');
      }
    } catch (err) {
      console.error('Save username error', err);
      showToast('error', 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: '' })} />}
      <div className="settings-container" style={{ maxWidth: 800, margin: '28px auto' }}>
        <div className="settings-card">
          <h2 className="section-title">Change Username</h2>
          <p className="section-subtitle">Update the username displayed to other users.</p>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your new username"
            />
            <span className="form-hint">3–30 characters, no leading/trailing spaces.</span>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button className="save-btn" onClick={handleSave} disabled={loading}>
              {loading ? (<><i className="fas fa-spinner fa-spin" /> Saving...</>) : (<><i className="fas fa-check" /> Save</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountUsername;
