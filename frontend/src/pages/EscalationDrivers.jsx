import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Layers,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingStates';

export default function EscalationDrivers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driversData, setDriversData] = useState(null);
  const [projects, setProjects] = useState([]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [drv, pList] = await Promise.all([
        api.getPortfolioDrivers(),
        api.getProjects({ sort_by: 'cost_escalation', sort_order: 'desc', page_size: 15 })
      ]);
      setDriversData(drv);
      setProjects(pList?.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load escalation drivers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton count={3} height="h-28" />
        <LoadingSkeleton count={2} height="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="Drivers Error" message={error} onRetry={loadDrivers} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-amber-700" />
            <h1 className="text-xl font-black text-[#002B50] tracking-tight uppercase">
              Cost Escalation Drivers & Analytical Associations
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Systemic analysis of potential contributing factors, physical vs financial disconnects, and empirical cost growth patterns
          </p>
        </div>

        <button
          onClick={loadDrivers}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium inline-flex items-center gap-1.5 transition"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Driver Weight Allocation Cards */}
      <div className="gov-card p-5">
        <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center">
          <h2 className="font-bold text-sm text-slate-800">Risk Engine Driver Weight Allocation</h2>
          <span className="text-[11px] text-slate-500">Heuristic-v1.0 Formulation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-red-50/50 rounded border border-red-200">
            <span className="text-[10px] text-red-800 font-bold uppercase block">Cost Escalation</span>
            <strong className="text-xl font-mono text-slate-900 font-black">25%</strong>
            <p className="text-[11px] text-slate-600 mt-1">Growth ratio of revised cost vs original approved sanction.</p>
          </div>

          <div className="p-3 bg-amber-50/50 rounded border border-amber-200">
            <span className="text-[10px] text-amber-800 font-bold uppercase block">Schedule Slippage</span>
            <strong className="text-xl font-mono text-slate-900 font-black">25%</strong>
            <p className="text-[11px] text-slate-600 mt-1">Planned vs revised target date of commissioning gap.</p>
          </div>

          <div className="p-3 bg-blue-50/50 rounded border border-blue-200">
            <span className="text-[10px] text-blue-800 font-bold uppercase block">Physical Velocity</span>
            <strong className="text-xl font-mono text-slate-900 font-black">20%</strong>
            <p className="text-[11px] text-slate-600 mt-1">Declining execution rate and milestone stagnation.</p>
          </div>

          <div className="p-3 bg-purple-50/50 rounded border border-purple-200">
            <span className="text-[10px] text-purple-800 font-bold uppercase block">Burn Disconnect</span>
            <strong className="text-xl font-mono text-slate-900 font-black">20%</strong>
            <p className="text-[11px] text-slate-600 mt-1">Slippage ratio between monthly expenditure and progress.</p>
          </div>

          <div className="p-3 bg-slate-100 rounded border border-slate-300">
            <span className="text-[10px] text-slate-700 font-bold uppercase block">Execution Friction</span>
            <strong className="text-xl font-mono text-slate-900 font-black">10%</strong>
            <p className="text-[11px] text-slate-600 mt-1">Milestone delays and reporting stability factors.</p>
          </div>
        </div>
      </div>

      {/* Projects with Highest Cost Growth & Contributing Associations */}
      <div className="gov-card p-5">
        <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center">
          <h2 className="font-bold text-sm text-slate-800">Top Projects by Cost Growth & Primary Observed Drivers</h2>
          <span className="text-[11px] text-slate-500">Sorted by % Escalation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
              <tr>
                <th className="py-3 px-3">Project & Code</th>
                <th className="py-3 px-3">Sector</th>
                <th className="py-3 px-3 text-right">Original (₹ Cr)</th>
                <th className="py-3 px-3 text-right">Revised (₹ Cr)</th>
                <th className="py-3 px-3 text-right">Cost Growth</th>
                <th className="py-3 px-3">Potential Contributing Factor</th>
                <th className="py-3 px-3 text-center">Slippage</th>
                <th className="py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {projects.map((p) => (
                <tr
                  key={p.project_code}
                  onClick={() => navigate(`/project/${encodeURIComponent(p.project_code)}`)}
                  className="hover:bg-blue-50/50 cursor-pointer transition"
                >
                  <td className="py-2.5 px-3 max-w-[240px]">
                    <div className="font-bold text-slate-900 truncate" title={p.project_name}>
                      {p.project_name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">Code: {p.project_code}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{p.sector}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    ₹{p.original_cost?.toLocaleString() || 0}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    ₹{p.revised_cost?.toLocaleString() || 0}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-red-700">
                    +{(p.cost_escalation_ratio ? p.cost_escalation_ratio * 100 : 0).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {p.slippage_ratio > 1.8
                      ? 'Observed financial acceleration mismatch'
                      : (p.cost_escalation_ratio > 1.0
                      ? 'Major scope revision & prolonged gestation'
                      : 'Extended commissioning timeline')}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                    {p.slippage_ratio ? `${p.slippage_ratio.toFixed(2)}x` : '-'}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <ArrowRight size={14} className="text-slate-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
