import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Login.css';
import { API_ENDPOINTS } from '../config/api';
import GridDistortion from '../components/backgrounds/GridDistortion';
import GlassSurface from '../components/GlassSurface/GlassSurface';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('request'); // request | verify | reset | success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for redirect
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && step === 'success') {
      navigate('/login');
    }
  }, [countdown, step, navigate]);

  const onRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError(''); 
    setMessage('');
    
    try {
      const res = await fetch(API_ENDPOINTS.requestOtp, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email }) 
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      
      setMessage('OTP sent to your email. Please check your inbox and spam folder.');
      setStep('verify');
    } catch (err) { 
      setError(err.message || 'Failed to send OTP'); 
    } finally { 
      setLoading(false); 
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError(''); 
    setMessage('');
    
    try {
      const res = await fetch(API_ENDPOINTS.verifyOtp, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, otp }) 
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Invalid or expired OTP');
      
      setMessage('OTP verified successfully! You can now set your new password.');
      setStep('reset');
    } catch (err) { 
      setError(err.message || 'OTP verification failed. Please check your code and try again.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const onResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true); 
    setError(''); 
    setMessage('');
    
    try {
      const res = await fetch(API_ENDPOINTS.resetPassword, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, otp, newPassword }) 
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');
      
      setMessage('Password reset successfully! Redirecting to login...');
      setStep('success');
      setCountdown(3); // 3 second countdown
    } catch (err) { 
      setError(err.message || 'Password reset failed. Please try again.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await fetch(API_ENDPOINTS.requestOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to resend OTP');
      
      setMessage('New OTP sent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-panel auth-showcase">
        <GridDistortion
          imageSrc="https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=2069"
          grid={10}
          mouse={0.1}
          strength={0.15}
          relaxation={0.9}
        />
        <div className="auth-showcase-content">
          <h1>STIVAN</h1>
          <p>Reset your password securely using the verification code sent to your email.</p>
          <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
            <i className="fas fa-shield-alt"></i> Secure password recovery
          </div>
        </div>
      </div>
      <div className="auth-panel auth-form-panel">
        <GlassSurface 
          className="auth-form-glass" 
          width="100%"
          height="auto"
          borderRadius={0}
          borderWidth={0}
          backgroundOpacity={0.3}
          brightness={20}
          opacity={0.98}
          blur={15}
        >
          <div className="auth-form-card">
          <h2>
            {step === 'request' && 'Forgot Password'}
            {step === 'verify' && 'Verify OTP'}
            {step === 'reset' && 'Set New Password'}
            {step === 'success' && 'Success!'}
          </h2>
          
          {message && <div className="message-box success"><i className="fas fa-check-circle"></i> {message}</div>}
          {error && <div className="message-box error"><i className="fas fa-exclamation-circle"></i> {error}</div>}

          {step === 'request' && (
            <form onSubmit={onRequestOtp}>
              <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                Enter your email address and we'll send you a verification code to reset your password.
              </p>
              <div className="input-group">
                <i className="fas fa-envelope input-icon"></i>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  disabled={loading}
                  autoFocus
                />
              </div>
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : <><i className="fas fa-paper-plane"></i> Send Verification Code</>}
              </button>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button type="button" onClick={handleBackToLogin} className="link-button" style={{ color: '#667eea', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  <i className="fas fa-arrow-left"></i> Back to Login
                </button>
              </div>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={onVerifyOtp}>
              <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                We've sent a 6-digit verification code to <strong>{email}</strong>. Please enter it below.
              </p>
              <div className="input-group">
                <i className="fas fa-key input-icon"></i>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit code" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                  required 
                  disabled={loading}
                  maxLength="6"
                  pattern="\d{6}"
                  autoFocus
                  style={{ letterSpacing: '4px', fontSize: '18px', textAlign: 'center' }}
                />
              </div>
              <button type="submit" className="auth-button" disabled={loading || otp.length !== 6}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Verifying...</> : <><i className="fas fa-check"></i> Verify Code</>}
              </button>
              <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
                <span style={{ color: '#666' }}>Didn't receive the code? </span>
                <button type="button" onClick={handleResendOtp} disabled={loading} className="link-button" style={{ color: '#667eea', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={onResetPassword}>
              <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                Your identity has been verified. Please create a new secure password.
              </p>
              <div className="input-group">
                <i className="fas fa-lock input-icon"></i>
                <input 
                  type="password" 
                  placeholder="New password (min 8 characters)" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  disabled={loading}
                  minLength="8"
                  autoFocus
                />
              </div>
              <div className="input-group">
                <i className="fas fa-lock input-icon"></i>
                <input 
                  type="password" 
                  placeholder="Confirm new password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  disabled={loading}
                  minLength="8"
                />
              </div>
              {newPassword && (
                <div style={{ fontSize: '12px', marginTop: '10px', color: newPassword.length >= 8 ? '#28a745' : '#dc3545' }}>
                  <i className={`fas ${newPassword.length >= 8 ? 'fa-check-circle' : 'fa-info-circle'}`}></i> Password must be at least 8 characters long
                </div>
              )}
              <button type="submit" className="auth-button" disabled={loading || newPassword.length < 8}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Resetting...</> : <><i className="fas fa-save"></i> Reset Password</>}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px', color: '#28a745', marginBottom: '20px' }}>
                <i className="fas fa-check-circle"></i>
              </div>
              <p style={{ fontSize: '16px', color: '#333', marginBottom: '20px' }}>
                Your password has been reset successfully!
              </p>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>
                Redirecting to login in <strong>{countdown}</strong> seconds...
              </p>
              <button onClick={handleBackToLogin} className="auth-button">
                <i className="fas fa-sign-in-alt"></i> Go to Login Now
              </button>
            </div>
          )}
        </div>
        </GlassSurface>
      </div>
    </div>
  );
};

export default ForgotPassword;
