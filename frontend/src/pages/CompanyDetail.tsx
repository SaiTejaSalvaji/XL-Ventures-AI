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

export const CompanyDetail: React.FC<CompanyDetailProps> = ({ company, onBack, onDecisionSubmitted }) => {
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
          border: '1px solid rgba(0, 212, 255, 0.3)',
          color: 'var(--text-secondary)',
        }}
      >
        ← Back to Pipeline
      </button>

      {/* ── Header Card ── */}
      <div className="card card-glass flex justify-between items-start gap-8">
        <div className="flex-col gap-3 flex-1">
          <div className="flex items-center gap-4">
            <h1 style={{ fontSize: '2rem', margin: 0 }}>{company.name}</h1>
            <ScoreBadge tier={company.tier} className="mt-1" />
          </div>
          <p style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{company.tagline || company.description}</p>
          <div className="flex gap-6 mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span><strong style={{ color: 'var(--text-primary)' }}>{company.stage}</strong> Stage</span>
            <span><strong style={{ color: 'var(--text-primary)' }}>{company.location}</strong> Location</span>
            <span><strong style={{ color: 'var(--text-primary)' }}>{company.employee_estimate || 'N/A'}</strong> Employees</span>
            <span><strong style={{ color: 'var(--text-primary)' }}>{company.business_model || 'N/A'}</strong> Model</span>
          </div>
        </div>

        {/* ── Big Score Badge ── */}
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `conic-gradient(from 0deg, ${company.score >= 80 ? '#00FF88' : company.score >= 50 ? '#FFB800' : '#FF6B6B'}, transparent ${(company.score / 100) * 360}deg, rgba(0,212,255,0.1) 0deg)`,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: 'var(--card-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              fontSize: '2rem',
              fontWeight: 800,
              color: company.score >= 80 ? '#00FF88' : company.score >= 50 ? '#FFB800' : '#FF6B6B',
              textShadow: `0 0 20px ${company.score >= 80 ? '#00FF88' : company.score >= 50 ? '#FFB800' : '#FF6B6B'}`,
            }}
          >
            <div>{company.score}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '4px' }}>SCORE</div>
          </div>
        </div>
      </div>

      {/* ── Body Layout (Split Panel) ── */}
      <div className="grid-2">
        {/* ── Left Side: Agent Findings ── */}
        <div className="flex flex-col gap-6">
          {/* ── Score Breakdown ── */}
          <div className="card">
            <h3 className="text-sm font-bold uppercase text-secondary tracking-wider mb-4" style={{ letterSpacing: '0.08em' }}>
              📊 Investment Score Breakdown
            </h3>
            <div className="flex flex-col gap-4">
              {Object.entries(company.score_breakdown || {}).map(([dim, val]) => (
                <div key={dim} className="flex-col gap-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="capitalize" style={{ color: 'var(--text-primary)' }}>{dim} Quality</span>
                    <span style={{ color: 'var(--accent-primary)' }}>{val}/100</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(13, 27, 42, 0.8)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${val}%`,
                        background: dim === 'team' ? 'linear-gradient(90deg, #00D4FF, #00E6FF)' : dim === 'technology' ? 'linear-gradient(90deg, #7B2FBE, #B084CC)' : dim === 'traction' ? 'linear-gradient(90deg, #00FF88, #66FFB3)' : 'linear-gradient(90deg, #FFB800, #FFD966)',
                        borderRadius: '4px',
                        transition: 'width 0.8s ease-out',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-primary)' }}>💡 Gemini Rationale:</strong> {company.rationale}
            </div>
          </div>

          {/* ── Founders ── */}
          <div className="card">
            <h3 className="text-sm font-bold uppercase text-secondary tracking-wider mb-4" style={{ letterSpacing: '0.08em' }}>
              👥 Leadership Team
            </h3>
            <div className="flex flex-col gap-4">
              {company.founders?.map((f, i) => (
                <div key={i} className="flex-col gap-2" style={{ paddingBottom: i < company.founders.length - 1 ? '12px', borderBottom: i < company.founders.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <div className="flex justify-between items-center">
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{f.name}</strong>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{f.title}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{f.background}</p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    📚 {f.education} | 💼 {f.past_companies.join(', ')}
                  </div>
                </div>
              )) || <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No leadership data.</p>}
            </div>
          </div>

          {/* ── GitHub & News ── */}
          <div className="grid-2">
            <div className="card">
              <h3 className="text-sm font-bold uppercase text-secondary tracking-wider mb-4" style={{ letterSpacing: '0.08em' }}>
                🐙 GitHub OS Metrics
              </h3>
              {company.github ? (
                <div className="flex flex-col gap-3" style={{ fontSize: '0.85rem' }}>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>⭐ Stars:</span> <strong>{company.github.total_stars}</strong></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>🍴 Forks:</span> <strong>{company.github.total_forks}</strong></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>📦 Repos:</span> <strong>{company.github.repo_count}</strong></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>📅 Last Push:</span> <strong>{company.github.last_commit_date?.split('T')[0] || 'N/A'}</strong></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>🔗 Source:</span> <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{company.github.source}</span></div>
                </div>
              ) : <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No repo data.</p>}
            </div>

            <div className="card">
              <h3 className="text-sm font-bold uppercase text-secondary tracking-wider mb-4" style={{ letterSpacing: '0.08em' }}>
                📰 News & Sentiment
              </h3>
              {company.news ? (
                <div className="flex flex-col gap-3" style={{ fontSize: '0.85rem' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-secondary)' }}>Sentiment:</span>
                    <span
                      className="badge"
                      style={{
                        background: company.news.sentiment === 'positive' ? 'rgba(0, 255, 136, 0.15)' : company.news.sentiment === 'negative' ? 'rgba(255, 107, 107, 0.15)' : 'rgba(255, 184, 0, 0.15)',
                        color: company.news.sentiment === 'positive' ? '#00FF88' : company.news.sentiment === 'negative' ? '#FF6B6B' : '#FFB800',
                        border: company.news.sentiment === 'positive' ? '1px solid rgba(0, 255, 136, 0.3)' : company.news.sentiment === 'negative' ? '1px solid rgba(255, 107, 107, 0.3)' : '1px solid rgba(255, 184, 0, 0.3)',
                      }}
                    >
                      {company.news.sentiment}
                    </span>
                  </div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '8px 0 0' }}>{company.news.summary}</p>
                  <div className="divider" style={{ margin: '12px 0' }} />
                  <div className="flex-col gap-2">
                    {company.news.momentum_signals?.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="badge badge-purple" style={{ fontSize: '0.7rem', fontWeight: 700, justifyContent: 'flex-start' }}>
                        ✦ {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No news data.</p>}
            </div>
          </div>

          {/* ── Market Opportunities ── */}
          <div className="card">
            <h3 className="text-sm font-bold uppercase text-secondary tracking-wider mb-4" style={{ letterSpacing: '0.08em' }}>
              🏆 Competitive Landscape
            </h3>
            <div className="flex flex-col gap-3" style={{ fontSize: '0.85rem' }}>
              <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>TAM Estimate:</span> <strong>{company.market?.tam_estimate || 'N/A'}</strong></div>
              <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>CAGR / Growth:</span> <strong>{company.market?.market_growth_rate || 'N/A'}</strong></div>
              <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Market Stage:</span> <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{company.market?.market_stage || 'N/A'}</span></div>
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
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--accent-primary)',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      🔗 Visit
                    </a>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>📌 {c.differentiator}</p>
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
              <h3 className="text-sm font-bold uppercase text-secondary tracking-wider" style={{ letterSpacing: '0.08em', margin: 0 }}>
                📄 Autonomous Due Diligence Report
              </h3>
              <span className="badge badge-info" style={{ background: 'rgba(0, 212, 255, 0.15)', borderColor: 'rgba(0, 212, 255, 0.3)', color: 'var(--accent-primary)', fontSize: '0.65rem', fontWeight: 700 }}>
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
