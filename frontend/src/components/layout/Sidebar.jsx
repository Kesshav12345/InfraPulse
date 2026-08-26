import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  AlertTriangle,
  PieChart,
  TrendingUp,
  Activity,
  Bot,
  BookOpen,
  Database,
  CheckCircle2
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects Explorer', icon: FolderKanban },
  { path: '/risk-monitor', label: 'Risk Monitor', icon: ShieldAlert },
  { path: '/early-warnings', label: 'Early Warnings', icon: AlertTriangle },
  { path: '/sectors', label: 'Sector Analytics', icon: PieChart },
  { path: '/predictive-analytics', label: 'Predictive Analytics', icon: TrendingUp },
  { path: '/drivers', label: 'Escalation Drivers', icon: Activity },
  { path: '/assistant', label: 'Intelligence Assistant', icon: Bot },
  { path: '/methodology', label: 'Methodology', icon: BookOpen },
  { path: '/data-health', label: 'Data Health & Ops', icon: Database },
];

export default function Sidebar({ warningCount = 0 }) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-[calc(100vh-100px)] flex flex-col justify-between border-r border-slate-800 select-none">
      <div className="py-4">
        <div className="px-5 mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation Command
        </div>
        <nav className="space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon size={16} className="opacity-90" />
                  <span>{item.label}</span>
                </div>
                {item.path === '/early-warnings' && warningCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {warningCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-200">System Operational</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          Engine: Heuristic Trajectory v1.0<br/>
          Panel: 21,863 records / 3,842 projects
        </div>
      </div>
    </aside>
  );
}
