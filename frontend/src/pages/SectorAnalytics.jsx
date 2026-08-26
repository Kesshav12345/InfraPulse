import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Coins,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  FolderKanban
} from 'lucide-react';
import { api } from '../services/api';
import SectorComparisonChart from '../components/charts/SectorComparisonChart';
import RiskBadge from '../components/common/RiskBadge';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingStates';

export default function SectorAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [sectorDetail, setSectorDetail] = useState(null);

  const loadSectors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSectors();
      setSectors(data || []);
      if (data && data.length > 0) {
        setSelectedSector(data[0].sector);
      }
    } catch (err) {
      setError(err.message || 'Failed to load sector analytics.');
    } finally {
      setLoading(false);
    }
  };

  const loadSectorDetail = async (secName) => {
    if (!secName) return;
    try {
      const data = await api.getSectorDetail(secName);
      setSectorDetail(data);
    } catch (err) {
      console.error('Error fetching sector detail:', err);
    }
  };

  useEffect(() => {
    loadSectors();
  }, []);

  useEffect(() => {
    if (selectedSector) {
      loadSectorDetail(selectedSector);
    }
  }, [selectedSector]);

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
        <ErrorState title="Sector Analytics Error" message={error} onRetry={loadSectors} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon size={20} className="text-blue-800" />
            <h1 className="text-xl font-black text-[#002B50] tracking-tight uppercase">
              Sectoral Infrastructure Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative performance, cost escalation profiles, and risk concentrations across infrastructure sectors
          </p>
        </div>

        <button
          onClick={loadSectors}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium inline-flex items-center gap-1.5 transition"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Sector Comparison Bar Chart */}
      <div className="gov-card p-5">
        <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center">
          <h2 className="font-bold text-sm text-slate-800">Cross-Sector Cost Escalation & Physical Execution</h2>
          <span className="text-[11px] text-slate-500">Longitudinal Aggregate</span>
        </div>
        <SectorComparisonChart sectors={sectors} />
      </div>

      {/* Sector Summary Cards & Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sector List (5 cols) */}
        <div className="lg:col-span-5 gov-card p-4 space-y-2">
          <div className="gov-card-header -mx-4 -mt-4 mb-2 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Infrastructure Sectors ({sectors.length})</h3>
            <span className="text-[10px] text-slate-400">Select to Inspect</span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {sectors.map((s) => {
              const isSelected = selectedSector === s.sector;
              return (
                <div
                  key={s.sector}
                  onClick={() => setSelectedSector(s.sector)}
                  className={`p-3 rounded-lg border cursor-pointer transition flex justify-between items-center text-xs ${
                    isSelected
                      ? 'bg-blue-50 border-blue-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{s.sector}</h4>
                    <div className="text-[11px] text-slate-500">
                      {s.project_count.toLocaleString()} projects | Total: ₹{s.revised_cost_cr.toLocaleString()} Cr
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-700 block">
                      +{s.cost_escalation_pct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Avg Prog: {s.avg_physical_progress.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Sector Deep Dive (7 cols) */}
        <div className="lg:col-span-7 gov-card p-5 flex flex-col justify-between">
          <div>
            <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800">
                {selectedSector} — Sector Intelligence
              </h3>
              <button
                onClick={() => navigate(`/projects?sector=${encodeURIComponent(selectedSector)}`)}
                className="text-xs text-blue-700 hover:underline font-semibold inline-flex items-center gap-1"
              >
                View in Directory <ArrowRight size={13} />
              </button>
            </div>

            {sectorDetail ? (
              <div className="space-y-4">
                {/* Sector KPIs */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Projects</span>
                    <strong className="text-lg font-mono text-slate-900">{sectorDetail.sector_summary?.project_count}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Revised Cost</span>
                    <strong className="text-lg font-mono text-slate-900">₹{sectorDetail.sector_summary?.revised_cost_cr?.toLocaleString()} Cr</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Avg Escalation</span>
                    <strong className="text-lg font-mono text-amber-700">+{sectorDetail.sector_summary?.cost_escalation_pct?.toFixed(1)}%</strong>
                  </div>
                </div>

                {/* Top Critical Projects in Sector */}
                <div>
                  <h4 className="font-bold text-xs text-slate-800 mb-2">Top Focal Projects in {selectedSector}:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-2.5">Project</th>
                          <th className="py-2 px-2.5">State</th>
                          <th className="py-2 px-2.5 text-right">Cost (Cr)</th>
                          <th className="py-2 px-2.5 text-center">Progress</th>
                          <th className="py-2 px-2.5 text-center">Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {sectorDetail.top_risk_projects?.map((p) => (
                          <tr
                            key={p.Project_Code}
                            onClick={() => navigate(`/project/${encodeURIComponent(p.Project_Code)}`)}
                            className="hover:bg-blue-50/50 cursor-pointer"
                          >
                            <td className="py-2 px-2.5 max-w-[200px] truncate font-bold text-slate-900" title={p.Project_Name}>
                              {p.Project_Name}
                            </td>
                            <td className="py-2 px-2.5 text-slate-600">{p.State}</td>
                            <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                              ₹{p.Revised_Cost?.toLocaleString() || 0}
                            </td>
                            <td className="py-2 px-2.5 text-center font-mono">
                              {p.Physical_Progress?.toFixed(1) || 0}%
                            </td>
                            <td className="py-2 px-2.5 text-center">
                              <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">Loading sector intelligence...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
