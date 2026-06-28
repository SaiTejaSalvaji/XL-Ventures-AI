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
    <div className="page flex flex-col gap-6 fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2">
          VenturePilot AI <span>AgentOS</span>
        </h1>
        <p>Enterprise B2B Innovation Research & Autonomous Diligence Platform</p>
      </div>

      {errorMsg && (
        <div className="alert alert-error">
          <span>⚠</span> {errorMsg}
        </div>
      )}

      <div className="grid-2">
        <ICPForm onSubmit={handleStartAnalysis} isLoading={isAnalyzing} />
        
        {jobStatus ? (
          <AgentProgress status={jobStatus.status} currentStep={jobStatus.current_step} />
        ) : (
          <div className="card card-glass flex flex-col justify-between" style={{ minHeight: '340px' }}>
            <h3 className="text-sm font-bold uppercase text-secondary tracking-wider">AgentOS Status</h3>
            <div className="flex-col gap-2 my-auto" style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>💤</span>
              <p className="mt-2 text-sm">System is idle. Submit an ICP form to launch the multi-agent pipeline.</p>
            </div>
            <div className="divider" style={{ margin: '12px 0' }} />
            <div className="flex justify-between items-center text-xs text-muted">
              <span>Database Status: Connected</span>
              <span>Available Agents: 11/11</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-secondary font-bold uppercase tracking-wider text-sm" style={{ fontSize: '0.85rem' }}>
            Discovered Opportunities Pipeline
          </h2>
          <span className="badge badge-info">{companies.length} Total</span>
        </div>
        <CompanyTable companies={companies} onSelectCompany={onSelectCompany} />
      </div>
    </div>
  );
};
