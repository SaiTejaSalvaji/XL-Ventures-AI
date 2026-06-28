import type { ICP, JobStatus, Company, Decision } from '../types';

// Standalone Mock Memory Store for Serverless Frontend
let mockCompanies: Company[] = [];
let mockDecisions: Record<string, { decision: Decision; notes: string }> = {};
let activeJobs: Record<string, {
  status: 'queued' | 'running' | 'done' | 'error';
  currentStep: string | null;
  companies: Company[];
  progressIndex: number;
}> = {};

const MOCK_COMPANY_LIST: Company[] = [
  {
    id: 'niramai-health-1',
    name: 'Niramai Health',
    url: 'https://niramai.com',
    industry: 'AI Healthcare',
    stage: 'Seed',
    location: 'India',
    description: 'Non-invasive breast cancer screening using thermal imaging and machine learning.',
    tagline: 'AI-driven non-touch, radiation-free breast cancer screening',
    employee_estimate: '25-50',
    business_model: 'B2B SaaS / Device leasing',
    validated: true,
    score: 87,
    tier: 'High',
    score_breakdown: { team: 90, technology: 85, traction: 80, market: 92 },
    rationale: 'Highly experienced deep tech founders, validated clinical trials, and massive TAM in early cancer detection.',
    report: `## Executive Summary
Niramai Health is a deep-tech healthcare startup that has developed a novel breast cancer screening solution. Using high-resolution thermal sensing and artificial intelligence, Niramai offers a non-touch, radiation-free, painless detection method. The technology is highly scalable and suited for mass screenings.

## Technology & IP
The core intellectual property centers around **Thermalytix**, Niramai's proprietary AI engine that interprets temperature distributions across the breast tissue to detect abnormalities. They hold multiple patents in thermal analysis and signal processing.

## Market Analysis
* **TAM**: $12 Billion globally by 2028.
* **Competitors**: Traditional mammography, Cyrcadia Health.
* **Differentiator**: High accuracy at a fraction of the cost, no physical touch, and suitability for women of all age groups.

## Team
* **Dr. Geetha Manjunath (CEO)**: 25+ years in computer science research, ex-Lab Director at Xerox.
* **Nidhi Ahn (CTO)**: 12+ years in clinical software architectures.

## Investment Recommendation
We recommend a **Strong Buy** at the Seed stage. Niramai offers a highly scalable medical diagnostic platform with robust clinical validation.`,
    founders: [
      {
        name: 'Dr. Geetha Manjunath',
        title: 'CEO & Founder',
        background: 'Former Lab Director at Xerox Research India, PhD in Computer Science from IISc.',
        education: 'Indian Institute of Science (IISc), PhD',
        linkedin_url: 'https://linkedin.com/in/geethamanjunath',
        past_companies: ['Xerox Research', 'Hewlett-Packard']
      }
    ],
    github: {
      repo_count: 8,
      total_stars: 120,
      total_forks: 34,
      last_commit_date: '2026-06-25T14:30:00Z',
      primary_languages: ['Python', 'C++', 'TypeScript'],
      github_org_url: 'https://github.com/niramai-labs',
      source: 'GitHub API'
    },
    news: {
      sentiment: 'positive',
      momentum_signals: ['clinical trial approval', 'funding raise'],
      summary: 'Niramai secures clinical approval for European market expansion and launches mobile screening vans.',
      articles: [
        { title: 'Niramai secures CE Mark approval for its AI screening tool', url: 'https://niramai.com/news/ce-mark', published_at: '2026-06-15T08:00:00Z', source: 'MedTech Innovation' }
      ]
    },
    market: {
      competitors: [
        { name: 'Mammography Devices (GE/Siemens)', url: 'https://gehealthcare.com', differentiator: 'Standard clinical path but highly painful/expensive' },
        { name: 'Cyrcadia Health', url: 'https://cyrcadiahealth.com', differentiator: 'Wearable patch, less scalable for public screenings' }
      ],
      tam_estimate: '$12 Billion',
      market_growth_rate: '18% CAGR',
      key_trends: ['Mobile health diagnostic clinics', 'Thermal imaging AI analysis'],
      market_stage: 'Growing'
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'tricog-health-2',
    name: 'Tricog Health',
    url: 'https://tricog.com',
    industry: 'AI Healthcare',
    stage: 'Series A',
    location: 'India',
    description: 'Virtual cardiac diagnostic platform interpreting ECGs within minutes using custom AI algorithms.',
    tagline: 'Instant cardiac diagnosis using remote AI sensing',
    employee_estimate: '80-120',
    business_model: 'B2B SaaS / Subscription per diagnostic',
    validated: true,
    score: 82,
    tier: 'High',
    score_breakdown: { team: 88, technology: 86, traction: 75, market: 80 },
    rationale: 'Strong partnerships with clinics, over 10 million ECGs interpreted, and an impressive clinical advisory board.',
    report: `## Executive Summary
Tricog Health is a cardiac diagnostics platform that leverages AI to provide rapid ECG interpretations. By deploying cloud-connected ECG machines to remote clinics, they bridge the gap between primary care centers and certified cardiologists.

## Technology & Product
Tricog's device-agnostic API integrates with various medical machines. The ECG analysis is processed via deep neural networks, flagged for anomalies, and double-verified by a round-the-clock panel of remote medical experts.

## Market Analysis
* **TAM**: $4.5 Billion globally.
* **Competitors**: AliveCor, iRhythm.
* **Differentiator**: hybrid human-AI verification yielding >99.8% diagnostic accuracy.

## Investment Recommendation
We recommend a **Buy** at Series A. Tricog has a proven SaaS revenue stream and holds a strong competitive advantage due to its proprietary clinical dataset of 10M+ ECGs.`,
    founders: [
      {
        name: 'Dr. Charit Bhograj',
        title: 'CEO & Founder',
        background: 'Interventional cardiologist with 15+ years of clinical practice.',
        education: 'Rajiv Gandhi University of Health Sciences, MD',
        linkedin_url: 'https://linkedin.com/in/charitbhograj',
        past_companies: ['Columbia Asia', 'Fortis Healthcare']
      }
    ],
    github: {
      repo_count: 5,
      total_stars: 45,
      total_forks: 12,
      last_commit_date: '2026-06-20T09:00:00Z',
      primary_languages: ['Python', 'Go', 'Swift'],
      github_org_url: 'https://github.com/tricog-dev',
      source: 'GitHub API'
    },
    news: {
      sentiment: 'positive',
      momentum_signals: ['10M ECGs reached', 'hospital integration'],
      summary: 'Tricog diagnostic platform crosses 10 million cardiograms interpreted globally.',
      articles: [
        { title: 'Tricog partners with Apollo hospitals for cardiac care', url: 'https://tricog.com/ Apollo-partnership', published_at: '2026-06-18T10:00:00Z', source: 'Economic Times' }
      ]
    },
    market: {
      competitors: [
        { name: 'AliveCor', url: 'https://alivecor.com', differentiator: 'Consumer-focused single-lead ECGs' },
        { name: 'iRhythm Technologies', url: 'https://irhythmtech.com', differentiator: 'Patch-based diagnostic monitor, high cost' }
      ],
      tam_estimate: '$4.5 Billion',
      market_growth_rate: '14% CAGR',
      key_trends: ['Tele-health diagnostic integration', 'Cloud ECG platforms'],
      market_stage: 'Scaling'
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'sigtuple-3',
    name: 'SigTuple Technologies',
    url: 'https://sigtuple.com',
    industry: 'AI Healthcare',
    stage: 'Seed',
    location: 'India',
    description: 'AI software and hardware for automated digitization and analysis of blood, urine, and semen samples.',
    tagline: 'AI-driven digitized microscopy and analysis',
    employee_estimate: '35-50',
    business_model: 'B2B SaaS / Device sales',
    validated: true,
    score: 74,
    tier: 'Medium',
    score_breakdown: { team: 82, technology: 80, traction: 65, market: 70 },
    rationale: 'Strong IP in computer vision for pathology, though device manufacturing supply chain represents a logistical challenge.',
    report: `## Executive Summary
SigTuple creates AI-driven hardware and software to digitize and automate manual microscopy. Their smart device, **AI100**, scans blood smears and uploads them to the cloud where deep learning algorithms count and classify cells.

## Technology & Competitiveness
SigTuple replaces manual counting under traditional microscopes, reducing laboratory turnaround times from hours to minutes.

## Investment Recommendation
**Hold / Watch**. High technical complexity but scaling requires significant capex. Recommend monitoring sales traction of AI100 devices.`,
    founders: [
      {
        name: 'Tathagato Rai Dastidar',
        title: 'CEO & Founder',
        background: 'Ex-Principal Engineer at Yahoo!, expert in large-scale machine learning.',
        education: 'IIT Kharagpur, B.Tech',
        linkedin_url: 'https://linkedin.com/in/tathagato',
        past_companies: ['Yahoo!', 'Xerox Research']
      }
    ],
    github: {
      repo_count: 12,
      total_stars: 80,
      total_forks: 22,
      last_commit_date: '2026-06-27T11:00:00Z',
      primary_languages: ['Python', 'C++', 'Java'],
      github_org_url: 'https://github.com/sigtuple',
      source: 'GitHub API'
    },
    news: {
      sentiment: 'neutral',
      momentum_signals: ['product launch'],
      summary: 'SigTuple launches AI100-Smart microscopy device in South East Asian markets.',
      articles: [
        { title: 'SigTuple expands pathology tech to Indonesia', url: 'https://sigtuple.com/indonesia-launch', published_at: '2026-06-22T06:00:00Z', source: 'BioSpectrum' }
      ]
    },
    market: {
      competitors: [
        { name: 'Sysmex Corporation', url: 'https://sysmex.co.jp', differentiator: 'Market leader in hematology, heavy hardware' }
      ],
      tam_estimate: '$7 Billion',
      market_growth_rate: '11% CAGR',
      key_trends: ['Digital pathology adoption', 'Lab automation using CV'],
      market_stage: 'Emerging'
    },
    created_at: new Date().toISOString()
  }
];

const MOCK_GENERIC_COMPANY_LIST: Company[] = [
  {
    id: 'zetacorp-1',
    name: 'ZetaCorp AI',
    url: 'https://zetacorp.ai',
    industry: 'Enterprise SaaS',
    stage: 'Seed',
    location: 'USA',
    description: 'Enterprise generative AI platform for automated compliance and documentation.',
    tagline: 'AI compliance and policy validation for enterprise ops',
    employee_estimate: '10-20',
    business_model: 'B2B SaaS / Annual Subscription',
    validated: true,
    score: 89,
    tier: 'High',
    score_breakdown: { team: 92, technology: 88, traction: 82, market: 94 },
    rationale: 'Extremely high value proposition, solid early pilot pipeline, and standard recurring SaaS model with low churn.',
    report: `## Executive Summary
ZetaCorp AI solves enterprise compliance bottlenecks. Their platform parses international regulation policies and reviews corporate documentation automatically.

## Investment Recommendation
**Strong Buy**. High margin recurring B2B software with clear enterprise market pull.`,
    founders: [
      {
        name: 'Sarah Jenkins',
        title: 'CEO & Founder',
        background: 'Former compliance officer at Goldman Sachs, MBA from Harvard.',
        education: 'Harvard Business School, MBA',
        linkedin_url: 'https://linkedin.com/in/sarahjenkins-zetacorp',
        past_companies: ['Goldman Sachs', 'PwC']
      }
    ],
    github: {
      repo_count: 14,
      total_stars: 340,
      total_forks: 58,
      last_commit_date: '2026-06-26T16:00:00Z',
      primary_languages: ['TypeScript', 'Python', 'Rust'],
      github_org_url: 'https://github.com/zetacorp-ai',
      source: 'GitHub API'
    },
    news: {
      sentiment: 'positive',
      momentum_signals: ['soc2 compliance', 'enterprise launch'],
      summary: 'ZetaCorp AI closes $4M seed round led by Sequoia Capital.',
      articles: [
        { title: 'ZetaCorp AI raises $4M for compliance LLMs', url: 'https://zetacorp.ai/seed-round', published_at: '2026-06-24T12:00:00Z', source: 'TechCrunch' }
      ]
    },
    market: {
      competitors: [
        { name: 'Vanta', url: 'https://vanta.com', differentiator: 'Focused mainly on SOC2 audit trails' }
      ],
      tam_estimate: '$15 Billion',
      market_growth_rate: '22% CAGR',
      key_trends: ['Enterprise policy automation', 'Generative AI safety'],
      market_stage: 'High Growth'
    },
    created_at: new Date().toISOString()
  }
];

const AGENT_STEPS = [
  'discovery:Scanning web sources for matches',
  'validation:Verifying domain registers and WHOIS data',
  'company_profile:Scraping website, business model mapping',
  'github:Querying repositories, counting stars/forks',
  'news:Scraping NewsAPI for funding and press announcements',
  'scoring:Evaluating financial fit and team rubric',
  'report:Drafting due diligence report with Gemini 1.5 Flash',
];

export const startAnalysis = async (icp: ICP): Promise<{ job_id: string; status: string }> => {
  const jobId = 'mock-job-' + Math.random().toString(36).substring(2, 9);
  
  // Decide which list to load based on ICP industry
  const targetCompanies = (icp.industry.toLowerCase().includes('health') || icp.industry.toLowerCase().includes('med'))
    ? MOCK_COMPANY_LIST
    : MOCK_GENERIC_COMPANY_LIST;

  activeJobs[jobId] = {
    status: 'queued',
    currentStep: 'Initializing AgentOS Pipeline',
    companies: targetCompanies,
    progressIndex: -1,
  };

  // Simulate serverless pipeline run in the background
  const runSteps = () => {
    const job = activeJobs[jobId];
    if (!job) return;

    job.progressIndex++;
    job.status = 'running';

    if (job.progressIndex < AGENT_STEPS.length) {
      job.currentStep = AGENT_STEPS[job.progressIndex];
      setTimeout(runSteps, 1800); // 1.8s per step
    } else {
      job.status = 'done';
      job.currentStep = null;
      // Add companies to the main memory store
      mockCompanies = [...job.companies];
    }
  };

  setTimeout(runSteps, 1000);

  return { job_id: jobId, status: 'queued' };
};

export const getResults = async (jobId: string): Promise<JobStatus> => {
  const job = activeJobs[jobId];
  if (!job) {
    throw new Error('Job not found');
  }

  return {
    job_id: jobId,
    status: job.status,
    current_step: job.currentStep,
    companies: job.status === 'done' ? job.companies : [],
  };
};

export const getAllCompanies = async (): Promise<{ companies: Company[]; total: number }> => {
  // Sort in-memory companies by score descending
  const sorted = [...mockCompanies].sort((a, b) => b.score - a.score);
  return { companies: sorted, total: sorted.length };
};

export const approveCompany = async (
  companyId: string,
  decision: Decision,
  notes: string = ''
): Promise<{ status: string }> => {
  mockDecisions[companyId] = { decision, notes };
  
  // Persist decision into the company object
  const company = mockCompanies.find(c => c.id === companyId);
  if (company) {
    company.validated = (decision === 'approve');
  }
  
  return { status: 'recorded' };
};

export const getReport = async (companyId: string): Promise<{ report: string }> => {
  const company = mockCompanies.find(c => c.id === companyId) || 
                  MOCK_COMPANY_LIST.find(c => c.id === companyId) ||
                  MOCK_GENERIC_COMPANY_LIST.find(c => c.id === companyId);
                  
  return { report: company ? company.report : 'Report not found.' };
};

export const checkHealth = async (): Promise<boolean> => {
  // Standalone frontend is always healthy!
  return true;
};
