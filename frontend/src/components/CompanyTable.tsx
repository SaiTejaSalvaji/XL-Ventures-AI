import React, { useState } from 'react';
import type { Company } from '../types';


interface CompanyTableProps {
  companies: Company[];
  onSelectCompany: (company: Company) => void;
}

type SortField = 'score' | 'name' | 'stage';
type SortOrder = 'asc' | 'desc';

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

const ScoreRing: React.FC<ScoreRingProps> = ({ score, color, size = 50, stroke = 4 }) => {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <span style={{
        position: 'relative',
        zIndex: 1,
        fontSize: '0.78rem',
        fontWeight: 800,
        fontFamily: "'Syne', sans-serif",
        color,
      }}>
        {score}
      </span>
    </div>
  );
};

export const CompanyTable: React.FC<CompanyTableProps> = ({ companies, onSelectCompany }) => {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedCompanies = [...companies].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return <span style={{ color: 'var(--text-2)', opacity: 0.6, marginLeft: '4px' }}>⇅</span>;
    return (
      <span style={{ color: 'var(--violet)', marginLeft: '4px' }}>
        {sortOrder === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 50) return 'var(--gold)';
    return 'var(--danger)';
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'high':   return '#FFD700';
      case 'medium': return '#C0C0C0';
      case 'low':    return '#CD7F32';
      default:       return 'var(--info)';
    }
  };

  const getStageColor = (stage: string) => {
    const stageMap: Record<string, string> = {
      'Seed':     'var(--violet-bright)',
      'Series A': 'var(--gold)',
      'Series B': 'var(--info)',
      'Series C': 'var(--success)',
    };
    return stageMap[stage] || 'var(--text-2)';
  };

  return (
    <div className="table-wrap fade-in">
      {sortedCompanies.length === 0 ? (
        /* ── Empty State with ◈ symbol ── */
        <div style={{
          padding: '60px 24px',
          textAlign: 'center',
          background: 'rgba(10, 13, 24, 0.5)',
          borderRadius: '16px',
          border: '2px dashed rgba(108, 63, 232, 0.2)',
        }}>
          <div style={{
            fontSize: '2.2rem',
            marginBottom: '12px',
            color: 'var(--violet)',
            lineHeight: 1,
          }}>◈</div>
          <p style={{ color: 'var(--text-1)', fontSize: '0.95rem' }}>
            No opportunities discovered yet.
          </p>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginTop: '6px' }}>
            Adjust ICP criteria and trigger AgentOS to begin discovery.
          </p>
        </div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th className="th-sort" onClick={() => handleSort('name')}>
                  Company Name {getSortIndicator('name')}
                </th>
                <th className="th-sort" onClick={() => handleSort('score')}>
                  Score {getSortIndicator('score')}
                </th>
                <th>Tier</th>
                <th className="th-sort" onClick={() => handleSort('stage')}>
                  Stage {getSortIndicator('stage')}
                </th>
                <th>Tech Stack</th>
                <th>Website</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {sortedCompanies.map((c, idx) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCompany(c)}
                  style={{
                    animation: `slideInUp 0.3s ease-out ${idx * 50}ms backwards`,
                  }}
                >
                  {/* Company name with Syne font + tagline below */}
                  <td>
                    <div>
                      <div style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: 'var(--text-0)',
                        lineHeight: 1.2,
                      }}>
                        {c.name}
                      </div>
                      {(c.tagline || c.description) && (
                        <div style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-2)',
                          marginTop: '3px',
                          lineHeight: 1.3,
                          maxWidth: '220px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {c.tagline || c.description}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* SVG Score ring */}
                  <td>
                    <ScoreRing score={c.score} color={getScoreColor(c.score)} />
                  </td>

                  <td>
                    <span
                      className="badge"
                      style={{
                        background: `${getTierColor(c.tier)}20`,
                        color: getTierColor(c.tier),
                        border: `1px solid ${getTierColor(c.tier)}50`,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      Tier {c.tier.charAt(0)}
                    </span>
                  </td>

                  <td>
                    <span
                      className="badge"
                      style={{
                        background: `${getStageColor(c.stage)}20`,
                        color: getStageColor(c.stage),
                        border: `1px solid ${getStageColor(c.stage)}50`,
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {c.stage}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '300px' }}>
                      {c.tech_stack?.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="chip"
                          style={{ padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600 }}
                        >
                          {t}
                        </span>
                      )) || <span style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>N/A</span>}
                    </div>
                  </td>

                  <td>
                    <a
                      href={formatUrl(c.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="btn btn-ghost btn-sm"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: `1px solid rgba(108, 63, 232, 0.3)`,
                        color: 'var(--violet-bright)',
                      }}
                    >
                      🔗 Visit
                    </a>
                  </td>

                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCompany(c);
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: `1px solid rgba(108, 63, 232, 0.3)`,
                        color: 'var(--violet-bright)',
                      }}
                    >
                      📋 View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer with count */}
          <div
            style={{
              padding: '16px 18px',
              background: 'rgba(10, 13, 24, 0.5)',
              borderTop: '1px solid rgba(108, 63, 232, 0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: 'var(--text-2)', fontSize: '0.8rem', fontWeight: 600 }}>
              Showing {sortedCompanies.length} result{sortedCompanies.length !== 1 ? 's' : ''}
            </span>
            <div
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                fontFamily: "'Syne', sans-serif",
                background: 'linear-gradient(135deg, var(--violet), var(--gold))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {sortedCompanies.length} Total
            </div>
          </div>
        </>
      )}
    </div>
  );
};
