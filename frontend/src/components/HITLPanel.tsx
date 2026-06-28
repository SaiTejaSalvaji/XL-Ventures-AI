import React, { useState } from 'react';
import type { Company, Decision } from '../types';
import { approveCompany } from '../api/client';

interface HITLPanelProps {
  company: Company;
  onDecisionSubmitted: () => void;
}

export const HITLPanel: React.FC<HITLPanelProps> = ({ company, onDecisionSubmitted }) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDecision = async (decision: Decision) => {
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await approveCompany(company.id, decision, notes);
      setSuccessMsg(`✓ Decision "${decision.toUpperCase()}" recorded successfully!`);
      setNotes('');
      onDecisionSubmitted();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to submit decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card card-glass flex flex-col gap-6">
      <div>
        <h3 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-2)',
          margin: 0,
        }}>
          ✦ Human-In-The-Loop Action
        </h3>
      </div>
      
      {successMsg && (
        <div className="alert alert-success" style={{ animation: 'slideInUp 0.3s ease-out' }}>
          <span>✓</span> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-error" style={{ animation: 'slideInUp 0.3s ease-out' }}>
          <span>⚠</span> {errorMsg}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Reviewer Notes / Feedback</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter investment rationale, feedback for the pipeline, or action items..."
          className="form-input"
          style={{
            minHeight: '100px',
            resize: 'vertical',
            fontFamily: 'inherit',
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'text',
          }}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleDecision('approve')}
          disabled={isSubmitting}
          className="btn btn-success flex-1 justify-center"
          style={{
            fontWeight: 700,
            fontSize: '0.9rem',
            padding: '12px 20px',
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? '⏳ Processing...' : '✓ Approve Pipeline'}
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => handleDecision('more_info')}
            disabled={isSubmitting}
            className="btn btn-warning flex-1 justify-center"
            style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              padding: '12px 20px',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            ❓ Request Info
          </button>
          <button
            onClick={() => handleDecision('reject')}
            disabled={isSubmitting}
            className="btn btn-danger flex-1 justify-center"
            style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              padding: '12px 20px',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            ✕ Reject
          </button>
        </div>
      </div>
    </div>
  );
};
