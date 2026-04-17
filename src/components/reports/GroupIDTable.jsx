import React from 'react';

const GroupIDTable = ({ groups }) => {
  return (
    <div className="bg-[#1e293b] border border-slate-800 rounded-xl shadow-lg overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-800 bg-slate-800/20">
        <h3 className="text-white font-semibold flex items-center gap-2">
          Hệ Thống Group IDs (8 Groups Ẩn)
          <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded">RESTRICTED VIEW</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#0f172a] text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-widest font-bold">
              <th className="px-6 py-4">Customer ID</th>
              <th className="px-4 py-4">Group Name</th>
              <th className="px-4 py-4">Spend (VND)</th>
              <th className="px-4 py-4">Orders</th>
              <th className="px-4 py-4">Channel</th>
              <th className="px-4 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {groups.map((g, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-mono text-indigo-400">{g.id}</td>
                <td className="px-4 py-4 text-slate-200">{g.name}</td>
                <td className="px-4 py-4 text-white font-mono">{g.spend.toLocaleString()}</td>
                <td className="px-4 py-4 text-slate-400">{g.orders}</td>
                <td className="px-4 py-4">
                  <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">{g.channel}</span>
                </td>
                <td className="px-4 py-4 text-center">
                   <div className="flex justify-center items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full mx-auto w-fit border border-emerald-500/20">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     ACTIVE
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupIDTable;
