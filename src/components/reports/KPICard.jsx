import React from 'react';

const KPICard = ({ title, value, target, status, suffix = "" }) => {
  const isRed = status === 'red' || status === '❌';
  const isGreen = status === 'green' || status === '✅';
  const isAmber = status === 'amber' || status === '⚠️';

  const getStatusColor = () => {
    if (isRed) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (isGreen) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (isAmber) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const getStatusIcon = () => {
    if (isRed) return '❌';
    if (isGreen) return '✅';
    if (isAmber) return '⚠️';
    return '';
  };

  return (
    <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-xl shadow-lg hover:border-slate-700 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h4>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor()}`}>
          {getStatusIcon()}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {suffix && <span className="text-slate-500 text-sm font-medium">{suffix}</span>}
      </div>
      {target && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-[11px]">
          <span className="text-slate-500">Mục tiêu: <span className="text-slate-300">{target}</span></span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
