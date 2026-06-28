import React, { useState, useEffect, useRef } from 'react';
import type { Company, ICP, JobStatus } from '../types';
import { startAnalysis, getResults, getAllCompanies } from '../api/client';
import { ICPForm } from '../components/ICPForm';
import { AgentProgress } from '../components/AgentProgress';
import { CompanyTable } from '../components/CompanyTable';

interface DashboardProps {
  onSelectCompany: (company: Company) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectCompany }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const pollIntervalRef = useRef<number | null>(null);

  // Fetch already analyzed companies on mount
  const fetchExistingCompanies = async () => {
    try {
      const data = await getAllCompanies();
      setCompanies(data.companies);
    } catch (err) {
      console.error('Failed to load existing companies', err);
    }
  };

  useEffect(() => {
    fetchExistingCompanies();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleStartAnalysis = async (icp: ICP) => {
    setIsAnalyzing(true);
    setErrorMsg('');
    setCompanies([]); // Clear old companies instantly so they don't see previous results!
    setJobStatus({
      job_id: '',
      status: 'queued',
      current_step: 'Initializing workflow',
      companies: [],
    });

    try {
      const { job_id } = await startAnalysis(icp);
      
      // Start polling
      pollIntervalRef.current = setInterval(async () => {
        try {
          const status = await getResults(job_id);
          setJobStatus(status);

          if (status.status === 'done') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsAnalyzing(false);
            setJobStatus(null);
            fetchExistingCompanies(); // Reload company list
          } else if (status.status === 'error') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsAnalyzing(false);
            setErrorMsg(status.current_step || 'An error occurred during execution.');
          }
        } catch (pollErr) {
          console.error('Polling error', pollErr);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsAnalyzing(false);
          setErrorMsg('Lost connection to AgentOS.');
        }
      }, 2000);

    } catch (err: any) {
      setIsAnalyzing(false);
      setJobStatus(null);
      setErrorMsg(err.response?.data?.detail || 'Failed to start AgentOS analysis.');
    }
  };

  return (
    <div className="page flex flex-col gap-8 fade-in">
      <div className="flex flex-col gap-2">
        <h1 style={{ fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
          VenturePilot <span style={{ color: 'var(--accent-primary)' }}>AI</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Enterprise B2B Innovation Research & Autonomous Diligence Platform
        </p>
      </div>

      {errorMsg && (
        <div className="alert alert-error" style={{ animation: 'slideInUp 0.3s ease-out' }}>
          <span>⚠</span> {errorMsg}
        </div>
      )}

      <div className="grid-2">
        <ICPForm onSubmit={handleStartAnalysis} isLoading={isAnalyzing} />
        
        {jobStatus ? (
          <AgentProgress status={jobStatus.status} currentStep={jobStatus.current_step} />
        ) : (
          <div className="card card-glass flex flex-col justify-between" style={{ minHeight: '440px' }}>
            <div>
              <h3 className="text-sm font-bold uppercase text-secondary tracking-wider" style={{ letterSpacing: '0.08em' }}>
                🤖 AgentOS Status
              </h3>
            </div>
            <div className="flex-col gap-3 my-auto" style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '4rem' }}>💤</span>
              <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                System is idle. Submit an ICP form to launch the multi-agent pipeline.
              </p>
            </div>
            <div className="divider" style={{ margin: '16px 0' }} />
            <div className="flex justify-between items-center text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>📊 Database: Connected</span>
              <span>✨ Agents: 11/11</span>
              <span>⚡ Ready</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-secondary font-bold uppercase tracking-wider" style={{ fontSize: '0.9rem', letterSpacing: '0.08em' }}>
            📊 Discovered Opportunities Pipeline
          </h2>
          {companies.length > 0 && (
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #00D4FF, #7B2FBE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {companies.length} Total
            </div>
          )}
        </div>
        <CompanyTable companies={companies} onSelectCompany={onSelectCompany} />
      </div>
    </div>
  );
};
