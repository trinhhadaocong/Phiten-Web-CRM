import React from 'react';

const KPIScorecard = ({ data }) => {
  return (
    <div className="bg-[#1e293b] border border-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-slate-800">
        <h3 className="text-white font-semibold italic flex items-center gap-2">
          CEO KPI Scorecard 
          <span className="not-italic text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">REAL-TIME</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#0f172a] text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-widest font-bold">
              <th className="px-6 py-4">KPI Metric</th>
              <th className="px-4 py-4">Thực tế</th>
              <th className="px-4 py-4">Mục tiêu</th>
              <th className="px-4 py-4">Gap</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-6 py-4">Hành động T4</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-200">{item.name}</td>
                <td className="px-4 py-4 text-white font-mono">{item.actual}</td>
                <td className="px-4 py-4 text-slate-400">{item.target}</td>
                <td className={`px-4 py-4 font-mono ${item.gap.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>
                  {item.gap}
                </td>
                <td className="px-4 py-4 text-center">{item.status}</td>
                <td className="px-6 py-4 text-slate-300 italic">{item.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KPIScorecard;
