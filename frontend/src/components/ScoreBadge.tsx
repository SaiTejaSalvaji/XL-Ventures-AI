import React from 'react';
import type { Tier } from '../types';

interface ScoreBadgeProps {
  tier: Tier;
  className?: string;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ tier, className = '' }) => {
  const getBadgeClass = (t: Tier) => {
    switch (t) {
      case 'High':
        return 'badge-high';
      case 'Medium':
        return 'badge-medium';
      case 'Low':
        return 'badge-low';
      default:
        return 'badge-info';
    }
  };

  return (
    <span className={`badge ${getBadgeClass(tier)} ${className}`}>
      {tier}
    </span>
  );
};
