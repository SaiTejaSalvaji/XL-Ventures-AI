import { useState } from "react";
import { FileText, Play, CheckCircle2, Clock, AlertCircle, Building2, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import DocumentProcessingWorkflow from "@/components/DocumentProcessingWorkflow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export type ProcessingStatus = "pending" | "processing" | "completed" | "error";

export interface Document {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  status: ProcessingStatus;
  progress?: number;
  opportunityId: string;
}

export interface Opportunity {
  id: string;
  name: string;
  company: string;
  sector: string;
  documentCount: number;
  pendingCount: number;
  completedCount: number;
}

const ProcessDocuments = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Sample opportunities data
  const [opportunities] = useState<Opportunity[]>([
    {
      id: "opp-1",
      name: "Series B Funding Round",
      company: "TechCorp Inc.",
      sector: "Technology",
      documentCount: 5,
      pendingCount: 3,
      completedCount: 2,
    },
    {
      id: "opp-2",
      name: "Growth Capital Investment",
      company: "GreenEnergy Solutions",
      sector: "Clean Energy",
      documentCount: 4,
      pendingCount: 2,
      completedCount: 2,
    },
    {
      id: "opp-3",
      name: "Acquisition Opportunity",
      company: "HealthTech Innovations",
      sector: "Healthcare",
      documentCount: 6,
      pendingCount: 4,
      completedCount: 2,
    },
  ]);

  // All documents with opportunity association
  const [allDocuments, setAllDocuments] = useState<Document[]>([
    {
      id: "doc-1",
      name: "Financial_Statement_Q4_2024.pdf",
      size: "2.4 MB",
      uploadDate: "2024-10-28",
      status: "pending",
      opportunityId: "opp-1",
    },
    {
      id: "doc-2",
      name: "Market_Analysis_Report.docx",
      size: "1.8 MB",
      uploadDate: "2024-10-28",
      status: "pending",
      opportunityId: "opp-1",
    },
    {
      id: "doc-3",
      name: "Investment_Proposal.pdf",
      size: "3.2 MB",
      uploadDate: "2024-10-27",
      status: "completed",
      progress: 100,
      opportunityId: "opp-1",
    },
    {
      id: "doc-4",
      name: "Risk_Assessment_Data.xlsx",
      size: "856 KB",
      uploadDate: "2024-10-27",
      status: "pending",
      opportunityId: "opp-1",
    },
    {
      id: "doc-5",
      name: "Company_Profile.pdf",
      size: "1.2 MB",
      uploadDate: "2024-10-26",
      status: "completed",
      progress: 100,
      opportunityId: "opp-1",
    },
    {
      id: "doc-6",
      name: "Environmental_Impact_Study.pdf",
      size: "3.8 MB",
      uploadDate: "2024-10-25",
      status: "pending",
      opportunityId: "opp-2",
    },
    {
      id: "doc-7",
      name: "Financial_Projections_2025.xlsx",
      size: "1.5 MB",
      uploadDate: "2024-10-25",
      status: "pending",
      opportunityId: "opp-2",
    },
    {
      id: "doc-8",
      name: "Technology_Assessment.pdf",
      size: "2.1 MB",
      uploadDate: "2024-10-24",
      status: "completed",
      progress: 100,
      opportunityId: "opp-2",
    },
    {
      id: "doc-9",
      name: "Executive_Summary.pdf",
      size: "950 KB",
      uploadDate: "2024-10-24",
      status: "completed",
      progress: 100,
      opportunityId: "opp-2",
    },
    {
      id: "doc-10",
      name: "Clinical_Trial_Results.pdf",
      size: "4.2 MB",
      uploadDate: "2024-10-23",
      status: "pending",
      opportunityId: "opp-3",
    },
    {
      id: "doc-11",
      name: "FDA_Compliance_Report.pdf",
      size: "2.9 MB",
      uploadDate: "2024-10-23",
      status: "pending",
      opportunityId: "opp-3",
    },
    {
      id: "doc-12",
      name: "Market_Research_Healthcare.docx",
      size: "1.7 MB",
      uploadDate: "2024-10-22",
      status: "pending",
      opportunityId: "opp-3",
    },
    {
      id: "doc-13",
      name: "IP_Portfolio_Analysis.pdf",
      size: "3.1 MB",
      uploadDate: "2024-10-22",
      status: "pending",
      opportunityId: "opp-3",
    },
    {
      id: "doc-14",
      name: "Financial_Statements_2024.pdf",
      size: "2.5 MB",
      uploadDate: "2024-10-21",
      status: "completed",
      progress: 100,
      opportunityId: "opp-3",
    },
    {
      id: "doc-15",
      name: "Management_Team_Bios.pdf",
      size: "890 KB",
      uploadDate: "2024-10-21",
      status: "completed",
      progress: 100,
      opportunityId: "opp-3",
    },
  ]);

  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isProcessingDialogOpen, setIsProcessingDialogOpen] = useState(false);
  const [currentProcessingDoc, setCurrentProcessingDoc] = useState<Document | null>(null);

  // Filter documents by selected opportunity
  const documents = selectedOpportunity
    ? allDocuments.filter(doc => doc.opportunityId === selectedOpportunity)
    : [];
  
  const selectedOpportunityData = opportunities.find(opp => opp.id === selectedOpportunity);

  const toggleDocumentSelection = (docId: string) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(docId)) {
      newSelection.delete(docId);
    } else {
      newSelection.add(docId);
    }
    setSelectedDocuments(newSelection);
  };

  const selectAll = () => {
    const pendingDocs = documents.filter(doc => doc.status === "pending");
    setSelectedDocuments(new Set(pendingDocs.map(doc => doc.id)));
  };

  const deselectAll = () => {
    setSelectedDocuments(new Set());
  };

  const handleProcessDocuments = () => {
    if (selectedDocuments.size === 0) {
      toast({
        title: "No documents selected",
        description: "Please select at least one document to process",
        variant: "destructive",
      });
      return;
    }

    // Start processing
    setIsProcessingDialogOpen(true);
    processNextDocument();
  };

  const processNextDocument = () => {
    const selectedDocsArray = Array.from(selectedDocuments);
    const currentIndex = documents.findIndex(
      doc => doc.id === currentProcessingDoc?.id
    );

    let nextDocId: string | null = null;

    if (currentProcessingDoc === null) {
      // Start with first document
      nextDocId = selectedDocsArray[0];
    } else {
      // Find next document to process
      const currentDocIndex = selectedDocsArray.indexOf(currentProcessingDoc.id);
      if (currentDocIndex < selectedDocsArray.length - 1) {
        nextDocId = selectedDocsArray[currentDocIndex + 1];
      }
    }

    if (nextDocId) {
      const docToProcess = documents.find(doc => doc.id === nextDocId);
      if (docToProcess) {
        setCurrentProcessingDoc(docToProcess);
        
        // Update document status to processing
        setAllDocuments(prev =>
          prev.map(doc =>
            doc.id === nextDocId
              ? { ...doc, status: "processing" as ProcessingStatus, progress: 0 }
              : doc
          )
        );

        // Simulate processing with progress
        simulateProcessing(docToProcess);
      }
    } else {
      // All documents processed
      setTimeout(() => {
        setIsProcessingDialogOpen(false);
        setCurrentProcessingDoc(null);
        setSelectedDocuments(new Set());
        toast({
          title: "Processing complete",
          description: `Successfully processed ${selectedDocsArray.length} document(s)`,
        });
      }, 1000);
    }
  };

  const simulateProcessing = (doc: Document) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setAllDocuments(prev =>
        prev.map(d =>
          d.id === doc.id ? { ...d, progress } : d
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
        // Mark as completed
        setAllDocuments(prev =>
          prev.map(d =>
            d.id === doc.id
              ? { ...d, status: "completed" as ProcessingStatus, progress: 100 }
              : d
          )
        );
        // Process next document after a short delay
        setTimeout(() => {
          processNextDocument();
        }, 800);
      }
    }, 400);
  };

  const getStatusBadge = (status: ProcessingStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="default" className="gap-1 bg-blue-500 hover:bg-blue-600">
            <AlertCircle className="h-3 w-3" />
            Processing
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="gap-1 bg-emerald-500 hover:bg-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Error
          </Badge>
        );
    }
  };

  const pendingCount = documents.filter(doc => doc.status === "pending").length;
  const completedCount = documents.filter(doc => doc.status === "completed").length;

  return (
    <div className="px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4 -ml-2 text-slate-500 hover:text-slate-900 rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Process Documents
          </h1>
          <p className="text-slate-500">
            Select an opportunity to view and process its documents with AI-powered agents
          </p>
        </div>

        {/* Opportunity Selection */}
        {!selectedOpportunity ? (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-panel p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Select an Opportunity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="glass-card p-6 cursor-pointer group hover:border-primary/50 transition-all duration-300"
                    onClick={() => setSelectedOpportunity(opp.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1 truncate group-hover:text-primary transition-colors">
                          {opp.name}
                        </h4>
                        <p className="text-sm text-slate-500 mb-3 truncate">
                          {opp.company}
                        </p>
                        <Badge variant="outline" className="mb-4 bg-white/50 dark:bg-slate-900/50">
                          {opp.sector}
                        </Badge>
                        <div className="grid grid-cols-3 gap-2 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="text-slate-500 font-medium mb-1">Total</div>
                            <div className="font-bold text-slate-900 dark:text-white">{opp.documentCount}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 font-medium mb-1">Pending</div>
                            <div className="font-bold text-amber-600 dark:text-amber-400">
                              {opp.pendingCount}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-500 font-medium mb-1">Done</div>
                            <div className="font-bold text-emerald-600 dark:text-emerald-400">
                              {opp.completedCount}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
            {/* Selected Opportunity Header */}
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Current Opportunity</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedOpportunityData?.name}
                    </div>
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{selectedOpportunityData?.company}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span> 
                      <span>{selectedOpportunityData?.sector}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedOpportunity(null);
                    setSelectedDocuments(new Set());
                  }}
                  className="rounded-full px-6"
                >
                  Change Opportunity
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <FileText className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider">Total Documents</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{documents.length}</div>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10">
                <div className="p-4 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-amber-600/80 uppercase tracking-wider mb-1">Pending</div>
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</div>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-emerald-600/80 uppercase tracking-wider mb-1">Completed</div>
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  disabled={pendingCount === 0}
                  className="rounded-full"
                >
                  Select All Pending
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll} className="rounded-full">
                  Deselect All
                </Button>
                <span className="text-sm font-medium text-slate-500 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                  <span className="text-primary font-bold">{selectedDocuments.size}</span> selected
                </span>
              </div>
              <Button
                onClick={handleProcessDocuments}
                disabled={selectedDocuments.size === 0}
                className="gap-2 rounded-full px-6 shadow-sm shadow-primary/20"
              >
                <Play className="h-4 w-4" />
                Process Selected ({selectedDocuments.size})
              </Button>
            </div>

            {/* Documents List */}
            <div className="glass-panel p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <FileText className="h-5 w-5 text-primary" />
                Documents
              </h3>
              {documents.length === 0 ? (
                <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                  <FileText className="h-12 w-12 text-slate-300 mb-4" />
                  <p>No documents found for this opportunity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                        selectedDocuments.has(doc.id)
                          ? "border-primary bg-primary/5 shadow-sm shadow-primary/5"
                          : "border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-primary/30"
                      }`}
                    >
                      <Checkbox
                        checked={selectedDocuments.has(doc.id)}
                        onCheckedChange={() => toggleDocumentSelection(doc.id)}
                        disabled={doc.status !== "pending"}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-slate-300"
                      />
                      
                      <div className={`p-2 rounded-lg ${doc.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                        <FileText className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 dark:text-white truncate">
                          {doc.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {doc.size} • Uploaded {doc.uploadDate}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {doc.status === "processing" && doc.progress !== undefined && (
                          <div className="w-32 flex items-center gap-3">
                            <Progress value={doc.progress} className="h-2 flex-1" />
                            <span className="text-xs font-medium text-slate-500">{doc.progress}%</span>
                          </div>
                        )}
                        {getStatusBadge(doc.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Processing Dialog with ReactFlow */}
      <Dialog open={isProcessingDialogOpen} onOpenChange={setIsProcessingDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl">
          <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Processing Documents
            </DialogTitle>
            <DialogDescription className="text-slate-500 mt-1">
              AI agents are processing your documents through multiple stages
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Document Info */}
            {currentProcessingDoc && (
              <div className="p-5 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white mb-1">
                      {currentProcessingDoc.name}
                    </div>
                    <div className="text-sm font-medium text-primary">
                      Processing: {currentProcessingDoc.progress || 0}% complete
                    </div>
                  </div>
                  {getStatusBadge(currentProcessingDoc.status)}
                </div>
                <Progress
                  value={currentProcessingDoc.progress || 0}
                  className="mt-4 h-2"
                />
              </div>
            )}

            {/* Processing Progress */}
            <div className="flex items-center justify-between px-2">
              <div className="text-sm font-medium text-slate-500">
                Processing <span className="text-slate-900 dark:text-white font-bold">{Array.from(selectedDocuments).findIndex(id => id === currentProcessingDoc?.id) + 1}</span> of <span className="text-slate-900 dark:text-white font-bold">{selectedDocuments.size}</span> selected documents
              </div>
              <div className="text-sm font-medium text-slate-500">
                Please don't close this window
              </div>
            </div>

            {/* ReactFlow Workflow Diagram */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 shadow-inner" style={{ height: '500px' }}>
              <DocumentProcessingWorkflow
                currentStage={
                  currentProcessingDoc?.progress
                    ? Math.floor(currentProcessingDoc.progress / 25)
                    : 0
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProcessDocuments;
