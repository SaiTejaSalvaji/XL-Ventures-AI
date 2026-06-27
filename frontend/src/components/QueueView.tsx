import React, { useState, useEffect } from "react";
import { Check, X, Edit3, Mail, Calendar, DollarSign, Cpu, CheckSquare } from "lucide-react";

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

interface Lead {
  id: number;
  execution_id: string;
  company_name: string;
  domain: string;
  industry: string;
  company_size: string;
  location: string;
  tech_stack: string;
  funding_status: string;
  hiring_status: string;
  decision_maker_name: string;
  decision_maker_role: string;
  decision_maker_email: string;
  decision_maker_linkedin: string;
  confidence_score: number;
  recommendation_reason: string;
  status: string;
}

export default function QueueView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Form states for editor modal
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editReason, setEditReason] = useState("");

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/approvals");
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (e) {
      console.error("Error loading approval queue:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (leadId: number, status: string, updatedData?: any) => {
    try {
      const payload: any = { status };
      if (updatedData) {
        payload.edit_data = updatedData;
      }

      const res = await fetch(`http://localhost:8000/api/approvals/${leadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Filter out resolved lead
        setLeads(leads.filter((l: Lead) => l.id !== leadId));
        setEditingLead(null);
      } else {
        alert("Failed to update lead status.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openEditor = (lead: Lead) => {
    setEditingLead(lead);
    setEditName(lead.decision_maker_name || "");
    setEditRole(lead.decision_maker_role || "");
    setEditEmail(lead.decision_maker_email || "");
    setEditReason(lead.recommendation_reason || "");
  };

  const saveEdit = () => {
    if (!editingLead) return;
    const edits = {
      decision_maker_name: editName,
      decision_maker_role: editRole,
      decision_maker_email: editEmail,
      recommendation_reason: editReason
    };
    handleAction(editingLead.id, "APPROVED", edits);
  };

  if (loading) {
    return (
      <div className="text-zinc-500 flex items-center justify-center h-48">
        <span>Loading approval queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Human Approval Queue</h1>
        <p className="text-zinc-400 mt-1">Review, refine, or approve AI-generated sales recommendations.</p>
      </div>

      {leads.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
          <CheckSquare className="h-12 w-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-semibold text-white font-display">Queue Clear!</h3>
          <p className="text-zinc-400 text-sm">All leads have been processed. Configure and start a new workflow run to discover more prospects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {leads.map((lead: Lead) => (
            <div key={lead.id} className="glass-card p-6 rounded-2xl grid grid-cols-1 lg:grid-cols-4 gap-6 relative overflow-hidden">
              
              {/* Profile details */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold text-white font-display">{lead.company_name}</h3>
                  <a href={`https://${lead.domain}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline">
                    {lead.domain}
                  </a>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700/80">
                    {lead.location}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center space-x-2 text-zinc-400">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <span>Hiring: <strong className="text-zinc-200">{lead.hiring_status || "N/A"}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-zinc-400">
                    <DollarSign className="h-4 w-4 text-zinc-500" />
                    <span>Funding: <strong className="text-zinc-200">{lead.funding_status || "N/A"}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-zinc-400">
                    <Cpu className="h-4 w-4 text-zinc-500" />
                    <span>Stack: <strong className="text-zinc-200">{lead.tech_stack || "N/A"}</strong></span>
                  </div>
                </div>

                {/* Decision Maker detail */}
                <div className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Prospect</p>
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <strong className="text-white">{lead.decision_maker_name}</strong>
                      <span className="text-zinc-400 ml-2">({lead.decision_maker_role})</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      {lead.decision_maker_email && (
                        <a href={`mailto:${lead.decision_maker_email}`} className="flex items-center space-x-1 text-indigo-400 hover:underline">
                          <Mail className="h-3.5 w-3.5" />
                          <span>Email</span>
                        </a>
                      )}
                      {lead.decision_maker_linkedin && (
                        <a href={`https://${lead.decision_maker_linkedin}`} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-indigo-400 hover:underline">
                          <LinkedinIcon className="h-3.5 w-3.5" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs leading-relaxed text-zinc-400">
                  <strong className="text-zinc-300">AI Reasoning: </strong> {lead.recommendation_reason}
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-zinc-800/80 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-between items-center text-center">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Match Score</p>
                  <div className="relative flex items-center justify-center mt-3">
                    {/* Glowing Score Ring */}
                    <div className="h-16 w-16 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center">
                      <span className="text-xl font-bold font-display text-emerald-400">
                        {Math.round(lead.confidence_score * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full gap-2.5 mt-6 lg:mt-0">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(lead.id, "APPROVED")}
                      className="flex-grow flex items-center justify-center space-x-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button 
                      onClick={() => handleAction(lead.id, "REJECTED")}
                      className="flex-grow flex items-center justify-center space-x-1.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      <X className="h-4 w-4 text-red-400" />
                      <span>Reject</span>
                    </button>
                  </div>
                  <button 
                    onClick={() => openEditor(lead)}
                    className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-zinc-900 border border-zinc-750 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Lead</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white font-display border-b border-zinc-800 pb-3">Edit Prospect Details</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-semibold text-zinc-400">Prospect Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-indigo-500 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">Prospect Role</label>
                <input 
                  type="text" 
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-indigo-500 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">Prospect Email</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-indigo-500 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">AI Reasoning Evidence</label>
                <textarea 
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-indigo-500 text-white resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-800">
              <button 
                onClick={() => setEditingLead(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={saveEdit}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Approve & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
