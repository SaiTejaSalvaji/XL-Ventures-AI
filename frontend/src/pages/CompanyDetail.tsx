import React from 'react';
import type { Company } from '../types';
import { ScoreBadge } from '../components/ScoreBadge';
import { HITLPanel } from '../components/HITLPanel';

interface CompanyDetailProps {
  company: Company;
  onBack: () => void;
  onDecisionSubmitted: () => void;
}

// Simple Markdown to HTML converter to avoid installing extra dependencies
const renderMarkdown = (md: string) => {
  if (!md) return '';
  let html = md;
  // Replace Headings
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  // Replace Bold
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
  // Replace Bullet points
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  // Replace Linebreaks with paragraphs
  html = html.split('\n\n').map(p => {
    if (p.trim().startsWith('<h') || p.trim().startsWith('<li')) return p;
    return `<p>${p}</p>`;
  }).join('\n');

  return html;
};

const formatUrl = (url: string | undefined): string => {
  if (!url) return '#';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

// ── SVG Score Ring ───────────────────────────────────────────────
interface ScoreRingProps {
  score: number;
  color: string;
  size?: number;
  stroke?: number;
}

const ScoreRingLarge: React.FC<ScoreRingProps> = ({ score, color, size = 120, stroke = 7 }) => {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '2px',
      }}>
        <span style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 800,
          fontSize: '2rem',
          color,
          textShadow: `0 0 20px ${color}`,
          lineHeight: 1,
        }}>
          {score}
        </span>
        <span style={{ fontSize: '0.55rem', color: 'var(--text-2)', letterSpacing: '0.1em', fontWeight: 600 }}>SCORE</span>
      </div>
    </div>
  );
};

// Score bar gradient map
const SCORE_BAR_GRADIENTS: Record<string, string> = {
  team:       'linear-gradient(90deg, var(--violet), var(--violet-bright))',
  technology: 'linear-gradient(90deg, var(--gold), var(--gold-bright))',
  traction:   'linear-gradient(90deg, var(--success), #22e69d)',
  market:     'linear-gradient(90deg, var(--info), #73d4fc)',
};

export const CompanyDetail: React.FC<CompanyDetailProps> = ({ company, onBack, onDecisionSubmitted }) => {
  const scoreColor =
    company.score >= 80 ? 'var(--success)' :
    company.score >= 50 ? 'var(--gold)' :
    'var(--danger)';

  return (
    <div className="page flex flex-col gap-8 fade-in">
      {/* ── Breadcrumb ── */}
      <button
        onClick={onBack}
        className="btn btn-ghost"
        style={{
          width: 'fit-content',
          padding: '8px 16px',
          fontSize: '0.9rem',
          fontWeight: 600,
          border: '1px solid rgba(108, 63, 232, 0.3)',
          color: 'var(--text-1)',
        }}
      >
        ← Back to Pipeline
      </button>

      {/* ── Header Card ── */}
      <div className="card card-glass flex justify-between items-start gap-8">
        <div className="flex-col gap-3 flex-1">
          <div className="flex items-center gap-4">
            <h1 style={{
              fontSize: '2rem',
              margin: 0,
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
            }}>
              {company.name}
            </h1>
            <ScoreBadge tier={company.tier} className="mt-1" />
          </div>
          <p style={{ color: 'var(--violet-bright)', fontSize: '0.95rem' }}>
            {company.tagline || company.description}
          </p>
          <div className="flex gap-6 mt-3 text-xs" style={{ color: 'var(--text-2)' }}>
            <span><strong style={{ color: 'var(--text-0)' }}>{company.stage}</strong> Stage</span>
            <span><strong style={{ color: 'var(--text-0)' }}>{company.location}</strong> Location</span>
            <span><strong style={{ color: 'var(--text-0)' }}>{company.employee_estimate || 'N/A'}</strong> Employees</span>
            <span><strong style={{ color: 'var(--text-0)' }}>{company.business_model || 'N/A'}</strong> Model</span>
          </div>
        </div>

        {/* ── SVG Score Ring (large) ── */}
        <ScoreRingLarge score={company.score} color={scoreColor} />
      </div>

      {/* ── Body Layout (Split Panel) ── */}
      <div className="grid-2">
        {/* ── Left Side: Agent Findings ── */}
        <div className="flex flex-col gap-6">

          {/* ── Score Breakdown ── */}
          <div className="card">
            <h3 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-2)',
              marginBottom: '16px',
            }}>
              ◈ Investment Score Breakdown
            </h3>
            <div className="flex flex-col gap-4">
              {Object.entries(company.score_breakdown || {}).map(([dim, val]) => (
                <div key={dim} className="flex-col gap-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="capitalize" style={{ color: 'var(--text-0)' }}>{dim} Quality</span>
                    <span style={{ color: 'var(--violet-bright)' }}>{val}/100</span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: 'rgba(10, 13, 24, 0.8)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                  }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${val}%`,
                        background: SCORE_BAR_GRADIENTS[dim] || SCORE_BAR_GRADIENTS.market,
                        borderRadius: '4px',
                        transition: 'width 0.8s ease-out',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', fontStyle: 'italic', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-0)' }}>✦ Gemini Rationale:</strong> {company.rationale}
            </div>
          </div>

          {/* ── Founders ── */}
          <div className="card">
            <h3 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-2)',
              marginBottom: '16px',
            }}>
              ✦ Leadership Team
            </h3>
            <div className="flex flex-col gap-4">
              {company.founders?.map((f, i) => (
                <div
                  key={i}
                  className="flex-col gap-2"
                  style={{
                    paddingBottom: i < company.founders.length - 1 ? '12px' : '0px',
                    borderBottom: i < company.founders.length - 1 ? '1px solid var(--border-color)' : 'none',
                  }}
                >
                  <div className="flex justify-between items-center">
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-0)' }}>{f.name}</strong>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{f.title}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-1)', margin: 0 }}>{f.background}</p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>
                    📚 {f.education} | 💼 {f.past_companies.join(', ')}
                  </div>
                </div>
              )) || <p style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>No leadership data.</p>}
            </div>
          </div>

          {/* ── GitHub & News ── */}
          <div className="grid-2">
            <div className="card">
              <h3 style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-2)',
                marginBottom: '16px',
              }}>
                ✦ GitHub OS Metrics
              </h3>
              {company.github ? (
                <div className="flex flex-col gap-3" style={{ fontSize: '0.85rem' }}>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-2)' }}>⭐ Stars:</span> <strong>{company.github.total_stars}</strong></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-2)' }}>🍴 Forks:</span> <strong>{company.github.total_forks}</strong></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-2)' }}>📦 Repos:</span> <strong>{company.github.repo_count}</strong></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-2)' }}>📅 Last Push:</span> <strong>{company.github.last_commit_date?.split('T')[0] || 'N/A'}</strong></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-2)' }}>🔗 Source:</span> <span style={{ color: 'var(--text-2)', fontSize: '0.75rem' }}>{company.github.source}</span></div>
                </div>
              ) : <p style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>No repo data.</p>}
            </div>

            <div className="card">
              <h3 style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-2)',
                marginBottom: '16px',
              }}>
                ✦ News &amp; Sentiment
              </h3>
              {company.news ? (
                <div className="flex flex-col gap-3" style={{ fontSize: '0.85rem' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-2)' }}>Sentiment:</span>
                    <span
                      className="badge"
                      style={{
                        background: company.news.sentiment === 'positive' ? 'rgba(16, 217, 140, 0.15)' : company.news.sentiment === 'negative' ? 'rgba(240, 82, 106, 0.15)' : 'rgba(245, 166, 35, 0.15)',
                        color: company.news.sentiment === 'positive' ? 'var(--success)' : company.news.sentiment === 'negative' ? 'var(--danger)' : 'var(--gold)',
                        border: company.news.sentiment === 'positive' ? '1px solid rgba(16, 217, 140, 0.3)' : company.news.sentiment === 'negative' ? '1px solid rgba(240, 82, 106, 0.3)' : '1px solid rgba(245, 166, 35, 0.3)',
                      }}
                    >
                      {company.news.sentiment}
                    </span>
                  </div>
                  <p style={{ fontWeight: 600, color: 'var(--text-0)', margin: '8px 0 0' }}>{company.news.summary}</p>
                  <div className="divider" style={{ margin: '12px 0' }} />
                  <div className="flex-col gap-2">
                    {company.news.momentum_signals?.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="badge badge-purple" style={{ fontSize: '0.7rem', fontWeight: 700, justifyContent: 'flex-start' }}>
                        ✦ {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : <p style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>No news data.</p>}
            </div>
          </div>

          {/* ── Market Opportunities ── */}
          <div className="card">
            <h3 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-2)',
              marginBottom: '16px',
            }}>
              ◈ Competitive Landscape
            </h3>
            <div className="flex flex-col gap-3" style={{ fontSize: '0.85rem' }}>
              <div className="flex justify-between"><span style={{ color: 'var(--text-2)' }}>TAM Estimate:</span> <strong>{company.market?.tam_estimate || 'N/A'}</strong></div>
              <div className="flex justify-between"><span style={{ color: 'var(--text-2)' }}>CAGR / Growth:</span> <strong>{company.market?.market_growth_rate || 'N/A'}</strong></div>
              <div className="flex justify-between"><span style={{ color: 'var(--text-2)' }}>Market Stage:</span> <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{company.market?.market_stage || 'N/A'}</span></div>
            </div>
            <div className="divider" style={{ margin: '16px 0' }} />
            <div className="flex-col gap-3">
              <span className="form-label" style={{ marginBottom: '8px' }}>Direct Competitors</span>
              {company.market?.competitors?.map((c, i) => (
                <div
                  key={i}
                  style={{
                    paddingTop: i > 0 ? '12px' : 0,
                    marginTop: i > 0 ? '12px' : 0,
                    borderTop: i > 0 ? '1px solid var(--border-color)' : 'none',
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <strong style={{ fontSize: '0.9rem' }}>{c.name}</strong>
                    <a
                      href={formatUrl(c.url)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--violet-bright)',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      🔗 Visit
                    </a>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-2)', margin: 0 }}>📌 {c.differentiator}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Side: Gemini DD Report & HITL Panel ── */}
        <div className="flex flex-col gap-6">
          <HITLPanel company={company} onDecisionSubmitted={onDecisionSubmitted} />

          <div className="card" style={{ minHeight: '500px' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-2)',
                margin: 0,
              }}>
                ✦ Autonomous Due Diligence Report
              </h3>
              <span className="badge badge-info" style={{
                background: 'rgba(108, 63, 232, 0.15)',
                borderColor: 'rgba(108, 63, 232, 0.3)',
                color: 'var(--violet-bright)',
                fontSize: '0.65rem',
                fontWeight: 700,
              }}>
                Powered by Gemini ✨
              </span>
            </div>
            <div className="divider" />

            <div
              className="report-body"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(company.report) }}
              style={{ fontSize: '0.9rem', lineHeight: 1.8 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
