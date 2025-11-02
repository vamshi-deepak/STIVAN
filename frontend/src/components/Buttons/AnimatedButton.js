import React from 'react';
import { motion } from 'framer-motion';
import '../../theme/theme.css';
import './AnimatedButton.css';

export default function AnimatedButton({ children, className='', ...props }){
  return (
    <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} className={`animated-btn ${className}`} {...props}>
      {children}
    </motion.button>
  );
}
