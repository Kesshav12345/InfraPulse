import React from 'react';
import {
  BookOpen,
  ArrowDown,
  Database,
  Layers,
  Activity,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  GitBranch
} from 'lucide-react';

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
    title: 'Multi-Signal Heuristic Risk Engine',
    icon: Activity,
    color: 'bg-amber-50 border-amber-300 text-amber-900',
    desc: 'Transparent 0–100 risk scoring based on Cost Risk (25%), Schedule Risk (25%), Progress Risk (20%), Financial Velocity Risk (20%), and Milestone Friction (10%). Evaluates temporal risk deltas (↗ Deteriorating vs ↘ Improving).'
  },
  {
    step: 4,
    title: 'Trajectory-Based Cost & Schedule Projections',
    icon: Cpu,
    color: 'bg-purple-50 border-purple-300 text-purple-900',
    desc: 'Conservative extrapolation blending revised approved costs with empirical expenditure-per-progress-unit burn velocities. Computes completion date forecasts with asymptotic zero-velocity safeguards.'
  },
  {
    step: 5,
    title: 'Early Warning Alert System',
    icon: ShieldAlert,
    color: 'bg-red-50 border-red-300 text-red-900',
    desc: 'Automated multi-criteria alert trigger engine detecting critical schedule slippages (>12 mos), financial burn acceleration with progress slowdown, and progress stagnation (<0.1%/mo).'
  },
  {
    step: 6,
    title: 'Administrative Decision Support & Model Abstraction',
    icon: CheckCircle2,
    color: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    desc: 'Synthesizes explainable driver contributions, executive project briefs, and intervention suggestions. Clean API abstraction ready for pluggable trained Gradient Boosting models without frontend modifications.'
  }
];

export default function Methodology() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-blue-800" />
          <h1 className="text-xl font-black text-[#002B50] tracking-tight uppercase">
            Analytical Pipeline & Mathematical Methodology
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive architecture, mathematical formulations, and model roadmap for PAIMANA Intelligence
        </p>
      </div>

      {/* End-to-End Pipeline Visualization */}
      <div className="gov-card p-6 space-y-4">
        <h2 className="font-bold text-sm text-slate-800">Sequential End-to-End Analytical Pipeline</h2>

        <div className="space-y-3">
          {PIPELINE_STAGES.map((s, idx) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={s.step}>
                <div className={`p-4 rounded-lg border ${s.color} shadow-xs flex items-start gap-4`}>
                  <div className="w-9 h-9 rounded-full bg-white border border-slate-300 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                    {s.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon size={16} />
                      <h3 className="font-bold text-xs uppercase tracking-wide">{s.title}</h3>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
                {idx < PIPELINE_STAGES.length - 1 && (
                  <div className="flex justify-center">
                    <ArrowDown size={18} className="text-slate-400" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mathematical Formulations Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slippage Ratio Formula */}
        <div className="gov-card p-5 space-y-2">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">1. Slippage Ratio Formulation</h3>
          <div className="p-3 bg-slate-100 rounded font-mono text-xs text-slate-900 border border-slate-300">
            Slippage Ratio = [Δ Expenditure / Revised Cost × 100] / max(Δ Physical Progress, 0.05)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Measures the proportionality between capital expenditure burn and milestone execution pace. A ratio of ~1.0 denotes balanced delivery, whereas values &gt;1.8x trigger automated supervisory alerts.
          </p>
        </div>

        {/* 5-Factor Weighted Risk Score */}
        <div className="gov-card p-5 space-y-2">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">2. Composite Risk Score Formula</h3>
          <div className="p-3 bg-slate-100 rounded font-mono text-xs text-slate-900 border border-slate-300">
            Risk = 0.25(CostRisk) + 0.25(ScheduleRisk) + 0.20(ProgressRisk) + 0.20(VelocityRisk) + 0.10(MilestoneFriction)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Composite index bounded strictly between 0 and 100, categorized into Low (0–24), Moderate (25–49), High (50–74), and Critical (75–100).
          </p>
        </div>
      </div>

      {/* Model Progression Roadmap */}
      <div className="gov-card p-5 space-y-3">
        <div className="gov-card-header -mx-5 -mt-5 mb-3 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800">Anticipated Machine Learning Model Progression Roadmap</h3>
          <span className="text-[11px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">Section 60</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-blue-50/70 rounded border border-blue-300">
            <span className="text-[10px] text-blue-900 font-bold uppercase block">Version 1 (Active)</span>
            <strong className="text-slate-900 block mt-0.5">Heuristic Trajectory Engine</strong>
            <p className="text-[11px] text-slate-600 mt-1">Multi-signal 4-month rolling velocity with zero-hallucination baseline.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-300">
            <span className="text-[10px] text-slate-600 font-bold uppercase block">Version 2 (Benchmark)</span>
            <strong className="text-slate-900 block mt-0.5">Parametric Regression</strong>
            <p className="text-[11px] text-slate-600 mt-1">Ridge and linear time-series smoothing benchmarks.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-300">
            <span className="text-[10px] text-slate-600 font-bold uppercase block">Version 3 (Candidate)</span>
            <strong className="text-slate-900 block mt-0.5">Gradient Tree Boosting</strong>
            <p className="text-[11px] text-slate-600 mt-1">Non-linear feature interactions across longitudinal observations.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-300">
            <span className="text-[10px] text-slate-600 font-bold uppercase block">Version 4 (Future)</span>
            <strong className="text-slate-900 block mt-0.5">External-Enhanced ML</strong>
            <p className="text-[11px] text-slate-600 mt-1">Incorporates commodity price indices, state friction, and monsoon deviations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
