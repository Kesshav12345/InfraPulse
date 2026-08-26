import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function TrajectoryLineChart({ trajectory = [] }) {
  if (!trajectory || trajectory.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-slate-400 text-xs bg-slate-50 border border-slate-200 rounded">
        No longitudinal trajectory observations available.
      </div>
    );
  }

  // Format chart data
  const data = trajectory.map((pt, idx) => {
    const isBaseline = idx === 0 && pt.physical_progress === 0;
    const isForecast = idx === trajectory.length - 1 && pt.physical_progress === 100 && String(pt.report_month).includes('Proj');
    
    let labelType = 'Observed Flash Report';
    if (isBaseline) labelType = 'Approved Sanction Baseline';
    else if (isForecast) labelType = 'Projected Commissioning Milestone';
    
    return {
      name: `${pt.report_month?.slice(0, 4)} '${String(pt.report_year).slice(-2)}`,
      fullDate: `${pt.report_month} ${pt.report_year}`,
      labelType,
      physicalProgress: pt.physical_progress !== null && !isNaN(pt.physical_progress) ? Number(pt.physical_progress) : 0,
      physicalVelocity: pt.physical_progress_velocity !== null && !isNaN(pt.physical_progress_velocity) ? Number(pt.physical_progress_velocity) : 0,
      cumulativeExpenditure: pt.cumulative_expenditure !== null && !isNaN(pt.cumulative_expenditure) ? Number(pt.cumulative_expenditure) : 0,
      financialBurnRate: pt.financial_burn_rate !== null && !isNaN(pt.financial_burn_rate) ? Number(pt.financial_burn_rate) : 0,
      slippageRatio: pt.slippage_ratio !== null && !isNaN(pt.slippage_ratio) ? Number(pt.slippage_ratio) : 1.0,
      riskScore: pt.risk_score !== null && !isNaN(pt.risk_score) ? Number(pt.risk_score) : 20
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0]?.payload;
      if (!d) return null;

      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700 min-w-[240px]">
          <div className="flex justify-between items-center border-b border-slate-700 pb-1 mb-2">
            <span className="font-bold text-sm text-blue-300">{d.fullDate}</span>
            <span className="text-[10px] uppercase font-semibold bg-blue-900/80 text-blue-200 px-1.5 py-0.5 rounded">
              {d.labelType}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-emerald-400">
              <span>Physical Progress:</span>
              <strong>{d.physicalProgress !== null ? `${d.physicalProgress.toFixed(1)}%` : '0.0%'}</strong>
            </div>
            <div className="flex justify-between items-center text-emerald-300 text-[11px]">
              <span>Monthly Progress Rate:</span>
              <span>{d.physicalVelocity ? `+${d.physicalVelocity.toFixed(2)}%/mo` : '0.00%/mo'}</span>
            </div>
            <div className="flex justify-between items-center text-amber-400 pt-1 border-t border-slate-800">
              <span>Cumulative Expenditure:</span>
              <strong>₹{d.cumulativeExpenditure !== null ? d.cumulativeExpenditure.toLocaleString() : 0} Cr</strong>
            </div>
            <div className="flex justify-between items-center text-amber-300 text-[11px]">
              <span>Monthly Burn Rate:</span>
              <span>₹{d.financialBurnRate ? d.financialBurnRate.toFixed(1) : '0.0'} Cr</span>
            </div>
            <div className="flex justify-between items-center text-purple-300 pt-1 border-t border-slate-800">
              <span>Slippage Ratio:</span>
              <strong>{d.slippageRatio ? `${d.slippageRatio.toFixed(2)}x` : '1.00x'}</strong>
            </div>
            <div className="flex justify-between items-center text-rose-400">
              <span>Point Risk Score:</span>
              <strong>{d.riskScore ? `${d.riskScore.toFixed(0)}/100` : '20/100'}</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="physGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16803C" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#16803C" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D97706" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748B' }}
            tickLine={false}
            axisLine={{ stroke: '#CBD5E1' }}
          />
          {/* Left Y Axis: Physical Progress % */}
          <YAxis
            yAxisId="left"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#16803C' }}
            tickFormatter={(v) => `${v}%`}
            axisLine={{ stroke: '#CBD5E1' }}
            tickLine={false}
          />
          {/* Right Y Axis: Cumulative Expenditure in Cr */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: '#D97706' }}
            tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
            axisLine={{ stroke: '#CBD5E1' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => <span className="text-xs text-slate-700 font-semibold">{value}</span>}
          />

          {/* Area Fills for rich visual depth */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="physicalProgress"
            fill="url(#physGrad)"
            stroke="none"
          />

          {/* Physical Progress Line (Left Axis) */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="physicalProgress"
            name="Physical Progress (%)"
            stroke="#16803C"
            strokeWidth={3}
            dot={{ r: 4.5, fill: '#16803C', strokeWidth: 1.5, stroke: '#FFFFFF' }}
            activeDot={{ r: 7 }}
          />

          {/* Cumulative Expenditure Line (Right Axis) */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulativeExpenditure"
            name="Cumulative Expenditure (₹ Cr)"
            stroke="#D97706"
            strokeWidth={2.5}
            strokeDasharray="4 3"
            dot={{ r: 4, fill: '#D97706', strokeWidth: 1.5, stroke: '#FFFFFF' }}
            activeDot={{ r: 7 }}
          />

          {/* Monthly Burn Bars (Right Axis) */}
          <Bar
            yAxisId="right"
            dataKey="financialBurnRate"
            name="MoM Burn (₹ Cr)"
            fill="#FDE68A"
            opacity={0.65}
            barSize={18}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
