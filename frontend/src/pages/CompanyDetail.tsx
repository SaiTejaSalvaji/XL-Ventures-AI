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
    <div className="page flex flex-col gap-6 fade-in">
      {/* ── Breadcrumb ── */}
      <div>
        <button onClick={onBack} className="btn btn-ghost btn-sm">
          ← Back to Pipeline
        </button>
      </div>

      {/* ── Header Card ── */}
      <div className="card card-glass flex justify-between items-center gap-6">
        <div className="flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 style={{ fontSize: '2.2rem' }}>{company.name}</h1>
            <ScoreBadge tier={company.tier} className="mt-1" />
          </div>
          <p className="text-accent">{company.tagline || company.description}</p>
          <div className="flex gap-4 mt-2 text-xs text-muted">
            <span>Stage: <strong>{company.stage}</strong></span>
            <span>Location: <strong>{company.location}</strong></span>
            <span>Employee Est: <strong>{company.employee_estimate || 'N/A'}</strong></span>
            <span>Business Model: <strong>{company.business_model || 'N/A'}</strong></span>
          </div>
        </div>

        {/* ── Big Score Badge ── */}
        <div className="score-ring flex-col items-center justify-center border" style={{ width: '90px', height: '90px', borderRadius: '50%', borderColor: 'var(--border)' }}>
          <div className={`score-value ${company.score >= 75 ? 'score-high' : company.score >= 50 ? 'score-medium' : 'score-low'}`}>
            {company.score}
          </div>
          <div className="text-xs text-muted">Score</div>
        </div>
      </div>

      {/* ── Body Layout (Split Panel) ── */}
      <div className="grid-2">
        {/* ── Left Side: Agent Findings ── */}
        <div className="flex flex-col gap-6">
          {/* ── Score Breakdown ── */}
          <div className="card">
            <h3 className="text-sm font-bold uppercase text-secondary tracking-wider mb-4">Investment Score Breakdown</h3>
            <div className="flex flex-col gap-3">
              {Object.entries(company.score_breakdown || {}).map(([dim, val]) => (
                <div key={dim} className="flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="capitalize">{dim} Quality</span>
                    <span>{val}/100</span>
                  </div>
                  <div className="w-full" style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${val}%`,
                      background: dim === 'team' ? 'var(--accent)' : dim === 'technology' ? 'var(--purple)' : dim === 'traction' ? 'var(--green)' : 'var(--yellow)',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="text-xs text-secondary italic">
              <strong>Gemini Rationale:</strong> {company.rationale}
            </div>
          </div>

          {/* ── Founders ── */}
          <div className="card">
            <h3 className="text-sm font-bold uppercase text-secondary tracking-wider mb-4">Leadership Team</h3>
            <div className="flex flex-col gap-4">
              {company.founders?.map((f, i) => (
                <div key={i} className="flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-sm">{f.name}</strong>
                    <span className="badge badge-info text-xs" style={{ fontSize: '0.65rem' }}>{f.title}</span>
                  </div>
                  <p className="text-xs">{f.background}</p>
                  <div className="text-xs text-muted">
                    Edu: {f.education} | Past: {f.past_companies.join(', ')}
                  </div>
                </div>
              )) || <p className="text-xs">No leadership data.</p>}
            </div>
          </div>

          {/* ── GitHub & News ── */}
          <div className="grid-2">
            <div className="card">
              <h3 className="text-sm font-bold uppercase text-secondary tracking-wider mb-4">GitHub OS Metrics</h3>
              {company.github ? (
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between"><span>Stars:</span> <strong>{company.github.total_stars}</strong></div>
                  <div className="flex justify-between"><span>Forks:</span> <strong>{company.github.total_forks}</strong></div>
                  <div className="flex justify-between"><span>Repos:</span> <strong>{company.github.repo_count}</strong></div>
                  <div className="flex justify-between"><span>Last Push:</span> <strong>{company.github.last_commit_date?.split('T')[0] || 'N/A'}</strong></div>
                  <div className="flex justify-between"><span>Source:</span> <span className="text-muted">{company.github.source}</span></div>
                </div>
              ) : <p className="text-xs">No repo data.</p>}
            </div>

            <div className="card">
              <h3 className="text-sm font-bold uppercase text-secondary tracking-wider mb-4">News & Sentiment</h3>
              {company.news ? (
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span>Sentiment:</span>
                    <span className={`badge ${company.news.sentiment === 'positive' ? 'badge-high' : company.news.sentiment === 'negative' ? 'badge-low' : 'badge-medium'}`}>
                      {company.news.sentiment}
                    </span>
                  </div>
                  <p className="text-xs font-bold mt-1">{company.news.summary}</p>
                  <div className="divider" style={{ margin: '8px 0' }} />
                  <div className="flex-col gap-1">
                    {company.news.momentum_signals?.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="badge badge-purple text-xs" style={{ fontSize: '0.6rem' }}>
                        ✦ {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : <p className="text-xs">No news data.</p>}
            </div>
          </div>

          {/* ── Market Opportunities ── */}
          <div className="card">
            <h3 className="text-sm font-bold uppercase text-secondary tracking-wider mb-4">Competitive Landscape</h3>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between"><span>TAM Estimate:</span> <strong>{company.market?.tam_estimate || 'N/A'}</strong></div>
              <div className="flex justify-between"><span>CAGR / Growth:</span> <strong>{company.market?.market_growth_rate || 'N/A'}</strong></div>
              <div className="flex justify-between"><span>Market Stage:</span> <span className="badge badge-info">{company.market?.market_stage || 'N/A'}</span></div>
            </div>
            <div className="divider" style={{ margin: '12px 0' }} />
            <div className="flex-col gap-3">
              <span className="form-label text-xs">Direct Competitors</span>
              {company.market?.competitors?.map((c, i) => (
                <div key={i} className="text-xs border-top pt-2" style={{ borderTop: '1px solid var(--border)', marginTop: i > 0 ? '8px' : 0 }}>
                  <div className="flex justify-between">
                    <strong>{c.name}</strong>
                    <a href={c.url} target="_blank" rel="noreferrer" className="text-accent text-xs">Link</a>
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.72rem' }}>Diff: {c.differentiator}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Side: Gemini DD Report & HITL Panel ── */}
        <div className="flex flex-col gap-6">
          <HITLPanel company={company} onDecisionSubmitted={onDecisionSubmitted} />
          
          <div className="card" style={{ minHeight: '400px' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase text-secondary tracking-wider">Autonomous Due Diligence Report</h3>
              <span className="badge badge-info" style={{ background: 'var(--accent-glow)', borderColor: 'var(--accent)', color: 'var(--accent-light)' }}>
                Powered by Gemini
              </span>
            </div>
            <div className="divider" />
            
            <div
              className="report-body text-sm"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(company.report) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
