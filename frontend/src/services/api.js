const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Dashboard
  getDashboardSummary: () => fetchJson('/dashboard/summary'),
  getStateRisks: () => fetchJson('/dashboard/state-risks'),

  // Projects
  getProjects: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        q.append(k, v);
      }
    });
    return fetchJson(`/projects?${q.toString()}`);
  },
  getProjectDetail: (code) => fetchJson(`/projects/${encodeURIComponent(code)}`),
  getProjectHistory: (code) => fetchJson(`/projects/${encodeURIComponent(code)}/history`),
  getProjectRisk: (code) => fetchJson(`/projects/${encodeURIComponent(code)}/risk`),
  getProjectPredictions: (code) => fetchJson(`/projects/${encodeURIComponent(code)}/predictions`),
  getProjectDrivers: (code) => fetchJson(`/projects/${encodeURIComponent(code)}/drivers`),
  getProjectBrief: (code) => fetchJson(`/projects/${encodeURIComponent(code)}/brief`),

  // Risk & Warnings
  getRiskSummary: () => fetchJson('/risk/summary'),
  getRiskTrends: () => fetchJson('/risk/trends'),
  getEarlyWarnings: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        q.append(k, v);
      }
    });
    return fetchJson(`/early-warnings?${q.toString()}`);
  },

  // Sectors
  getSectors: () => fetchJson('/sectors'),
  getSectorDetail: (name) => fetchJson(`/sectors/${encodeURIComponent(name)}`),

  // Analytics & ML Benchmark
  getCostAnalytics: () => fetchJson('/analytics/cost'),
  getScheduleAnalytics: () => fetchJson('/analytics/schedule'),
  getModelComparison: () => fetchJson('/analytics/model-comparison'),
  getPortfolioDrivers: () => fetchJson('/analytics/drivers'),

  // Assistant & Operations
  queryIntelligence: (query) => fetchJson('/intelligence/query', {
    method: 'POST',
    body: JSON.stringify({ query })
  }),
  getDataHealth: () => fetchJson('/data/health')
};
