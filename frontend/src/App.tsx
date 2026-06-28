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
        <div className="navbar-glass-effect" />
        <div className="navbar-glass-tint" />
        <div className="navbar-glass-shine" />
        <div className="navbar-glass-filter w-embed">
          <svg style={{ display: 'none' }}>
            <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
              <feTurbulence type="fractalNoise" baseFrequency="0.015 0.015" numOctaves="1" seed="5" result="turbulence" />
              <feComponentTransfer in="turbulence" result="mapped">
                <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
                <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
                <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
              </feComponentTransfer>
              <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
              <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lightingColor="white" result="specLight">
                <fePointLight x={-200} y={-200} z={300} />
              </feSpecularLighting>
              <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
              <feDisplacementMap in="SourceGraphic" in2="softMap" scale="60" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>
        </div>
        <div className="navbar-content">
          <div className="navbar-logo">
            VenturePilot <span>AI</span>
          </div>
          <div className="navbar-tag">Prototype</div>
          
          <div className="navbar-status">
            <span className={`status-dot ${isBackendLive ? '' : 'offline'}`} />
            <span style={{ color: isBackendLive ? 'var(--text-secondary)' : 'var(--error-color)', fontSize: '0.75rem', fontWeight: 600 }}>
              {isBackendLive ? 'AgentOS Backend: Live' : 'AgentOS Backend: Offline'}
            </span>
          </div>
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
