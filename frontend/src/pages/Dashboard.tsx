import React, { useState, useEffect, useRef } from 'react';
import type { Company, ICP, JobStatus } from '../types';
import { startAnalysis, getResults, getAllCompanies } from '../api/client';
import { ICPForm } from '../components/ICPForm';
import { AgentProgress } from '../components/AgentProgress';
import { CompanyTable } from '../components/CompanyTable';
import MagicRings from '../components/MagicRings';
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack';
import { 
  Search, 
  Cpu, 
  FileText, 
  Zap, 
  Users, 
  ShieldCheck, 
  LineChart, 
  AlertTriangle, 
  Wrench, 
  Rocket, 
  Compass, 
  Eye, 
  Terminal, 
  UserCheck, 
  TrendingUp, 
  ArrowRight 
} from 'lucide-react';

interface DashboardProps {
  onSelectCompany: (company: Company) => void;
}





// ── Dashboard ────────────────────────────────────────────────────
export const Dashboard: React.FC<DashboardProps> = ({ onSelectCompany }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showLanding, setShowLanding] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [viewState, setViewState] = useState<'form' | 'status' | 'results'>('form');

  const pollIntervalRef = useRef<number | null>(null);

  // Fetch already analyzed companies on mount
  const fetchExistingCompanies = async () => {
    setIsFetching(true);
    try {
      const data = await getAllCompanies();
      setCompanies(data.companies);
      // If companies already exist, keep landing page visible on mount
      // and only show dashboard upon user action.
    } catch (err) {
      console.error('Failed to load existing companies', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchExistingCompanies();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Reset scroll to top on landing page transition
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [showLanding]);

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
    setViewState('status');
    window.scrollTo({ top: 0, behavior: 'smooth' });

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
            await fetchExistingCompanies(); // Reload company list
            setViewState('results');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (status.status === 'error') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsAnalyzing(false);
            setJobStatus(null);
            setErrorMsg(status.current_step || 'An error occurred during execution.');
            setViewState('form');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } catch (pollErr) {
          console.error('Polling error', pollErr);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsAnalyzing(false);
          setErrorMsg('Lost connection to AgentOS.');
          setViewState('form');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 2000);

    } catch (err: any) {
      setIsAnalyzing(false);
      setJobStatus(null);
      setErrorMsg(err.response?.data?.detail || 'Failed to start AgentOS analysis.');
      setViewState('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── Landing Page ─────────────────────────────────────────────
  if (showLanding) {
    return (
      <div className="landing-page-wrap" style={{ background: '#050505', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
        {/* Section 1: Full-Screen Magic Rings Header */}
        <div style={{ position: 'relative', height: '85vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <MagicRings
              color="#D4AF37"
              colorTwo="#AA7C11"
              ringCount={8}
              speed={1.0}
              attenuation={8}
              lineThickness={2}
              baseRadius={0.25}
              radiusStep={0.08}
              scaleRate={0.08}
              opacity={1}
              followMouse={true}
              mouseInfluence={0.15}
              clickBurst={true}
            />
          </div>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center', pointerEvents: 'auto' }}>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 'clamp(2.2rem, 7vw, 5rem)', letterSpacing: '-0.04em', margin: 0, color: '#fff', textShadow: '0 0 40px rgba(212, 175, 55, 0.3)' }}>
              VenturePilot <span style={{ background: 'linear-gradient(135deg, #F3E5AB, #D4AF37, #AA7C11)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textShadow: 'none' }}>AI</span>
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(0.95rem, 3vw, 1.25rem)', fontWeight: 400, color: '#8892A4', maxWidth: '600px', lineHeight: 1.6, margin: 0 }}>
              Autonomous Multi-Agent Opportunity Discovery Platform
            </p>
            <button
              onClick={() => setShowLanding(false)}
              style={{
                padding: '16px 42px',
                fontSize: '1.05rem',
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                marginTop: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F3E5AB, #D4AF37, #AA7C11)',
                color: '#000',
                boxShadow: '0 0 30px rgba(212, 175, 55, 0.35)',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 0 45px rgba(212, 175, 55, 0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.35)'; }}
            >
              Launch Pipeline <ArrowRight size={18} />
            </button>
            <div style={{ marginTop: '36px', fontSize: '0.85rem', fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.25em', animation: 'pulse-dot 2s ease-in-out infinite' }}>
              ↓ Scroll down to explore ↓
            </div>
          </div>
        </div>

        {/* Section 1 — How It Works */}
        <div style={{ width: '100%', padding: '60px 0 50px', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.25rem',
            fontWeight: 400,
            color: '#94A3B8',
            maxWidth: '740px',
            textAlign: 'center',
            lineHeight: 1.8,
            marginBottom: '48px',
            padding: '0 24px',
          }}>
            VenturePilot AI is a cognitive multi-agent orchestration engine. It works day and night to scrape startup signals, validate metrics, index founding teams, cross-reference GitHub repositories, and construct comprehensive investment due diligence reports automatically.
          </p>
          
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.4rem', fontWeight: 800, color: '#fff', marginBottom: '30px' }}>How It Works</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '32px 24px', width: '280px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.1)', transition: 'all 0.3s ease', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#D4AF37', marginBottom: '12px', fontFamily: "'Space Grotesk', sans-serif" }}>01</div>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#D4AF37', marginBottom: '16px' }}><Search size={32} /></div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>Submit a Startup</h3>
              <p style={{ fontSize: '0.9rem', color: '#8E8E93', lineHeight: 1.5 }}>Enter a startup name, URL, or LinkedIn profile to begin.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '32px 24px', width: '280px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.1)', transition: 'all 0.3s ease', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#D4AF37', marginBottom: '12px', fontFamily: "'Space Grotesk', sans-serif" }}>02</div>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#D4AF37', marginBottom: '16px' }}><Cpu size={32} /></div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>Agents Get to Work</h3>
              <p style={{ fontSize: '0.9rem', color: '#8E8E93', lineHeight: 1.5 }}>11 specialized agents run in parallel, analyzing every dimension.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '32px 24px', width: '280px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.1)', transition: 'all 0.3s ease', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#D4AF37', marginBottom: '12px', fontFamily: "'Space Grotesk', sans-serif" }}>03</div>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#D4AF37', marginBottom: '16px' }}><FileText size={32} /></div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>Get Your Report</h3>
              <p style={{ fontSize: '0.9rem', color: '#8E8E93', lineHeight: 1.5 }}>Receive a comprehensive due diligence report in under 5 minutes.</p>
            </div>
          </div>
        </div>

        {/* Section 2 — Stats Bar */}
        <div style={{ width: '100%', background: '#0C0C0C', padding: '28px 0', borderTop: '1px solid rgba(212, 175, 55, 0.15)', borderBottom: '1px solid rgba(212, 175, 55, 0.15)', display: 'flex', justifyContent: 'center', gap: '64px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>11</div>
            <div style={{ fontSize: '0.9rem', color: '#8E8E93', marginTop: '4px' }}>Autonomous Agents</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>&lt; 5 min</div>
            <div style={{ fontSize: '0.9rem', color: '#8E8E93', marginTop: '4px' }}>Analysis Time</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>10+</div>
            <div style={{ fontSize: '0.9rem', color: '#8E8E93', marginTop: '4px' }}>Data Sources</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>100%</div>
            <div style={{ fontSize: '0.9rem', color: '#8E8E93', marginTop: '4px' }}>Autonomous</div>
          </div>
        </div>

        {/* Section 3 — Why VenturePilot */}
        <div style={{ width: '100%', padding: '80px 0', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.4rem', fontWeight: 800, color: '#fff', marginBottom: '40px' }}>Why VenturePilot</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', width: '100%', maxWidth: '960px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '28px 24px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.1)', transition: 'all 0.3s ease' }}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#D4AF37', marginBottom: '16px' }}><Zap size={28} /></div>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>Parallel Execution</h3>
              <p style={{ fontSize: '0.92rem', color: '#8E8E93', lineHeight: 1.5 }}>All 11 agents run simultaneously, not sequentially.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '28px 24px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.1)', transition: 'all 0.3s ease' }}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#D4AF37', marginBottom: '16px' }}><Search size={28} /></div>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>Deep Signal Scraping</h3>
              <p style={{ fontSize: '0.92rem', color: '#8E8E93', lineHeight: 1.5 }}>Pulls live data from news, GitHub, LinkedIn, and more.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '28px 24px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.1)', transition: 'all 0.3s ease' }}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#D4AF37', marginBottom: '16px' }}><LineChart size={28} /></div>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>Financial Modeling</h3>
              <p style={{ fontSize: '0.92rem', color: '#8E8E93', lineHeight: 1.5 }}>Automated revenue, burn rate, and runway analysis.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '28px 24px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.1)', transition: 'all 0.3s ease' }}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#D4AF37', marginBottom: '16px' }}><Users size={28} /></div>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>Founder Intelligence</h3>
              <p style={{ fontSize: '0.92rem', color: '#8E8E93', lineHeight: 1.5 }}>Cross-references team credibility and track record.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '28px 24px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.1)', transition: 'all 0.3s ease' }}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#D4AF37', marginBottom: '16px' }}><ShieldCheck size={28} /></div>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>Risk Flagging</h3>
              <p style={{ fontSize: '0.92rem', color: '#8E8E93', lineHeight: 1.5 }}>Identifies red flags before you write the check.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '28px 24px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.1)', transition: 'all 0.3s ease' }}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#D4AF37', marginBottom: '16px' }}><FileText size={28} /></div>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>Investor Reports</h3>
              <p style={{ fontSize: '0.92rem', color: '#8E8E93', lineHeight: 1.5 }}>Outputs structured PDF-style due diligence reports.</p>
    </div>
  </div>
</div>

        {/* Section 3: Scroll Stack Cards Product Details */}
        <div style={{ padding: '100px 20px', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Platform Capabilities
            </h2>
            <p style={{ color: '#8E8E93', fontSize: '1.1rem', marginTop: '12px' }}>
              How our 11 autonomous agents diligence startup pipelines
            </p>
          </div>

          <ScrollStack useWindowScroll={true} itemDistance={100} itemScale={0.008} itemStackDistance={14} blurAmount={2}>
            <ScrollStackItem key={1}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', color: '#D4AF37' }}><Search size={36} /></div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>01 · Autonomous Sourcing</h3>
                <p style={{ fontSize: '1rem', color: '#8E8E93', lineHeight: 1.6 }}>
                  VenturePilot deploys specialized discovery agents that crawl startup directories, repositories, and search engines to capture early signals of innovative companies.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={2}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', color: '#D4AF37' }}><Terminal size={36} /></div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>02 · Deep Technical Diligence</h3>
                <p style={{ fontSize: '1rem', color: '#8E8E93', lineHeight: 1.6 }}>
                  Enrichment agents interface directly with open-source repositories to inspect code velocity, language composition, stars, and forks, yielding precise technical scores.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={3}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', color: '#D4AF37' }}><UserCheck size={36} /></div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>03 · Executive Profiles</h3>
                <p style={{ fontSize: '1rem', color: '#8E8E93', lineHeight: 1.6 }}>
                  Founder research agents compile detailed executive bios, analyzing historical exits, educational credentials, and past company associations to score team quality.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={4}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', color: '#D4AF37' }}><FileText size={36} /></div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>04 · Automated Due Diligence</h3>
                <p style={{ fontSize: '1rem', color: '#8E8E93', lineHeight: 1.6 }}>
                  A direct integration with Google Gemini synthesizes all unstructured search results, competitor analysis, and news sentiment into a clean investment report.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={5}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', color: '#D4AF37' }}><Compass size={36} /></div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>05 · Market Intelligence</h3>
                <p style={{ fontSize: '1rem', color: '#8E8E93', lineHeight: 1.6 }}>
                  Scans market data, trends, and funding events to surface emerging opportunities.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={6}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', color: '#D4AF37' }}><Eye size={36} /></div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>06 · Competitor Analysis</h3>
                <p style={{ fontSize: '1rem', color: '#8E8E93', lineHeight: 1.6 }}>
                  Benchmarks target startups against rivals, uncovering strengths and gaps.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={7}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', color: '#D4AF37' }}><Users size={36} /></div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>07 · Founder & Team Profiler</h3>
                <p style={{ fontSize: '1rem', color: '#8E8E93', lineHeight: 1.6 }}>
                  Evaluates founding team experience, past exits, and network influence.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={8}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', color: '#D4AF37' }}><TrendingUp size={36} /></div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>08 · Financial Modeling</h3>
                <p style={{ fontSize: '1rem', color: '#8E8E93', lineHeight: 1.6 }}>
                  Builds financial projections, unit economics, and valuation scenarios.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={9}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', color: '#D4AF37' }}><AlertTriangle size={36} /></div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>09 · Risk Assessment</h3>
                <p style={{ fontSize: '1rem', color: '#8E8E93', lineHeight: 1.6 }}>
                  Identifies regulatory, technical, and market risks with scoring.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={10}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', color: '#D4AF37' }}><Wrench size={36} /></div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>10 · Tech Stack Evaluator</h3>
                <p style={{ fontSize: '1rem', color: '#8E8E93', lineHeight: 1.6 }}>
                  Analyzes codebases, dependencies, and scalability of technology stacks.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={11}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', color: '#D4AF37' }}><Rocket size={36} /></div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>11 · Exit Strategy</h3>
                <p style={{ fontSize: '1rem', color: '#8E8E93', lineHeight: 1.6 }}>
                  Models potential exit pathways, M&A fit, and ROI timelines.
                </p>
              </div>
            </ScrollStackItem>
          </ScrollStack>
        </div>

        {/* Section 4: Final Call to Action */}
        <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px', textAlign: 'center', background: '#0C0C0C', borderTop: '1px solid rgba(212, 175, 55, 0.15)', padding: '100px 20px' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.6rem, 5vw, 3rem)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Ready to discover your next opportunity?
          </h2>
          <p style={{ color: '#8E8E93', fontSize: '1.2rem', maxWidth: '600px', margin: 0, lineHeight: 1.7 }}>
            Access the interactive multi-agent discovery panel to configure your Ideal Customer Profile and run the pipeline.
          </p>
          <button
            className="btn"
            onClick={() => setShowLanding(false)}
            style={{ 
              padding: '18px 56px', 
              fontSize: '1.15rem', 
              fontWeight: 700, 
              fontFamily: "'Space Grotesk', sans-serif", 
              marginTop: '20px', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F3E5AB, #D4AF37, #AA7C11)',
              color: '#000',
              boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            Launch Discovery Pipeline <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // ── Main Dashboard (after landing) ───────────────────────────
  return (
    <div className="page flex flex-col gap-8 fade-in">
      <div className="flex flex-col gap-2">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setShowLanding(true);
              setErrorMsg('');
              setJobStatus(null);
              setIsAnalyzing(false);
              setIsFetching(false);
              setViewState('form');
            }}
            style={{ 
              fontSize: '0.8rem', 
              padding: '8px 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            ← Back to Home
          </button>
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4.5vw, 2.2rem)', letterSpacing: '-0.02em', fontFamily: "'Sora', sans-serif", margin: 0 }}>
              VenturePilot{' '}
              <span style={{
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>AI</span>
            </h1>
            <p style={{ color: '#8E8E93', fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)', margin: '4px 0 0' }}>
              Enterprise B2B Innovation Research &amp; Autonomous Diligence Platform
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-error" style={{ animation: 'slideInUp 0.3s ease-out' }}>
          <span>⚠</span> {errorMsg}
        </div>
      )}

      {viewState === 'form' && (
        <div style={{ width: '100%' }}>
          <ICPForm onSubmit={handleStartAnalysis} isLoading={isAnalyzing} />
        </div>
      )}

      {viewState === 'status' && jobStatus && (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <AgentProgress status={jobStatus.status} currentStep={jobStatus.current_step} />
        </div>
      )}

      {viewState === 'results' && (
        <div className="flex flex-col gap-6 mt-2">
          <div className="flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
            <div>
              <h2 className="text-secondary font-bold uppercase tracking-wider" style={{ fontSize: '1rem', letterSpacing: '0.08em', margin: 0 }}>
                ◈ Discovered Opportunities Pipeline
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#8E8E93' }}>
                Targeting matches compiled by your 11 diligence agents.
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {companies.length > 0 && (
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  fontFamily: "'Sora', sans-serif",
                  background: 'var(--accent-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {companies.length} Total
                </div>
              )}
              
              <button
                className="btn"
                onClick={() => setViewState('form')}
                style={{
                  padding: '10px 20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  borderRadius: '8px',
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  color: '#D4AF37',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.08)'}
              >
                ✎ Modify ICP
              </button>
            </div>
          </div>
          <CompanyTable companies={companies} onSelectCompany={onSelectCompany} isLoading={isFetching} />
        </div>
      )}
    </div>
  );
};
