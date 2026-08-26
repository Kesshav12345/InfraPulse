import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Filter,
  RefreshCw,
  Clock,
  DollarSign,
  Activity,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import { LoadingSkeleton, EmptyState, ErrorState } from '../components/common/LoadingStates';

export default function EarlyWarnings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  const loadWarnings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getEarlyWarnings({
        severity: selectedSeverity || undefined,
        sector: selectedSector || undefined,
        limit: 100
      });
      setWarnings(data || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve early warning alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarnings();
  }, [selectedSeverity, selectedSector]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-red-700" />
            <h1 className="text-xl font-black text-[#002B50] tracking-tight uppercase">
              Early Warning Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated multi-signal early warning triggers across schedule, financial burn velocity, and cost escalation
          </p>
        </div>

        <button
          onClick={loadWarnings}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium inline-flex items-center gap-1.5 transition"
        >
          <RefreshCw size={13} /> Refresh Alerts
        </button>
      </div>

      {/* Filter Bar */}
      <div className="gov-card p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Filter size={14} className="text-blue-700" /> Filter Alerts:
          </span>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-800"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">CRITICAL Only</option>
            <option value="HIGH">HIGH Only</option>
            <option value="MODERATE">MODERATE Only</option>
          </select>

          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-800"
          >
            <option value="">All Sectors</option>
            <option value="Roads & Highways">Roads & Highways</option>
            <option value="Railways">Railways</option>
            <option value="Power & Renewable Energy">Power & Renewable Energy</option>
            <option value="Coal & Lignite">Coal & Lignite</option>
            <option value="Petroleum & Natural Gas">Petroleum & Natural Gas</option>
            <option value="Civil Aviation">Civil Aviation</option>
            <option value="Urban Development & Metro">Urban Development & Metro</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <strong>{warnings.length}</strong> active early warning alerts
        </div>
      </div>

      {/* Alerts Grid */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-36" />
      ) : error ? (
        <ErrorState title="Failed to Load Early Warnings" message={error} onRetry={loadWarnings} />
      ) : warnings.length === 0 ? (
        <EmptyState
          title="No Warning Alerts Triggered"
          description="No projects match your current filter parameters or meet the warning threshold."
          onReset={() => {
            setSelectedSeverity('');
            setSelectedSector('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warnings.map((w, idx) => {
            const isCrit = w.severity === 'CRITICAL';
            const borderCol = isCrit ? 'border-l-4 border-l-red-600' : 'border-l-4 border-l-amber-500';
            const badgeBg = isCrit ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800';

            return (
              <div
                key={idx}
                className={`gov-card p-4 flex flex-col justify-between space-y-3 ${borderCol} hover:shadow-md transition`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase ${badgeBg}`}>
                      {w.severity} • {w.warning_type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Detected: {w.detected_date}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{w.title}</h3>
                  <div className="text-xs font-semibold text-blue-900 mt-0.5">
                    {w.project_name} <span className="font-mono text-[11px] text-slate-500">({w.project_code})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mb-2">
                    {w.sector} | {w.state}
                  </div>

                  {/* Trigger & Evidence */}
                  <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div>
                      <strong className="text-slate-700 block text-[10px] uppercase">Trigger Reason:</strong>
                      <span className="text-slate-800">{w.trigger}</span>
                    </div>
                    <div>
                      <strong className="text-slate-700 block text-[10px] uppercase">Analytical Evidence:</strong>
                      <span className="text-slate-600 font-mono text-[11px]">{w.evidence}</span>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="mt-2 text-xs text-blue-950 bg-blue-50/70 p-2 rounded border border-blue-200">
                    <strong className="block text-[10px] uppercase text-blue-900">Recommended Supervisory Review:</strong>
                    <span>{w.recommendation}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">Model: {w.model_version}</span>
                  <button
                    onClick={() => navigate(`/project/${encodeURIComponent(w.project_code)}`)}
                    className="px-2.5 py-1 bg-blue-900 hover:bg-blue-950 text-white rounded font-medium inline-flex items-center gap-1 shadow-sm transition"
                  >
                    View Project <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
