import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  Clock,
  ShieldAlert,
  Download,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import ConfidenceBadge from '../components/common/ConfidenceBadge';
import TrajectoryLineChart from '../components/charts/TrajectoryLineChart';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingStates';

export default function ProjectDetail() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [briefModal, setBriefModal] = useState(null);
  const [generatingBrief, setGeneratingBrief] = useState(false);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProjectDetail(code);
      setDetail(data);
    } catch (err) {
      setError(err.message || `Unable to load Project Intelligence for '${code}'.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) loadProjectData();
  }, [code]);

  const handleGenerateBrief = async () => {
    try {
      setGeneratingBrief(true);
      const brief = await api.getProjectBrief(code);
      setBriefModal(brief);
    } catch (err) {
      alert('Failed to generate brief: ' + err.message);
    } finally {
      setGeneratingBrief(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton count={2} height="h-20" />
        <LoadingSkeleton count={3} height="h-64" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-6">
        <ErrorState
          title="Project Intelligence Unavailable"
          message={error || 'Project record not found.'}
          onRetry={loadProjectData}
        />
      </div>
    );
  }

  const { summary, risk_assessment, cost_prediction, time_prediction, trajectory, administrative_recommendations } = detail;

  return (
    <div className="p-6 space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 transition"
        >
          <ArrowLeft size={14} /> Back to Project Explorer
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleGenerateBrief}
            disabled={generatingBrief}
            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <FileText size={14} />
            {generatingBrief ? 'Generating Brief...' : 'Export Project Brief'}
          </button>
        </div>
      </div>

      {/* Project Header Banner */}
      <div className="gov-card p-6 border-l-4 border-l-blue-900">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Code: {summary.project_code}
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Sector: {summary.sector}
              </span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                State: {summary.state}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {summary.project_name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Ministry: <strong className="text-slate-700">{summary.ministry}</strong> | Latest Flash Report: <strong>{summary.report_month} {summary.report_year}</strong> ({detail.historical_count} Monthly Observations)
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <RiskBadge level={risk_assessment.risk_level} score={risk_assessment.risk_score} size="md" />
            <span className="text-[11px] text-slate-500 font-medium">
              Trajectory: {risk_assessment.risk_trajectory_trend === 'UP' ? '↗ Deteriorating' : (risk_assessment.risk_trajectory_trend === 'DOWN' ? '↘ Improving' : '→ Stable')}
              {risk_assessment.risk_score_delta !== 0 && ` (${risk_assessment.risk_score_delta > 0 ? '+' : ''}${risk_assessment.risk_score_delta} pts)`}
            </span>
          </div>
        </div>

        {/* 6-Column KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-200 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Approved Cost</span>
            <strong className="text-base text-slate-900 font-mono">₹{summary.original_cost?.toLocaleString() || 0} Cr</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Revised Cost</span>
            <strong className="text-base text-slate-900 font-mono">₹{summary.revised_cost?.toLocaleString() || 0} Cr</strong>
            <span className="block text-[10px] text-amber-700 font-semibold">
              +{(summary.cost_escalation_ratio ? summary.cost_escalation_ratio * 100 : 0).toFixed(1)}% Growth
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Cumulative Exp</span>
            <strong className="text-base text-slate-900 font-mono">₹{summary.cumulative_expenditure?.toLocaleString() || 0} Cr</strong>
            <span className="block text-[10px] text-slate-500">
              {(((summary.cumulative_expenditure || 0) / (summary.revised_cost || 1)) * 100).toFixed(1)}% of Revised
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Physical Progress</span>
            <strong className="text-base text-emerald-800 font-mono">{summary.physical_progress?.toFixed(1) || 0}%</strong>
            <span className="block text-[10px] text-emerald-700 font-semibold">
              {summary?.physical_progress_velocity != null && !isNaN(summary.physical_progress_velocity)
                ? `+${summary.physical_progress_velocity.toFixed(2)}%/mo`
                : '0.00%/mo velocity'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Slippage Ratio</span>
            <strong className={`text-base font-mono ${(risk_assessment?.slippage_ratio || 1.0) > 1.8 ? 'text-red-700' : 'text-slate-900'}`}>
              {(risk_assessment?.slippage_ratio != null && !isNaN(risk_assessment.slippage_ratio))
                ? risk_assessment.slippage_ratio.toFixed(2)
                : '1.00'}x
            </strong>
            <span className="block text-[10px] text-slate-500">Burn vs Progress</span>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Target Commissioning</span>
            <strong className="text-base text-slate-900">{summary.revised_doc || summary.original_target_doc || 'N/A'}</strong>
            <span className="block text-[10px] text-slate-500">DoA: {summary.date_of_approval || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Main Trajectory Visualization & Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trajectory Multi-Series Line Chart (8 cols) */}
        <div className="lg:col-span-8 gov-card p-5 flex flex-col justify-between">
          <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-sm text-slate-800">Longitudinal Project Trajectory</h2>
              <p className="text-[11px] text-slate-500">Physical Execution Progress (%) vs Financial Cumulative Expenditure (₹ Cr)</p>
            </div>
            <ConfidenceBadge confidence={risk_assessment.confidence} />
          </div>
          <TrajectoryLineChart trajectory={trajectory} />
        </div>

        {/* Explainable Risk Drivers Breakdown (4 cols) */}
        <div className="lg:col-span-4 gov-card p-5 flex flex-col justify-between">
          <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center">
            <h2 className="font-bold text-sm text-slate-800">Explainable Risk Drivers</h2>
            <span className="text-[11px] text-slate-500">Relative Weight</span>
          </div>

          <div className="space-y-3">
            {risk_assessment.drivers.map((d, i) => (
              <div key={i} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-800 mb-1">
                  <span>{d.driver_name}</span>
                  <span className={d.severity === 'CRITICAL' ? 'text-red-700' : (d.severity === 'HIGH' ? 'text-amber-700' : 'text-slate-600')}>
                    {d.contribution_pct}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full ${
                      d.severity === 'CRITICAL' ? 'bg-red-600' : (d.severity === 'HIGH' ? 'bg-amber-500' : 'bg-blue-600')
                    }`}
                    style={{ width: `${d.contribution_pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">{d.explanation}</p>
              </div>
            ))}
          </div>

          {risk_assessment.alert_tags.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
              {risk_assessment.alert_tags.map((tag, i) => (
                <span key={i} className="bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trajectory Prediction Cards (Cost & Schedule Projections) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Overrun Projection */}
        <div className="gov-card p-5">
          <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-amber-600" />
              <h2 className="font-bold text-sm text-slate-800">Projected Cost Outcome (Trajectory Estimate)</h2>
            </div>
            <ConfidenceBadge confidence={cost_prediction.confidence} />
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center p-3 bg-amber-50/60 rounded border border-amber-200">
              <div>
                <span className="text-[10px] text-amber-800 font-bold uppercase block">Predicted Final Cost</span>
                <strong className="text-xl font-mono text-slate-900 font-black">
                  ₹{cost_prediction.predicted_final_cost.toLocaleString()} Cr
                </strong>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-800 font-bold uppercase block">Potential Escalation</span>
                <span className="text-sm font-mono font-bold text-red-700">
                  +{cost_prediction.predicted_escalation_pct.toFixed(1)}% (₹{cost_prediction.predicted_escalation_cr.toLocaleString()} Cr)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="block text-[10px] text-slate-500 font-semibold uppercase">Conservative Range (Min)</span>
                <strong className="font-mono text-slate-800 font-bold">₹{cost_prediction.prediction_range_min.toLocaleString()} Cr</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="block text-[10px] text-slate-500 font-semibold uppercase">Conservative Range (Max)</span>
                <strong className="font-mono text-slate-800 font-bold">₹{cost_prediction.prediction_range_max.toLocaleString()} Cr</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Estimated based on remaining physical work ({(100 - (summary.physical_progress || 0)).toFixed(1)}%), empirical monthly burn velocity, and approved scope revisions.
            </p>
          </div>
        </div>

        {/* Time Overrun Projection */}
        <div className="gov-card p-5">
          <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-700" />
              <h2 className="font-bold text-sm text-slate-800">Projected Schedule Outcome (Trajectory Estimate)</h2>
            </div>
            <ConfidenceBadge confidence={time_prediction.confidence} />
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center p-3 bg-blue-50/60 rounded border border-blue-200">
              <div>
                <span className="text-[10px] text-blue-800 font-bold uppercase block">Projected Completion</span>
                <strong className="text-xl font-mono text-slate-900 font-black">
                  {time_prediction.predicted_completion_date}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-blue-800 font-bold uppercase block">Projected Delay</span>
                <span className="text-sm font-mono font-bold text-red-700">
                  +{time_prediction.predicted_delay_months.toFixed(0)} Months
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="block text-[10px] text-slate-500 font-semibold uppercase">Rolling Physical Velocity</span>
                <strong className="font-mono text-slate-800 font-bold">
                  {time_prediction?.rolling_velocity_pct_pm != null && !isNaN(time_prediction.rolling_velocity_pct_pm)
                    ? `${time_prediction.rolling_velocity_pct_pm.toFixed(2)}% / month`
                    : 'N/A'}
                </strong>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="block text-[10px] text-slate-500 font-semibold uppercase">Delay Probability</span>
                <strong className="font-mono text-red-700 font-bold">
                  {time_prediction?.delay_probability_pct != null && !isNaN(time_prediction.delay_probability_pct)
                    ? `${time_prediction.delay_probability_pct.toFixed(0)}%`
                    : '20%'}
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Projected by extrapolating the 4-month rolling execution velocity across the remaining physical scope with zero-velocity safeguards.
            </p>
          </div>
        </div>
      </div>

      {/* Administrative Intervention Recommendations & Longitudinal Audit Table */}
      <div className="gov-card p-5">
        <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <h2 className="font-bold text-sm text-slate-800">Areas for Administrative Review & Monthly Observation Log</h2>
          </div>
          <span className="text-[11px] text-slate-500">Decision Support Advisory</span>
        </div>

        {/* Advisory Points */}
        <div className="p-3.5 bg-blue-50/50 rounded border border-blue-200 mb-5">
          <h3 className="font-bold text-xs text-blue-950 mb-2">Recommended Supervisory Actions:</h3>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {administrative_recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-700 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Longitudinal Observations Table */}
        <h3 className="font-bold text-xs text-slate-800 mb-2">Sequential Reporting Snapshots ({trajectory.length} Months):</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
              <tr>
                <th className="py-2 px-3">Reporting Period</th>
                <th className="py-2 px-3 text-right">Physical Progress</th>
                <th className="py-2 px-3 text-right">Monthly Velocity</th>
                <th className="py-2 px-3 text-right">Cumulative Expenditure</th>
                <th className="py-2 px-3 text-right">Monthly Burn</th>
                <th className="py-2 px-3 text-center">Slippage Ratio</th>
                <th className="py-2 px-3 text-center">Point Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {trajectory.slice().reverse().map((pt, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-800">
                    {pt.report_month} {pt.report_year}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    {pt.physical_progress !== null ? `${pt.physical_progress.toFixed(1)}%` : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-700">
                    {pt.physical_progress_velocity !== null ? `+${pt.physical_progress_velocity.toFixed(2)}%` : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-900 font-semibold">
                    {pt.cumulative_expenditure !== null ? `₹${pt.cumulative_expenditure.toLocaleString()} Cr` : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-amber-700">
                    {pt.financial_burn_rate !== null ? `₹${pt.financial_burn_rate.toFixed(1)} Cr` : '-'}
                  </td>
                  <td className="py-2 px-3 text-center font-mono">
                    {pt.slippage_ratio ? `${pt.slippage_ratio.toFixed(2)}x` : '-'}
                  </td>
                  <td className="py-2 px-3 text-center font-mono">
                    {pt.risk_score ? `${pt.risk_score.toFixed(0)}/100` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Brief Modal */}
      {briefModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Government Decision-Support Brief
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{briefModal.project_name}</h3>
                <p className="text-xs text-slate-500 font-mono">Code: {briefModal.project_code} | {briefModal.sector} | {briefModal.state}</p>
              </div>
              <button
                onClick={() => setBriefModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">Executive Summary:</strong>
              {briefModal.executive_summary}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <strong className="block text-slate-800 mb-1">Projected Outcome:</strong>
                <div>Estimated Cost: <strong>₹{briefModal.projected_outcomes?.predicted_final_cost_cr?.toLocaleString()} Cr</strong></div>
                <div>Target Date: <strong>{briefModal.projected_outcomes?.predicted_completion_date}</strong></div>
                <div>Delay: <strong>+{briefModal.projected_outcomes?.predicted_delay_months} months</strong></div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <strong className="block text-slate-800 mb-1">Risk Profile:</strong>
                <div>Score: <strong>{briefModal.risk_profile?.risk_score}/100 ({briefModal.risk_profile?.risk_level})</strong></div>
                <div>Primary Driver: <strong>{briefModal.risk_profile?.primary_driver}</strong></div>
                <div>Confidence: <strong>{briefModal.projected_outcomes?.confidence}</strong></div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded border border-blue-200 text-xs text-blue-950">
              <strong className="block mb-1">Intervention Recommendations:</strong>
              <ul className="list-disc pl-4 space-y-1">
                {briefModal.administrative_intervention_points?.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 text-xs">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded font-semibold inline-flex items-center gap-1.5"
              >
                <Download size={13} /> Print Brief
              </button>
              <button
                onClick={() => setBriefModal(null)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
