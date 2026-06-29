import React from 'react';

interface AgentProgressProps {
  status: 'queued' | 'running' | 'done' | 'error';
  currentStep: string | null;
}


export const AgentProgress: React.FC<AgentProgressProps> = ({ status, currentStep }) => {
  const agents = [
    { key: 'discovery', label: 'Discovery', icon: '🔍' },
    { key: 'validation', label: 'Validation', icon: '✓' },
    { key: 'company_profile', label: 'Company Profile', icon: '🏢' },
    { key: 'contact', label: 'Contact', icon: '👤' },
    { key: 'founder_profile', label: 'Founder Profile', icon: '👨‍💼' },
    { key: 'github', label: 'GitHub', icon: '🐙' },
    { key: 'market_analysis', label: 'Market', icon: '📈' },
    { key: 'news', label: 'News', icon: '📰' },
    { key: 'enriching', label: 'Enrichment', icon: '📊' },
    { key: 'scoring', label: 'Scoring', icon: '⭐' },
    { key: 'report', label: 'Report', icon: '📄' },
  ];

  const getAgentStatus = (agentKey: string) => {
    if (status === 'done') return 'done';
    if (status === 'error') return 'pending';
    if (status === 'queued') return 'pending';

    if (!currentStep) return 'pending';

    // Parse sub-steps like enriching:CompanyName or scoring:CompanyName
    const normalizedStep = currentStep.split(':')[0].toLowerCase();

    if (normalizedStep.includes(agentKey) || agentKey.includes(normalizedStep)) return 'running';

    const agentOrder = ['discovery', 'validation', 'company_profile', 'contact', 'founder_profile', 'github', 'market_analysis', 'news', 'enriching', 'scoring', 'report'];
    const currentIdx = agentOrder.findIndex(a => normalizedStep.includes(a));
    const agentIdx = agentOrder.indexOf(agentKey);

    if (currentIdx === -1) return 'pending';
    if (agentIdx < currentIdx) return 'done';
    return 'pending';
  };

  const getOverallStatus = () => {
    if (status === 'done') return 'Analysis Complete';
    if (status === 'error') return 'Pipeline Failed';
    if (status === 'running') return 'Pipeline Running';
    return 'System Ready';
  };

  const getStatusColor = () => {
    if (status === 'done') return '#00FF88';
    if (status === 'error') return '#FF6B6B';
    if (status === 'running') return '#D4AF37';
    return '#8E8E93';
  };

  return (
    <div className="card card-glass flex flex-col gap-6" style={{ background: 'linear-gradient(135deg, rgba(18, 18, 18, 0.85), rgba(8, 8, 8, 0.95))', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold uppercase text-secondary tracking-wider" style={{ letterSpacing: '0.08em', color: '#8E8E93' }}>
            🤖 AgentOS Pipeline Status
          </h3>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: getStatusColor(), marginTop: '8px', textShadow: `0 0 12px ${getStatusColor()}` }}>
            {getOverallStatus()}
          </div>
        </div>
        <span
          style={{
            background: `rgba(212, 175, 55, 0.12)`,
            color: '#D4AF37',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '6px 14px',
            borderRadius: '20px',
          }}
        >
          {status}
        </span>
      </div>

      {status === 'running' && currentStep && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(212, 175, 55, 0.05)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: '#D4AF37',
        }}>
          Active: <code style={{ color: '#F5D76E', fontWeight: 600 }}>{currentStep}</code>
        </div>
      )}

      {/* Agent Grid */}
      <div className="agent-grid">
        {agents.map((agent) => {
          const agentStatus = getAgentStatus(agent.key);
          return (
            <div
              key={agent.key}
              className={`agent-card ${agentStatus === 'running' ? 'running' : agentStatus === 'done' ? 'done' : ''}`}
              style={{
                animation: agentStatus === 'done' ? 'fadeIn 0.3s ease-out' : undefined,
              }}
            >
              <div className="agent-icon">{agent.icon}</div>
              <div className="agent-name">{agent.label}</div>
              <div
                className="agent-status-dot"
                style={{
                  background: agentStatus === 'running' ? 'var(--accent-primary)' : agentStatus === 'done' ? '#00FF88' : 'var(--text-secondary)',
                  boxShadow: agentStatus === 'running' ? '0 0 12px var(--accent-primary)' : agentStatus === 'done' ? '0 0 12px #00FF88' : '0 0 8px var(--text-secondary)',
                  opacity: agentStatus === 'pending' ? 0.4 : 1,
                } as React.CSSProperties}
              />
            </div>
          );
        })}
      </div>

      {/* Database Status */}
      <div className="divider" />
      <div className="flex justify-between items-center text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span>📊 Database: Connected</span>
        <span>✨ Available Agents: 11/11</span>
        <span>⚡ Status: {status === 'running' ? 'Processing' : 'Ready'}</span>
      </div>
    </div>
  );
};
