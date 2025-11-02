import React from 'react';
import { motion } from 'framer-motion';
import './AnimatedInput.css';

const container = { hover: { scale: 1.01 } };

const AnimatedInput = ({ id, name, value, onChange, placeholder, type='text', required=false, disabled=false, as='input', options=[] }) => {
  const isTextarea = as === 'textarea';
  const isSelect = as === 'select';

  const commonProps = { id, name, value, onChange, required, disabled };

  return (
    <motion.label className="anim-input" initial={false} whileHover="hover" variants={container}>
      <span className="anim-label">{placeholder}</span>
      {isTextarea ? (
        <textarea className="anim-field" {...commonProps} />
      ) : isSelect ? (
        <select className="anim-field" {...commonProps}>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input className="anim-field" type={type} {...commonProps} />
      )}
    </motion.label>
  );
};

export default AnimatedInput;
