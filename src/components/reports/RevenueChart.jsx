import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data }) => {
  return (
    <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-xl shadow-lg h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-semibold flex items-center gap-2">
          Doanh Thu theo Tháng
          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-widest">Q1 2026</span>
        </h3>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ fontSize: '13px' }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', color: '#94a3b8' }}
            />
            <Bar dataKey="new" name="KH Mới" stackId="a" fill="#2dd4bf" radius={[0, 0, 0, 0]} />
            <Bar dataKey="existing" name="KH Hiện Hữu" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
