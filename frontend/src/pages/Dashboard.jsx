import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Coins,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import MetricCard from '../components/common/MetricCard';
import RiskBadge from '../components/common/RiskBadge';
import PortfolioRiskDonut from '../components/charts/PortfolioRiskDonut';
import IndiaRiskMap from '../components/charts/IndiaRiskMap';
import SectorComparisonChart from '../components/charts/SectorComparisonChart';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingStates';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [stateRisks, setStateRisks] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [criticalProjects, setCriticalProjects] = useState([]);
  const [selectedState, setSelectedState] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [kpiData, stateData, sectorData, projData] = await Promise.all([
        api.getDashboardSummary(),
        api.getStateRisks(),
        api.getSectors(),
        api.getProjects({ risk_level: 'CRITICAL', page_size: 6, sort_by: 'risk_score', sort_order: 'desc' })
      ]);
      setKpis(kpiData);
      setStateRisks(stateData || []);
      setSectors(sectorData || []);
      setCriticalProjects(projData?.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton count={3} height="h-28" />
        <LoadingSkeleton count={2} height="h-72" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="Dashboard Connection Error" message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  const riskDistribution = {
    LOW: kpis?.low_risk_count || 0,
    MODERATE: kpis?.moderate_risk_count || 0,
    HIGH: kpis?.high_risk_count || 0,
    CRITICAL: kpis?.critical_risk_count || 0
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-[#002B50] tracking-tight uppercase">
            Infrastructure Project Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Predictive decision-support monitoring of Central Sector Infrastructure Projects (₹150 Cr & Above)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => navigate('/early-warnings')}
            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded font-medium inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <ShieldAlert size={14} />
            Early Warning Center ({kpis?.projects_requiring_attention || 0})
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded font-medium inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <FolderKanban size={14} />
            Project Directory
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Projects Monitored"
          value={kpis?.total_projects_monitored?.toLocaleString() || '0'}
          subtitle={`Across ${kpis?.active_sectors_count || 0} Sectors / ${kpis?.active_states_count || 0} States`}
          icon={FolderKanban}
        />
        <MetricCard
          title="Approved Cost"
          value={`₹${(kpis?.total_original_cost_cr || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr`}
          subtitle="Original sanction cost baseline"
          icon={Coins}
        />
        <MetricCard
          title="Revised Cost"
          value={`₹${(kpis?.total_revised_cost_cr || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr`}
          subtitle={`Overall Growth: +${(kpis?.overall_cost_escalation_pct || 0).toFixed(1)}%`}
          icon={CreditCard}
          trend={kpis?.overall_cost_escalation_pct > 15 ? 'up' : 'neutral'}
          trendValue={`+${(kpis?.overall_cost_escalation_pct || 0).toFixed(1)}%`}
        />
        <MetricCard
          title="Cumulative Expenditure"
          value={`₹${(kpis?.total_cumulative_expenditure_cr || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr`}
          subtitle={`${(((kpis?.total_cumulative_expenditure_cr || 0) / (kpis?.total_revised_cost_cr || 1)) * 100).toFixed(1)}% of Revised Cost`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Requiring Attention"
          value={kpis?.projects_requiring_attention?.toLocaleString() || '0'}
          subtitle={`${kpis?.critical_risk_count || 0} Critical / ${kpis?.high_risk_count || 0} High Risk`}
          icon={AlertTriangle}
          alertLevel="critical"
          highlight={true}
        />
      </div>

      {/* Main Analytical Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Donut (4 cols) */}
        <div className="lg:col-span-4 gov-card p-5 flex flex-col justify-between">
          <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center">
            <h2 className="font-bold text-sm text-slate-800">Portfolio Risk Distribution</h2>
            <span className="text-[11px] text-slate-500">Heuristic-v1.0</span>
          </div>
          <PortfolioRiskDonut distribution={riskDistribution} />
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
            <div className="p-2 bg-red-50/60 rounded border border-red-200">
              <span className="text-red-700 font-semibold block text-[11px]">Critical Risk</span>
              <strong className="text-slate-900 text-sm">{kpis?.critical_risk_count || 0}</strong> projects
            </div>
            <div className="p-2 bg-amber-50/60 rounded border border-amber-200">
              <span className="text-amber-700 font-semibold block text-[11px]">High Risk</span>
              <strong className="text-slate-900 text-sm">{kpis?.high_risk_count || 0}</strong> projects
            </div>
          </div>
        </div>

        {/* India Infrastructure Risk Map (8 cols) */}
        <div className="lg:col-span-8 gov-card p-5 flex flex-col justify-between">
          <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-sm text-slate-800">India Infrastructure Risk & Density Map</h2>
              {selectedState && (
                <span className="bg-blue-100 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded">
                  Filtered: {selectedState}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">Spatial Ingestion</span>
          </div>
          <IndiaRiskMap
            stateSummaries={stateRisks}
            selectedState={selectedState}
            onSelectState={(st) => {
              setSelectedState(st);
              if (st) navigate(`/projects?state=${encodeURIComponent(st)}`);
            }}
          />
        </div>
      </div>

      {/* Projects Requiring Attention & Sector Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Critical Projects Attention Table (7 cols) */}
        <div className="lg:col-span-7 gov-card p-5">
          <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ShieldAlert size={16} className="text-red-600" />
              <h2 className="font-bold text-sm text-slate-800">Projects Requiring Immediate Attention</h2>
            </div>
            <button
              onClick={() => navigate('/early-warnings')}
              className="text-xs text-blue-700 hover:underline font-semibold inline-flex items-center gap-1"
            >
              View All Alerts <ArrowRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Sector / State</th>
                  <th className="py-2.5 px-3 text-right">Revised Cost</th>
                  <th className="py-2.5 px-3 text-center">Progress</th>
                  <th className="py-2.5 px-3 text-center">Risk</th>
                  <th className="py-2.5 px-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {criticalProjects.map((p) => (
                  <tr
                    key={p.project_code}
                    onClick={() => navigate(`/project/${encodeURIComponent(p.project_code)}`)}
                    className="hover:bg-blue-50/50 cursor-pointer transition"
                  >
                    <td className="py-2.5 px-3 max-w-[200px]">
                      <div className="font-bold text-slate-900 truncate" title={p.project_name}>
                        {p.project_name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Code: {p.project_code}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div className="truncate max-w-[130px] font-medium">{p.sector}</div>
                      <div className="text-[10px] text-slate-500">{p.state}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{p.revised_cost?.toLocaleString() || 0} Cr
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <div className="font-semibold text-slate-800">{p.physical_progress?.toFixed(1) || 0}%</div>
                      <div className="text-[10px] text-slate-500">
                        {p.physical_progress_velocity ? `+${p.physical_progress_velocity.toFixed(1)}%/mo` : '0%/mo'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
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

        {/* Sector Analytics Summary (5 cols) */}
        <div className="lg:col-span-5 gov-card p-5 flex flex-col justify-between">
          <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center">
            <h2 className="font-bold text-sm text-slate-800">Sector Performance & Cost Escalation</h2>
            <button
              onClick={() => navigate('/sectors')}
              className="text-xs text-blue-700 hover:underline font-semibold inline-flex items-center gap-1"
            >
              Full Analytics <ArrowRight size={13} />
            </button>
          </div>
          <SectorComparisonChart sectors={sectors} />
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
            <span>Aggregated across {sectors.length} national sectors</span>
            <span className="font-semibold text-slate-800">Longitudinal Baseline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
