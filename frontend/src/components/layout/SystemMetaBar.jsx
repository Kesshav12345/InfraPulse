import React from 'react';
import { Database, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

export default function SystemMetaBar({ kpis = null }) {
  return (
    <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex flex-wrap items-center justify-between text-xs text-slate-600">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-1.5 font-medium">
          <Database size={14} className="text-blue-700" />
          <span>Projects Monitored: <strong className="text-slate-900">{kpis?.total_projects_monitored ? kpis.total_projects_monitored.toLocaleString() : '3,842'}</strong></span>
        </div>
        <div className="flex items-center space-x-1.5 font-medium">
          <AlertTriangle size={14} className="text-amber-600" />
          <span>Requiring Attention: <strong className="text-red-700">{kpis?.projects_requiring_attention ? kpis.projects_requiring_attention.toLocaleString() : '840'}</strong></span>
        </div>
        <div className="flex items-center space-x-1.5 font-medium">
          <ShieldCheck size={14} className="text-emerald-700" />
          <span>Overall Escalation: <strong className="text-slate-900">{kpis?.overall_cost_escalation_pct ? `+${kpis.overall_cost_escalation_pct.toFixed(1)}%` : '+18.4%'}</strong></span>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Cpu size={13} className="text-slate-600" />
          Model: <strong>Trajectory Engine v1.0</strong>
        </span>
        <span>Reporting Month: <strong>{kpis?.latest_report_month_year || 'July 2026'}</strong></span>
      </div>
    </div>
  );
}
