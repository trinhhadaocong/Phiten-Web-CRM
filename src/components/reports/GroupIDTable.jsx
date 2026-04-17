import React, { useState } from 'react';

const GroupIDTable = ({ groups }) => {
  const [showFullAmount, setShowFullAmount] = useState(false);

  const formatSpend = (value) => {
    if (showFullAmount) return value.toLocaleString() + ' VND';
    return (value / 1000000).toFixed(2) + 'M';
  };

  const totals = groups.reduce((acc, g) => ({
    spend: acc.spend + g.spend,
    orders: acc.orders + (g.orders || 0),
    active: acc.active + (g.status === 'Active' ? 1 : 0),
    stop: acc.stop + (g.status === 'Stop' ? 1 : 0)
  }), { spend: 0, orders: 0, active: 0, stop: 0 });

  return (
    <div className="bg-[#1e293b] border border-slate-800 rounded-xl shadow-lg overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
        <h3 className="text-white font-semibold flex items-center gap-2">
          Hệ Thống Group IDs (8 Groups Thực Tế)
          <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-bold">RESTRICTED — CRM Manager Only</span>
        </h3>
        <button 
          onClick={() => setShowFullAmount(!showFullAmount)}
          className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded transition-colors"
        >
          {showFullAmount ? 'XEM DẠNG TRIỆU' : 'XEM ĐẦY ĐỦ VND'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#0f172a] text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-widest font-bold">
              <th className="px-6 py-4">Customer ID</th>
              <th className="px-4 py-4">Group Name</th>
              <th className="px-4 py-4">Spend</th>
              <th className="px-4 py-4">Quantity (KH)</th>
              <th className="px-4 py-4">Channel</th>
              <th className="px-4 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {groups.map((g, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4 font-mono text-indigo-400 font-bold">{g.id}</td>
                <td className="px-4 py-4 text-slate-200">
                  <div className="relative cursor-help" title={g.note}>
                    {g.name}
                    <span className="opacity-0 group-hover:opacity-100 absolute left-0 -top-8 bg-slate-900 text-white text-[10px] px-2 py-1 rounded border border-slate-700 pointer-events-none transition-all w-max z-50">
                      {g.note}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-white font-mono">{formatSpend(g.spend)}</td>
                <td className="px-4 py-4 text-slate-400 font-mono">{g.orders}</td>
                <td className="px-4 py-4">
                  <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">{g.channel}</span>
                </td>
                <td className="px-4 py-4 text-center">
                   <div className={`flex justify-center items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full mx-auto w-fit border ${
                     g.status === 'Active' 
                      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
                      : 'text-red-500 bg-red-500/10 border-red-500/20'
                   }`}>
                     <div className={`w-1.5 h-1.5 rounded-full ${g.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                     {g.status.toUpperCase()}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#0f172a]/50 text-slate-300 border-t border-slate-800 font-bold text-xs">
              <td className="px-6 py-4">TỔNG CỘNG</td>
              <td className="px-4 py-4">8 Groups</td>
              <td className="px-4 py-4 text-white font-mono">{totals.spend.toLocaleString()} VND</td>
              <td className="px-4 py-4 font-mono">{totals.orders} KH</td>
              <td className="px-4 py-4"></td>
              <td className="px-4 py-4 text-center">
                 <span className="text-emerald-500">{totals.active} Active</span> / <span className="text-red-500">{totals.stop} Stop</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default GroupIDTable;
