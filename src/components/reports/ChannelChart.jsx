import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ChannelChart = ({ data }) => {
  return (
    <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-xl shadow-lg h-full">
      <h3 className="text-white font-semibold mb-6">Doanh Thu theo Kênh (Channel)</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
            <XAxis 
              type="number"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(v) => `${(v/1000000000).toFixed(1)}B`}
            />
            <YAxis 
              dataKey="name" 
              type="category"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#e2e8f0', fontSize: 11 }}
              width={80}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              formatter={(v) => [`${v.toLocaleString()} VND`, "Doanh thu"]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#312e81'} fillOpacity={1 - (index * 0.05)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChannelChart;
