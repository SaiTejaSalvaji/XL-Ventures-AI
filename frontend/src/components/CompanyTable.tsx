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

  return (
    <div className="table-wrap fade-in">
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedCompanies.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center text-secondary py-8" style={{ textAlign: 'center' }}>
                No opportunities discovered yet. Adjust ICP criteria and trigger AgentOS.
              </td>
            </tr>
          ) : (
            sortedCompanies.map((c) => (
              <tr key={c.id} onClick={() => onSelectCompany(c)}>
                <td className="font-bold">{c.name}</td>
                <td className={`font-bold ${c.score >= 75 ? 'text-green' : c.score >= 50 ? 'text-yellow' : 'text-red'}`}>
                  {c.score}/100
                </td>
                <td>
                  <ScoreBadge tier={c.tier} />
                </td>
                <td>
                  <span className="badge badge-info">{c.stage}</span>
                </td>
                <td>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap', maxWidth: '300px' }}>
                    {c.tech_stack?.slice(0, 3).map((t) => (
                      <span key={t} className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', fontSize: '0.65rem' }}>
                        {t}
                      </span>
                    )) || <span className="text-muted text-xs">N/A</span>}
                  </div>
                </td>
                <td>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-accent"
                  >
                    {c.url.replace('https://', '').replace('www.', '').split('/')[0]}
                  </a>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm">Research Report</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
