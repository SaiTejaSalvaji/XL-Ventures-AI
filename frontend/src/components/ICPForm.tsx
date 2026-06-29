import React, { useState } from 'react';
import type { ICP } from '../types';
import { 
  Building2, 
  TrendingUp, 
  MapPin, 
  Users, 
  ChevronRight, 
  Loader2,
  DollarSign,
  Rocket,
  Activity,
  X,
  ArrowRight
} from 'lucide-react';

const GithubIcon = ({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface ICPFormProps {
  onSubmit: (icp: ICP) => void;
  isLoading: boolean;
}

export const ICPForm: React.FC<ICPFormProps> = ({ onSubmit, isLoading }) => {
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState('Seed');
  const [location, setLocation] = useState('');
  const [keywordChips, setKeywordChips] = useState<string[]>([]);
  
  // Advanced options state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [personas, setPersonas] = useState('');
  const [triggers, setTriggers] = useState<string[]>([]);
  const [minScore, setMinScore] = useState(50);
  
  const [chipInput, setChipInput] = useState('');

  const getCompletionPercentage = () => {
    let score = 0;
    if (industry.trim() !== '') score += 20;
    if (stage.trim() !== '') score += 20;
    if (location.trim() !== '') score += 20;
    if (keywordChips.length > 0) score += 20;
    if (personas.trim() !== '') score += 20;
    return score;
  };
  const completion = getCompletionPercentage();

  const getScoreDescriptor = () => {
    if (minScore < 30) return 'Broad Discovery (High Signal Quantity)';
    if (minScore < 70) return 'Balanced Filter (Recommended screening)';
    return 'Strict Sifting (High-quality opportunities only)';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = chipInput.trim();
      if (trimmed && !keywordChips.includes(trimmed)) {
        const newChips = [...keywordChips, trimmed];
        setKeywordChips(newChips);
      }
      setChipInput('');
    } else if (e.key === 'Backspace' && chipInput === '' && keywordChips.length > 0) {
      const newChips = keywordChips.slice(0, -1);
      setKeywordChips(newChips);
    }
  };

  const removeChip = (index: number) => {
    const newChips = keywordChips.filter((_, i) => i !== index);
    setKeywordChips(newChips);
  };

  const toggleTrigger = (triggerId: string) => {
    if (triggers.includes(triggerId)) {
      setTriggers(triggers.filter((t) => t !== triggerId));
    } else {
      setTriggers([...triggers, triggerId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tech_keywords = keywordChips.filter((k) => k.length > 0);
    const target_personas = personas
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    onSubmit({
      industry,
      stage,
      location,
      tech_keywords,
      target_personas,
      business_triggers: triggers,
      min_qualification_score: minScore,
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Scope custom stylesheet styles */}
      <style>{`
        .icp-form-card {
          background: linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(5, 5, 5, 0.99));
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-top: 3px solid #D4AF37;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(212, 175, 55, 0.02);
          border-radius: 24px;
          padding: 36px;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          backdrop-filter: blur(24px);
        }
        .icp-form-card:hover {
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(212, 175, 55, 0.05);
          transform: translateY(-2px);
        }
        .fields-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .fields-grid {
            grid-template-columns: 1fr 1fr;
          }
          .full-width-field {
            grid-column: span 2;
          }
        }
        .form-input-container {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .form-input-icon {
          position: absolute;
          left: 14px;
          color: #8E8E93;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.25s ease;
        }
        .form-input-container:focus-within .form-input-icon {
          color: #D4AF37;
        }
        .icp-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #F5F5F7;
          padding: 14px 16px 14px 44px;
          border-radius: 12px;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .icp-input:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.12), inset 0 0 10px rgba(212, 175, 55, 0.02);
          background: rgba(8, 8, 8, 0.95);
        }
        .icp-select {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #F5F5F7;
          padding: 14px 36px 14px 44px;
          border-radius: 12px;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23D4AF37' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
        }
        .icp-select:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.12), inset 0 0 10px rgba(212, 175, 55, 0.02);
          background: rgba(8, 8, 8, 0.95);
        }
        .tokenized-input-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 10px 14px;
          min-height: 52px;
          width: 100%;
          box-sizing: border-box;
          cursor: text;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tokenized-input-container:focus-within {
          border-color: #D4AF37;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.12);
          background: rgba(8, 8, 8, 0.95);
        }
        .trigger-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 8px;
        }
        @media (min-width: 640px) {
          .trigger-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .trigger-card-new {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
        }
        .trigger-card-new:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
        .trigger-card-new.active {
          background: rgba(212, 175, 55, 0.02);
          border-color: #D4AF37;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.05);
        }
        .icp-slider {
          -webkit-appearance: none;
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          height: 6px;
          border-radius: 3px;
          outline: none;
          transition: background 0.3s;
        }
        .icp-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          background: #D4AF37;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.6);
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s;
        }
        .icp-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          background: #F5D76E;
        }
        .tech-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(212, 175, 55, 0.06);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 20px;
          font-size: 0.8rem;
          color: #D4AF37;
          font-weight: 600;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tech-chip:hover {
          background: rgba(212, 175, 55, 0.12);
          border-color: rgba(212, 175, 55, 0.4);
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 4px 10px rgba(212, 175, 55, 0.1);
        }
        @keyframes spin-smooth {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-custom {
          animation: spin-smooth 1s linear infinite;
        }
      `}</style>

      <form onSubmit={handleSubmit} className="icp-form-card flex flex-col gap-10" style={{ position: 'relative' }}>
        {/* Dynamic Form Completion Progress Bar */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.03)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          overflow: 'hidden',
          zIndex: 10
        }}>
          <div style={{
            width: `${completion}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #AA7C11, #D4AF37, #F3E5AB)',
            boxShadow: '0 0 10px rgba(212, 175, 55, 0.4)',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>

        {/* ── Header / Title Section ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#fff',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Ideal Customer Profile
            </h1>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              color: '#D4AF37'
            }}>
              🎯
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#8E8E93', fontWeight: 400 }}>
            Define targeting and signals to filter matching opportunity channels.
          </p>
        </div>

        <div className="divider" style={{ margin: 0, opacity: 0.06, borderBottom: '1px solid #fff' }} />

        {/* ── Section 1: Basic Profile ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Basic Profile
          </h4>
          
          <div className="fields-grid">
            {/* Target Industry */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#8E8E93', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Target Industry</label>
              <div className="form-input-container">
                <span className="form-input-icon">
                  <Building2 size={16} />
                </span>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="icp-input"
                  placeholder="ex: Fintech, HealthTech, AI Infrastructure"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Funding Stage */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#8E8E93', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Funding Stage</label>
              <div className="form-input-container">
                <span className="form-input-icon">
                  <TrendingUp size={16} />
                </span>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="icp-select"
                  disabled={isLoading}
                >
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Series C">Series C</option>
                  <option value="All Stages">All Stages</option>
                </select>
              </div>
            </div>

            {/* Geography (full width) */}
            <div className="form-group full-width-field">
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#8E8E93', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Geography</label>
              <div className="form-input-container">
                <span className="form-input-icon">
                  <MapPin size={16} />
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="icp-input"
                  placeholder="ex: India, United States, Europe, Global"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Tech Keywords (full width) */}
            <div className="form-group full-width-field">
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#8E8E93', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Tech Keywords</label>
              <div className="tokenized-input-container" onClick={() => document.getElementById('token-input-field')?.focus()}>
                {keywordChips.map((chip, idx) => (
                  <span key={idx} className="tech-chip">
                    {chip}
                    <span
                      onClick={(e) => { e.stopPropagation(); removeChip(idx); }}
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'rgba(212, 175, 55, 0.6)' }}
                      onMouseOver={e => e.currentTarget.style.color = '#FF4757'}
                      onMouseOut={e => e.currentTarget.style.color = 'rgba(212, 175, 55, 0.6)'}
                    >
                      <X size={12} />
                    </span>
                  </span>
                ))}
                <input
                  id="token-input-field"
                  type="text"
                  value={chipInput}
                  onChange={e => setChipInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={keywordChips.length === 0 ? "ex: NLP, computer vision, payment API, observability" : "Type and press Enter..."}
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    fontSize: '0.85rem',
                    padding: '4px 0'
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="divider" style={{ margin: 0, opacity: 0.06, borderBottom: '1px solid #fff' }} />

        {/* ── Section 2: Advanced Qualification Accordion ── */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.01)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          borderRadius: '16px',
          padding: '24px',
          transition: 'all 0.3s ease'
        }}>
          <div
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
                Advanced Qualification
              </h4>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#8E8E93' }}>
                Configure target personas, business signals, and qualification score thresholds.
              </p>
            </div>
            <ChevronRight
              size={18}
              style={{
                color: '#8E8E93',
                transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0)',
                transition: 'transform 0.2s ease'
              }}
            />
          </div>
          
          {showAdvanced && (
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="divider" style={{ margin: '0 0 8px', opacity: 0.06, borderBottom: '1px solid #fff' }} />
              
              {/* Target Personas */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', color: '#8E8E93', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Target Personas</label>
                <div className="form-input-container">
                  <span className="form-input-icon">
                    <Users size={16} />
                  </span>
                  <input
                    type="text"
                    value={personas}
                    onChange={(e) => setPersonas(e.target.value)}
                    className="icp-input"
                    placeholder="ex: CEO, CTO, VP Engineering, Founder"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Triggers Selection */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', color: '#8E8E93', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Business Triggers to Monitor</label>
                <div className="trigger-grid">
                  {[
                    { id: 'funding', label: '💰 Funding Announcements', desc: 'Used to discover startups raising capital.', icon: <DollarSign size={16} /> },
                    { id: 'github_activity', label: '🐙 GitHub Repository Activity', desc: 'Tracks engineering velocity and open-source updates.', icon: <GithubIcon size={16} /> },
                    { id: 'product_launch', label: '🚀 Product Launch Events', desc: 'Monitors newly shipped products and launches.', icon: <Rocket size={16} /> },
                    { id: 'sentiment_positive', label: '📈 Positive Sentiment Momentum', desc: 'Scans news and media for positive public sentiment.', icon: <Activity size={16} /> },
                  ].map((trig) => {
                    const isChecked = triggers.includes(trig.id);
                    return (
                      <div
                        key={trig.id}
                        onClick={() => !isLoading && toggleTrigger(trig.id)}
                        className={`trigger-card-new ${isChecked ? 'active' : ''}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {trig.icon} {trig.label}
                          </span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            style={{
                              accentColor: '#D4AF37',
                              cursor: 'pointer',
                              pointerEvents: 'none'
                            }}
                          />
                        </div>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#8E8E93', lineHeight: 1.4 }}>
                          {trig.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Qualification score */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: '#8E8E93', fontWeight: 600 }}>
                    Qualification Threshold
                  </label>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D4AF37' }}>{minScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value))}
                  disabled={isLoading}
                  className="icp-slider"
                  style={{ width: '100%', margin: '10px 0' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8E8E93', marginTop: '4px' }}>
                  <span>Low Quality</span>
                  <span>High Quality</span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '0.72rem', color: '#8E8E93', lineHeight: 1.4 }}>
                  Only companies scoring above <span style={{ color: '#fff', fontWeight: 600 }}>{minScore}</span> will enter the opportunity pipeline. ({getScoreDescriptor()})
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="divider" style={{ margin: 0, opacity: 0.06, borderBottom: '1px solid #fff' }} />

        {/* ── Submit Button Section ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>Discover Matching Companies</h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#8E8E93' }}>Estimated execution runtime: ~30 sec</p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '14px 48px',
              fontSize: '0.95rem',
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              background: isLoading
                ? 'rgba(212, 175, 55, 0.15)'
                : 'linear-gradient(135deg, #F3E5AB, #D4AF37, #AA7C11)',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              boxShadow: isLoading ? 'none' : '0 0 24px rgba(212, 175, 55, 0.25)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 35px rgba(212, 175, 55, 0.35)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(212, 175, 55, 0.2)';
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin-custom" size={18} />
                Running Discovery...
              </>
            ) : (
              <>
                Start Discovery <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
