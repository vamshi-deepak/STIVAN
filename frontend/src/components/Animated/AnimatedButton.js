import React from 'react';
import { motion } from 'framer-motion';
import '../Buttons/AnimatedButton.css';

export default function AnimatedButton({ children, className = '', ...props }){
  return (
    <motion.button whileTap={{ scale: 0.985 }} whileHover={{ y: -3 }} className={`rb-animated-btn ${className}`} {...props}>
      {children}
    </motion.button>
  );
}
