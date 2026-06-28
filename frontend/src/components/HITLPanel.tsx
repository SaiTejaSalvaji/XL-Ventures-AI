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
      setSuccessMsg(`Decision "${decision.toUpperCase()}" recorded successfully!`);
      setNotes('');
      onDecisionSubmitted();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to submit decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card card-glass flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase text-secondary tracking-wider">Human-In-The-Loop Action</h3>
      
      {successMsg && (
        <div className="alert alert-success text-xs">
          <span>✓</span> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-error text-xs">
          <span>⚠</span> {errorMsg}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Reviewer Notes / Feedback</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter investment rationale notes, feedback for the pipeline, or action items..."
          className="form-input"
          style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-3 mt-1">
        <button
          onClick={() => handleDecision('approve')}
          disabled={isSubmitting}
          className="btn btn-success flex-1 justify-center btn-sm font-bold"
        >
          Approve Pipeline
        </button>
        <button
          onClick={() => handleDecision('more_info')}
          disabled={isSubmitting}
          className="btn btn-warning flex-1 justify-center btn-sm font-bold"
        >
          Request Info
        </button>
        <button
          onClick={() => handleDecision('reject')}
          disabled={isSubmitting}
          className="btn btn-danger flex-1 justify-center btn-sm font-bold"
        >
          Reject Opportunity
        </button>
      </div>
    </div>
  );
};
