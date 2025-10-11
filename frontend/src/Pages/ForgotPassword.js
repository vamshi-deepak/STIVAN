import React, { useState } from 'react';
import './CSS/Login.css';
import { API_ENDPOINTS } from '../config/api';

const ForgotPassword = () => {
  const [step, setStep] = useState('request'); // request | verify | reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await fetch(API_ENDPOINTS.requestOtp, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setMessage('OTP sent to your email.');
      setStep('verify');
    } catch (err) { setError(err.message || 'Failed to send OTP'); } finally { setLoading(false); }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await fetch(API_ENDPOINTS.verifyOtp, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid or expired OTP');
      setMessage('OTP verified. You can now reset your password.');
      setStep('reset');
    } catch (err) { setError(err.message || 'OTP verification failed'); } finally { setLoading(false); }
  };

  const onResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await fetch(API_ENDPOINTS.resetPassword, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp, newPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');
      setMessage('Password reset successfully. You can now log in.');
    } catch (err) { setError(err.message || 'Password reset failed'); } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-panel auth-showcase">
        <div className="auth-showcase-content">
          <h1>STIVAN</h1>
          <p>Reset your password using OTP sent to your email.</p>
        </div>
      </div>
      <div className="auth-panel auth-form-panel">
        <div className="auth-form-card">
          <h2>Forgot Password</h2>
          {message && <div className="message-box success">{message}</div>}
          {error && <div className="message-box error">{error}</div>}

          {step === 'request' && (
            <form onSubmit={onRequestOtp}>
              <div className="input-group">
                <i className="fas fa-envelope input-icon"></i>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
              </div>
              <button type="submit" className="auth-button" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={onVerifyOtp}>
              <div className="input-group">
                <i className="fas fa-envelope input-icon"></i>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
              </div>
              <div className="input-group">
                <i className="fas fa-key input-icon"></i>
                <input type="text" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required disabled={loading} />
              </div>
              <button type="submit" className="auth-button" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={onResetPassword}>
              <div className="input-group">
                <i className="fas fa-envelope input-icon"></i>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
              </div>
              <div className="input-group">
                <i className="fas fa-key input-icon"></i>
                <input type="text" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required disabled={loading} />
              </div>
              <div className="input-group">
                <i className="fas fa-lock input-icon"></i>
                <input type="password" placeholder="New password (min 8 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={loading} />
              </div>
              <button type="submit" className="auth-button" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
