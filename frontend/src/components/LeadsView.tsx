import React, { useEffect, useState } from "react";
import { Download, Building2, User, Mail, FileText, CheckCircle } from "lucide-react";

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
  created_at: string;
}

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/leads");
      if (res.ok) {
        const data = await res.json();
        // Filter only approved leads
        setLeads(data.filter((l: Lead) => l.status === "APPROVED"));
      }
    } catch (e) {
      console.error("Error loading leads:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    if (leads.length === 0) return;
    setExporting(true);
    try {
      // Trigger report agent execution schema
      const res = await fetch("http://localhost:8500", { method: "HEAD" }); // quick bypass check
    } catch(e) {}
    
    // Convert leads to download payload locally or trigger server write
    const headers = [
      "Company", "Domain", "Industry", "Location", "Size", "Tech Stack", 
      "Funding", "Hiring", "Decision Maker", "Role", "Email", "LinkedIn", "Score", "Reason"
    ];
    
    let fileContent = "";
    let mimeType = "";
    let fileExt = "";
    
    if (format === "csv") {
      mimeType = "text/csv";
      fileExt = "csv";
      const csvRows = [headers.join(",")];
      
      for (const lead of leads) {
        const row = [
          `"${lead.company_name}"`,
          `"${lead.domain}"`,
          `"${lead.industry || ""}"`,
          `"${lead.location || ""}"`,
          `"${lead.company_size || ""}"`,
          `"${lead.tech_stack || ""}"`,
          `"${lead.funding_status || ""}"`,
          `"${lead.hiring_status || ""}"`,
          `"${lead.decision_maker_name || ""}"`,
          `"${lead.decision_maker_role || ""}"`,
          `"${lead.decision_maker_email || ""}"`,
          `"${lead.decision_maker_linkedin || ""}"`,
          lead.confidence_score,
          `"${lead.recommendation_reason.replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(","));
      }
      fileContent = csvRows.join("\n");
    } else {
      mimeType = "application/json";
      fileExt = "json";
      fileContent = JSON.stringify(leads, null, 2);
    }
    
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prospect_pilot_leads_${new Date().toISOString().split('T')[0]}.${fileExt}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="text-zinc-500 flex items-center justify-center h-48">
        <span>Loading qualified database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Qualified Leads</h1>
          <p className="text-zinc-400 mt-1">Review approved prospects and export accounts for outreach.</p>
        </div>

        {leads.length > 0 && (
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => handleExport("csv")}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold glow-primary transition cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={() => handleExport("json")}
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Export JSON</span>
            </button>
          </div>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
          <Building2 className="h-12 w-12 text-zinc-650 mx-auto" />
          <h3 className="text-lg font-semibold text-white font-display">No leads approved yet</h3>
          <p className="text-zinc-400 text-sm">Leads will appear here once they have been approved in the Human Approval Queue.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase font-semibold tracking-wider">
                  <th className="p-4">Company</th>
                  <th className="p-4">Decision Maker</th>
                  <th className="p-4">Hiring Details</th>
                  <th className="p-4">Contact Detail</th>
                  <th className="p-4 text-center">Score</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {leads.map((lead: Lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-900/40 transition">
                    <td className="p-4">
                      <div className="font-semibold text-white">{lead.company_name}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{lead.domain}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white">{lead.decision_maker_name}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{lead.decision_maker_role}</div>
                    </td>
                    <td className="p-4 text-zinc-400 max-w-xs truncate">
                      {lead.hiring_status || "N/A"}
                    </td>
                    <td className="p-4 font-mono text-[10px] space-y-1">
                      <div className="text-zinc-300 flex items-center space-x-1.5">
                        <Mail className="h-3 w-3 text-zinc-500" />
                        <span>{lead.decision_maker_email}</span>
                      </div>
                      {lead.decision_maker_linkedin && (
                        <div className="text-indigo-400 flex items-center space-x-1.5">
                          <LinkedinIcon className="h-3 w-3 text-zinc-500" />
                          <span className="truncate max-w-[150px]">{lead.decision_maker_linkedin}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center font-bold text-emerald-400">
                      {Math.round(lead.confidence_score * 100)}%
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900 flex items-center justify-center space-x-1 max-w-[85px] mx-auto">
                        <CheckCircle className="h-2.5 w-2.5" />
                        <span>Approved</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
