import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = null, // 'up', 'down', 'neutral'
  trendValue = null,
  highlight = false,
  alertLevel = null // 'critical', 'high', 'moderate', 'success'
}) {
  const alertStyles = {
    critical: 'border-l-4 border-l-red-600',
    high: 'border-l-4 border-l-amber-500',
    moderate: 'border-l-4 border-l-yellow-500',
    success: 'border-l-4 border-l-emerald-600'
  }[alertLevel] || '';

  return (
    <div className={`gov-card p-4 flex flex-col justify-between ${alertStyles} ${highlight ? 'bg-blue-50/40' : ''}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className="p-2 rounded bg-slate-100 text-slate-700">
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="my-2">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{subtitle}</span>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 font-medium ${
              trend === 'up'
                ? 'text-red-600'
                : trend === 'down'
                ? 'text-emerald-600'
                : 'text-slate-500'
            }`}
          >
            {trend === 'up' && <ArrowUpRight size={13} />}
            {trend === 'down' && <ArrowDownRight size={13} />}
            {trend === 'neutral' && <Minus size={13} />}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}
