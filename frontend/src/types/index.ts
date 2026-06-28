export interface ICP {
  industry: string;
  stage: string;
  location: string;
  tech_keywords: string[];
}

export interface Founder {
  name: string;
  title: string;
  background: string;
  education: string;
  linkedin_url: string;
  past_companies: string[];
}

export interface GitHubData {
  repo_count: number;
  total_stars: number;
  total_forks: number;
  last_commit_date: string | null;
  primary_languages: string[];
  github_org_url: string | null;
  source: string;
}

export interface NewsArticle {
  title: string;
  url: string;
  published_at: string;
  source: string;
}

export interface NewsData {
  articles: NewsArticle[];
  sentiment: 'positive' | 'neutral' | 'negative';
  momentum_signals: string[];
  summary: string;
}

export interface MarketData {
  competitors: { name: string; url: string; differentiator: string }[];
  tam_estimate: string;
  market_growth_rate: string;
  key_trends: string[];
  market_stage: string;
}

export interface ScoreBreakdown {
  team: number;
  technology: number;
  traction: number;
  market: number;
}

export type Tier = 'High' | 'Medium' | 'Low';

export interface Company {
  id: string;
  name: string;
  url: string;
  industry: string;
  stage: string;
  location: string;
  description: string;
  tagline?: string;
  product?: string;
  target_customers?: string;
  tech_stack?: string[];
  employee_estimate?: string;
  business_model?: string;
  validated?: boolean;
  founders: Founder[];
  github: GitHubData;
  news: NewsData;
  market: MarketData;
  score: number;
  tier: Tier;
  rationale: string;
  score_breakdown: ScoreBreakdown;
  report: string;
  created_at: string;
}

export interface JobStatus {
  job_id: string;
  status: 'queued' | 'running' | 'done' | 'error';
  current_step: string | null;
  companies: Company[];
}

export type Decision = 'approve' | 'reject' | 'more_info';
