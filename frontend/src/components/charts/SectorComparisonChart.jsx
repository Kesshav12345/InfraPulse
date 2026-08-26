import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function SectorComparisonChart({ sectors = [] }) {
  if (!sectors || sectors.length === 0) {
    return <div className="text-xs text-slate-400">No sector data available.</div>;
  }

  const data = sectors.slice(0, 8).map((s) => ({
    name: s.sector.replace('Ministry of ', '').replace('Infrastructure', 'Infra').slice(0, 16),
    fullName: s.sector,
    costEscalation: s.cost_escalation_pct || 0,
    avgProgress: s.avg_physical_progress || 0,
    projectCount: s.project_count,
    revisedCost: s.revised_cost_cr
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0]?.payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded shadow-lg border border-slate-700">
          <div className="font-bold text-sm text-blue-300 mb-1">{d.fullName}</div>
          <div>Projects: <strong>{d.projectCount}</strong></div>
          <div>Total Revised Cost: <strong>₹{d.revisedCost.toLocaleString()} Cr</strong></div>
          <div className="text-amber-400">Cost Escalation: <strong>+{d.costEscalation.toFixed(1)}%</strong></div>
          <div className="text-emerald-400">Avg Progress: <strong>{d.avgProgress.toFixed(1)}%</strong></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 35 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#475569' }}
            angle={-30}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748B' }}
            tickFormatter={(v) => `${v}%`}
            axisLine={{ stroke: '#CBD5E1' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={30} />
          <Bar dataKey="costEscalation" name="Cost Escalation (%)" fill="#D97706" radius={[4, 4, 0, 0]} />
          <Bar dataKey="avgProgress" name="Avg Physical Progress (%)" fill="#16803C" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
