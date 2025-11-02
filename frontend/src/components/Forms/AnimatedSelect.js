import React from 'react';
import { motion } from 'framer-motion';
import './AnimatedInput.css';

const AnimatedSelect = ({ id, name, value, onChange, options, disabled=false }) => {
  return (
    <label className="anim-input">
      <span className="anim-label">{id}</span>
      <select id={id} name={name} value={value} onChange={onChange} className="anim-field" disabled={disabled}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
};

export default AnimatedSelect;
