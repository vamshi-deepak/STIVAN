import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/Login.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { API_ENDPOINTS } from "../config/api";

// Accept optional setToken prop so App can lift auth state
const Login = ({ setToken }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShowSuccess(false);

    if (email.trim() === "" || password.trim() === "") {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data && data.success) {
        const token = data.data?.token;
        const user = data.data?.user;

        if (!token || !user) {
          setError("Invalid response from server. Please try again.");
          setLoading(false);
          return;
        }

        const normalizedUser = {
          id: user._id || user.id || "",
          name: user.name || "",
          email: user.email || "",
          role: user.role || "user",
          ...user,
        };

        // Store everything in localStorage first (but don't update App state yet)
        localStorage.setItem("token", token);
        localStorage.setItem("userData", JSON.stringify(normalizedUser));
        localStorage.setItem("userId", normalizedUser.id);
        localStorage.setItem("userName", normalizedUser.name);
        localStorage.setItem("userEmail", normalizedUser.email);
        localStorage.setItem("userRole", normalizedUser.role);

        console.info("Login successful — stored token and user info.");

        // Clear inputs for UX
        setEmail("");
        setPassword("");

        // Show success message FIRST
        setSuccessMessage(`🎉 Login successful! Welcome back, ${normalizedUser.name || "User"}!`);
        setShowSuccess(true);
        setLoading(false);

        // Update App state and navigate after 2 seconds
        setTimeout(() => {
          // Update App state which will trigger route protection and redirect
          try {
            if (typeof setToken === 'function') setToken(token);
          } catch (err) {
            console.warn('setToken callback threw:', err);
          }
          navigate("/home", { replace: true });
        }, 2000);
      } else {
        setError((data && data.message) || "Login failed. Please check your credentials.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Connection error. Please check if the server is running and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="left-side">
        <div className="overlay-text">
          <h1>S T I V A N</h1>
          <p>Your AI companion to validate and enhance startup ideas.</p>
        </div>
      </div>

      <div className="right-side">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>

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
              {successMessage}
            </div>
          )}

          {error && (
            <div className="error-message" style={{
              color: "#e74c3c",
              backgroundColor: "#fadbd8",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "15px",
              textAlign: "center",
              fontSize: "14px",
              border: "1px solid #e74c3c",
              fontWeight: "500"
            }}>
              {error}
            </div>
          )}

          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || showSuccess}
            />
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || showSuccess}
            />
            <span
              className="toggle-password"
              onClick={() => !loading && !showSuccess && setShowPassword((s) => !s)}
              style={{ 
                cursor: (loading || showSuccess) ? "not-allowed" : "pointer", 
                opacity: (loading || showSuccess) ? 0.5 : 1 
              }}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </span>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading || showSuccess}
            style={{ 
              opacity: (loading || showSuccess) ? 0.7 : 1, 
              cursor: (loading || showSuccess) ? "not-allowed" : "pointer" 
            }}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: "8px" }} />
                Logging in...
              </>
            ) : showSuccess ? (
              <>
                <i className="fas fa-check-circle" style={{ marginRight: "8px" }} />
                Success! Redirecting to Home...
              </>
            ) : (
              "Login"
            )}
          </button>

          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>
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

export default Login;