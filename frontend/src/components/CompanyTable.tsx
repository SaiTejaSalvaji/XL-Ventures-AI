import React, { useState } from 'react';
import type { Company } from '../types';
import { ScoreBadge } from './ScoreBadge';

interface CompanyTableProps {
  companies: Company[];
  onSelectCompany: (company: Company) => void;
}

type SortField = 'score' | 'name' | 'stage';
type SortOrder = 'asc' | 'desc';

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00FF88';
    if (score >= 50) return '#FFB800';
    return '#FF6B6B';
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'high':
        return '#FFD700'; // Gold
      case 'medium':
        return '#C0C0C0'; // Silver
      case 'low':
        return '#CD7F32'; // Bronze
      default:
        return '#00D4FF';
    }
  };

  const getStageColor = (stage: string) => {
    const stageMap: Record<string, string> = {
      'Seed': '#00D4FF',
      'Series A': '#7B2FBE',
      'Series B': '#FFB800',
      'Series C': '#00FF88',
    };
    return stageMap[stage] || '#8892A4';
  };

  return (
    <div className="table-wrap fade-in">
      {sortedCompanies.length === 0 ? (
        <div style={{
          padding: '60px 24px',
          textAlign: 'center',
          background: 'rgba(13, 27, 42, 0.5)',
          borderRadius: '16px',
          border: '1px solid rgba(0, 212, 255, 0.15)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎯</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            No opportunities discovered yet.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
            Adjust ICP criteria and trigger AgentOS to begin discovery.
          </p>
        </div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th className="th-sort" onClick={() => handleSort('name')}>
                  Company Name {sortField === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="th-sort" onClick={() => handleSort('score')}>
                  Score {sortField === 'score' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th>Tier</th>
                <th className="th-sort" onClick={() => handleSort('stage')}>
                  Stage {sortField === 'stage' && (sortOrder === 'asc' ? '▲' : '▼')}
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
                  <td className="font-semibold">{c.name}</td>
                  <td>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: `conic-gradient(from 0deg, ${getScoreColor(c.score)}, transparent ${(c.score / 100) * 360}deg, rgba(0,212,255,0.1) 0deg)`,
                      position: 'relative',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: getScoreColor(c.score),
                      textShadow: `0 0 8px ${getScoreColor(c.score)}`,
                    }}>
                      <div style={{
                        position: 'absolute',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'var(--card-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: getScoreColor(c.score),
                      }}>
                        {c.score}
                      </div>
                    </div>
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
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        >
                          {t}
                        </span>
                      )) || <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>N/A</span>}
                    </div>
                  </td>
                  <td>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="btn btn-ghost btn-sm"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: `1px solid rgba(0, 212, 255, 0.3)`,
                        color: 'var(--accent-primary)',
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
                        border: `1px solid rgba(0, 212, 255, 0.3)`,
                        color: 'var(--accent-primary)',
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
              background: 'rgba(13, 27, 42, 0.5)',
              borderTop: '1px solid rgba(0, 212, 255, 0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
              Showing {sortedCompanies.length} result{sortedCompanies.length !== 1 ? 's' : ''}
            </span>
            <div
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #00D4FF, #7B2FBE)',
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
