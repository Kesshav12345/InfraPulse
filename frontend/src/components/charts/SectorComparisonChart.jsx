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
        <div className="bg-slate-900/95 backdrop-blur-xs text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 space-y-1">
          <div className="font-bold text-sm text-sky-400 pb-1 border-b border-slate-800">{d.fullName}</div>
          <div className="flex justify-between gap-4 text-slate-300 font-mono text-[11px]">
            <span>Monitored Projects:</span>
            <strong className="text-white">{d.projectCount}</strong>
          </div>
          <div className="flex justify-between gap-4 text-slate-300 font-mono text-[11px]">
            <span>Revised Sanction:</span>
            <strong className="text-white">₹{d.revisedCost.toLocaleString()} Cr</strong>
          </div>
          <div className="flex justify-between gap-4 text-amber-400 font-mono text-[11px]">
            <span>Cost Escalation:</span>
            <strong>+{d.costEscalation.toFixed(1)}%</strong>
          </div>
          <div className="flex justify-between gap-4 text-emerald-400 font-mono text-[11px]">
            <span>Avg Progress:</span>
            <strong>{d.avgProgress.toFixed(1)}%</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 35 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D5E4F2" vertical={false} opacity={0.8} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
            angle={-30}
            textAnchor="end"
            interval={0}
            axisLine={{ stroke: '#B8CEE2' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#475569', fontFamily: 'monospace' }}
            tickFormatter={(v) => `${v}%`}
            axisLine={{ stroke: '#B8CEE2' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={30}
            formatter={(value) => <span className="text-[11px] text-[#10213D] font-semibold">{value}</span>}
          />
          <Bar dataKey="costEscalation" name="Cost Escalation (%)" fill="#F7941D" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="avgProgress" name="Avg Physical Progress (%)" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
