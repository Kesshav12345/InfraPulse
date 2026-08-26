import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function PortfolioRiskDonut({
  distribution = { LOW: 1400, MODERATE: 1200, HIGH: 800, CRITICAL: 442 }
}) {
  const data = [
    { name: 'Critical (75-100)', value: distribution.CRITICAL || 0, color: '#C62828' },
    { name: 'High (50-74)', value: distribution.HIGH || 0, color: '#D97706' },
    { name: 'Moderate (25-49)', value: distribution.MODERATE || 0, color: '#EAB308' },
    { name: 'Low (0-24)', value: distribution.LOW || 0, color: '#16803C' },
  ];

  const total = data.reduce((acc, cur) => acc + cur.value, 0) || 1;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0];
      const pct = ((d.value / total) * 100).toFixed(1);
      return (
        <div className="bg-slate-900 text-white text-xs p-2 rounded shadow-lg border border-slate-700">
          <div className="font-semibold">{d.name}</div>
          <div className="text-slate-300">
            Count: <strong>{d.value.toLocaleString()}</strong> ({pct}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-slate-700 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
