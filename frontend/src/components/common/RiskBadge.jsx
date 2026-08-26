import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ level = 'LOW', score = null, size = 'md' }) {
  const normLevel = (level || 'LOW').toUpperCase();

  const config = {
    CRITICAL: {
      bg: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-600',
      icon: ShieldAlert,
      label: 'CRITICAL'
    },
    HIGH: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-600',
      icon: AlertTriangle,
      label: 'HIGH'
    },
    MODERATE: {
      bg: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      dot: 'bg-yellow-500',
      icon: AlertCircle,
      label: 'MODERATE'
    },
    LOW: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-600',
      icon: CheckCircle,
      label: 'LOW'
    }
  }[normLevel] || {
    bg: 'bg-gray-50 text-gray-700 border-gray-200',
    dot: 'bg-gray-500',
    icon: AlertCircle,
    label: normLevel
  };

  const IconComp = config.icon;
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold border rounded-full ${
        isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } ${config.bg}`}
      title={`Risk Category: ${config.label}${score !== null ? ` (Score: ${score})` : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <IconComp size={isSmall ? 11 : 13} />
      <span>{config.label}</span>
      {score !== null && (
        <span className="font-mono text-[11px] opacity-90 pl-0.5">({Math.round(score)})</span>
      )}
    </span>
  );
}
