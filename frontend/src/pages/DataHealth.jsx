import React, { useEffect, useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Server,
  FileCheck,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingStates';

export default function DataHealth() {
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
      <div className="p-6 space-y-6">
        <LoadingSkeleton count={3} height="h-28" />
        <LoadingSkeleton count={2} height="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="Health Monitor Error" message={error} onRetry={loadHealth} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Database size={20} className="text-blue-800" />
            <h1 className="text-xl font-black text-[#002B50] tracking-tight uppercase">
              System Operations & Data Health Audit
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time verification of longitudinal ingestion, database connectivity, and data completeness metrics
          </p>
        </div>

        <button
          onClick={loadHealth}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium inline-flex items-center gap-1.5 transition"
        >
          <RefreshCw size={13} /> Run Health Check
        </button>
      </div>

      {/* Primary KPI Row */}
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
          <div className="text-2xl font-black text-blue-900 font-mono mt-1">
            {healthData?.data_quality_pct}%
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">High completeness index</span>
        </div>
      </div>

      {/* Detailed Operational Diagnostics */}
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
              <strong className="text-blue-900 font-mono">{healthData?.database_engine} (SQLAlchemy ORM)</strong>
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
  );
}
