import React, { useState } from 'react';
import type { ICP } from '../types';

interface ICPFormProps {
  onSubmit: (icp: ICP) => void;
  isLoading: boolean;
}

export const ICPForm: React.FC<ICPFormProps> = ({ onSubmit, isLoading }) => {
  const [industry, setIndustry] = useState('AI Healthcare');
  const [stage, setStage] = useState('Seed');
  const [location, setLocation] = useState('India');
  const [keywords, setKeywords] = useState('machine learning, diagnostic screening, thermal imaging');
  const [keywordChips, setKeywordChips] = useState<string[]>(['machine learning', 'diagnostic screening', 'thermal imaging']);

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeywords(value);
    // Split by comma and update chips
    const chips = value
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    setKeywordChips(chips);
  };

  const removeChip = (index: number) => {
    const newChips = keywordChips.filter((_, i) => i !== index);
    setKeywordChips(newChips);
    setKeywords(newChips.join(', '));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tech_keywords = keywordChips.filter((k) => k.length > 0);

    onSubmit({
      industry,
      stage,
      location,
      tech_keywords,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card card-glass flex flex-col gap-6">
      {/* ── Header ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '1.1rem',
              color: 'var(--gold)',
              lineHeight: 1,
            }}>◈</span>
            <h3 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-2)',
              margin: 0,
            }}>
              Ideal Customer Profile (ICP)
            </h3>
          </div>
          {/* Target tile */}
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'rgba(245, 166, 35, 0.15)',
            border: '1px solid rgba(245, 166, 35, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
          }}>
            🎯
          </div>
        </div>
        {/* Divider below header */}
        <div className="divider" style={{ margin: '14px 0 0' }} />
      </div>

      <div className="form-group">
        <label className="form-label">Target Industry</label>
        <input
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="form-input"
          placeholder="e.g. AI Healthcare, Fintech, SaaS"
          required
          disabled={isLoading}
          style={{
            background: isLoading ? 'rgba(14, 18, 32, 0.4)' : undefined,
            cursor: isLoading ? 'not-allowed' : 'text',
            opacity: isLoading ? 0.6 : 1,
          }}
        />
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Funding Stage</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="form-select"
            disabled={isLoading}
            style={{
              background: isLoading ? 'rgba(14, 18, 32, 0.4)' : 'rgba(10, 13, 24, 0.6)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238B5CF6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              paddingRight: '36px',
            }}
          >
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Series B">Series B</option>
            <option value="Series C">Series C</option>
            <option value="All Stages">All Stages</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">📍 Geography</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-input"
            placeholder="e.g. India, United States"
            required
            disabled={isLoading}
            style={{
              background: isLoading ? 'rgba(14, 18, 32, 0.4)' : undefined,
              cursor: isLoading ? 'not-allowed' : 'text',
              opacity: isLoading ? 0.6 : 1,
            }}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tech Keywords (comma separated)</label>
        <input
          type="text"
          value={keywords}
          onChange={handleKeywordsChange}
          className="form-input"
          placeholder="e.g. NLP, computer vision, LLM"
          disabled={isLoading}
          style={{
            background: isLoading ? 'rgba(14, 18, 32, 0.4)' : undefined,
            cursor: isLoading ? 'not-allowed' : 'text',
            opacity: isLoading ? 0.6 : 1,
          }}
        />

        {/* Keyword Chips Display */}
        {keywordChips.length > 0 && (
          <div className="flex flex-col gap-2 mt-3">
            <div className="flex flex-wrap gap-2">
              {keywordChips.map((chip, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    background: 'rgba(108, 63, 232, 0.12)',
                    border: '1px solid rgba(108, 63, 232, 0.3)',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    color: 'var(--violet-bright)',
                    fontWeight: 500,
                    opacity: isLoading ? 0.6 : 1,
                    pointerEvents: isLoading ? 'none' : 'auto',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {chip}
                  <span
                    className="chip-remove"
                    onClick={() => !isLoading && removeChip(idx)}
                    style={{ color: 'var(--text-2)' }}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', opacity: 0.8 }}>
              {keywordChips.length} keyword{keywordChips.length !== 1 ? 's' : ''} added
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn w-full justify-center mt-4"
        style={{
          padding: '14px 24px',
          fontSize: '0.95rem',
          fontWeight: 700,
          fontFamily: "'Sora', sans-serif",
          position: 'relative',
          background: isLoading
            ? 'rgba(108, 63, 232, 0.5)'
            : 'linear-gradient(135deg, var(--violet), var(--violet-bright))',
          color: '#fff',
          border: '1px solid rgba(108, 63, 232, 0.3)',
          boxShadow: isLoading ? 'none' : '0 0 24px rgba(108, 63, 232, 0.35)',
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? (
          <>
            <span
              style={{
                display: 'inline-block',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                border: '2px solid transparent',
                borderTopColor: '#fff',
                borderRightColor: 'rgba(255,255,255,0.4)',
                animation: 'spin-smooth 0.8s linear infinite',
                marginRight: '6px',
                flexShrink: 0,
              }}
            />
            Analyzing...
          </>
        ) : (
          <>🤖 Trigger Discovery Workflow</>
        )}
      </button>
    </form>
  );
};
