import React, { useState, useEffect } from 'react';
import './CSS/AboutUs.css';
import ChromaGrid from '../components/ChromaGrid/ChromaGrid';
import GradientBlinds from '../components/GradientBlinds/GradientBlinds';
import GradientText from '../components/GradientText/GradientText';
import "@fortawesome/fontawesome-free/css/all.min.css";

const AboutUs = () => {
  const [counters, setCounters] = useState({
    ideas: 0,
    users: 0,
    satisfaction: 0,
    uptime: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  // Simple AOS (Animate On Scroll) Implementation
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('[data-aos]');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);

  // Animated counter effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const statsSection = document.querySelector('.stats-banner');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => {
      if (statsSection) {
        observer.unobserve(statsSection);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const targets = { ideas: 1000, users: 500, satisfaction: 95, uptime: 24 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounters({
        ideas: Math.floor(targets.ideas * progress),
        users: Math.floor(targets.users * progress),
        satisfaction: Math.floor(targets.satisfaction * progress),
        uptime: Math.floor(targets.uptime * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setCounters(targets);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="about-us-container">
      {/* Hero Section with Animated Background */}
      <div className="about-hero">
        <div className="about-hero-background">
          <GradientBlinds
            gradientColors={['#6a11cb', '#2575fc', '#a855f7', '#ec4899']}
            angle={45}
            blindCount={20}
            noise={0.4}
            mixBlendMode="normal"
          />
        </div>
        <div className="about-hero-content">
          <GradientText
            colors={['#ffffff', '#a78bfa', '#ffffff', '#ec4899', '#ffffff']}
            animationSpeed={6}
            className="about-hero-title"
          >
            About STIVAN
          </GradientText>
          <p className="about-hero-subtitle">Transforming Ideas into Reality</p>
          <div className="scroll-indicator">
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>
      </div>

      {/* Mission & Vision Cards */}
      <div className="mission-vision-section">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="glass-card mission-card" data-aos="fade-right">
              <div className="card-icon mission-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h2 className="card-title">Our Mission</h2>
              <p className="card-text">
                To empower innovators, entrepreneurs, and dreamers by providing instant, 
                data-driven, and insightful feedback on their startup ideas. We believe 
                that every great idea deserves a great start, and STIVAN is here to 
                provide just that.
              </p>
            </div>

            <div className="glass-card vision-card" data-aos="fade-left">
              <div className="card-icon vision-icon">
                <i className="fas fa-eye"></i>
              </div>
              <h2 className="card-title">Our Vision</h2>
              <p className="card-text">
                To become the world's most trusted AI-powered startup validation platform, 
                helping millions of entrepreneurs transform their innovative ideas into 
                successful businesses through intelligent insights and actionable feedback.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="values-section">
        <div className="container">
          <h2 className="section-title" data-aos="fade-up">
            <GradientText colors={['#6a11cb', '#2575fc', '#a855f7']}>
              Why Choose STIVAN
            </GradientText>
          </h2>
          <div className="values-grid">
            <div className="value-card" data-aos="zoom-in" data-aos-delay="0">
              <div className="value-icon innovation">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h3 className="value-title">Innovation First</h3>
              <p className="value-text">
                Cutting-edge AI technology powered by Google Gemini for accurate insights.
              </p>
            </div>

            <div className="value-card" data-aos="zoom-in" data-aos-delay="100">
              <div className="value-icon speed">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="value-title">Lightning Fast</h3>
              <p className="value-text">
                Get comprehensive feedback on your idea in seconds, not days.
              </p>
            </div>

            <div className="value-card" data-aos="zoom-in" data-aos-delay="200">
              <div className="value-icon ai">
                <i className="fas fa-robot"></i>
              </div>
              <h3 className="value-title">AI-Powered</h3>
              <p className="value-text">
                Advanced machine learning algorithms analyze market trends and patterns.
              </p>
            </div>

            <div className="value-card" data-aos="zoom-in" data-aos-delay="300">
              <div className="value-icon security">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="value-title">Secure & Private</h3>
              <p className="value-text">
                Your ideas are encrypted and protected with enterprise-grade security.
              </p>
            </div>

            <div className="value-card" data-aos="zoom-in" data-aos-delay="400">
              <div className="value-icon analytics">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="value-title">Deep Analytics</h3>
              <p className="value-text">
                Comprehensive reports with market analysis and actionable insights.
              </p>
            </div>

            <div className="value-card" data-aos="zoom-in" data-aos-delay="500">
              <div className="value-icon community">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="value-title">Vibrant Community</h3>
              <p className="value-text">
                Connect with fellow entrepreneurs and share your journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Banner */}
      <div className="stats-banner">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card" data-aos="fade-up" data-aos-delay="0">
              <div className="stat-icon">
                <i className="fas fa-lightbulb"></i>
              </div>
              <div className="stat-number">{counters.ideas.toLocaleString()}+</div>
              <div className="stat-label">Ideas Validated</div>
            </div>

            <div className="stat-card" data-aos="fade-up" data-aos-delay="100">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-number">{counters.users.toLocaleString()}+</div>
              <div className="stat-label">Active Users</div>
            </div>

            <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
              <div className="stat-icon">
                <i className="fas fa-smile"></i>
              </div>
              <div className="stat-number">{counters.satisfaction}%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>

            <div className="stat-card" data-aos="fade-up" data-aos-delay="300">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-number">{counters.uptime}/7</div>
              <div className="stat-label">AI Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack Section */}
      <div className="tech-stack-section">
        <div className="container">
          <h2 className="section-title" data-aos="fade-up">
            <GradientText colors={['#6a11cb', '#2575fc', '#a855f7']}>
              Powered By Modern Technology
            </GradientText>
          </h2>
          <div className="tech-grid">
            <div className="tech-category" data-aos="fade-up" data-aos-delay="0">
              <h3 className="tech-category-title">Frontend</h3>
              <div className="tech-badges">
                <div className="tech-badge">
                  <i className="fab fa-react"></i>
                  <span>React.js</span>
                </div>
                <div className="tech-badge">
                  <i className="fab fa-css3-alt"></i>
                  <span>Modern CSS</span>
                </div>
              </div>
            </div>

            <div className="tech-category" data-aos="fade-up" data-aos-delay="100">
              <h3 className="tech-category-title">Backend</h3>
              <div className="tech-badges">
                <div className="tech-badge">
                  <i className="fab fa-node-js"></i>
                  <span>Node.js</span>
                </div>
                <div className="tech-badge">
                  <i className="fas fa-server"></i>
                  <span>Express.js</span>
                </div>
              </div>
            </div>

            <div className="tech-category" data-aos="fade-up" data-aos-delay="200">
              <h3 className="tech-category-title">Database</h3>
              <div className="tech-badges">
                <div className="tech-badge">
                  <i className="fas fa-database"></i>
                  <span>MongoDB</span>
                </div>
              </div>
            </div>

            <div className="tech-category" data-aos="fade-up" data-aos-delay="300">
              <h3 className="tech-category-title">AI Engine</h3>
              <div className="tech-badges">
                <div className="tech-badge ai-badge">
                  <i className="fas fa-brain"></i>
                  <span>Google Gemini</span>
                  <span>Perplexity AI</span>
                  <span>RAG</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <div className="container">
          <h2 className="section-title" data-aos="fade-up">
            <GradientText colors={['#6a11cb', '#2575fc', '#a855f7']}>
              Meet Our Team
            </GradientText>
          </h2>
          <div style={{ position: 'relative', marginTop: 40, marginBottom: 40 }}>
            <ChromaGrid
              items={[
                { image: 'https://i.pinimg.com/736x/c0/74/9b/c0749b7cc401421662ae901ec8f9f660.jpg', title: 'B Vamshi Deepak', subtitle: 'Coordinator', handle: '@vamshi', borderColor: '#3B82F6', gradient: 'linear-gradient(145deg,#3B82F6,#fff)' },
                { image: 'https://i.pinimg.com/736x/c0/74/9b/c0749b7cc401421662ae901ec8f9f660.jpg', title: 'Nithin', subtitle: 'Coordinator', handle: '@nithin', borderColor: '#10B981', gradient: 'linear-gradient(145deg,#10B981,#fff)' },
                { image: 'https://i.pinimg.com/736x/c0/74/9b/c0749b7cc401421662ae901ec8f9f660.jpg', title: 'Parthiv', subtitle: 'Coordinator', handle: '@parthiv', borderColor: '#F59E0B', gradient: 'linear-gradient(145deg,#F59E0B,#fff)' },
                { image: 'https://i.pinimg.com/736x/c0/74/9b/c0749b7cc401421662ae901ec8f9f660.jpg', title: 'S Ram Maanas', subtitle: 'Coordinator', handle: '@maanas', borderColor: '#EF4444', gradient: 'linear-gradient(145deg,#EF4444,#fff)' },
                { image: 'https://i.pinimg.com/736x/c0/74/9b/c0749b7cc401421662ae901ec8f9f660.jpg', title: 'Tarunika', subtitle: 'Coordinator', handle: '@tarunika', borderColor: '#8B5CF6', gradient: 'linear-gradient(150g,#8B5CF6,#fff)' },
                { image: 'https://i.pinimg.com/736x/c0/74/9b/c0749b7cc401421662ae901ec8f9f660.jpg', title: 'Niharika', subtitle: 'Coordinator', handle: '@niharika', borderColor: '#06B6D4', gradient: 'linear-gradient(145deg,#06B6D4,#fff)' }
              ]}
              radius={250}
              columns={3}
              damping={0.45}
              fadeOut={0.6}
              ease="power3.out"
            />
          </div>

          <h3 className="mentor-heading">Our Mentor</h3>
          <div className="mentor-wrapper">
            <div className="mentor-inner">
              <ChromaGrid
                items={[{ image: 'https://i.pinimg.com/736x/c0/74/9b/c0749b7cc401421662ae901ec8f9f660.jpg', title: 'B Varsha', subtitle: 'Mentor', handle: '@bvarsha', borderColor: '#9CA3AF', gradient: 'linear-gradient(180deg,#111827,#0f172a)' }]}
                columns={1}
                radius={180}
                damping={0.45}
                fadeOut={0.6}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="cta-section">
        <div className="cta-background">
          <GradientBlinds
            gradientColors={['#6a11cb', '#2575fc', '#ec4899', '#a855f7']}
            angle={-45}
            blindCount={15}
            noise={0.3}
            mixBlendMode="normal"
          />
        </div>
        <div className="cta-content">
          <h2 className="cta-title" data-aos="fade-up">
            Ready to Validate Your Idea?
          </h2>
          <p className="cta-subtitle" data-aos="fade-up" data-aos-delay="100">
            Join thousands of entrepreneurs who trust STIVAN for their startup journey
          </p>
          <div className="cta-buttons" data-aos="fade-up" data-aos-delay="200">
            <a href="/signup" className="cta-button primary">
              <i className="fas fa-rocket"></i>
              Start Your Journey
            </a>
            <a href="/community" className="cta-button secondary">
              <i className="fas fa-users"></i>
              Join Community
            </a>
          </div>
          <div className="cta-contact" data-aos="fade-up" data-aos-delay="300">
            <p>
              <i className="fas fa-envelope"></i>
              For queries: <a href="mailto:stivancontact@gmail.com">stivancontact@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;