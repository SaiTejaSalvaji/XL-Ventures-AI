import React, { useState, useEffect, useRef } from 'react';
import type { Company, ICP, JobStatus } from '../types';
import { startAnalysis, getResults, getAllCompanies } from '../api/client';
import { ICPForm } from '../components/ICPForm';
import { AgentProgress } from '../components/AgentProgress';
import { CompanyTable } from '../components/CompanyTable';
import MagicRings from '../components/MagicRings';
import ScrollReveal from '../components/ScrollReveal';
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack';

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

  const pollIntervalRef = useRef<number | null>(null);

  // Fetch already analyzed companies on mount
  const fetchExistingCompanies = async () => {
    setIsFetching(true);
    try {
      const data = await getAllCompanies();
      setCompanies(data.companies);
      // If companies already exist, skip landing
      if (data.companies.length > 0) {
        setShowLanding(false);
      }
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

  // ── Landing Page ─────────────────────────────────────────────
  if (showLanding) {
    return (
      <div className="landing-page-wrap" style={{ background: '#0A0F1E', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
        {/* Section 1: Full-Screen Magic Rings Header */}
        <div style={{ position: 'relative', height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <MagicRings
              color="#00D4FF"
              colorTwo="#7B2FBE"
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
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center', pointerEvents: 'none' }}>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '5rem', letterSpacing: '-0.04em', margin: 0, color: '#fff', textShadow: '0 0 40px rgba(0, 212, 255, 0.4)' }}>
              VenturePilot <span style={{ background: 'linear-gradient(135deg, #00D4FF, #7B2FBE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textShadow: 'none' }}>AI</span>
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.25rem', fontWeight: 400, color: '#8892A4', maxWidth: '600px', lineHeight: 1.6, margin: 0 }}>
              Autonomous Multi-Agent Opportunity Discovery Platform
            </p>
            <div style={{ marginTop: '48px', fontSize: '0.85rem', fontWeight: 700, color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '0.25em', animation: 'pulse-dot 2s ease-in-out infinite' }}>
              ↓ Scroll down to explore ↓
            </div>
          </div>
        </div>

        {/* Section 2: Scroll Reveal Effect Description */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', background: '#090d1a' }}>
          <ScrollReveal baseOpacity={0.08} enableBlur={true} baseRotation={3} blurStrength={8}>
            <p style={{
              fontSize: '1.3rem',
              fontWeight: 400,
              lineHeight: 1.7,
              maxWidth: '720px',
              margin: '0 auto',
              padding: '2rem 1.5rem',
              background: 'linear-gradient(135deg, #7c3aed, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              VenturePilot AI is a cognitive multi-agent orchestration engine. It works day and night to scrape startup signals, validate metrics, index founding teams, cross-reference GitHub repositories, and construct comprehensive investment due diligence reports automatically.
            </p>
          </ScrollReveal>
        </div>
{/* Section 1 — How It Works */}
<div style={{ width: '100%', padding: '80px 0', background: '#0A0F1E', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.4rem', fontWeight: 800, color: '#fff', marginBottom: '40px' }}>How It Works</h2>
  <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', width: '260px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '2px solid transparent', transition: 'border 0.3s' }}
         onMouseEnter={e => e.currentTarget.style.border = '2px solid #7c3aed'}
         onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}>
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>1</div>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔎</div>
      <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>Submit a Startup</h3>
      <p style={{ fontSize: '0.95rem', color: '#8892A4' }}>Enter a startup name, URL, or LinkedIn profile to begin.</p>
    </div>
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', width: '260px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '2px solid transparent', transition: 'border 0.3s' }}
         onMouseEnter={e => e.currentTarget.style.border = '2px solid #7c3aed'}
         onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}>
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>2</div>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚙️</div>
      <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>Agents Get to Work</h3>
      <p style={{ fontSize: '0.95rem', color: '#8892A4' }}>11 specialized agents run in parallel, analyzing every dimension.</p>
    </div>
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', width: '260px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '2px solid transparent', transition: 'border 0.3s' }}
         onMouseEnter={e => e.currentTarget.style.border = '2px solid #7c3aed'}
         onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}>
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>3</div>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
      <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>Get Your Report</h3>
      <p style={{ fontSize: '0.95rem', color: '#8892A4' }}>Receive a comprehensive due diligence report in under 5 minutes.</p>
    </div>
  </div>
</div>

{/* Section 2 — Stats Bar */}
<div style={{ width: '100%', background: '#090d1a', padding: '24px 0', borderTop: '1px solid #1a1f2b', borderBottom: '1px solid #1a1f2b', display: 'flex', justifyContent: 'center', gap: '48px' }}>
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #7c3aed, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>11</div>
    <div style={{ fontSize: '0.9rem', color: '#8892A4' }}>Autonomous Agents</div>
  </div>
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #7c3aed, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>&lt; 5 min</div>
    <div style={{ fontSize: '0.9rem', color: '#8892A4' }}>Analysis Time</div>
  </div>
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #7c3aed, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>10+</div>
    <div style={{ fontSize: '0.9rem', color: '#8892A4' }}>Data Sources</div>
  </div>
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #7c3aed, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>100%</div>
    <div style={{ fontSize: '0.9rem', color: '#8892A4' }}>Autonomous</div>
  </div>
</div>

{/* Section 3 — Why VenturePilot */}
<div style={{ width: '100%', padding: '80px 0', background: '#0A0F1E', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.4rem', fontWeight: 800, color: '#fff', marginBottom: '40px' }}>Why VenturePilot</h2>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', width: '100%', maxWidth: '960px' }}>
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '2px solid transparent', transition: 'border 0.3s' }}
         onMouseEnter={e => e.currentTarget.style.border = '2px solid #7c3aed'}
         onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}>
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚡</div>
      <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>Parallel Execution</h3>
      <p style={{ fontSize: '0.95rem', color: '#8892A4' }}>All 11 agents run simultaneously, not sequentially.</p>
    </div>
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '2px solid transparent', transition: 'border 0.3s' }}
         onMouseEnter={e => e.currentTarget.style.border = '2px solid #7c3aed'}
         onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}>
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
      <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>Deep Signal Scraping</h3>
      <p style={{ fontSize: '0.95rem', color: '#8892A4' }}>Pulls live data from news, GitHub, LinkedIn, and more.</p>
    </div>
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '2px solid transparent', transition: 'border 0.3s' }}
         onMouseEnter={e => e.currentTarget.style.border = '2px solid #7c3aed'}
         onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}>
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📊</div>
      <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>Financial Modeling</h3>
      <p style={{ fontSize: '0.95rem', color: '#8892A4' }}>Automated revenue, burn rate, and runway analysis.</p>
    </div>
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '2px solid transparent', transition: 'border 0.3s' }}
         onMouseEnter={e => e.currentTarget.style.border = '2px solid #7c3aed'}
         onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}>
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🧠</div>
      <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>Founder Intelligence</h3>
      <p style={{ fontSize: '0.95rem', color: '#8892A4' }}>Cross-references team credibility and track record.</p>
    </div>
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '2px solid transparent', transition: 'border 0.3s' }}
         onMouseEnter={e => e.currentTarget.style.border = '2px solid #7c3aed'}
         onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}>
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🛡️</div>
      <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>Risk Flagging</h3>
      <p style={{ fontSize: '0.95rem', color: '#8892A4' }}>Identifies red flags before you write the check.</p>
    </div>
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '2px solid transparent', transition: 'border 0.3s' }}
         onMouseEnter={e => e.currentTarget.style.border = '2px solid #7c3aed'}
         onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}>
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📄</div>
      <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>Investor-Ready Reports</h3>
      <p style={{ fontSize: '0.95rem', color: '#8892A4' }}>Outputs structured PDF-style due diligence reports.</p>
    </div>
  </div>
</div>

        {/* Section 3: Scroll Stack Cards Product Details */}
        <div style={{ padding: '100px 20px', background: '#0A0F1E', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Platform Capabilities
            </h2>
            <p style={{ color: '#8892A4', fontSize: '1.1rem', marginTop: '12px' }}>
              How our 11 autonomous agents diligence startup pipelines
            </p>
          </div>

          <ScrollStack useWindowScroll={true} itemDistance={100} itemScale={0.025} itemStackDistance={24} blurAmount={2}>
            <ScrollStackItem key={1}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>🔍</div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>01 · Autonomous Sourcing</h3>
                <p style={{ fontSize: '1rem', color: '#8892A4', lineHeight: 1.6 }}>
                  VenturePilot deploys specialized discovery agents that crawl startup directories, repositories, and search engines to capture early signals of innovative companies.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={2}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>🐙</div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>02 · Deep Technical Diligence</h3>
                <p style={{ fontSize: '1rem', color: '#8892A4', lineHeight: 1.6 }}>
                  Enrichment agents interface directly with open-source repositories to inspect code velocity, language composition, stars, and forks, yielding precise technical scores.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={3}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>👨‍💼</div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>03 · Executive Profiles</h3>
                <p style={{ fontSize: '1rem', color: '#8892A4', lineHeight: 1.6 }}>
                  Founder research agents compile detailed executive bios, analyzing historical exits, educational credentials, and past company associations to score team quality.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={4}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>📄</div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>04 · Automated Due Diligence</h3>
                <p style={{ fontSize: '1rem', color: '#8892A4', lineHeight: 1.6 }}>
                  A direct integration with Google Gemini synthesizes all unstructured search results, competitor analysis, and news sentiment into a clean investment report.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={5}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>🧭</div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>05 · Market Intelligence</h3>
                <p style={{ fontSize: '1rem', color: '#8892A4', lineHeight: 1.6 }}>
                  Scans market data, trends, and funding events to surface emerging opportunities.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem key={6}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>🕵️‍♂️</div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>06 · Competitor Analysis</h3>
                <p style={{ fontSize: '1rem', color: '#8892A4', lineHeight: 1.6 }}>
                  Benchmarks target startups against rivals, uncovering strengths and gaps.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>👥</div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>07 · Founder & Team Profiler</h3>
                <p style={{ fontSize: '1rem', color: '#8892A4', lineHeight: 1.6 }}>
                  Evaluates founding team experience, past exits, and network influence.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>📊</div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>08 · Financial Modeling</h3>
                <p style={{ fontSize: '1rem', color: '#8892A4', lineHeight: 1.6 }}>
                  Builds financial projections, unit economics, and valuation scenarios.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>⚠️</div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>09 · Risk Assessment</h3>
                <p style={{ fontSize: '1rem', color: '#8892A4', lineHeight: 1.6 }}>
                  Identifies regulatory, technical, and market risks with scoring.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>🛠️</div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>10 · Tech Stack Evaluator</h3>
                <p style={{ fontSize: '1rem', color: '#8892A4', lineHeight: 1.6 }}>
                  Analyzes codebases, dependencies, and scalability of technology stacks.
                </p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>🚀</div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff' }}>11 · Exit Strategy</h3>
                <p style={{ fontSize: '1rem', color: '#8892A4', lineHeight: 1.6 }}>
                  Models potential exit pathways, M&A fit, and ROI timelines.
                </p>
              </div>
            </ScrollStackItem>
          </ScrollStack>
        </div>

        {/* Section 4: Final Call to Action */}
        <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px', textAlign: 'center', background: '#090d1a', borderTop: '1px solid rgba(108, 63, 232, 0.15)', padding: '100px 20px' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '3rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Ready to discover your next opportunity?
          </h2>
          <p style={{ color: '#8892A4', fontSize: '1.2rem', maxWidth: '600px', margin: 0, lineHeight: 1.7 }}>
            Access the interactive multi-agent discovery panel to configure your Ideal Customer Profile and run the pipeline.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setShowLanding(false)}
            style={{ padding: '18px 56px', fontSize: '1.15rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginTop: '20px', borderRadius: '12px' }}
          >
            Launch Discovery Pipeline →
          </button>
        </div>
      </div>
    );
  }

  // ── Main Dashboard (after landing) ───────────────────────────
  return (
    <div className="page flex flex-col gap-8 fade-in">
      <div className="flex flex-col gap-2">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', letterSpacing: '-0.02em', fontFamily: "'Sora', sans-serif", margin: 0 }}>
              VenturePilot{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--violet), var(--gold))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>AI</span>
            </h1>
            <p style={{ color: 'var(--text-1)', fontSize: '1rem', margin: '4px 0 24px' }}>
              Enterprise B2B Innovation Research &amp; Autonomous Diligence Platform
            </p>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setShowLanding(true);
              setErrorMsg('');
              setJobStatus(null);
              setIsAnalyzing(false);
              setIsFetching(false);
            }}
            style={{ fontSize: '0.8rem', padding: '8px 16px' }}
          >
            ← Landing
          </button>
        </div>
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
                ◈ AgentOS Status
              </h3>
            </div>
            <div className="flex-col gap-3 my-auto" style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '4rem' }}>💤</span>
              <p style={{ marginTop: '16px', color: 'var(--text-1)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                System is idle. Submit an ICP form to launch the multi-agent pipeline.
              </p>
            </div>
            <div className="divider" style={{ margin: '16px 0' }} />
            <div className="flex justify-between items-center text-xs" style={{ color: 'var(--text-2)' }}>
              <span>📊 Database: Connected</span>
              <span>✦ Agents: 11/11</span>
              <span>⚡ Ready</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-secondary font-bold uppercase tracking-wider" style={{ fontSize: '0.9rem', letterSpacing: '0.08em' }}>
            ◈ Discovered Opportunities Pipeline
          </h2>
          {companies.length > 0 && (
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              fontFamily: "'Sora', sans-serif",
              background: 'linear-gradient(135deg, var(--violet), var(--gold))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {companies.length} Total
            </div>
          )}
        </div>
        <CompanyTable companies={companies} onSelectCompany={onSelectCompany} isLoading={isFetching} />
      </div>
    </div>
  );
};
