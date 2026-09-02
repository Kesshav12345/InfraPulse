import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Filter,
  RefreshCw,
  Clock,
  Activity,
  CheckCircle2,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../components/layout/AuthContext';
import { LoadingSkeleton, EmptyState, ErrorState } from '../components/common/LoadingStates';

export default function EarlyWarnings() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('warnings'); // 'warnings', 'interventions'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [warnings, setWarnings] = useState([]);
  const [interventions, setInterventions] = useState([]);
  
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'warnings') {
        const data = await api.getEarlyWarnings({
          severity: selectedSeverity || undefined,
          sector: selectedSector || undefined,
          limit: 100
        });
        setWarnings(data || []);
      } else {
        if (!user) {
          setInterventions([]);
          setLoading(false);
          return;
        }
        const data = await api.getInterventions();
        setInterventions(data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, selectedSeverity, selectedSector, user]);

  const handleCreateIntervention = async (warning) => {
    try {
      await api.createIntervention({
        project_code: warning.project_code,
        warning_reference: warning.warning_id,
        priority: warning.severity,
        evidence_summary: warning.evidence,
        recommended_review_area: warning.recommendation
      });
      alert('Intervention ticket created successfully.');
      loadData();
    } catch (err) {
      alert('Failed to create intervention: ' + err.message);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-red-700" />
            <h1 className="text-xl font-black text-[#002B50] tracking-tight uppercase">
              Early Warning & Intervention Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated multi-signal early warning triggers and administrative intervention workflows.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium inline-flex items-center gap-1.5 transition"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('warnings')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'warnings' 
              ? 'border-[#1689ca] text-[#1689ca] bg-blue-50/60' 
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} /> Active Alerts
          </div>
        </button>
        <button
          onClick={() => setActiveTab('interventions')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'interventions' 
              ? 'border-[#1689ca] text-[#1689ca] bg-blue-50/60' 
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={16} /> Intervention Workflow
          </div>
        </button>
      </div>

      {activeTab === 'warnings' && (
        <>
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
              </select>
            </div>
            <div className="text-slate-500 font-medium">
              Showing <strong>{warnings.length}</strong> active alerts
            </div>
          </div>

          {/* Alerts Grid */}
          {loading ? (
            <LoadingSkeleton count={4} height="h-36" />
          ) : error ? (
            <ErrorState title="Failed to Load Early Warnings" message={error} onRetry={loadData} />
          ) : warnings.length === 0 ? (
            <EmptyState
              title="No Warning Alerts Triggered"
              description="No projects match your current filter parameters or meet the warning threshold."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {warnings.map((w, idx) => {
                const isCrit = w.severity === 'CRITICAL';
                const borderCol = isCrit ? 'border-l-4 border-l-red-600' : 'border-l-4 border-l-amber-500';
                const badgeBg = isCrit ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800';

                return (
                  <div key={idx} className={`gov-card p-4 flex flex-col justify-between space-y-3 ${borderCol} hover:shadow-md transition`}>
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
                      <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                        <div>
                          <strong className="text-slate-700 block text-[10px] uppercase">Trigger Reason:</strong>
                          <span className="text-slate-800">{w.trigger}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                      {user && user.role === 'ADMIN' ? (
                        <button
                          onClick={() => handleCreateIntervention(w)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium inline-flex items-center gap-1 shadow-sm transition"
                        >
                          Request Intervention
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Model: {w.model_version}</span>
                      )}
                      
                      <button
                        onClick={() => navigate(`/project/${encodeURIComponent(w.project_code)}`)}
                        className="px-2.5 py-1 bg-[#1689ca] hover:bg-[#1279b5] text-white rounded font-medium inline-flex items-center gap-1 shadow-sm transition"
                      >
                        View Project <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'interventions' && (
        <div className="space-y-4">
          {!user ? (
            <div className="gov-card p-8 text-center max-w-lg mx-auto space-y-4 my-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mx-auto">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Administrative Sign-In Required</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Intervention ticket management, ministry task delegations, and resolution logs require authorized MoSPI credentials.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={async () => {
                    await login('admin', 'admin');
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded text-xs font-semibold shadow-xs transition"
                >
                  Sign in as Admin (Demo)
                </button>
                <button
                  onClick={async () => {
                    await login('engineer', 'engineer');
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold border border-slate-300 transition"
                >
                  Sign in as Engineer (Demo)
                </button>
              </div>
            </div>
          ) : loading ? (
            <LoadingSkeleton count={3} height="h-24" />
          ) : error ? (
            <ErrorState title="Failed to Load Interventions" message={error} onRetry={loadData} />
          ) : interventions.length === 0 ? (
            <EmptyState
              title="No Active Interventions"
              description="There are no active administrative interventions in your queue."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {interventions.map((inv) => (
                <div key={inv.intervention_id} className="gov-card p-4 border-l-4 border-blue-600 flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Intervention #{inv.intervention_id}</h3>
                      <div className="text-xs font-semibold text-blue-900 mt-0.5">
                        Project: {inv.project_code}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase ${inv.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                      {inv.status}
                    </span>
                  </div>
                  
                  <div className="text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                    <strong className="text-slate-700 block text-[10px] uppercase mb-1">Recommended Action:</strong>
                    <span className="text-slate-800">{inv.recommended_review_area || 'No specific recommendation provided.'}</span>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-100 flex justify-end gap-2 text-xs">
                    <button
                      onClick={() => navigate(`/project/${encodeURIComponent(inv.project_code)}`)}
                      className="px-2.5 py-1 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-medium"
                    >
                      View Details
                    </button>
                    {user && (user.role === 'ADMIN' || user.role === 'ENGINEER') && inv.status !== 'RESOLVED' && (
                      <button
                        onClick={async () => {
                          await api.updateIntervention(inv.intervention_id, { status: 'RESOLVED' });
                          loadData();
                        }}
                        className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-medium inline-flex items-center gap-1 shadow-sm transition"
                      >
                        <CheckCircle2 size={13} /> Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
