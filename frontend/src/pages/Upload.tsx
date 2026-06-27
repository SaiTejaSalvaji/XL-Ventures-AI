import { useState } from "react";
import { Upload as UploadIcon, FileText, X, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      toast({
        title: "Files added",
        description: `${newFiles.length} file(s) ready for analysis`,
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one document",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis complete",
        description: "AI agents have finished analyzing your documents",
      });
      navigate("/analysis");
    }, 3000);
  };

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4 -ml-2 text-slate-500 hover:text-slate-900 rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          Upload Investment Documents
        </h1>
        <p className="text-slate-500">
          Upload financial documents, reports, and data for AI-powered analysis
        </p>
      </div>

      <div className="glass-panel p-8 mb-6 rounded-2xl">
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-xl p-12 text-center hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all duration-300">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload" className="cursor-pointer block w-full h-full">
            <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadIcon className="h-8 w-8 text-primary/70" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
              Drop files here or click to upload
            </h3>
            <p className="text-sm text-slate-500">
              Supports PDF, DOC, DOCX, XLS, XLSX, CSV, TXT
            </p>
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <div className="glass-panel p-6 mb-8 rounded-2xl animate-fade-in">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Uploaded Documents ({files.length})
          </h3>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-sm transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="rounded-full px-6">
          Cancel
        </Button>
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || files.length === 0}
          className="min-w-[200px] rounded-full shadow-sm shadow-primary/20"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Start AI Analysis
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Upload;
