import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Building2,
  Calendar,
  FileText,
  ArrowRight,
  Search,
  Pencil,
  Loader2,
  AlertCircle,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { opportunities, documents } from "@/lib/api";
import type { Opportunity as APIOpportunity } from "@/lib/api/types";
import Dashboard from "@/components/Dashboard";

interface OpportunityWithDocs extends APIOpportunity {
  documentsCount: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [opportunitiesList, setOpportunitiesList] = useState<OpportunityWithDocs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const opps = await opportunities.getOpportunities(true);
        const oppsWithDocs = await Promise.all(
          opps.map(async (opp) => {
            try {
              const docs = await documents.getDocuments(opp.id);
              return { ...opp, documentsCount: docs.length };
            } catch (err) {
              console.error(`Error fetching docs for opp ${opp.id}:`, err);
              return { ...opp, documentsCount: 0 };
            }
          })
        );
        
        setOpportunitiesList(oppsWithDocs);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError(err instanceof Error ? err.message : 'Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const filteredOpportunities = opportunitiesList.filter(
    (opp) =>
      opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-12">
      {/* Executive Dashboard Section */}
      <Dashboard />
      
      {/* Opportunities Section */}
      <div className="px-2 sm:px-6 mt-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
              Active Opportunities
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage and analyze your current investment pipeline
            </p>
          </div>
          <Button
            onClick={() => navigate("/opportunity/new")}
            className="mt-4 md:mt-0 rounded-full px-6 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all duration-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Opportunity
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16 glass-card rounded-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 font-medium text-slate-600 dark:text-slate-300">Syncing opportunities...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-300">Error loading opportunities</h3>
                <p className="text-sm text-red-700 dark:text-red-400/80 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Search Bar */}
            <div className="mb-6 relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all text-sm"
              />
            </div>

            {/* Opportunities List */}
            <div className="space-y-4">
              {filteredOpportunities.length > 0 && (
                filteredOpportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className="glass-panel p-6 rounded-2xl hover:shadow-md transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/analysis?opid=${opportunity.id}`)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            {opportunity.display_name || opportunity.name}
                          </h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 text-sm leading-relaxed max-w-3xl">
                          {opportunity.description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {opportunity.settings?.company && (
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 font-medium">
                              <Building2 className="h-3.5 w-3.5 text-slate-500" />
                              {opportunity.settings.company}
                            </div>
                          )}
                          {opportunity.settings?.stage && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent">
                              {opportunity.settings.stage}
                            </Badge>
                          )}
                          {opportunity.settings?.industry && (
                            <Badge variant="secondary" className="bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 border-transparent">
                              {opportunity.settings.industry}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs ml-auto sm:ml-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(opportunity.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <FileText className="h-3.5 w-3.5" />
                            {opportunity.documentsCount} doc{opportunity.documentsCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 lg:ml-6 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/opportunity/edit?id=${opportunity.id}`);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          className="rounded-full px-5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 shadow-sm"
                        >
                          Analyze
                          <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Empty State */}
            {opportunitiesList.length === 0 && (
              <div className="glass-panel rounded-2xl p-16 text-center max-w-2xl mx-auto mt-12">
                <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FolderOpen className="h-10 w-10 text-primary/40" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                  No Active Opportunities
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                  Start building your investment pipeline by creating a new opportunity. You'll be able to upload documents and run AI analysis immediately.
                </p>
                <Button onClick={() => navigate("/opportunity/new")} size="lg" className="rounded-full shadow-md shadow-primary/20">
                  <Plus className="mr-2 h-5 w-5" />
                  Create First Opportunity
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
