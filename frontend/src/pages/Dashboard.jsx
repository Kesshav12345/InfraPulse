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
import HeroSlideshow from '../components/common/HeroSlideshow';
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
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-[#C8DAEB]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#10213D] tracking-tight uppercase">
            Infrastructure Project Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] font-medium mt-0.5">
            Predictive decision-support monitoring of Central Sector Infrastructure Projects (₹150 Cr & Above)
          </p>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          <button
            onClick={() => navigate('/early-warnings')}
            className="px-3.5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-semibold inline-flex items-center gap-1.5 shadow-xs hover:shadow transition"
          >
            <ShieldAlert size={15} />
            Early Warning Center ({kpis?.projects_requiring_attention || 0})
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="px-3.5 py-2 bg-[#102A72] hover:bg-[#0E235C] text-white rounded-lg font-semibold inline-flex items-center gap-1.5 shadow-xs hover:shadow transition border-b-2 border-b-[#13A8E0]"
          >
            <FolderKanban size={15} />
            Project Directory
          </button>
        </div>
      </div>

      {/* Hero Slideshow Banner */}
      <HeroSlideshow />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4.5">
        <MetricCard
          title="Projects Monitored"
          value={kpis?.total_projects_monitored?.toLocaleString() || '0'}
          subtitle={`Across ${kpis?.active_sectors_count || 0} Sectors / ${kpis?.active_states_count || 0} States`}
          icon={FolderKanban}
        />
        <MetricCard
          title="Approved Cost"
          value={`₹${(kpis?.total_original_cost_cr || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr`}
          subtitle="Original sanction baseline"
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
          <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center bg-gradient-to-r from-[#EEF5FB] to-[#E4EFF9] border-b border-[#CFE1F2]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#13A8E0] rounded-full inline-block" />
              <h2 className="font-bold text-sm text-[#10213D] tracking-tight">Portfolio Risk Distribution</h2>
            </div>
            <span className="text-[11px] text-[#475569] font-mono font-medium">Heuristic-v1.0</span>
          </div>
          <div className="bg-[#F5F9FD] p-2.5 rounded-xl border border-[#D5E5F2] my-1">
            <PortfolioRiskDonut distribution={riskDistribution} />
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-[#E2EDF7] text-xs">
            <div className="p-2.5 bg-[#FEF2F2] rounded-lg border border-red-200 border-l-4 border-l-[#DC2626]">
              <span className="text-red-800 font-bold block text-[10.5px] uppercase tracking-wider">Critical Risk</span>
              <strong className="text-[#10213D] text-base font-mono mt-0.5 block">{kpis?.critical_risk_count || 0} <span className="text-xs font-normal text-slate-500">projects</span></strong>
            </div>
            <div className="p-2.5 bg-[#FEF8F0] rounded-lg border border-orange-200 border-l-4 border-l-[#F7941D]">
              <span className="text-[#9A4C00] font-bold block text-[10.5px] uppercase tracking-wider">High Risk</span>
              <strong className="text-[#10213D] text-base font-mono mt-0.5 block">{kpis?.high_risk_count || 0} <span className="text-xs font-normal text-slate-500">projects</span></strong>
            </div>
          </div>
        </div>

        {/* India Infrastructure Risk Map (8 cols) */}
        <div className="lg:col-span-8 gov-card p-5 flex flex-col justify-between">
          <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center bg-gradient-to-r from-[#EEF5FB] to-[#E4EFF9] border-b border-[#CFE1F2]">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-4 bg-[#13A8E0] rounded-full inline-block" />
              <h2 className="font-bold text-sm text-[#10213D] tracking-tight">India Infrastructure Risk & Density Map</h2>
              {selectedState && (
                <span className="bg-[#E0F2FE] text-[#102A72] border border-[#BAE6FD] text-[11px] font-bold px-2.5 py-0.5 rounded-full ml-1">
                  Filtered: {selectedState}
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#475569] font-mono font-medium">Spatial Ingestion</span>
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
        <div className="lg:col-span-7 gov-card p-5 border-t-3 border-t-[#DC2626]">
          <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center bg-gradient-to-r from-[#EEF5FB] to-[#E4EFF9] border-b border-[#CFE1F2]">
            <div className="flex items-center space-x-2">
              <ShieldAlert size={17} className="text-[#DC2626]" />
              <h2 className="font-bold text-sm text-[#10213D] tracking-tight">Projects Requiring Immediate Attention</h2>
            </div>
            <button
              onClick={() => navigate('/early-warnings')}
              className="text-xs text-[#102A72] hover:text-[#13A8E0] font-bold inline-flex items-center gap-1 transition-colors"
            >
              View All Alerts <ArrowRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#C8DAEB]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E2EDF7] text-[#10213D] font-bold uppercase text-[10.5px] tracking-wider border-b border-[#C8DAEB]">
                <tr>
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Sector / State</th>
                  <th className="py-2.5 px-3 text-right">Revised Cost</th>
                  <th className="py-2.5 px-3 text-center">Progress</th>
                  <th className="py-2.5 px-3 text-center">Risk</th>
                  <th className="py-2.5 px-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EEF8]">
                {criticalProjects.map((p, idx) => (
                  <tr
                    key={p.project_code}
                    onClick={() => navigate(`/project/${encodeURIComponent(p.project_code)}`)}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FCFE]'} hover:bg-[#EBF4FC] cursor-pointer transition duration-150 group`}
                  >
                    <td className="py-2.5 px-3 max-w-[200px]">
                      <div className="font-bold text-[#10213D] truncate group-hover:text-[#13A8E0] transition-colors" title={p.project_name}>
                        {p.project_name}
                      </div>
                      <div className="text-[10px] text-[#64748B] font-mono mt-0.5">Code: {p.project_code}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#334155]">
                      <div className="truncate max-w-[130px] font-semibold text-[#10213D]">{p.sector}</div>
                      <div className="text-[10px] text-[#64748B] mt-0.5">{p.state}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#10213D]">
                      ₹{p.revised_cost?.toLocaleString() || 0} Cr
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <div className="font-bold text-[#10213D]">{p.physical_progress?.toFixed(1) || 0}%</div>
                      <div className="text-[10px] text-[#64748B] mt-0.5">
                        {p.physical_progress_velocity ? `+${p.physical_progress_velocity.toFixed(1)}%/mo` : '0%/mo'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-[#13A8E0] group-hover:translate-x-0.5 transition-all" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sector Analytics Summary (5 cols) */}
        <div className="lg:col-span-5 gov-card p-5 flex flex-col justify-between">
          <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center bg-gradient-to-r from-[#EEF5FB] to-[#E4EFF9] border-b border-[#CFE1F2]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#13A8E0] rounded-full inline-block" />
              <h2 className="font-bold text-sm text-[#10213D] tracking-tight">Sector Performance & Cost Escalation</h2>
            </div>
            <button
              onClick={() => navigate('/sectors')}
              className="text-xs text-[#102A72] hover:text-[#13A8E0] font-bold inline-flex items-center gap-1 transition-colors"
            >
              Full Analytics <ArrowRight size={13} />
            </button>
          </div>
          <div className="bg-[#F5F9FD] p-2.5 rounded-xl border border-[#D5E5F2]">
            <SectorComparisonChart sectors={sectors} />
          </div>
          <div className="pt-3.5 border-t border-[#E2EDF7] text-xs text-[#475569] flex justify-between items-center">
            <span className="font-medium">Aggregated across {sectors.length} national sectors</span>
            <span className="font-bold text-[#10213D] font-mono text-[11px]">Longitudinal Baseline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
