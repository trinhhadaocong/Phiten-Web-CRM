import React from 'react';
import { Target, Users, Gift } from 'lucide-react';

const CampaignCards = ({ campaigns }) => {
  const getIcon = (title) => {
    if (title.includes('BẠN')) return <Users size={20} className="text-indigo-400" />;
    if (title.includes('VIP')) return <Target size={20} className="text-amber-400" />;
    return <Gift size={20} className="text-emerald-400" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {campaigns.map((camp, idx) => (
        <div key={idx} className="bg-[#1e293b] border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-indigo-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 -mt-10 -mr-10 bg-indigo-500/5 rounded-full group-hover:bg-indigo-500/10 transition-all" />
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-900 rounded-lg">
              {getIcon(camp.title)}
            </div>
            <h4 className="text-white font-bold text-sm tracking-wide">{camp.title}</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 uppercase font-semibold">Quy mô:</span>
              <span className="text-slate-200 font-bold">{camp.scale}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-xs uppercase font-semibold">Dự kiến (VNĐ):</span>
              <span className="text-indigo-400 font-mono font-bold">{camp.expected}</span>
            </div>
            
            <div className="pt-4 border-t border-slate-800">
               <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[10%] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
               </div>
               <div className="flex justify-between mt-2">
                 <span className="text-[10px] text-slate-500">Trạng thái: <b>Ready</b></span>
                 <span className="text-[10px] text-indigo-400 font-bold">Launch T4</span>
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CampaignCards;
