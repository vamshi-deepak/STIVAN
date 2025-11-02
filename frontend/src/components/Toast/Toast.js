import React, { useEffect } from 'react';
import './Toast.css';
import { motion } from 'framer-motion';

const toastVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: 24, transition: { duration: 0.2 } }
};

const Toast = ({ message, type='info', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <motion.div initial="hidden" animate="visible" exit="exit" variants={toastVariants} className={`toast toast-${type}`}>
      <div className="toast-icon">
        {type === 'success' ? '✓' : '!'}
      </div>
      <p>{message}</p>
      <button onClick={onClose} className="toast-close-btn">&times;</button>
    </motion.div>
  );
};

export default Toast;