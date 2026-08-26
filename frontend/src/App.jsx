import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GovHeader from './components/layout/GovHeader';
import Sidebar from './components/layout/Sidebar';
import SystemMetaBar from './components/layout/SystemMetaBar';

import Dashboard from './pages/Dashboard';
import ProjectExplorer from './pages/ProjectExplorer';
import ProjectDetail from './pages/ProjectDetail';
import RiskMonitor from './pages/RiskMonitor';
import EarlyWarnings from './pages/EarlyWarnings';
import SectorAnalytics from './pages/SectorAnalytics';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import EscalationDrivers from './pages/EscalationDrivers';
import IntelligenceAssistant from './pages/IntelligenceAssistant';
import Methodology from './pages/Methodology';
import DataHealth from './pages/DataHealth';
import { api } from './services/api';

function App() {
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    api.getDashboardSummary()
      .then((data) => setKpis(data))
      .catch((err) => console.error('Failed to load system KPIs:', err));
  }, []);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen font-sans bg-slate-50">
        <GovHeader latestDate={kpis?.latest_report_month_year || 'July 2026'} />
        <SystemMetaBar kpis={kpis} />
        
        <div className="flex flex-1">
          <Sidebar warningCount={kpis?.projects_requiring_attention || 0} />
          
          <main className="flex-1 overflow-x-hidden bg-slate-50 min-h-[calc(100vh-140px)]">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<ProjectExplorer />} />
              <Route path="/project/:code" element={<ProjectDetail />} />
              <Route path="/risk-monitor" element={<RiskMonitor />} />
              <Route path="/early-warnings" element={<EarlyWarnings />} />
              <Route path="/sectors" element={<SectorAnalytics />} />
              <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
              <Route path="/drivers" element={<EscalationDrivers />} />
              <Route path="/assistant" element={<IntelligenceAssistant />} />
              <Route path="/methodology" element={<Methodology />} />
              <Route path="/data-health" element={<DataHealth />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
