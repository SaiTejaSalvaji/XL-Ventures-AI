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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tech_keywords = keywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    onSubmit({
      industry,
      stage,
      location,
      tech_keywords,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card card-glass flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase text-secondary tracking-wider">Opportunity Parameters (ICP)</h3>
      
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
          >
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Series B">Series B</option>
            <option value="Series C">Series C</option>
            <option value="All Stages">All Stages</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Geography</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-input"
            placeholder="e.g. India, United States"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tech Keywords (comma separated)</label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="form-input"
          placeholder="e.g. NLP, computer vision, LLM"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary w-full justify-between mt-2"
      >
        {isLoading ? 'AgentOS Running...' : 'Trigger Discovery Workflow'}
        <span>🤖</span>
      </button>
    </form>
  );
};
