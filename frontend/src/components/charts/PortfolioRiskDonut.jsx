import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function PortfolioRiskDonut({
  distribution = { LOW: 1400, MODERATE: 1200, HIGH: 800, CRITICAL: 442 }
}) {
  const data = [
    { name: 'Critical (75-100)', value: distribution.CRITICAL || 0, color: '#DC2626' },
    { name: 'High (50-74)', value: distribution.HIGH || 0, color: '#D97706' },
    { name: 'Moderate (25-49)', value: distribution.MODERATE || 0, color: '#CA8A04' },
    { name: 'Low (0-24)', value: distribution.LOW || 0, color: '#059669' },
  ];

  const total = data.reduce((acc, cur) => acc + cur.value, 0) || 1;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0];
      const pct = ((d.value / total) * 100).toFixed(1);
      return (
        <div className="bg-slate-900/95 backdrop-blur-xs text-white text-xs p-2.5 rounded-lg shadow-xl border border-slate-700">
          <div className="font-bold text-slate-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.payload.color }} />
            {d.name}
          </div>
          <div className="text-slate-300 font-mono mt-1">
            Projects: <strong className="text-white">{d.value.toLocaleString()}</strong> ({pct}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="46%"
            innerRadius={58}
            outerRadius={84}
            paddingAngle={3}
            dataKey="value"
            stroke="#FFFFFF"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-[11px] text-slate-600 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
