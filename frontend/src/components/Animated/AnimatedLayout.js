import React from 'react';
import { motion } from 'framer-motion';
import '../../theme/theme.css';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } }
};

export default function AnimatedLayout({ children, className='' }){
  return (
    <motion.div initial="initial" animate="enter" exit="exit" variants={pageVariants} className={className}>
      {children}
    </motion.div>
  );
}
