import React from 'react';
import { motion } from 'framer-motion';
import './Hero.css';
import Lottie from 'lottie-react';
import heroAnim from './hero-sample.json';

export default function Hero(){
  return (
    <section className="rb-hero container-wide">
      <div className="hero-inner">
        <header className="hero-top">
          <div className="brand-pill">React Bits</div>
          <nav className="hero-nav">
            <a href="#">Home</a>
            <a href="#">Docs</a>
          </nav>
        </header>

        <div className="hero-body">
          <div className="hero-copy">
            <motion.h1 initial={{ y: 12, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.05 }}>Validate. Improve. Launch.</motion.h1>
            <motion.p initial={{ y: 8, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.12 }} className="muted">AI-powered startup idea validator and advisor — get instant feedback, suggestions, and a coachable chatbot to refine your idea.</motion.p>

            <div className="hero-ctas">
              <button className="btn-primary">Go to Validator</button>
              <button className="btn-outline">Learn more</button>
            </div>
          </div>

          <div className="hero-art">
            {heroAnim ? <Lottie animationData={heroAnim} style={{ width: 320, height: 240 }} /> : null}
          </div>
        </div>

        <footer className="hero-footer">
          <div className="built-with">Built with <span role="img" aria-label="light">💡</span> — STIVAN</div>
          <label className="demo-toggle"><input type="checkbox"/> Demo Content</label>
        </footer>
      </div>
    </section>
  );
}
