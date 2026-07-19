import React from 'react';

export default function MetricsCard({ title, value, subText, color, tint }) {
  const glassTintMap = {
    amber: 'glass-amber',
    green: 'glass-green',
    red: 'glass-red',
    blue: 'glass-blue',
  };

  const glassClass = tint ? glassTintMap[tint] : 'glass';

  return (
    <div className={`${glassClass} p-6 rounded-[--radius] transition-all duration-300 hover:scale-[1.02]`}>
      <p className="text-[--color-muted-foreground] text-xs font-mono mb-1 uppercase tracking-wider">
        {title}
      </p>
      <p 
        className="font-display text-4xl font-bold leading-tight" 
        style={{ color: color || 'var(--color-foreground)' }}
      >
        {value}
      </p>
      <p className="text-[--color-muted-foreground] text-xs mt-1 font-body">
        {subText}
      </p>
    </div>
  );
}