import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/Login.css"; // Use the new shared CSS
import "@fortawesome/fontawesome-free/css/all.min.css";
import { API_ENDPOINTS } from "../config/api";

const Login = ({ setToken }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userData", JSON.stringify(data.data.user));
        
        setSuccessMessage(`Welcome back, ${data.data.user.name || "User"}!`);
        
        setTimeout(() => {
          if (typeof setToken === 'function') {
            setToken(data.data.token);
          }
          navigate("/home", { replace: true });
        }, 1500);
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
        setLoading(false);
      }
    } catch (err) {
      setError("Connection error. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-panel auth-showcase">
        <div className="auth-showcase-content">
          <h1>STIVAN</h1>
          <p>Your AI companion to validate and enhance startup ideas.</p>
        </div>
      </div>
      <div className="auth-panel auth-form-panel">
        <div className="auth-form-card">
          <h2>Welcome Back!</h2>
          <p>Login to access your dashboard.</p>

          <form onSubmit={handleLogin}>
            {error && <div className="message-box error">{error}</div>}
            {successMessage && <div className="message-box success">{successMessage}</div>}

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

            <button type="submit" className="auth-button" disabled={loading || successMessage}>
              {loading ? (<><i className="fas fa-spinner fa-spin" /> Logging in...</>) : successMessage ? (<><i className="fas fa-check-circle" /> Success!</>) : ("Login")}
            </button>

            <p className="auth-switch-link">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
            <p className="auth-switch-link">
              Forgot your password? <Link to="/forgot-password">Reset it</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;