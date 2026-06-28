import axios from 'axios';
import type { ICP, JobStatus, Company, Decision } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const startAnalysis = async (icp: ICP): Promise<{ job_id: string; status: string }> => {
  const { data } = await api.post('/analyze', icp);
  return data;
};

export const getResults = async (jobId: string): Promise<JobStatus> => {
  const { data } = await api.get(`/results/${jobId}`);
  return data;
};

export const getAllCompanies = async (): Promise<{ companies: Company[]; total: number }> => {
  const { data } = await api.get('/companies');
  return data;
};

export const approveCompany = async (
  companyId: string,
  decision: Decision,
  notes: string = ''
): Promise<{ status: string }> => {
  const { data } = await api.post(`/approve/${companyId}`, { decision, notes });
  return data;
};

export const getReport = async (companyId: string): Promise<{ report: string }> => {
  const { data } = await api.get(`/company/${companyId}/report`);
  return data;
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
};
