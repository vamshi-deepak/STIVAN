import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-root">
      <header className="landing-header">
        <div className="brand">STIVAN</div>
      </header>

      <section className="landing-hero">
        <div className="hero-left">
          <h1>Validate. Improve. Launch.</h1>
          <p className="lead">AI-powered startup idea validator and advisor — get instant feedback, suggestions, and a coachable chatbot to refine your idea.</p>
          <div className="cta-row">
            <button className="primary-cta" onClick={() => navigate('/home')}>Go to Validator</button>
            <button className="secondary-cta" onClick={() => navigate('/about')}>Learn more</button>
          </div>
        </div>

        <div className="hero-right">
          <div className="device">
            <div className="screen">
              <div className="floating-bubble b1" />
              <div className="floating-bubble b2" />
              <div className="floating-bubble b3" />
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">Built with 💡 — STIVAN</footer>
    </div>
  );
};

export default Landing;
