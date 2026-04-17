import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SegmentChart = ({ data }) => {
  const COLORS = {
    'VIP': '#f59e0b',
    'Loyal': '#10b981',
    'At Risk': '#f97316',
    'Lost': '#ef4444'
  };

  return (
    <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-xl shadow-lg h-full">
      <h3 className="text-white font-semibold mb-6">Phân khúc Khách hàng (Segments)</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="count"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#64748b'} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              formatter={(v, name) => [`${v} KH`, name]}
            />
            <Legend 
              verticalAlign="bottom" 
              align="center" 
              iconType="circle"
              formatter={(value, entry) => {
                const { payload } = entry;
                return <span className="text-slate-400 text-xs">{value} ({payload.percent.toFixed(1)}%)</span>;
              }}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SegmentChart;
