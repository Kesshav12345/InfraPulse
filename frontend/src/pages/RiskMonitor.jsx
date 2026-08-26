import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import PortfolioRiskDonut from '../components/charts/PortfolioRiskDonut';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingStates';

export default function RiskMonitor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [riskSummary, setRiskSummary] = useState(null);
  const [riskTrends, setRiskTrends] = useState({ rising_risk_projects: [], falling_risk_projects: [], high_slippage_projects: [] });
  const [activeTab, setActiveTab] = useState('rising'); // 'rising', 'falling', 'slippage'

  const loadRiskData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumData, trendData] = await Promise.all([
        api.getRiskSummary(),
        api.getRiskTrends()
      ]);
      setRiskSummary(sumData);
      setRiskTrends(trendData);
    } catch (err) {
      setError(err.message || 'Failed to load Risk Monitor data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiskData();
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
        <ErrorState title="Risk Monitor Error" message={error} onRetry={loadRiskData} />
      </div>
    );
  }

  const currentList = activeTab === 'rising'
    ? riskTrends.rising_risk_projects
    : (activeTab === 'falling' ? riskTrends.falling_risk_projects : riskTrends.high_slippage_projects);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-red-700" />
            <h1 className="text-xl font-black text-[#002B50] tracking-tight uppercase">
              Portfolio Risk & Trajectory Monitor
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic surveillance of project risk movements, deteriorating trajectories, and threshold breaches
          </p>
        </div>

        <button
          onClick={loadRiskData}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium inline-flex items-center gap-1.5 transition"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="gov-card p-4 border-l-4 border-l-red-600 bg-red-50/20">
          <span className="text-xs font-bold text-red-800 uppercase block">Critical Risk Projects</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {riskSummary?.distribution?.CRITICAL?.toLocaleString() || 0}
          </div>
          <span className="text-[11px] text-slate-500">Score 75–100 (Immediate Attention)</span>
        </div>

        <div className="gov-card p-4 border-l-4 border-l-amber-500 bg-amber-50/20">
          <span className="text-xs font-bold text-amber-800 uppercase block">High Risk Projects</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {riskSummary?.distribution?.HIGH?.toLocaleString() || 0}
          </div>
          <span className="text-[11px] text-slate-500">Score 50–74 (Surveillance List)</span>
        </div>

        <div className="gov-card p-4 border-l-4 border-l-yellow-500 bg-yellow-50/20">
          <span className="text-xs font-bold text-yellow-800 uppercase block">Moderate Risk Projects</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {riskSummary?.distribution?.MODERATE?.toLocaleString() || 0}
          </div>
          <span className="text-[11px] text-slate-500">Score 25–49 (Acceptable Variance)</span>
        </div>

        <div className="gov-card p-4 border-l-4 border-l-emerald-600 bg-emerald-50/20">
          <span className="text-xs font-bold text-emerald-800 uppercase block">Low Risk Projects</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {riskSummary?.distribution?.LOW?.toLocaleString() || 0}
          </div>
          <span className="text-[11px] text-slate-500">Score 0–24 (On-Track Baseline)</span>
        </div>
      </div>

      {/* Trajectory Movement Tabs & Table */}
      <div className="gov-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
          <div className="flex space-x-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('rising')}
              className={`px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 transition ${
                activeTab === 'rising'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingUp size={14} /> Rising Risk Trajectory (↗)
            </button>
            <button
              onClick={() => setActiveTab('falling')}
              className={`px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 transition ${
                activeTab === 'falling'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingDown size={14} /> Improving Trajectory (↘)
            </button>
            <button
              onClick={() => setActiveTab('slippage')}
              className={`px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 transition ${
                activeTab === 'slippage'
                  ? 'bg-blue-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle size={14} /> High Slippage Ratio (&gt;1.8x)
            </button>
          </div>

          <span className="text-xs text-slate-500">
            Showing top {currentList.length} focal projects
          </span>
        </div>

        {/* Dynamic Project Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3">Project Code & Name</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3 text-right">Revised Cost</th>
                <th className="py-2.5 px-3 text-center">Progress %</th>
                <th className="py-2.5 px-3 text-center">Slippage Ratio</th>
                <th className="py-2.5 px-3 text-center">Risk Score</th>
                <th className="py-2.5 px-3 text-center">Trend Movement</th>
                <th className="py-2.5 px-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentList.map((p) => (
                <tr
                  key={p.Project_Code}
                  onClick={() => navigate(`/project/${encodeURIComponent(p.Project_Code)}`)}
                  className="hover:bg-blue-50/50 cursor-pointer transition"
                >
                  <td className="py-2.5 px-3 max-w-[280px]">
                    <div className="font-bold text-slate-900 truncate" title={p.Project_Name}>
                      {p.Project_Name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">Code: {p.Project_Code}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{p.Sector}</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.State}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    ₹{p.Revised_Cost?.toLocaleString() || 0} Cr
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    <div className="font-semibold text-slate-800">{p.Physical_Progress?.toFixed(1) || 0}%</div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    <span className={p.slippage_ratio > 1.8 ? 'text-red-700 font-bold' : 'text-slate-700'}>
                      {p.slippage_ratio ? `${p.slippage_ratio.toFixed(2)}x` : '-'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold">
                    {p.risk_trend === 'UP' && (
                      <span className="text-red-600 inline-flex items-center gap-0.5">
                        <TrendingUp size={13} /> +Delta
                      </span>
                    )}
                    {p.risk_trend === 'DOWN' && (
                      <span className="text-emerald-600 inline-flex items-center gap-0.5">
                        <TrendingDown size={13} /> -Delta
                      </span>
                    )}
                    {(!p.risk_trend || p.risk_trend === 'STABLE') && (
                      <span className="text-slate-400">Stable</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <ChevronRight size={16} className="text-slate-400" />
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
