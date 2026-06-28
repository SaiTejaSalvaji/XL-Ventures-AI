import React from 'react';

interface AgentProgressProps {
  status: 'queued' | 'running' | 'done' | 'error';
  currentStep: string | null;
}

export const AgentProgress: React.FC<AgentProgressProps> = ({ status, currentStep }) => {
  const steps = [
    { key: 'discovery', label: 'Discovery Agent', desc: 'Searching Google CSE & directories' },
    { key: 'validation', label: 'Validation Agent', desc: 'Verifying domains and live check' },
    { key: 'enriching', label: 'Enrichment Agents', desc: 'Retrieving profiles, GitHub metrics, news' },
    { key: 'scoring', label: 'Scoring Agent', desc: 'Running rubric-based investment scoring' },
    { key: 'report', label: 'Report Agent', desc: 'Writing comprehensive due-diligence report' },
  ];

  const getStepStatus = (stepKey: string) => {
    if (status === 'done') return 'done';
    if (status === 'error') return 'pending';
    if (status === 'queued') return 'pending';

    if (!currentStep) return 'pending';

    // Parse sub-steps like enriching:CompanyName or scoring:CompanyName
    const normalizedStep = currentStep.split(':')[0];

    if (normalizedStep === stepKey) return 'active';

    const stepOrder = ['discovery', 'validation', 'enriching', 'scoring', 'report'];
    const currentIdx = stepOrder.indexOf(normalizedStep);
    const stepIdx = stepOrder.indexOf(stepKey);

    if (stepIdx < currentIdx) return 'done';
    return 'pending';
  };

  return (
    <div className="card card-glass flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase text-secondary tracking-wider">AgentOS Pipeline Status</h3>
        <span className={`badge ${
          status === 'done' ? 'badge-high' : 
          status === 'error' ? 'badge-low' : 
          status === 'running' ? 'badge-purple' : 'badge-info'
        }`}>
          {status}
        </span>
      </div>

      {status === 'running' && currentStep && (
        <div className="text-xs text-accent truncate">
          Active target: <code style={{color: '#93c5fd'}}>{currentStep}</code>
        </div>
      )}

      <div className="steps-wrap mt-2">
        {steps.map((step) => {
          const stepStatus = getStepStatus(step.key);
          return (
            <div key={step.key} className={`step-item ${stepStatus}`}>
              <div className="step-icon">
                {stepStatus === 'done' ? '✓' : stepStatus === 'active' ? '⚡' : '○'}
              </div>
              <div className="flex-col">
                <div className="font-bold text-sm" style={{ color: stepStatus === 'active' ? 'var(--accent-light)' : stepStatus === 'done' ? 'var(--green)' : 'inherit' }}>
                  {step.label}
                </div>
                <div className="text-xs text-muted">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
