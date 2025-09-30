import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/Signup.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { API_ENDPOINTS } from "../config/api";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShowSuccess(false);

    // Email validation
    if (!email.includes("@") || !email.endsWith(".com")) {
      setError('Email must contain "@" and end with ".com"');
      setLoading(false);
      return;
    }

    // Password length validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.signup, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for CORS
        body: JSON.stringify({ 
          name: username,
          email,
          password,
          confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token if provided by backend after signup
        if (data.data && data.data.token) {
          localStorage.setItem('token', data.data.token);
        } else if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Clear form
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        
        // Show success message
        setShowSuccess(true);
        setLoading(false);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        setError(data.message || "Registration failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError("Connection error. Please check if the server is running and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Left Side */}
      <div className="left-side">
        <div className="overlay-text">
          <h1>S T I V A N</h1>
          <p>Your AI companion to validate and enhance startup ideas.</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="right-side">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Sign Up</h2>

          {showSuccess && (
            <div className="success-message" style={{
              color: "#27ae60",
              backgroundColor: "#d5f4e6",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "15px",
              textAlign: "center",
              fontSize: "16px",
              fontWeight: "600",
              border: "1px solid #a9dfbf",
              animation: "fadeIn 0.3s ease-in",
              boxShadow: "0 2px 8px rgba(39, 174, 96, 0.2)"
            }}>
              🎉 Signup successful! Now Login to proceed.
            </div>
          )}

          {/* Display error message */}
          {error && (
            <div className="error-message" style={{
              color: '#e74c3c',
              backgroundColor: '#fadbd8',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px',
              textAlign: 'center',
              fontSize: '14px',
              border: '1px solid #e74c3c',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          {/* Username */}
          <div className="input-group">
            <i className="fas fa-user icon"></i>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading || showSuccess}
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <i className="fas fa-envelope icon"></i>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || showSuccess}
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <i className="fas fa-lock icon"></i>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || showSuccess}
            />
            <i
              className={`far ${showPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
              onClick={() => !loading && !showSuccess && setShowPassword(!showPassword)}
              style={{ 
                cursor: (loading || showSuccess) ? "not-allowed" : "pointer",
                opacity: (loading || showSuccess) ? 0.5 : 1
              }}
            ></i>
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <i className="fas fa-lock icon"></i>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || showSuccess}
            />
            <i
              className={`far ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
              onClick={() => !loading && !showSuccess && setShowConfirmPassword(!showConfirmPassword)}
              style={{ 
                cursor: (loading || showSuccess) ? "not-allowed" : "pointer",
                opacity: (loading || showSuccess) ? 0.5 : 1
              }}
            ></i>
          </div>

          <button 
            type="submit" 
            className="signup-btn"
            disabled={loading || showSuccess}
            style={{
              opacity: (loading || showSuccess) ? 0.7 : 1,
              cursor: (loading || showSuccess) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                Signing Up...
              </>
            ) : showSuccess ? (
              <>
                <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
                Success! Redirecting...
              </>
            ) : (
              'Sign Up'
            )}
          </button>

          <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Signup;