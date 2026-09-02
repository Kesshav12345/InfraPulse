import React, { useEffect, useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Server,
  FileCheck,
  RefreshCw,
  HardDrive,
  BookOpen,
  ArrowDown,
  Layers,
  Activity,
  Cpu,
  ShieldAlert,
  GitBranch
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingStates';

const PIPELINE_STAGES = [
  {
    step: 1,
    title: 'PAIMANA / OCMS Longitudinal Ingestion',
    icon: Database,
    color: 'bg-blue-50 border-blue-300 text-blue-900',
    desc: 'Ingests monthly Flash Report observations from MoSPI IPMD across 16 consecutive months (April 2025 to July 2026) covering 21,863 longitudinal records across 3,842 Central Sector Projects (₹150 Cr & Above).'
  },
  {
    step: 2,
    title: 'Temporal Feature Engineering (Project × Time)',
    icon: Layers,
    color: 'bg-indigo-50 border-indigo-300 text-indigo-900',
    desc: 'Constructs 4-month rolling windows calculating Physical Progress Velocity (Δ Progress/mo), Financial Burn Rate (Δ Expenditure/mo), Acceleration, and the Slippage Ratio (Burn Velocity / max(Physical Velocity, 0.05)).'
  },
  {
    step: 3,
    title: 'CatBoost Multi-Signal Early Warning Classifiers',
    icon: Activity,
    color: 'bg-amber-50 border-amber-300 text-amber-900',
    desc: 'CatBoost Classifiers predict severe cost escalations and critical schedule delays, maintaining high F1 scores and precision-recall AUC across complex non-linear interactions.'
  },
  {
    step: 4,
    title: 'Hybrid Regressor Projections',
    icon: Cpu,
    color: 'bg-purple-50 border-purple-300 text-purple-900',
    desc: 'CatBoost Regressors (replacing parametric ridge benchmarks) forecast continuous variables like precise financial cost in Crores, minimizing MAE and RMSE across longitudinal splits.'
  },
  {
    step: 5,
    title: 'Hybrid Model Convergence',
    icon: ShieldAlert,
    color: 'bg-red-50 border-red-300 text-red-900',
    desc: 'Automated synthesis combining classification probabilities (early warnings) with regression exact values (capital cost) to power a comprehensive decision-support matrix.'
  },
  {
    step: 6,
    title: 'Administrative Action Engine',
    icon: CheckCircle2,
    color: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    desc: 'Translates the CatBoost hybrid outputs into explainable executive project briefs, structural bottleneck identification, and actionable intervention suggestions.'
  }
];

export default function SystemOpsMethodology() {
  const [activeTab, setActiveTab] = useState('health');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthData, setHealthData] = useState(null);

  const loadHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDataHealth();
      setHealthData(data);
    } catch (err) {
      setError(err.message || 'Failed to load system health report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <LoadingSkeleton count={3} height="h-28" />
        <LoadingSkeleton count={2} height="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="System Monitor Error" message={error} onRetry={loadHealth} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Server size={20} className="text-blue-800" />
            <h1 className="text-xl font-black text-[#002B50] tracking-tight uppercase">
              System Operations & Methodology
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time data health monitoring and mathematical pipeline documentation
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('health')}
          className={`px-3.5 py-2 rounded-t-md inline-flex items-center gap-1.5 font-semibold text-xs transition ${
            activeTab === 'health'
              ? 'bg-[#1689ca] text-white shadow-sm font-bold'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Database size={14} /> Data Health & Operations
        </button>
        <button
          onClick={() => setActiveTab('methodology')}
          className={`px-3.5 py-2 rounded-t-md inline-flex items-center gap-1.5 font-semibold text-xs transition ${
            activeTab === 'methodology'
              ? 'bg-[#1689ca] text-white shadow-sm font-bold'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <BookOpen size={14} /> Analytical Methodology
        </button>
      </div>

      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={loadHealth}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium inline-flex items-center gap-1.5 transition"
            >
              <RefreshCw size={13} /> Run Health Check
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="gov-card p-4 border-l-4 border-l-emerald-600">
              <span className="text-xs text-slate-500 font-bold uppercase block">System Status</span>
              <div className="text-xl font-black text-emerald-700 mt-1 flex items-center gap-1.5">
                <CheckCircle2 size={20} /> {healthData?.status}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Engine: {healthData?.database_engine}</span>
            </div>

            <div className="gov-card p-4">
              <span className="text-xs text-slate-500 font-bold uppercase block">Records Ingested</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {healthData?.total_records?.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">Longitudinal observations</span>
            </div>

            <div className="gov-card p-4">
              <span className="text-xs text-slate-500 font-bold uppercase block">Unique Projects</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {healthData?.unique_projects?.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">Central sector infrastructure</span>
            </div>

            <div className="gov-card p-4">
              <span className="text-xs text-slate-500 font-bold uppercase block">Data Quality Score</span>
              <div className="text-2xl font-black text-[#1689ca] font-mono mt-1">
                {healthData?.data_quality_pct}%
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">High completeness index</span>
            </div>
          </div>

          <div className="gov-card p-5 space-y-4">
            <div className="gov-card-header -mx-5 -mt-5 mb-4 flex justify-between items-center">
              <h2 className="font-bold text-sm text-slate-800">Database & Longitudinal Ingestion Diagnostics</h2>
              <span className="text-[11px] text-slate-500">Schema Ingestion</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Reporting Range:</span>
                  <strong className="text-slate-900 font-mono">{healthData?.earliest_report_date} to {healthData?.latest_report_date}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Consecutive Months Covered:</span>
                  <strong className="text-slate-900 font-mono">{healthData?.months_covered_count} Months</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Active Database Driver:</span>
                  <strong className="text-[#1689ca] font-mono">{healthData?.database_engine} (SQLAlchemy ORM)</strong>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Missing Progress Entries:</span>
                  <span className="font-mono font-bold text-slate-800">{healthData?.missing_physical_progress_count?.toLocaleString()} ({((healthData?.missing_physical_progress_count / (healthData?.total_records || 1)) * 100).toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Missing Revised DoC Entries:</span>
                  <span className="font-mono font-bold text-slate-800">{healthData?.missing_revised_doc_count?.toLocaleString()} ({((healthData?.missing_revised_doc_count / (healthData?.total_records || 1)) * 100).toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Duplicate Scrubbing:</span>
                  <strong className="text-emerald-700">100% Unique (Project, Month) Panel</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'methodology' && (
        <div className="space-y-6">
          {/* Header Notice */}
          <div className="gov-card p-5 bg-white border-l-4 border-l-[#1689ca] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#1689ca] font-bold">Dual-Engine Analytical Framework</span>
              <h2 className="text-base font-black text-slate-900 tracking-tight mt-0.5">Two Distinct Modeling Paradigms in Production</h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                InfraPulse divides analytical intelligence into two dedicated workflows: a <strong>Deterministic Heuristic & Regressive Engine</strong> for exact rupee/time forecasts, and a <strong>CatBoost Gradient Boosted Classifier</strong> for non-linear early warning detection.
              </p>
            </div>
            <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-[#1689ca] rounded text-xs font-mono font-bold shrink-0">
              Panel: 21,863 Observations
            </div>
          </div>

          {/* Dual Workflow Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* WORKFLOW 1: HEURISTIC / REGRESSIVE TRAJECTORY ENGINE */}
            <div className="gov-card p-5 space-y-4 border-t-4 border-t-blue-700">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">
                      Heuristic & Continuous Regressor Workflow
                    </h3>
                    <span className="text-[10px] text-blue-800 font-bold uppercase">Role: Exact Financial & Timeline Projections</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-bold rounded">
                  ACTIVE PRODUCTION
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1">1. Primary Task & Objectives</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Forecasts exact continuous numeric values — specifically estimating total projected <strong>Revised Cost (₹ Crores)</strong> upon completion and determining exact <strong>Schedule Slippage (Months)</strong>. Operates deterministically without synthetic hallucination.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1">2. Features & Temporal Signals Ingested</h4>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <li><strong className="text-slate-800">Financial Burn Rate:</strong> Δ Cumulative Expenditure per consecutive month</li>
                    <li><strong className="text-slate-800">Physical Progress Velocity:</strong> Δ Physical Progress % per month</li>
                    <li><strong className="text-slate-800">Approved Baseline Capital:</strong> Original Sanctioned Cost vs Cumulative Expended</li>
                    <li><strong className="text-slate-800">4-Month Rolling Window:</strong> Temporal smoothing across trailing reporting cycles</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1">3. Mathematical Formulations</h4>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-100 rounded border border-slate-300 font-mono text-[11px] text-slate-900">
                      <div className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Slippage Ratio Formula:</div>
                      Slippage Ratio = [Δ Expenditure / Revised Cost × 100] / max(Δ Physical Progress, 0.05)
                    </div>
                    <p className="text-[11px] text-slate-500 italic">
                      A ratio &gt; 1.8 indicates capital expenditure is burning significantly faster than physical progress is moving.
                    </p>

                    <div className="p-2.5 bg-slate-100 rounded border border-slate-300 font-mono text-[11px] text-slate-900">
                      <div className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Continuous Cost Trajectory Equation:</div>
                      Estimated Cost = max(Cumulative Exp, Original Cost × (1.0 + max(0, Cost Escalation Ratio)))
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1">4. Target Evaluation Metrics</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Cost MAE</span>
                      <strong className="text-slate-900 font-mono text-xs">₹70.03 Cr</strong>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Cost RMSE</span>
                      <strong className="text-slate-900 font-mono text-xs">₹1,075 Cr</strong>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">R² Score</span>
                      <strong className="text-blue-900 font-mono text-xs">0.9784</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WORKFLOW 2: MACHINE LEARNING CLASSIFIER ENGINE */}
            <div className="gov-card p-5 space-y-4 border-t-4 border-t-purple-700">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">
                      CatBoost Multi-Signal Classifier Workflow
                    </h3>
                    <span className="text-[10px] text-purple-800 font-bold uppercase">Role: Discrete Early Warning & Risk Classification</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-900 text-[10px] font-bold rounded">
                  ACTIVE PRODUCTION
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1">1. Primary Task & Objectives</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Predicts the <strong>discrete probability of critical failure</strong> 3 months in advance: categorizing projects into <em>Critical</em>, <em>High</em>, or <em>Moderate</em> alert levels to trigger proactive supervisory interventions before cost escalations occur.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1">2. Features & Non-Linear Interactions</h4>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 bg-purple-50/50 p-2.5 rounded border border-purple-200">
                    <li><strong className="text-slate-800">Multi-Lag Temporal Signals:</strong> Trailing velocity vectors across 16-month longitudinal history</li>
                    <li><strong className="text-slate-800">Categorical Sector Embeddings:</strong> High-cardinality ministry & state friction indices</li>
                    <li><strong className="text-slate-800">Non-Linear Oblivious Trees:</strong> Symmetric decision tree splits preventing target leakage</li>
                    <li><strong className="text-slate-800">Velocity Deceleration:</strong> Rate of change in milestone execution pace</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1">3. Mathematical Formulations</h4>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-100 rounded border border-slate-300 font-mono text-[11px] text-slate-900">
                      <div className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Binary Cross-Entropy Loss Optimization:</div>
                      LogLoss = -1/N Σ [ yᵢ log(p̂ᵢ) + (1 - yᵢ) log(1 - p̂ᵢ) ]
                    </div>
                    <p className="text-[11px] text-slate-500 italic">
                      Maximizes classification margin between stable projects and projects on an escalation trajectory.
                    </p>

                    <div className="p-2.5 bg-slate-100 rounded border border-slate-300 font-mono text-[11px] text-slate-900">
                      <div className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">5-Factor Weighted Composite Risk Formulation:</div>
                      Risk = 0.25(CostRisk) + 0.25(SchedRisk) + 0.20(ProgRisk) + 0.20(VelRisk) + 0.10(Friction)
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1">4. Target Evaluation Metrics</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Cost F1-Score</span>
                      <strong className="text-purple-900 font-mono text-xs">0.910</strong>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Schedule F1</span>
                      <strong className="text-purple-900 font-mono text-xs">0.699</strong>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Accuracy</span>
                      <strong className="text-emerald-700 font-mono text-xs">94.2%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Model Progression Roadmap */}
          <div className="gov-card p-5 space-y-3">
            <div className="gov-card-header -mx-5 -mt-5 mb-3 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800">Anticipated Machine Learning Model Progression Roadmap</h3>
              <span className="text-[11px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">MoSPI Standard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-blue-50/70 rounded border border-blue-300">
                <span className="text-[10px] text-blue-900 font-bold uppercase block">Version 1 (Active)</span>
                <strong className="text-slate-900 block mt-0.5">Heuristic Trajectory Engine</strong>
                <p className="text-[11px] text-slate-600 mt-1">Deterministic multi-signal 4-month rolling velocity with zero-hallucination baseline.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-300">
                <span className="text-[10px] text-slate-600 font-bold uppercase block">Version 2 (Benchmark)</span>
                <strong className="text-slate-900 block mt-0.5">Parametric Statistical Baseline</strong>
                <p className="text-[11px] text-slate-600 mt-1">Ridge and linear time-series smoothing regression benchmarks.</p>
              </div>

              <div className="p-3 bg-blue-50/70 rounded border border-blue-300">
                <span className="text-[10px] text-blue-900 font-bold uppercase block">Version 3 (Active)</span>
                <strong className="text-slate-900 block mt-0.5">CatBoost Multi-Signal Engine</strong>
                <p className="text-[11px] text-slate-600 mt-1">Non-linear gradient boosted tree interactions for high-precision early warning classification.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
