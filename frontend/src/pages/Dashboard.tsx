import React, { useState, useEffect, useRef } from 'react';
import type { Company, ICP, JobStatus } from '../types';
import { startAnalysis, getResults, getAllCompanies } from '../api/client';
import { ICPForm } from '../components/ICPForm';
import { AgentProgress } from '../components/AgentProgress';
import { CompanyTable } from '../components/CompanyTable';
import MagicRings from '../components/MagicRings';

interface DashboardProps {
  onSelectCompany: (company: Company) => void;
}



// ── Agent Data ───────────────────────────────────────────────────
const LANDING_AGENTS = [
  { num: '01', icon: '🔍', name: 'Discovery', desc: 'Finds startups matching your ICP across the web' },
  { num: '02', icon: '✓', name: 'Validation', desc: 'Verifies company legitimacy and data accuracy' },
  { num: '03', icon: '🏢', name: 'Company Profile', desc: 'Builds deep company profile with business model analysis' },
  { num: '04', icon: '👤', name: 'Contact Finder', desc: 'Identifies key decision-makers and contact info' },
  { num: '05', icon: '👨‍💼', name: 'Founder Intel', desc: 'Profiles founders: education, experience, past ventures' },
  { num: '06', icon: '🐙', name: 'GitHub Metrics', desc: 'Analyzes open-source activity and code velocity' },
  { num: '07', icon: '📈', name: 'Market Analysis', desc: 'Estimates TAM, CAGR, competitive landscape and trends' },
  { num: '08', icon: '📰', name: 'News & Sentiment', desc: 'Scans recent press and funding announcements' },
  { num: '09', icon: '📊', name: 'Enrichment', desc: 'Aggregates signals into unified intelligence record' },
  { num: '10', icon: '⭐', name: 'Scoring Engine', desc: 'Scores team, tech, traction and market fit 0–100' },
  { num: '11', icon: '📄', name: 'Due Diligence', desc: 'Generates a full AI-powered DD report for review' },
];

const TILE_COLORS = [
  { bg: 'rgba(108, 63, 232, 0.18)', border: 'rgba(108, 63, 232, 0.35)', text: 'var(--violet-bright)' },
  { bg: 'rgba(245, 166, 35, 0.15)', border: 'rgba(245, 166, 35, 0.3)',  text: 'var(--gold)' },
  { bg: 'rgba(16, 217, 140, 0.15)', border: 'rgba(16, 217, 140, 0.3)',  text: 'var(--success)' },
];

// ── Dashboard ────────────────────────────────────────────────────
export const Dashboard: React.FC<DashboardProps> = ({ onSelectCompany }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showLanding, setShowLanding] = useState(true);
  const [isIntroActive, setIsIntroActive] = useState(true);
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
    if (isIntroActive) {
      return (
        <div 
          onClick={() => setIsIntroActive(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#0A0F1E',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer',
            overflow: 'hidden',
          }}
          className="fade-in"
        >
          {/* Full-screen MagicRings background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            opacity: 0.85,
          }}>
            <MagicRings
              color="#00D4FF"
              colorTwo="#7B2FBE"
              ringCount={8}
              speed={1.2}
              attenuation={8}
              lineThickness={2}
              baseRadius={0.25}
              radiusStep={0.08}
              scaleRate={0.08}
              opacity={1}
              blur={0}
              noiseAmount={0.05}
              followMouse={true}
              mouseInfluence={0.15}
              clickBurst={true}
            />
          </div>

          {/* Content Container */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            {/* Glowing Animated Logo */}
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: '4.5rem',
              letterSpacing: '-0.04em',
              margin: 0,
              color: '#fff',
              textShadow: '0 0 40px rgba(0, 212, 255, 0.4)',
            }}>
              VenturePilot{' '}
              <span style={{
                background: 'linear-gradient(135deg, #00D4FF, #7B2FBE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none',
              }}>AI</span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.1rem',
              color: '#8892A4',
              maxWidth: '500px',
              lineHeight: 1.6,
              margin: 0,
            }}>
              Autonomous Multi-Agent Opportunity Discovery Platform
            </p>

            {/* Pulsating enter prompt */}
            <div style={{
              marginTop: '16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#00D4FF',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }}>
              ✦ Click anywhere to enter ✦
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="page flex flex-col gap-8 fade-in" style={{ maxWidth: 1440, margin: '0 auto' }}>

        {/* ── SECTION A: Hero ──────────────────────────── */}
        <div className="hero-grid" style={{
          gap: '48px',
          alignItems: 'center',
          minHeight: '520px',
          padding: '24px 0',
        }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Pill badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                background: 'rgba(108, 63, 232, 0.1)',
                border: '1px solid rgba(108, 63, 232, 0.3)',
                borderRadius: '100px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--violet-bright)',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {/* Pulsing gold dot */}
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--gold)',
                  boxShadow: '0 0 10px var(--gold)',
                  animation: 'pulse-dot 2s ease-in-out infinite',
                  flexShrink: 0,
                }} />
                XL Ventures Agentic AI Platform
              </div>
            </div>

            {/* H1 */}
            <h1 style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: '3rem',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: 'var(--text-0)',
              margin: 0,
            }}>
              Discover Startups<br />with{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--violet), var(--gold))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                11 AI Agents
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-1)',
              lineHeight: 1.7,
              maxWidth: '480px',
              margin: 0,
            }}>
              VenturePilot AI deploys a coordinated multi-agent pipeline to autonomously
              discover, validate, and score B2B startups — from first signal to full
              due diligence — without human bottlenecks.
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {[
                { value: '11', label: 'Specialized Agents' },
                { value: '4', label: 'Score Dimensions' },
                { value: '100%', label: 'Autonomous' },
              ].map(stat => (
                <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.8rem',
                    background: 'linear-gradient(135deg, var(--violet-bright), var(--gold))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.1,
                  }}>{stat.value}</span>
                  <span style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-2)',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>{stat.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowLanding(false)}
                style={{
                  padding: '14px 32px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  fontFamily: "'Sora', sans-serif",
                  letterSpacing: '-0.01em',
                }}
              >
                Launch Discovery →
              </button>
              <a
                href="#agents"
                className="btn btn-ghost"
                style={{ padding: '14px 24px', fontSize: '0.95rem', fontWeight: 600 }}
              >
                Meet the Agents
              </a>
            </div>
          </div>

          {/* Right Column — Constellation Canvas */}
          <div style={{
            position: 'relative',
            borderRadius: '20px',
            border: '1px solid rgba(108, 63, 232, 0.25)',
            background: 'rgba(10, 13, 24, 0.7)',
            backdropFilter: 'blur(12px)',
            height: '460px',
            overflow: 'hidden',
          }}>
            {/* Top-left label */}
            <div style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{
                fontSize: '0.7rem',
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--text-2)',
                fontWeight: 500,
              }}>
                Multi-Agent Network · Live
              </span>
            </div>

            {/* Top-right ACTIVE badge */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--success)',
                boxShadow: '0 0 10px var(--success)',
                animation: 'pulse-dot 1.5s ease-in-out infinite',
              }} />
              <span style={{
                fontSize: '0.65rem',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: 'var(--success)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>ACTIVE</span>
            </div>

            <MagicRings
              color="#fc42ff"
              colorTwo="#42fcff"
              ringCount={6}
              speed={1.0}
              attenuation={10}
              lineThickness={2}
              baseRadius={0.35}
              radiusStep={0.1}
              scaleRate={0.1}
              opacity={1}
              blur={0}
              noiseAmount={0.1}
              rotation={0}
              ringGap={1.5}
              fadeIn={0.7}
              fadeOut={0.5}
              followMouse={true}
              mouseInfluence={0.2}
              hoverScale={1.2}
              parallax={0.05}
              clickBurst={true}
            />
          </div>
        </div>

        {/* ── SECTION B: Agent Cards ───────────────────── */}
        <div id="agents" style={{ scrollMarginTop: '80px', marginTop: '48px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'var(--text-0)',
              marginBottom: '8px',
            }}>
              ◈ The 11-Agent Pipeline
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-2)', margin: 0 }}>
              Each agent specializes in a distinct phase of B2B startup intelligence gathering.
            </p>
          </div>

          <div className="agents-grid-landing">
            {LANDING_AGENTS.map((agent, idx) => {
              const tile = TILE_COLORS[idx % 3];
              return (
                <div
                  key={agent.num}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    padding: '22px',
                    animation: `fadeIn 0.5s ease-out ${idx * 40}ms backwards`,
                    cursor: 'default',
                  }}
                >
                  {/* Icon tile + Agent num */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: tile.bg,
                      border: `1px solid ${tile.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                    }}>
                      {agent.icon}
                    </div>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.65rem',
                      fontWeight: 500,
                      color: 'var(--text-2)',
                      letterSpacing: '0.1em',
                    }}>
                      Agent {agent.num}
                    </span>
                  </div>

                  {/* Name */}
                  <div style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: 'var(--text-0)',
                    lineHeight: 1.3,
                  }}>
                    {agent.name}
                  </div>

                  {/* Description */}
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.82rem',
                    color: 'var(--text-2)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {agent.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION C: CTA Banner ────────────────────── */}
        <div style={{
          borderRadius: '20px',
          padding: '48px',
          marginTop: '48px',
          background: 'linear-gradient(135deg, rgba(108,63,232,0.08), rgba(245,166,35,0.08))',
          border: '1px solid rgba(108, 63, 232, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '20px',
        }}>
          <h3 style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 800,
            fontSize: '1.8rem',
            color: 'var(--text-0)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Ready to find your next investment?
          </h3>
          <p style={{
            color: 'var(--text-2)',
            fontSize: '1rem',
            maxWidth: '460px',
            margin: 0,
            lineHeight: 1.7,
          }}>
            Configure your Ideal Customer Profile and let 11 autonomous AI agents
            surface, score, and diligence the best opportunities for you.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setShowLanding(false)}
            style={{
              padding: '16px 40px',
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: "'Sora', sans-serif",
              letterSpacing: '-0.01em',
              marginTop: '8px',
            }}
          >
            Start Discovery Workflow →
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
