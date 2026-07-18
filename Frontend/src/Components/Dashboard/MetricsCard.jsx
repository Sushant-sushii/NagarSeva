import React from 'react';

const MetricsCard = ({ title, value, change, color }) => {
  const colorMap = {
    amber: 'border-amber-500 text-amber-400 bg-amber-500/5',
    cyan: 'border-cyan-500 text-cyan-400 bg-cyan-500/5',
    green: 'border-emerald-500 text-emerald-400 bg-emerald-500/5',
    red: 'border-red-500 text-red-400 bg-red-500/5',
  };

  return (
    <div className={`p-6 bg-slate-800 border-l-4 rounded-r-xl border-y border-r border-slate-700 shadow-xl flex flex-col justify-between ${colorMap[color] || 'border-slate-500'}`}>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-white">{value}</h3>
      </div>
      {change && (
        <span className="text-[11px] font-medium text-gray-400 mt-3 block">
          ⚡ Status: <span className="text-white font-semibold">{change}</span>
        </span>
      )}
    </div>
  );
};

export default MetricsCard;