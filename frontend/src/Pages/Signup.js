import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/Signup.css"; // Use the new shared CSS
import "@fortawesome/fontawesome-free/css/all.min.css";
import { API_ENDPOINTS } from "../config/api";
import GridDistortion from "../components/backgrounds/GridDistortion";
import GlassSurface from "../components/GlassSurface/GlassSurface";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.signup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, email, password, confirmPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Signup successful! Redirecting to login...");
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        setError(data.message || "Registration failed.");
        setLoading(false);
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-panel auth-showcase">
        <GridDistortion
          imageSrc="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2032"
          grid={10}
          mouse={0.1}
          strength={0.15}
          relaxation={0.9}
        />
        <div className="auth-showcase-content">
          <h1>STIVAN</h1>
          <p>Join the next generation of innovators.</p>
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
          <h2>Create Your Account</h2>
          <p>Get started validating your ideas in minutes.</p>
          <form onSubmit={handleSubmit}>
            {error && <div className="message-box error">{error}</div>}
            {successMessage && <div className="message-box success">{successMessage}</div>}

            <div className="input-group">
              <i className="fas fa-user input-icon"></i>
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading || successMessage}/>
            </div>
            <div className="input-group">
              <i className="fas fa-envelope input-icon"></i>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading || successMessage}/>
            </div>
            <div className="input-group">
              <i className="fas fa-lock input-icon"></i>
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading || successMessage}/>
              <span className="toggle-password" onClick={() => !loading && !successMessage && setShowPassword((s) => !s)}>
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </span>
            </div>
            <div className="input-group">
              <i className="fas fa-check-circle input-icon"></i>
              <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading || successMessage}/>
            </div>

            <button type="submit" className="auth-button" disabled={loading || successMessage}>
              {loading ? 'Creating Account...' : successMessage ? 'Success!' : 'Sign Up'}
            </button>
            <p className="auth-switch-link">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
        </GlassSurface>
      </div>
    </div>
  );
};

export default Signup;