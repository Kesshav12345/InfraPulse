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
    critical: 'border-t-3 border-t-[#DC2626] border-l-4 border-l-[#DC2626] bg-gradient-to-b from-[#FEF2F2] to-white',
    high: 'border-t-3 border-t-[#F7941D] border-l-4 border-l-[#F7941D] bg-gradient-to-b from-[#FEF8F0] to-white',
    moderate: 'border-t-3 border-t-[#D97706] border-l-4 border-l-[#D97706] bg-gradient-to-b from-[#FFFDF5] to-white',
    success: 'border-t-3 border-t-[#059669] border-l-4 border-l-[#059669] bg-gradient-to-b from-[#F0FDF4] to-white'
  }[alertLevel] || (highlight ? 'border-t-3 border-t-[#13A8E0] border-l-4 border-l-[#13A8E0] bg-gradient-to-b from-[#F0F8FE] to-white' : 'border-t-3 border-t-[#102A72] bg-gradient-to-b from-[#F6FAFD] to-white hover:border-t-[#13A8E0]');

  const iconBg = {
    critical: 'bg-red-100/90 text-red-700 border border-red-200',
    high: 'bg-orange-100/90 text-[#F7941D] border border-orange-200',
    moderate: 'bg-amber-100/90 text-amber-700 border border-amber-200',
    success: 'bg-emerald-100/90 text-emerald-700 border border-emerald-200'
  }[alertLevel] || (highlight ? 'bg-[#E3F2FD] text-[#102A72] border border-[#BDE0FA]' : 'bg-[#E8F2FA] text-[#102A72] border border-[#CDE2F5]');

  return (
    <div className={`gov-card p-4 sm:p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 ${alertStyles}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">{title}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${iconBg}`}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="my-2.5">
        <div className="text-2xl sm:text-[26px] font-black text-[#10213D] font-mono tracking-tight">
          {value}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E5EFF8]">
        <span className="truncate pr-1 font-medium">{subtitle}</span>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold shrink-0 ${
              trend === 'up'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : trend === 'down'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {trend === 'up' && <ArrowUpRight size={12} />}
            {trend === 'down' && <ArrowDownRight size={12} />}
            {trend === 'neutral' && <Minus size={12} />}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}
