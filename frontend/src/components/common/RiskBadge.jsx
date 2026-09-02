import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ level = 'LOW', score = null, size = 'md' }) {
  const normLevel = (level || 'LOW').toUpperCase();

  const config = {
    CRITICAL: {
      bg: 'bg-red-50 text-red-800 border-red-200/90',
      dot: 'bg-red-600',
      icon: ShieldAlert,
      label: 'CRITICAL'
    },
    HIGH: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200/90',
      dot: 'bg-amber-600',
      icon: AlertTriangle,
      label: 'HIGH'
    },
    MODERATE: {
      bg: 'bg-yellow-50 text-yellow-800 border-yellow-200/90',
      dot: 'bg-yellow-600',
      icon: AlertCircle,
      label: 'MODERATE'
    },
    LOW: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
      dot: 'bg-emerald-600',
      icon: CheckCircle,
      label: 'LOW'
    }
  }[normLevel] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    icon: AlertCircle,
    label: normLevel
  };

  const IconComp = config.icon;
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold border rounded-full ${
        isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${config.bg}`}
      title={`Risk Category: ${config.label}${score !== null ? ` (Score: ${score})` : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <IconComp size={isSmall ? 10 : 12} className="shrink-0" />
      <span className="tracking-wide">{config.label}</span>
      {score !== null && (
        <span className="font-mono text-[10px] font-bold opacity-80 pl-0.5">({Math.round(score)})</span>
      )}
    </span>
  );
}
