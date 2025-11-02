import React from 'react';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';
import './FeatureCard.css';

const FeatureCard = ({ title, description, icon, onClick }) => {
  return (
    <Tilt glareEnable={false} tiltMaxAngleX={8} tiltMaxAngleY={8} className="feature-tilt">
      <motion.div whileHover={{ y: -6 }} className="feature-card" onClick={onClick}>
        <div className="feature-icon">{icon}</div>
        <h4>{title}</h4>
        <p className="muted">{description}</p>
      </motion.div>
    </Tilt>
  );
};

export default FeatureCard;
