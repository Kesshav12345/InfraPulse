import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  PieChart,
  TrendingUp,
  Server
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/projects', label: 'Project Intelligence', icon: FolderKanban },
  { path: '/early-warnings', label: 'Early Warning Center', icon: AlertTriangle },
  { path: '/predictive-analytics', label: 'Predictive Models', icon: TrendingUp },
  { path: '/sectors', label: 'Sector Analytics', icon: PieChart },
  { path: '/system-ops', label: 'System Ops & Methodology', icon: Server },
];

export default function Sidebar({ warningCount = 0 }) {
  return (
    <nav className="w-full bg-[#102A72] text-white border-b-2 border-b-[#13A8E0] shadow-sm select-none px-6 py-0 flex flex-wrap items-center justify-between">
      {/* Horizontal Nav Links */}
      <div className="flex items-center space-x-1 overflow-x-auto py-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3.5 py-2 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                  isActive
                    ? 'bg-[#13A8E0] text-white shadow-xs font-bold'
                    : 'text-white/90 hover:bg-[#1C3E96] hover:text-white'
                }`
              }
            >
              <Icon size={15} className="opacity-95 shrink-0" />
              <span>{item.label}</span>
              {item.path === '/early-warnings' && warningCount > 0 && (
                <span className="bg-[#F7941D] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full ml-1 shadow-xs">
                  {warningCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
