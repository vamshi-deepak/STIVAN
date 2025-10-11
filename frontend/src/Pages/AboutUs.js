import React from 'react';
import './CSS/AboutUs.css';
import "@fortawesome/fontawesome-free/css/all.min.css";

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <div className="about-hero">
        <h1>About STIVAN</h1>
        <p>Your AI companion to validate and enhance startup ideas.</p>
      </div>
      
      <div className="about-content">
        <div className="about-section">
          <h2><i className="fas fa-bullseye"></i> Our Mission</h2>
          <p>Our mission is to empower innovators, entrepreneurs, and dreamers by providing instant, data-driven, and insightful feedback on their startup ideas. We believe that a great idea deserves a great start, and STIVAN is here to provide just that.</p>
        </div>
        
        <div className="about-section">
          <h2><i className="fas fa-robot"></i> How It Works</h2>
          <p>
            STIVAN (Startup Idea Validator and Analyzer) is an AI-powered web application that evaluates startup ideas using the Google Gemini API, which is trained on vast business data, market insights, and successful startup patterns.
          </p>
          <p>
            When a user submits their startup idea through the web interface, STIVAN performs a comprehensive analysis across multiple aspects such as market potential, innovation, scalability, and competition. The platform then generates a detailed evaluation report that highlights market viability, potential competitors, risk factors, and practical improvement suggestions.
          </p>
          <p>
            Under the hood, STIVAN is built on a full-stack architecture:
          </p>
          <p>
            <strong>Frontend:</strong> Developed using React.js and CSS, offering an intuitive and interactive interface where users can easily input their startup ideas and view instant AI-based feedback.
          </p>
          <p>
            <strong>Backend:</strong> Built with Node.js and Express.js, which directly connects to the Google Gemini API to analyze ideas in real time. It also manages authentication, data storage, and communication between the frontend and database.
          </p>
          <p>
            <strong>Database:</strong> MongoDB is used to securely store user inputs, AI evaluation results, and other analytics for scalability and efficient data retrieval.
          </p>
          <p>
            Together, these components make STIVAN a smart platform that not only validates startup ideas but also provides valuable insights and suggestions to help turn them into successful ventures.
          </p>
          <p>
            📩 For any queries or collaborations, feel free to contact us through :<a href="mailto:stivancontact@gmail.com">stivancontact@gmail.com</a>.
          </p>
        </div>

        <div className="team-section">
          <h2>Meet the Team</h2>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-name">B Vamshi Deepak</div>
              <div className="team-role">Coordinator</div>
            </div>
            <div className="team-card">
              <div className="team-name">Nithin</div>
              <div className="team-role">Coordinator</div>
            </div>
            <div className="team-card">
              <div className="team-name">Parthiv</div>
              <div className="team-role">Coordinator</div>
            </div>
            <div className="team-card">
              <div className="team-name">Maanas</div>
              <div className="team-role">Coordinator</div>
            </div>
            <div className="team-card">
              <div className="team-name">Tarunika</div>
              <div className="team-role">Coordinator</div>
            </div>
            <div className="team-card">
              <div className="team-name">Niharika</div>
              <div className="team-role">Coordinator</div>
            </div>
          </div>

          <h3 className="mentor-heading">Mentor</h3>
          <div className="mentor-card">
            <div className="team-card">
              <div className="team-name">B Varsha</div>
              <div className="team-role">Mentor</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;