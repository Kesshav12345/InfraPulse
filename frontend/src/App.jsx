import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import GovHeader from './components/layout/GovHeader';
import Sidebar from './components/layout/Sidebar';

import Dashboard from './pages/Dashboard';
import ProjectExplorer from './pages/ProjectExplorer';
import ProjectDetail from './pages/ProjectDetail';
import RiskMonitor from './pages/RiskMonitor';
import EarlyWarnings from './pages/EarlyWarnings';
import SectorAnalytics from './pages/SectorAnalytics';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import EscalationDrivers from './pages/EscalationDrivers';
import SystemOpsMethodology from './pages/SystemOpsMethodology';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './components/layout/AuthContext';
import { FilterProvider } from './context/FilterContext';
import { api } from './services/api';

function AppLayout() {
  const [kpis, setKpis] = useState(null);
  const location = useLocation();
  const { user, loading } = useAuth();
  
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    api.getDashboardSummary()
      .then((data) => setKpis(data))
      .catch((err) => console.error('Failed to load system KPIs:', err));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (isLoginPage) {
    return <Routes><Route path="/login" element={<Login />} /></Routes>;
  }

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#E2ECF6]">
      <GovHeader latestDate={kpis?.latest_report_month_year || 'July 2026'} />
      <Sidebar warningCount={kpis?.projects_requiring_attention || 0} />
      
      <main className="flex-1 overflow-x-hidden bg-[#E2ECF6] min-h-[calc(100vh-140px)]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectExplorer />} />
          <Route path="/project/:code" element={<ProjectDetail />} />
          <Route path="/risk-monitor" element={<RiskMonitor />} />
          <Route path="/early-warnings" element={<EarlyWarnings />} />
          <Route path="/sectors" element={<SectorAnalytics />} />
          <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
          <Route path="/drivers" element={<EscalationDrivers />} />
          <Route path="/system-ops" element={<SystemOpsMethodology />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </FilterProvider>
    </AuthProvider>
  );
}

export default App;
