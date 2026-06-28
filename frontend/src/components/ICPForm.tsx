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
      <div>
        <h3 className="text-sm font-bold uppercase text-secondary tracking-wider" style={{ letterSpacing: '0.08em' }}>
          🎯 Opportunity Parameters (ICP)
        </h3>
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
            background: isLoading ? 'rgba(19, 43, 69, 0.4)' : undefined,
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
              background: isLoading ? 'rgba(19, 43, 69, 0.4)' : 'rgba(13, 27, 42, 0.6)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300D4FF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
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
              background: isLoading ? 'rgba(19, 43, 69, 0.4)' : undefined,
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
            background: isLoading ? 'rgba(19, 43, 69, 0.4)' : undefined,
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
                  className="chip"
                  style={{
                    opacity: isLoading ? 0.6 : 1,
                    pointerEvents: isLoading ? 'none' : 'auto',
                  }}
                >
                  {chip}
                  <span
                    className="chip-remove"
                    onClick={() => !isLoading && removeChip(idx)}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
              {keywordChips.length} keyword{keywordChips.length !== 1 ? 's' : ''} added
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary w-full justify-center mt-4"
        style={{
          padding: '14px 24px',
          fontSize: '0.95rem',
          fontWeight: 700,
          position: 'relative',
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
                borderTopColor: 'currentColor',
                borderRightColor: 'currentColor',
                animation: 'spin-smooth 0.8s linear infinite',
                marginRight: '6px',
              }}
            />
            Analyzing...
          </>
        ) : (
          <>
            🤖 Trigger Discovery Workflow
          </>
        )}
      </button>
    </form>
  );
};
