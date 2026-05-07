import React from 'react';

const GlassCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl ${className}`}>
    {children}
  </div>
);

export default GlassCard;