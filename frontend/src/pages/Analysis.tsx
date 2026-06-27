import { useState, useEffect } from "react";
import { ArrowLeft, Brain, TrendingUp, AlertTriangle, CheckCircle, BarChart3, Play, Clock, FileText, Expand, Copy, Check, FileCheck, FileX, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatInterface from "@/components/ChatInterface";
import { AnalysisProcessingWorkflow } from "@/components/AnalysisProcessingWorkflow";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import * as analysisApi from "@/lib/api/analysis";
import * as opportunitiesApi from "@/lib/api/opportunities";
import * as documentsApi from "@/lib/api/documents";
import { getClientIdForAnalysis } from "@/lib/utils";
import type { Analysis as AnalysisType, Opportunity, ProcessingStatistics } from "@/lib/api/types";

const Analysis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const opportunityId = searchParams.get("opid") || "";
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisType[]>([]);
  const [processingStats, setProcessingStats] = useState<ProcessingStatistics | null>(null);
    
  // UI states
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [isNewRunDialogOpen, setIsNewRunDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [analysisRunName, setAnalysisRunName] = useState("");
  const [investmentHypothesis, setInvestmentHypothesis] = useState("");
  const [isAnalysisRunning, setIsAnalysisRunning] = useState(false);
  const [isCreatingAnalysis, setIsCreatingAnalysis] = useState(false);
  const [isDeletingAnalysis, setIsDeletingAnalysis] = useState(false);
  const [useSoftDelete, setUseSoftDelete] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!opportunityId) {
        setError("No opportunity ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch opportunity details, analyses, and processing statistics in parallel
        const [opportunityData, analysesData, docProcessingStatsData] = await Promise.all([
          opportunitiesApi.getOpportunity(opportunityId),
          analysisApi.getAnalysesByOpportunity(opportunityId),
          documentsApi.getProcessingStatistics(opportunityId).catch(() => null), // Gracefully handle if no documents
        ]);

        setOpportunity(opportunityData);
        setAnalyses(analysesData);
        setProcessingStats(docProcessingStatsData);

        // Set the first analysis as selected by default
        if (analysesData.length > 0 && !selectedRunId) {
          setSelectedRunId(analysesData[0].id);

          setIsAnalysisRunning(analysesData[0].status === "in_progress" || analysesData[0].status === "pending");
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load analysis data");
        toast({
          title: "Error",
          description: "Failed to load analysis data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [opportunityId]);

  const opportunityName = opportunity?.display_name || "Investment Opportunity";

  // Document processing status - use API data if available, otherwise show empty state
  const documents = processingStats ? {
    total: processingStats.total_documents,
    pending: processingStats.pending,
    processing: processingStats.in_progress,
    completed: processingStats.completed,
    error: processingStats.failed,
  } : {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    error: 0,
  };

  const allDocumentsProcessed = documents.completed === documents.total && documents.total > 0;
  const hasDocuments = documents.total > 0;
  const processingProgress = hasDocuments ? Math.round((documents.completed / documents.total) * 100) : 0;

  // Transform API analyses to the format expected by the UI
  const analysisRuns = analyses.map(analysis => ({
    id: analysis.id,
    name: analysis.name,
    date: new Date(analysis.created_at).toISOString().split('T')[0],
    time: new Date(analysis.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    status: analysis.status,
  }));

  const handleNewAnalysisRun = () => {
    setIsNewRunDialogOpen(true);
  };

  const handleConfirmRun = async () => {
    if (!opportunityId || !analysisRunName.trim()) {
      return;
    }

    try {
      setIsCreatingAnalysis(true);
      
      // Create the analysis via API
      const newAnalysis = await analysisApi.createAnalysis({
        name: analysisRunName,
        opportunity_id: opportunityId,
        investment_hypothesis: investmentHypothesis || undefined,
        tags: [],
      });

      // Add the new analysis to the list
      setAnalyses([newAnalysis, ...analyses]);
      setSelectedRunId(newAnalysis.id);

      toast({
        title: "Analysis Created",
        description: `"${analysisRunName}" has been created successfully.`,
      });

      // Close dialog and reset form
      setIsNewRunDialogOpen(false);
      setAnalysisRunName("");
      setInvestmentHypothesis("");

      // Start the analysis
      const startedAnalysis = await analysisApi.startAnalysis(getClientIdForAnalysis(), opportunityId, newAnalysis.id);
      
      // Update the analysis status in the list
      setAnalyses(prev => prev.map(a => 
        a.id === startedAnalysis.id ? { ...a, status: startedAnalysis.status } : a
      ));
     
    } catch (err: any) {
      console.error("Error creating or starting analysis:", err);
      console.log(err);
      toast({
        title: "Error Creating or Starting Analysis",
        description: JSON.stringify(err.detail) || err.message || "Failed to create analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAnalysis(false);
    }
  };

  const isSelectedAnalysisRunning = () => {
    const selectedAnalysis = analyses.find(a => a.id === selectedRunId);
    return selectedAnalysis?.status === "in_progress" || selectedAnalysis?.status === "pending";
  };

  const isAnyAnalysisRunning = () => {
    return analyses.some(a => a.status === "in_progress" || a.status === "pending");
  };

  const handleAnalysisWorkflowComplete = (status: string, data: any) => {
    setIsAnalysisRunning(false);
    
    // Update the analysis status when complete
    setAnalyses(prev => prev.map(a => 
      a.id === selectedRunId ? { ...a, status: status as AnalysisType['status'] } : a
    ));
  };

  const handleCancelRun = () => {
    setIsNewRunDialogOpen(false);
    setAnalysisRunName("");
    setInvestmentHypothesis("");
  };

  const handleDeleteAnalysis = async () => {
    if (!opportunityId || !selectedRunId) {
      return;
    }

    try {
      setIsDeletingAnalysis(true);
      
      // Get the analysis name before deleting for the toast message
      const analysisToDelete = analyses.find(a => a.id === selectedRunId);
      const analysisName = analysisToDelete?.name || "Analysis";

      // Delete the analysis via API with the selected soft delete option
      await analysisApi.deleteAnalysis(opportunityId, selectedRunId, useSoftDelete);

      // Remove the deleted analysis from the list
      const updatedAnalyses = analyses.filter(a => a.id !== selectedRunId);
      setAnalyses(updatedAnalyses);

      // Select the first remaining analysis, or clear selection if none left
      if (updatedAnalyses.length > 0) {
        setSelectedRunId(updatedAnalyses[0].id);
      } else {
        setSelectedRunId("");
      }

      toast({
        title: "Analysis Deleted",
        description: `"${analysisName}" has been ${useSoftDelete ? 'soft' : 'permanently'} deleted successfully.`,
      });

      setIsDeleteDialogOpen(false);
      setUseSoftDelete(true); // Reset to default
    } catch (err: any) {
      console.error("Error deleting analysis:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAnalysis(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center glass-panel p-8 rounded-2xl">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-500 font-medium">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !opportunityId) {
    return (
      <div className="px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4 text-slate-500 hover:text-slate-900 rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="glass-panel p-12 rounded-2xl max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-full border border-red-100 dark:border-red-900/30">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {error || "No Opportunity Selected"}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {error ? "Please try again and check that the API is running." : "Please select an opportunity from the dashboard."}
              </p>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="gap-2 rounded-full mt-4">
              <ArrowLeft className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4 -ml-2 text-slate-500 hover:text-slate-900 rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">
              Investment Analysis
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              {opportunityName}
            </h1>
            <p className="text-slate-500">
              Multi-agent AI analysis & due diligence
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Analysis Run Selector and Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Analysis Run Selector - Left Column */}
        {analysisRuns.length > 0 && (
          <div className="glass-panel rounded-2xl p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" />
                  Analysis Runs
                </h3>
                <Button 
                  size="sm"
                  onClick={handleNewAnalysisRun}
                  disabled={isCreatingAnalysis || isAnyAnalysisRunning()}
                  className="rounded-full shadow-sm text-xs px-4"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  New Run
                </Button>
              </div>
              <Select value={selectedRunId} onValueChange={setSelectedRunId} disabled={isCreatingAnalysis || isDeletingAnalysis}>
                <SelectTrigger className="w-full h-11 rounded-xl bg-white/50 dark:bg-slate-900/50">
                  <SelectValue placeholder="Select an analysis run" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {analysisRuns.map((run) => (
                    <SelectItem key={run.id} value={run.id} className="rounded-lg my-1">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{run.name}</span>
                        <span className="ml-4 text-xs text-slate-500">
                          {run.date} - {run.time} - {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRunId && (
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={isCreatingAnalysis || isDeletingAnalysis || isSelectedAnalysisRunning()}
                    className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 w-full rounded-lg"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete Analysis Run
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document Processing Status - Right Column */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Documents
              </h3>
              {hasDocuments && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs h-6 px-2.5 rounded-full border-slate-200">
                    {documents.total} Total
                  </Badge>
                  {allDocumentsProcessed ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-xs h-6 px-2.5 rounded-full">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-xs h-6 px-2.5 rounded-full">
                      <Clock className="h-3 w-3 mr-1" />
                      {documents.completed}/{documents.total}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/process-documents?opportunityId=${opportunityId}`)}
              className="h-8 text-xs rounded-full px-4"
            >
              Manage
            </Button>
          </div>

          {!hasDocuments ? (
            <Alert className="py-3 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl">
              <FileX className="h-4 w-4 text-slate-400" />
              <AlertTitle className="text-sm font-medium mb-0">No Documents Uploaded</AlertTitle>
              <AlertDescription className="text-xs text-slate-500 mt-1">
                Upload business documents to enable AI analysis.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="flex-1">
                  <Progress value={processingProgress} className="h-2 bg-slate-100 dark:bg-slate-800" />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 min-w-[3rem] text-right">
                  {processingProgress}%
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="text-center py-2 px-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{documents.completed}</div>
                  <div className="text-[10px] font-medium text-emerald-600/80 uppercase tracking-wider">Done</div>
                </div>
                <div className="text-center py-2 px-1 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{documents.processing}</div>
                  <div className="text-[10px] font-medium text-blue-600/80 uppercase tracking-wider">Active</div>
                </div>
                <div className="text-center py-2 px-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{documents.pending}</div>
                  <div className="text-[10px] font-medium text-amber-600/80 uppercase tracking-wider">Queue</div>
                </div>
                <div className="text-center py-2 px-1 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">{documents.error}</div>
                  <div className="text-[10px] font-medium text-red-600/80 uppercase tracking-wider">Error</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {!allDocumentsProcessed ? (
        <div className="glass-panel p-12 rounded-2xl">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-5 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-100 dark:border-amber-900/30">
              <FileText className="h-10 w-10 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Documents Processing Required
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Process all opportunity documents to unlock the multi-agent AI analysis workflows.
              </p>
            </div>
            <Button
              onClick={() => navigate(`/process-documents?opportunityId=${opportunityId}`)}
              className="gap-2 rounded-full mt-4 px-6 shadow-sm shadow-primary/20"
            >
              <FileText className="h-4 w-4" />
              Process Documents
            </Button>
          </div>
        </div>
      ) : (
        <>
          {analysisRuns.length === 0 ? (
            <div className="glass-panel p-12 mb-8 rounded-2xl">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-5 bg-primary/10 rounded-full border border-primary/20">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    No Analysis Runs Yet
                  </h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Create your first AI-powered investment analysis run to get started with due diligence.
                  </p>
                </div>
                <Button
                  onClick={handleNewAnalysisRun}
                  className="gap-2 rounded-full mt-4 px-6 shadow-sm shadow-primary/20"
                >
                  <Play className="h-4 w-4" />
                  New Analysis Run
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Analysis with Real-Time Events */}
              {selectedRunId && (
                <div className="glass-panel rounded-2xl p-6 mb-8 overflow-hidden">
                  <AnalysisProcessingWorkflow
                    opportunityId={opportunityId}
                    analysisId={selectedRunId}
                    analysisStatus={analyses.find(a => a.id === selectedRunId)?.status}
                    onComplete={(status, data) => {
                      handleAnalysisWorkflowComplete(status, data);
                    }}
                  />
                </div>
              )}

              {/* What If Analysis Section */}
              {analyses.find(a => a.id === selectedRunId)?.status === 'completed' && (
                <div className="mt-8 mb-8 glass-panel rounded-2xl overflow-hidden">
                  <ChatInterface analysis_id={selectedRunId} opportunity_id={opportunityId} />
                </div>
              )}
            </>
          )}
        </>
      )}

      <Dialog open={isNewRunDialogOpen} onOpenChange={setIsNewRunDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-xl font-bold">New Analysis Run</DialogTitle>
            <DialogDescription className="text-slate-500 mt-1">
              Enter a name for the new analysis run and provide guidance for the AI agents.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor="analysis-name" className="font-semibold text-slate-700 dark:text-slate-300">Analysis Run Name</Label>
              <Input
                id="analysis-name"
                placeholder="e.g., Q3 Tech Due Diligence"
                value={analysisRunName}
                onChange={(e) => setAnalysisRunName(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="investment-hypothesis" className="font-semibold text-slate-700 dark:text-slate-300">Investment Hypothesis (Optional)</Label>
              <Textarea
                id="investment-hypothesis"
                placeholder="Describe your investment hypothesis, key assumptions, or specific areas you'd like the AI agents to focus on..."
                value={investmentHypothesis}
                onChange={(e) => setInvestmentHypothesis(e.target.value)}
                rows={4}
                className="resize-none rounded-xl"
              />
              <p className="text-xs text-slate-500 mt-1">
                This context helps tailor the multi-agent analysis to your specific goals.
              </p>
            </div>
          </div>
          <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button 
              variant="outline" 
              onClick={handleCancelRun}
              disabled={isCreatingAnalysis}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmRun}
              disabled={!analysisRunName.trim() || isCreatingAnalysis}
              className="rounded-full px-6 shadow-sm"
            >
              {isCreatingAnalysis ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Confirm Run"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Analysis Run
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-300 mt-2">
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">"{analyses.find(a => a.id === selectedRunId)?.name}"</span>? 
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-3 py-4 mt-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <Checkbox 
              id="soft-delete" 
              checked={useSoftDelete}
              onCheckedChange={(checked) => setUseSoftDelete(checked as boolean)}
              className="rounded text-primary focus:ring-primary"
            />
            <label
              htmlFor="soft-delete"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Soft delete (mark as inactive)
            </label>
          </div>
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeletingAnalysis}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteAnalysis}
              disabled={isDeletingAnalysis}
              className="rounded-full px-6 shadow-sm"
            >
              {isDeletingAnalysis ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
    </div>
  );
};

export default Analysis;