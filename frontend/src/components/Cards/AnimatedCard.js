import React from 'react';
import { motion } from 'framer-motion';
import './AnimatedCard.css';

const AnimatedCard = ({ children, onClick, className='' }) => (
  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.995 }} className={`anim-card ${className}`} onClick={onClick}>
    {children}
  </motion.div>
);

export default AnimatedCard;
