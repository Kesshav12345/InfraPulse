import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function ConfidenceBadge({ confidence = 'High', tooltip = '' }) {
  const norm = (confidence || 'Moderate').toLowerCase();

  const styles = {
    high: 'bg-blue-50 text-blue-700 border-blue-200',
    moderate: 'bg-slate-100 text-slate-700 border-slate-300',
    low: 'bg-orange-50 text-orange-700 border-orange-200',
    'very low': 'bg-red-50 text-red-700 border-red-200'
  }[norm] || 'bg-gray-100 text-gray-700 border-gray-200';

  const defaultTooltip = {
    high: 'High confidence based on ≥4 consecutive longitudinal monthly observations.',
    moderate: 'Moderate confidence based on 3 longitudinal reporting periods.',
    low: 'Low confidence based on 2 monthly observations.',
    'very low': 'Very low confidence based on a single baseline observation.'
  }[norm] || 'Confidence level derived from data completeness.';

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${styles}`}
      title={tooltip || defaultTooltip}
    >
      <span>Confidence: <strong>{confidence}</strong></span>
      <HelpCircle size={11} className="opacity-60 cursor-help" />
    </span>
  );
}
