import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  FolderKanban
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import { LoadingSkeleton, EmptyState, ErrorState } from '../components/common/LoadingStates';

const SECTORS = [
  'Roads & Highways',
  'Railways',
  'Power & Renewable Energy',
  'Coal & Lignite',
  'Petroleum & Natural Gas',
  'Civil Aviation',
  'Urban Development & Metro',
  'Ports & Shipping',
  'Higher Education',
  'Healthcare Infrastructure',
  'Telecommunications'
];

const RISK_LEVELS = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'];

export default function ProjectExplorer() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectsData, setProjectsData] = useState({ items: [], total: 0, page: 1, total_pages: 1 });

  // Filters state initialized from searchParams
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedSector, setSelectedSector] = useState(searchParams.get('sector') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [selectedRisk, setSelectedRisk] = useState(searchParams.get('risk_level') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'risk_score');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort_order') || 'desc');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: searchTerm || undefined,
        sector: selectedSector || undefined,
        state: selectedState || undefined,
        risk_level: selectedRisk || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: currentPage,
        page_size: 25
      };

      const res = await api.getProjects(params);
      setProjectsData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, selectedSector, selectedState, selectedRisk, sortBy, sortOrder, currentPage]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSector('');
    setSelectedState('');
    setSelectedRisk('');
    setSortBy('risk_score');
    setSortOrder('desc');
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban size={20} className="text-blue-800" />
            <h1 className="text-xl font-black text-[#002B50] tracking-tight uppercase">
              National Infrastructure Project Explorer
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, and inspect {projectsData.total.toLocaleString()} ongoing central sector infrastructure projects
          </p>
        </div>

        <button
          onClick={fetchProjects}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium inline-flex items-center gap-1.5 transition"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="gov-card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box (5 cols) */}
          <div className="md:col-span-5 relative">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project name, corridor, or code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:bg-white transition"
            />
          </div>

          {/* Sector Filter (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:bg-white"
            >
              <option value="">All Sectors</option>
              {SECTORS.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Risk Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:bg-white"
            >
              <option value="">All Risk Levels</option>
              {RISK_LEVELS.map((rl) => (
                <option key={rl} value={rl}>{rl}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters (2 cols) */}
          <div className="md:col-span-2 flex items-center justify-end">
            {(searchTerm || selectedSector || selectedState || selectedRisk) && (
              <button
                onClick={handleResetFilters}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Selected Filter Tags */}
        {(selectedState || selectedSector || selectedRisk) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold text-[11px]">Active Filters:</span>
            {selectedState && (
              <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                State: {selectedState}
                <button onClick={() => setSelectedState('')} className="font-bold hover:text-blue-950">×</button>
              </span>
            )}
            {selectedSector && (
              <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                Sector: {selectedSector}
                <button onClick={() => setSelectedSector('')} className="font-bold hover:text-blue-950">×</button>
              </span>
            )}
            {selectedRisk && (
              <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                Risk: {selectedRisk}
                <button onClick={() => setSelectedRisk('')} className="font-bold hover:text-blue-950">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Table */}
      {loading ? (
        <LoadingSkeleton count={8} height="h-12" />
      ) : error ? (
        <ErrorState title="Failed to Load Projects" message={error} onRetry={fetchProjects} />
      ) : projectsData.items.length === 0 ? (
        <EmptyState title="No Projects Found" description="No project records match your current filter parameters." onReset={handleResetFilters} />
      ) : (
        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 select-none">
                <tr>
                  <th onClick={() => handleSort('project_code')} className="py-3 px-3 cursor-pointer hover:bg-slate-200">
                    <div className="flex items-center gap-1">Code <ArrowUpDown size={12} /></div>
                  </th>
                  <th onClick={() => handleSort('project_name')} className="py-3 px-3 cursor-pointer hover:bg-slate-200 min-w-[220px]">
                    <div className="flex items-center gap-1">Project Name <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-3 px-3">Sector</th>
                  <th className="py-3 px-3">State</th>
                  <th onClick={() => handleSort('original_cost')} className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200">
                    <div className="flex items-center justify-end gap-1">Original <ArrowUpDown size={12} /></div>
                  </th>
                  <th onClick={() => handleSort('revised_cost')} className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200">
                    <div className="flex items-center justify-end gap-1">Revised Cost <ArrowUpDown size={12} /></div>
                  </th>
                  <th onClick={() => handleSort('physical_progress')} className="py-3 px-3 text-center cursor-pointer hover:bg-slate-200">
                    <div className="flex items-center justify-center gap-1">Progress <ArrowUpDown size={12} /></div>
                  </th>
                  <th onClick={() => handleSort('slippage_ratio')} className="py-3 px-3 text-center cursor-pointer hover:bg-slate-200">
                    <div className="flex items-center justify-center gap-1">Slippage <ArrowUpDown size={12} /></div>
                  </th>
                  <th onClick={() => handleSort('risk_score')} className="py-3 px-3 text-center cursor-pointer hover:bg-slate-200">
                    <div className="flex items-center justify-center gap-1">Risk <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="py-3 px-2 text-center">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {projectsData.items.map((p) => (
                  <tr
                    key={p.project_code}
                    onClick={() => navigate(`/project/${encodeURIComponent(p.project_code)}`)}
                    className="hover:bg-blue-50/60 cursor-pointer transition"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                      {p.project_code}
                    </td>
                    <td className="py-2.5 px-3 max-w-[260px]">
                      <div className="font-bold text-slate-900 truncate" title={p.project_name}>
                        {p.project_name}
                      </div>
                      <div className="text-[10px] text-slate-500">{p.ministry}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {p.sector}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {p.state}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      ₹{p.original_cost?.toLocaleString() || 0} Cr
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{p.revised_cost?.toLocaleString() || 0} Cr
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <div className="font-semibold text-slate-800">{p.physical_progress?.toFixed(1) || 0}%</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-medium">
                      <span className={p.slippage_ratio > 1.8 ? 'text-red-700 font-bold' : 'text-slate-700'}>
                        {p.slippage_ratio ? `${p.slippage_ratio.toFixed(2)}x` : '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {p.risk_trend === 'UP' && (
                        <span className="text-red-600 flex items-center justify-center" title="Risk increasing">
                          <TrendingUp size={14} />
                        </span>
                      )}
                      {p.risk_trend === 'DOWN' && (
                        <span className="text-emerald-600 flex items-center justify-center" title="Risk decreasing">
                          <TrendingDown size={14} />
                        </span>
                      )}
                      {(!p.risk_trend || p.risk_trend === 'STABLE') && (
                        <span className="text-slate-400 flex items-center justify-center" title="Stable trajectory">
                          <Minus size={14} />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-600">
            <div>
              Showing <strong>{((currentPage - 1) * 25) + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * 25, projectsData.total)}</strong> of{' '}
              <strong>{projectsData.total.toLocaleString()}</strong> projects
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded font-medium disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronLeft size={14} />
              </button>
              <span>
                Page <strong>{currentPage}</strong> of <strong>{projectsData.total_pages}</strong>
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(projectsData.total_pages, currentPage + 1))}
                disabled={currentPage >= projectsData.total_pages}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded font-medium disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
