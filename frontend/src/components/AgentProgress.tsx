import React from 'react';

interface AgentProgressProps {
  status: 'queued' | 'running' | 'done' | 'error';
  currentStep: string | null;
}

const AGENT_ICONS: Record<string, string> = {
  discovery: '🔍',
  validation: '✓',
  enriching: '📊',
  scoring: '⭐',
  report: '📄',
  company_profile: '🏢',
  contact: '👤',
  founder_profile: '👨‍💼',
  github: '🐙',
  market_analysis: '📈',
  news: '📰',
  enrichment: '📊',
};

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
    if (status === 'running') return '#00D4FF';
    return '#8892A4';
  };

  return (
    <div className="card card-glass flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold uppercase text-secondary tracking-wider" style={{ letterSpacing: '0.08em' }}>
            🤖 AgentOS Pipeline Status
          </h3>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: getStatusColor(), marginTop: '8px', textShadow: `0 0 12px ${getStatusColor()}` }}>
            {getOverallStatus()}
          </div>
        </div>
        <span
          className="badge badge-info"
          style={{
            background: `rgba(0, 212, 255, 0.15)`,
            color: '#00D4FF',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '6px 14px',
          }}
        >
          {status}
        </span>
      </div>

      {status === 'running' && currentStep && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(0, 212, 255, 0.08)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: '#00D4FF',
        }}>
          Active: <code style={{ color: '#00E6FF', fontWeight: 600 }}>{currentStep}</code>
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
