import React, { useState, useEffect } from 'react';
import type { Company } from './types';
import { Dashboard } from './pages/Dashboard';
import { CompanyDetail } from './pages/CompanyDetail';
import { checkHealth } from './api/client';

export const App: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isBackendLive, setIsBackendLive] = useState(false);

  // Check health on mount
  useEffect(() => {
    const fetchHealth = async () => {
      const live = await checkHealth();
      setIsBackendLive(live);
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const handleDecisionSubmitted = () => {
    // Rerender or update stats if needed
    console.log('HITL decision updated');
  };

  return (
    <div className="app">
      {/* ── Navbar ── */}
      <header className="navbar">
        <div className="navbar-logo">
          VenturePilot <span>AI</span>
        </div>
        <div className="navbar-tag">Prototype</div>
        
        <div className="navbar-status">
          <span className="status-dot" style={{ background: isBackendLive ? 'var(--green)' : 'var(--red)' }} />
          <span style={{ color: isBackendLive ? 'var(--text-secondary)' : 'var(--red)', fontSize: '0.75rem', fontWeight: 600 }}>
            {isBackendLive ? 'AgentOS Backend: Live' : 'AgentOS Backend: Offline'}
          </span>
        </div>
      </header>

      {/* ── Main Content Router ── */}
      <main style={{ flex: 1 }}>
        {selectedCompany ? (
          <CompanyDetail
            company={selectedCompany}
            onBack={() => setSelectedCompany(null)}
            onDecisionSubmitted={handleDecisionSubmitted}
          />
        ) : (
          <Dashboard onSelectCompany={setSelectedCompany} />
        )}
      </main>
    </div>
  );
};

export default App;
