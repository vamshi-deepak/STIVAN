import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="landing-root" onMouseMove={handleMouseMove}>
      {/* Static gradient background with flowing shapes */}
      <div className="landing-bg">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
        <div className="gradient-blob blob-4"></div>
        {/* Cursor glow effect */}
        <div 
          className="cursor-glow"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
          }}
        ></div>
      </div>

      {/* Content overlay */}
      <div className="landing-content">
        <header className="landing-header">
          <div className="brand-pill">
            <span className="brand-icon">⚡</span> STIVAN
          </div>
          <nav className="landing-nav">
            <a href="/home">Home</a>
            <a href="/about">Docs</a>
          </nav>
        </header>

        <section className="landing-hero">
          <div className="new-bg-badge">✨ New Background</div>
          <h1>Don't just sit there, move your cursor!</h1>
          <p className="lead">AI-powered startup idea validator and advisor — get instant feedback, suggestions, and a coachable chatbot to refine your idea.</p>
          <div className="cta-row">
            <button className="btn-get-started" onClick={() => navigate('/home')}>Get Started</button>
            <button className="btn-learn-more" onClick={() => navigate('/about')}>Learn More</button>
          </div>
        </section>

        <footer className="landing-footer">
          <div className="built-with">Built with 💡 — STIVAN</div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
