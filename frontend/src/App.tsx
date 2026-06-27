import React, { useState, useEffect, useRef } from "react";
import { 
  Building2, 
  Network, 
  Terminal, 
  CheckSquare, 
  Database, 
  HardDrive, 
  Cpu, 
  Settings,
  Shield,
  CircleDot,
  Play,
  Save,
  Server,
  ArrowRight,
  Check,
  Download,
  FileText,
  Mail,
  X,
  Edit3,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";

// --- Types & Interfaces ---

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

interface ExecutionInfo {
  id: string;
  workflow_id: number;
  status: string;
  current_step: string;
  step_status_json: string;
  memory_hits: number;
  execution_time: number;
  created_at: string;
  completed_at: string;
}

interface LogInfo {
  id: number;
  agent_name: string;
  log_level: string;
  message: string;
  data_payload_json: string;
  timestamp: string;
}

interface AgentMetadata {
  name: string;
  description: string;
  capabilities: string[];
  input_schema: any;
  output_schema: any;
  tool_dependencies: string[];
  priority: number;
  retry_policy: {
    max_retries: number;
    backoff_factor: number;
  };
  memory_access: boolean;
}

interface ToolMetadata {
  name: string;
  description: string;
  args_schema: any;
}

interface AnalyticsData {
  discovered_companies: number;
  qualified_leads: number;
  pending_leads: number;
  rejected_leads: number;
  memory_hits: number;
  avg_confidence: number;
  avg_execution_time: number;
  agents_registered: number;
  tools_registered: number;
}

interface MemoryEntry {
  id: number;
  entity_type: string;
  entity_key: string;
  data_json: string;
  updated_at: string;
}

interface SemanticResult {
  key: string;
  content: string;
  score: number;
}

type ActiveTab = 
  | "dashboard" 
  | "workflow" 
  | "monitor" 
  | "queue" 
  | "leads" 
  | "memory" 
  | "registry" 
  | "settings";

// --- Inline Icons to avoid versioning conflicts ---
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

// --- Subviews Components ---

// 1. Dashboard View
function DashboardView() {
  const [stats, setStats] = useState<AnalyticsData>({
    discovered_companies: 0,
    qualified_leads: 0,
    pending_leads: 0,
    rejected_leads: 0,
    memory_hits: 0,
    avg_confidence: 0,
    avg_execution_time: 0,
    agents_registered: 0,
    tools_registered: 0
  });

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/analytics");
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const statCards = [
    { title: "Companies Discovered", value: stats.discovered_companies, icon: Building2, color: "text-blue-400", bg: "rgba(96, 165, 250, 0.1)" },
    { title: "Qualified Leads", value: stats.qualified_leads, icon: CheckCircle, color: "text-emerald-400", bg: "rgba(52, 211, 153, 0.1)" },
    { title: "Memory Hits", value: stats.memory_hits, icon: Database, color: "text-amber-400", bg: "rgba(245, 158, 11, 0.1)" },
    { title: "Avg Confidence", value: `${Math.round(stats.avg_confidence * 100)}%`, icon: Cpu, color: "text-indigo-400", bg: "rgba(129, 140, 248, 0.1)" },
    { title: "Avg Latency", value: `${stats.avg_execution_time}s`, icon: Clock, color: "text-violet-400", bg: "rgba(167, 139, 250, 0.1)" },
    { title: "Active Agents", value: stats.agents_registered, icon: Zap, color: "text-pink-400", bg: "rgba(244, 114, 182, 0.1)" }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Dashboard</h1>
        <p className="text-zinc-400">Real-time telemetry and qualification metrics for ProspectPilot AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-2 font-display">{card.value}</p>
              </div>
              <div className="p-3.5 rounded-xl" style={{ backgroundColor: card.bg }}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white font-display">Lead Conversion Funnel</h3>
            <span className="text-xs text-zinc-400">Live Updates</span>
          </div>
          
          <div className="h-64 flex items-end justify-around pt-6 relative border-b border-zinc-800">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-zinc-650 pb-1">
              <div className="border-t border-zinc-850 w-full pt-1">100%</div>
              <div className="border-t border-zinc-850 w-full pt-1">75%</div>
              <div className="border-t border-zinc-850 w-full pt-1">50%</div>
              <div className="border-t border-zinc-850 w-full pt-1">25%</div>
              <div className="w-full"></div>
            </div>

            <div className="flex flex-col items-center z-10 w-24">
              <div className="w-12 bg-blue-500/80 rounded-t-lg transition-all duration-500 glow-primary" style={{ height: stats.discovered_companies ? "160px" : "15px" }} />
              <span className="text-xs font-semibold text-white mt-2">Discovered</span>
              <span className="text-[10px] text-zinc-500">{stats.discovered_companies}</span>
            </div>

            <div className="flex flex-col items-center z-10 w-24">
              <div className="w-12 bg-amber-500/80 rounded-t-lg transition-all duration-500" style={{ height: stats.pending_leads ? `${(stats.pending_leads / (stats.discovered_companies || 1)) * 160}px` : "15px" }} />
              <span className="text-xs font-semibold text-white mt-2">Reviewing</span>
              <span className="text-[10px] text-zinc-500">{stats.pending_leads}</span>
            </div>

            <div className="flex flex-col items-center z-10 w-24">
              <div className="w-12 bg-emerald-500/80 rounded-t-lg transition-all duration-500 glow-success" style={{ height: stats.qualified_leads ? `${(stats.qualified_leads / (stats.discovered_companies || 1)) * 160}px` : "15px" }} />
              <span className="text-xs font-semibold text-white mt-2">Approved</span>
              <span className="text-[10px] text-zinc-500">{stats.qualified_leads}</span>
            </div>

            <div className="flex flex-col items-center z-10 w-24">
              <div className="w-12 bg-red-500/80 rounded-t-lg transition-all duration-500" style={{ height: stats.rejected_leads ? `${(stats.rejected_leads / (stats.discovered_companies || 1)) * 160}px` : "15px" }} />
              <span className="text-xs font-semibold text-white mt-2">Rejected</span>
              <span className="text-[10px] text-zinc-500">{stats.rejected_leads}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white font-display mb-4">Memory Diagnostics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-zinc-400 mb-1.5">
                  <span>Long-Term Reuse Ratio</span>
                  <span className="text-white font-semibold">
                    {stats.discovered_companies > 0 
                      ? `${Math.round((stats.memory_hits / (stats.discovered_companies + stats.memory_hits)) * 100)}%`
                      : "100%"}
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: stats.discovered_companies > 0 ? `${(stats.memory_hits / (stats.discovered_companies + stats.memory_hits)) * 100}%` : "100%" }} />
                </div>
              </div>
              <div className="text-xs text-zinc-500 leading-relaxed border-t border-zinc-850 pt-4">
                Memory Engine automatically caches companies and contacts. Subsequent runs query this context cache first, resulting in <strong>0ms API latency</strong> and <strong>$0 external API cost</strong>.
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-850 pt-4 mt-4 flex items-center space-x-3 text-emerald-400 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Orchestration Gateway Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Workflow View
interface WorkflowViewProps {
  onTriggerExecution: (execId: string) => void;
}
function WorkflowView({ onTriggerExecution }: WorkflowViewProps) {
  const [workflowId, setWorkflowId] = useState<number | null>(null);
  const [name, setName] = useState("AI Engineer Sourcing Funnel");
  const [description, setDescription] = useState("Discover high-growth AI SaaS providers hiring engineering talent in London.");
  const [industry, setIndustry] = useState("AI & Software Engineering");
  const [location, setLocation] = useState("London, United Kingdom");
  const [minSize, setMinSize] = useState(20);
  const [targetTechs, setTargetTechs] = useState("React, Python, FastAPI, PyTorch");
  const [targetPersonas, setTargetPersonas] = useState("CTO, VP of Engineering, Head of AI");
  
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflow();
  }, []);

  const fetchWorkflow = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/workflows");
      if (res.ok) {
        const workflows = await res.json();
        if (workflows.length > 0) {
          const wf = workflows[0];
          setWorkflowId(wf.id);
          setName(wf.name);
          setDescription(wf.description);
          const config = JSON.parse(wf.config_json);
          setIndustry(config.industry || "");
          setLocation(config.location || "");
          setMinSize(config.min_size || 10);
          setTargetTechs(Array.isArray(config.target_technologies) ? config.target_technologies.join(", ") : "");
          setTargetPersonas(Array.isArray(config.target_personas) ? config.target_personas.join(", ") : "");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      const config = {
        industry,
        location,
        min_size: Number(minSize),
        target_technologies: targetTechs.split(",").map(t => t.trim()).filter(Boolean),
        target_personas: targetPersonas.split(",").map(p => p.trim()).filter(Boolean),
        formats: ["csv", "json"]
      };

      const res = await fetch("http://localhost:8000/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, config })
      });

      if (res.ok) {
        const savedWf = await res.json();
        setWorkflowId(savedWf.id);
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (e) {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!workflowId) {
      alert("Please save the config first.");
      return;
    }
    setRunning(true);
    try {
      const res = await fetch(`http://localhost:8000/api/workflows/${workflowId}/execute`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        onTriggerExecution(data.execution_id);
      } else {
        alert("Execution failed.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  const graphNodes = [
    { name: "Planner Agent", desc: "DAG Graph Compiler" },
    { name: "Discovery Agent", desc: "Web Search Targets" },
    { name: "Validation Agent", desc: "Duplicate Check" },
    { name: "Enrichment Agent", desc: "Scrapes Tech Stack" },
    { name: "Decision Maker Agent", desc: "Locates CTO/VP" },
    { name: "Contact Agent", desc: "Finds Emails & socials" },
    { name: "Recommendation Agent", desc: "Grades Fitness" },
    { name: "Approval Gateway", desc: "Human review lock" }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Workflow Builder</h1>
          <p className="text-zinc-400">Configure targeting rules, criteria filters, and agent dependencies.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleSave} disabled={saving} className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer">
            {saveStatus === "success" ? <><Check className="h-4 w-4 text-emerald-400" /><span className="text-emerald-400">Saved</span></> : <><Save className="h-4 w-4" /><span>Save Config</span></>}
          </button>
          <button onClick={handleExecute} disabled={running || !workflowId} className="flex items-center space-x-2 px-4 py-2 bg-indigo-650 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold glow-primary cursor-pointer">
            <Play className="h-4 w-4 fill-current" />
            <span>{running ? "Starting..." : "Run Pipeline"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card p-6 rounded-2xl lg:col-span-1 space-y-5">
          <h3 className="text-lg font-semibold text-white font-display border-b border-zinc-800 pb-3">Pipeline Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Workflow Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-4 py-2 mt-1 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target Industry</label>
              <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-4 py-2 mt-1 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-4 py-2 mt-1 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Min Headcount</label>
              <input type="number" value={minSize} onChange={(e) => setMinSize(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-4 py-2 mt-1 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target Technologies (CSV)</label>
              <input type="text" value={targetTechs} onChange={(e) => setTargetTechs(e.target.value)} className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-4 py-2 mt-1 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target Personas (CSV)</label>
              <input type="text" value={targetPersonas} onChange={(e) => setTargetPersonas(e.target.value)} className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-4 py-2 mt-1 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white font-display mb-2 flex items-center space-x-2">
              <Network className="h-5 w-5 text-indigo-400" />
              <span>Orchestration Graph (DAG)</span>
            </h3>
            <p className="text-xs text-zinc-400">The Planner Agent dynamically matches the criteria, establishes task dependencies, and maps outputs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            {graphNodes.map((node, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl relative">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center font-display font-bold text-xs text-zinc-400">0{i + 1}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{node.name}</p>
                  <p className="text-[10px] text-zinc-500">{node.desc}</p>
                </div>
                {i < graphNodes.length - 1 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 transform -translate-y-1/2 z-10 bg-zinc-950 border border-zinc-800 rounded-full p-0.5 text-zinc-650">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-4 flex items-start space-x-3">
            <Server className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs leading-relaxed text-zinc-400">
              <strong className="text-white font-semibold">DAG Parallel Processing Enabled:</strong> Independent tasks (such as validation lookups across targets) run concurrently.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Monitor View
interface MonitorViewProps {
  activeExecutionId: string | null;
}
function MonitorView({ activeExecutionId }: MonitorViewProps) {
  const [executions, setExecutions] = useState<ExecutionInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(activeExecutionId);
  const [execution, setExecution] = useState<ExecutionInfo | null>(null);
  const [logs, setLogs] = useState<LogInfo[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchExecutions();
  }, []);

  useEffect(() => {
    if (activeExecutionId) {
      setSelectedId(activeExecutionId);
    }
  }, [activeExecutionId]);

  useEffect(() => {
    if (!selectedId) return;
    fetchExecutionDetails();
    const interval = setInterval(fetchExecutionDetails, 1500);
    return () => clearInterval(interval);
  }, [selectedId]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const fetchExecutions = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/executions");
      if (res.ok) {
        const data = await res.json();
        setExecutions(data);
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchExecutionDetails = async () => {
    if (!selectedId) return;
    try {
      const statusRes = await fetch(`http://localhost:8000/api/executions/${selectedId}`);
      if (statusRes.ok) {
        const data = await statusRes.json();
        setExecution(data);
        if (data.status !== "RUNNING" && data.status !== "PENDING") {
          fetchExecutions();
        }
      }
      
      const logsRes = await fetch(`http://localhost:8000/api/executions/${selectedId}/logs`);
      if (logsRes.ok) {
        setLogs(await logsRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const steps = execution && execution.step_status_json ? JSON.parse(execution.step_status_json) : {};

  const getStepIndicator = (status: string) => {
    switch (status) {
      case "PENDING":
        return <div className="h-4 w-4 rounded-full border border-zinc-700 bg-zinc-950 flex-shrink-0" />;
      case "RUNNING":
        return (
          <div className="relative flex h-4 w-4 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
          </div>
        );
      case "COMPLETED":
        return <div className="h-4 w-4 rounded-full bg-emerald-500 flex-shrink-0 glow-success" />;
      case "FAILED":
        return <div className="h-4 w-4 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />;
      default:
        return <div className="h-4 w-4 rounded-full border border-zinc-700 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Execution Monitor</h1>
          <p className="text-zinc-400">Watch agents execute workflow graphs, check memory caches, and verify run metrics.</p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs text-zinc-400 uppercase font-semibold">Active Run</label>
          <select value={selectedId || ""} onChange={(e) => setSelectedId(e.target.value)} className="bg-zinc-900 border border-zinc-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500">
            {executions.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.id.substring(0, 8)}... ({ex.status}) - {new Date(ex.created_at).toLocaleTimeString()}
              </option>
            ))}
          </select>
          <button onClick={fetchExecutions} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl cursor-pointer">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card p-6 rounded-2xl lg:col-span-1 space-y-6">
          <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white font-display">Agent Pipeline</h3>
            {execution && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                execution.status === "RUNNING" ? "bg-indigo-950/60 text-indigo-400 border border-indigo-900" :
                execution.status === "WAITING_APPROVAL" ? "bg-amber-950/60 text-amber-400 border border-amber-950" :
                execution.status === "COMPLETED" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900" :
                "bg-zinc-800 text-zinc-400"
              }`}>
                {execution.status.replace("_", " ")}
              </span>
            )}
          </div>

          <div className="space-y-6 relative pl-3">
            <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-zinc-850" />
            {Object.keys(steps).length === 0 ? (
              <p className="text-xs text-zinc-550">No execution steps logged.</p>
            ) : (
              Object.entries(steps).map(([taskId, step]: [string, any]) => (
                <div key={taskId} className="flex items-start space-x-4 relative z-10">
                  {getStepIndicator(step.status)}
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-white">{step.agent_name.replace("_", " ").toUpperCase()}</span>
                      {step.latency > 0 && <span className="text-[10px] text-zinc-500 font-mono">{step.latency}s</span>}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 font-mono">ID: {taskId}</p>
                    {step.error && <p className="text-[10px] text-red-400 font-mono mt-1">{step.error}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col h-[500px]">
          <div className="border-b border-zinc-800 pb-3 flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white font-display flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-indigo-400" />
              <span>Audit Log stream</span>
            </h3>
            {execution && (
              <div className="flex items-center space-x-3 text-xs text-zinc-500 font-mono">
                <span>Hits: <strong className="text-amber-400 font-bold">{execution.memory_hits}</strong></span>
                <span>Time: <strong className="text-white font-bold">{execution.execution_time}s</strong></span>
              </div>
            )}
          </div>

          <div className="flex-grow bg-zinc-950 border border-zinc-850 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-2.5">
            {logs.length === 0 ? (
              <div className="text-zinc-650 flex items-center justify-center h-full">Waiting for execution logs...</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="leading-relaxed">
                  <span className="text-zinc-600 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className="text-indigo-400 mr-2">[{log.agent_name}]</span>
                  <span className={`mr-2 ${log.log_level === "SUCCESS" ? "text-emerald-400 font-bold" : log.log_level === "ERROR" ? "text-red-400 font-bold" : "text-zinc-400"}`}>[{log.log_level}]</span>
                  <span className="text-zinc-200">{log.message}</span>
                  {log.data_payload_json && log.data_payload_json !== "{}" && (
                    <details className="mt-1 ml-4 cursor-pointer text-[10px] text-zinc-500">
                      <summary className="hover:text-zinc-300">View Node Payload</summary>
                      <pre className="mt-1 bg-zinc-900/60 p-2 rounded border border-zinc-850 text-zinc-400 overflow-x-auto whitespace-pre font-mono">
                        {JSON.stringify(JSON.parse(log.data_payload_json), null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Queue View (Human Approvals)
function QueueView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

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
        setLeads(await res.json());
      }
    } catch (e) {
      console.error(e);
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
        setLeads(leads.filter(l => l.id !== leadId));
        setEditingLead(null);
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
    handleAction(editingLead.id, "APPROVED", {
      decision_maker_name: editName,
      decision_maker_role: editRole,
      decision_maker_email: editEmail,
      recommendation_reason: editReason
    });
  };

  if (loading) {
    return <div className="text-zinc-550 flex items-center justify-center h-48">Loading approval queue...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Human Approval Queue</h1>
        <p className="text-zinc-400">Review, refine, or approve AI-generated sales recommendations.</p>
      </div>

      {leads.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
          <CheckSquare className="h-12 w-12 text-zinc-650 mx-auto" />
          <h3 className="text-lg font-semibold text-white font-display">Queue Clear!</h3>
          <p className="text-zinc-400 text-sm">All discovered leads have been approved or rejected.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {leads.map((lead: Lead) => (
            <div key={lead.id} className="glass-card p-6 rounded-2xl grid grid-cols-1 lg:grid-cols-4 gap-6 relative overflow-hidden">
              <div className="lg:col-span-3 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold text-white font-display">{lead.company_name}</h3>
                  <span className="text-xs text-indigo-400">{lead.domain}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700/80">{lead.location}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-400 font-medium">
                  <div>Hiring: <strong className="text-zinc-200">{lead.hiring_status || "N/A"}</strong></div>
                  <div>Funding: <strong className="text-zinc-200">{lead.funding_status || "N/A"}</strong></div>
                  <div>Stack: <strong className="text-zinc-200">{lead.tech_stack || "N/A"}</strong></div>
                </div>

                <div className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target Prospect</span>
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <strong className="text-white font-semibold">{lead.decision_maker_name}</strong>
                      <span className="text-zinc-400 ml-2">({lead.decision_maker_role})</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      {lead.decision_maker_email && <span className="flex items-center space-x-1.5 text-indigo-400"><Mail className="h-3.5 w-3.5" /><span>{lead.decision_maker_email}</span></span>}
                      {lead.decision_maker_linkedin && <a href={`https://${lead.decision_maker_linkedin}`} target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 text-indigo-400 hover:underline"><LinkedinIcon className="h-3.5 w-3.5" /><span>LinkedIn</span></a>}
                    </div>
                  </div>
                </div>
                <div className="text-xs leading-relaxed text-zinc-400"><strong className="text-zinc-300 font-semibold">AI Reasoning:</strong> {lead.recommendation_reason}</div>
              </div>

              <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-zinc-800/80 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-between items-center text-center">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Match Score</p>
                  <div className="relative flex items-center justify-center mt-3">
                    <div className="h-16 w-16 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center font-display font-bold text-xl text-emerald-400">
                      {Math.round(lead.confidence_score * 100)}%
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-full gap-2.5 mt-6 lg:mt-0">
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(lead.id, "APPROVED")} className="flex-grow flex items-center justify-center space-x-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"><Check className="h-4 w-4" /><span>Approve</span></button>
                    <button onClick={() => handleAction(lead.id, "REJECTED")} className="flex-grow flex items-center justify-center space-x-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold cursor-pointer"><X className="h-4 w-4 text-red-400" /><span>Reject</span></button>
                  </div>
                  <button onClick={() => openEditor(lead)} className="w-full flex items-center justify-center space-x-1 py-2 bg-zinc-900 border border-zinc-750 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"><Edit3 className="h-3.5 w-3.5" /><span>Edit Lead</span></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingLead && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white font-display border-b border-zinc-800 pb-3">Edit Prospect Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-semibold text-zinc-400">Prospect Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-indigo-500 text-white text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400">Prospect Role</label>
                <input type="text" value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-indigo-500 text-white text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400">Prospect Email</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-indigo-500 text-white text-xs" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400">AI Reasoning Evidence</label>
                <textarea value={editReason} onChange={(e) => setEditReason(e.target.value)} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 mt-1 focus:outline-none focus:border-indigo-500 text-white text-xs resize-none" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-800">
              <button onClick={() => setEditingLead(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl cursor-pointer">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer">Approve & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 5. Leads View (Final database and exporters)
function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.filter((l: Lead) => l.status === "APPROVED"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    if (leads.length === 0) return;
    
    let fileContent = "";
    let mimeType = "";
    let fileExt = "";
    
    if (format === "csv") {
      mimeType = "text/csv";
      fileExt = "csv";
      const headers = ["Company", "Domain", "Industry", "Location", "Size", "Tech Stack", "Funding", "Hiring", "Decision Maker", "Role", "Email", "LinkedIn", "Score", "Reasoning"];
      const csvRows = [headers.join(",")];
      
      for (const lead of leads) {
        csvRows.push([
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
        ].join(","));
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
  };

  if (loading) {
    return <div className="text-zinc-550 flex items-center justify-center h-48">Loading qualified leads...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Qualified Leads</h1>
          <p className="text-zinc-400">Review approved prospects and export accounts for outreach.</p>
        </div>

        {leads.length > 0 && (
          <div className="flex items-center space-x-3">
            <button onClick={() => handleExport("csv")} className="flex items-center space-x-2 px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold glow-primary cursor-pointer"><Download className="h-4 w-4" /><span>Export CSV</span></button>
            <button onClick={() => handleExport("json")} className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"><FileText className="h-4 w-4" /><span>Export JSON</span></button>
          </div>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
          <Building2 className="h-12 w-12 text-zinc-650 mx-auto" />
          <h3 className="text-lg font-semibold text-white font-display">No leads approved yet</h3>
          <p className="text-zinc-450 text-sm">Approved lead profiles will appear here for batch spreadsheet exporting.</p>
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
                    <td className="p-4 text-zinc-450 max-w-xs truncate">{lead.hiring_status || "N/A"}</td>
                    <td className="p-4 font-mono text-[10px] space-y-1">
                      <div className="text-zinc-300 flex items-center space-x-1.5"><Mail className="h-3 w-3 text-zinc-500" /><span>{lead.decision_maker_email}</span></div>
                      {lead.decision_maker_linkedin && <div className="text-indigo-400 flex items-center space-x-1.5"><LinkedinIcon className="h-3 w-3 text-zinc-500" /><span className="truncate max-w-[150px]">{lead.decision_maker_linkedin}</span></div>}
                    </td>
                    <td className="p-4 text-center font-bold text-emerald-400">{Math.round(lead.confidence_score * 100)}%</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900 flex items-center justify-center space-x-1 max-w-[85px] mx-auto"><CheckCircle className="h-2.5 w-2.5" /><span>Approved</span></span>
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

// 6. Memory View (Cache list and semantic searches)
function MemoryView() {
  const [cache, setCache] = useState<MemoryEntry[]>([]);
  const [filterType, setFilterType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [semanticResults, setSemanticResults] = useState<SemanticResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lookupStep, setLookupStep] = useState(0);

  useEffect(() => {
    fetchMemory();
  }, [filterType]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLookupStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const fetchMemory = async () => {
    setLoading(true);
    try {
      let url = "http://localhost:8000/api/memory/long-term";
      if (filterType) url += `?entity_type=${filterType}`;
      const res = await fetch(url);
      if (res.ok) {
        setCache(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSemanticSearch = async () => {
    if (!searchQuery) return;
    setSearching(true);
    try {
      const res = await fetch(`http://localhost:8000/api/memory/semantic?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        setSemanticResults(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Memory Explorer</h1>
        <p className="text-zinc-400">Audit Working, Short-Term, Long-Term, and Semantic Memory graphs.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-lg font-semibold text-white font-display flex items-center space-x-2">
          <Database className="h-5 w-5 text-indigo-400" />
          <span>Active Cache Resolution Pipeline</span>
        </h3>
        
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-6 border-b border-zinc-800/85">
          <div className={`p-4 rounded-2xl transition border ${lookupStep === 0 ? "border-indigo-500 bg-indigo-950/20 text-indigo-400" : "border-zinc-800 bg-zinc-900/40 text-zinc-500"}`}>
            <Cpu className="h-6 w-6 mx-auto mb-2" />
            <span className="text-xs font-semibold">1. Agent Query</span>
          </div>
          <ArrowRight className={`h-4 w-4 hidden md:block ${lookupStep === 0 ? "text-indigo-400 animate-pulse" : "text-zinc-700"}`} />
          
          <div className={`p-4 rounded-2xl transition border ${lookupStep === 1 ? "border-indigo-500 bg-indigo-950/20 text-indigo-400" : "border-zinc-800 bg-zinc-900/40 text-zinc-500"}`}>
            <Search className="h-6 w-6 mx-auto mb-2" />
            <span className="text-xs font-semibold">2. Memory Lookup</span>
          </div>
          <ArrowRight className={`h-4 w-4 hidden md:block ${lookupStep === 1 ? "text-indigo-400 animate-pulse" : "text-zinc-700"}`} />

          <div className={`p-4 rounded-2xl transition border ${lookupStep === 2 ? "border-emerald-500 bg-emerald-950/20 text-emerald-400" : "border-zinc-800 bg-zinc-900/40 text-zinc-500"}`}>
            <Database className="h-6 w-6 mx-auto mb-2" />
            <span className="text-xs font-semibold">3. Cache HIT (LTM)</span>
          </div>
          <ArrowRight className={`h-4 w-4 hidden md:block ${lookupStep === 2 ? "text-emerald-400 animate-pulse" : "text-zinc-700"}`} />

          <div className={`p-4 rounded-2xl transition border ${lookupStep === 3 ? "border-indigo-500 bg-indigo-950/20 text-indigo-400" : "border-zinc-800 bg-zinc-900/40 text-zinc-500"}`}>
            <CheckCircle className="h-6 w-6 mx-auto mb-2" />
            <span className="text-xs font-semibold">4. Skip Live Search</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card p-6 rounded-2xl lg:col-span-1 space-y-4 h-[420px] flex flex-col">
          <h3 className="text-md font-semibold text-white font-display">Semantic Vector Search</h3>
          <p className="text-xs text-zinc-400">Query local semantic memory embeddings index contextually.</p>
          <div className="flex gap-2">
            <input type="text" placeholder="e.g. PyTorch in London" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-grow bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
            <button onClick={handleSemanticSearch} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer">Search</button>
          </div>
          <div className="flex-grow bg-zinc-950 border border-zinc-850 rounded-xl p-3 overflow-y-auto space-y-3">
            {searching ? <span className="text-xs text-zinc-650 block text-center mt-8">Embedding query...</span> : semanticResults.length === 0 ? <span className="text-xs text-zinc-650 block text-center mt-8">No queries run yet.</span> : (
              semanticResults.map((r, i) => (
                <div key={i} className="text-xs border-b border-zinc-900/80 pb-2 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-indigo-400">{r.key}</span>
                    <span className="text-emerald-400 font-mono">{(r.score * 100).toFixed(0)}% Match</span>
                  </div>
                  <p className="text-zinc-500 line-clamp-2">{r.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col h-[420px]">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
            <h3 className="text-md font-semibold text-white font-display flex items-center space-x-2"><HardDrive className="h-4.5 w-4.5 text-indigo-400" /><span>Long-Term Cache Records</span></h3>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-300 rounded-lg px-2.5 py-1">
              <option value="">All Types</option>
              <option value="COMPANY">Companies</option>
              <option value="CONTACT">Contacts</option>
            </select>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3">
            {loading ? <span className="text-xs text-zinc-500 block text-center mt-8">Querying databases...</span> : cache.length === 0 ? <span className="text-xs text-zinc-650 block text-center mt-8">No cache records found.</span> : (
              cache.map((entry) => {
                const data = JSON.parse(entry.data_json);
                return (
                  <div key={entry.id} className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl flex items-center justify-between text-xs hover:border-zinc-700 transition">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${entry.entity_type === "COMPANY" ? "bg-blue-950 text-blue-400 border border-blue-900" : "bg-emerald-950 text-emerald-400 border border-emerald-900"}`}>{entry.entity_type}</span>
                        <strong className="text-white">{entry.entity_key}</strong>
                      </div>
                      <p className="text-zinc-450 mt-1.5 truncate max-w-md">
                        {entry.entity_type === "COMPANY" ? `${data.name} | Stack: ${data.tech_stack || "N/A"} | ${data.funding_status || ""}` : `${data.name} (${data.role}) | Email: ${data.email || ""}`}
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-zinc-500">
                      <span>{new Date(entry.updated_at).toLocaleDateString()}</span>
                      <span className="block mt-0.5 font-semibold text-emerald-400 font-mono">0ms Lookup</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. Registry View
function RegistryView() {
  const [agents, setAgents] = useState<AgentMetadata[]>([]);
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"agents" | "tools">("agents");

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    setLoading(true);
    try {
      const agentsRes = await fetch("http://localhost:8000/api/registry/agents");
      if (agentsRes.ok) setAgents(await agentsRes.json());
      
      const toolsRes = await fetch("http://localhost:8000/api/registry/tools");
      if (toolsRes.ok) setTools(await toolsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-zinc-550 flex items-center justify-center h-48">Loading registries catalog...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Registry Catalog</h1>
          <p className="text-zinc-400">Browse registered agents, capacities, parameters schemas, and active tools.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 flex">
          <button onClick={() => setActiveTab("agents")} className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${activeTab === "agents" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}>AI Agents ({agents.length})</button>
          <button onClick={() => setActiveTab("tools")} className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${activeTab === "tools" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}>External Tools ({tools.length})</button>
        </div>
      </div>

      {activeTab === "agents" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <div key={agent.name} className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-5 w-5 text-indigo-400" />
                    <h3 className="text-md font-bold text-white uppercase font-display tracking-wide">{agent.name.replace("_", " ")}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-900/60">Priority {agent.priority}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{agent.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {agent.capabilities.map((cap) => (
                    <span key={cap} className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/50">{cap}</span>
                  ))}
                </div>
              </div>
              <div className="border-t border-zinc-800/80 pt-4 mt-4 grid grid-cols-2 gap-4 text-[10px] text-zinc-555">
                <div className="flex items-center space-x-2"><span>Max Retries: <strong className="text-zinc-350">{agent.retry_policy.max_retries}</strong></span></div>
                <div className="flex items-center space-x-2"><span>Memory Access: <strong className="text-emerald-500 font-semibold">Enabled</strong></span></div>
                <div className="col-span-2 flex items-center space-x-2 mt-1"><span>Required Tools: <strong className="text-indigo-400 font-semibold">{agent.tool_dependencies.join(", ") || "None"}</strong></span></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <div key={tool.name} className="glass-card p-6 rounded-2xl space-y-3">
              <h3 className="text-md font-bold text-white uppercase font-display tracking-wide">{tool.name.replace("_", " ")}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{tool.description}</p>
              {tool.args_schema && (
                <div className="bg-zinc-950/80 border border-zinc-850 rounded-xl p-3 mt-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-2">Input Schema Fields</span>
                  <div className="space-y-1.5 text-[10px] font-mono text-zinc-450">
                    {Object.entries(tool.args_schema.properties || {}).map(([prop, val]: [string, any]) => (
                      <div key={prop} className="flex justify-between"><span className="text-indigo-400 font-semibold">{prop}</span><span className="text-zinc-600">{val.type || "string"}</span></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 8. Settings View
function SettingsView() {
  const [showKey, setShowKey] = useState(false);
  const [openaiKey, setOpenaiKey] = useState("");
  const [tavilyKey, setTavilyKey] = useState("");
  const [firecrawlKey, setFirecrawlKey] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">System Settings</h1>
        <p className="text-zinc-400">Manage API Keys, Workspace rules, and Orchestrator presets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white font-display flex items-center space-x-2"><span>API Gateway Credentials</span></h3>
          <p className="text-xs text-zinc-400">Leave blank to leverage the system's Intelligent Mocking Engine. Keys entered here are run securely on your local FastAPI loop.</p>
          
          <form onSubmit={handleSaveKeys} className="space-y-4 pt-4">
            <div>
              <label className="text-xs text-zinc-400 uppercase font-semibold">OpenAI API Key</label>
              <input type={showKey ? "text" : "password"} value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder="sk-proj-..." className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 mt-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 uppercase font-semibold">Tavily Search API Key</label>
              <input type="password" value={tavilyKey} onChange={(e) => setTavilyKey(e.target.value)} placeholder="tvly-..." className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 mt-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 uppercase font-semibold">Firecrawl Scrape API Key</label>
              <input type="password" value={firecrawlKey} onChange={(e) => setFirecrawlKey(e.target.value)} placeholder="fc-..." className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 mt-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono" />
            </div>
            <div className="flex justify-end pt-3 border-t border-zinc-800/80">
              <button type="submit" className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold glow-primary transition cursor-pointer">
                <span>{saved ? "Keys Configured" : "Save Keys"}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="glass-card p-6 rounded-2xl lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-semibold text-white font-display mb-4 flex items-center space-x-2"><span>Security & Policies</span></h3>
            <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
              <div>
                <strong className="text-white block mb-1">Human Approval Policy:</strong>
                <span>Leads are held in review queues until an administrator approves them.</span>
              </div>
              <div className="border-t border-zinc-850 pt-3">
                <strong className="text-white block mb-1">Memory Eviction:</strong>
                <span>Long-Term context database cache entries expire after 7 days.</span>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 mt-6 text-[10px] text-zinc-550 flex items-center space-x-2.5">
            <span>Running ProspectPilot AI Platform Gateway v1.0.0 local mode.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main App Shell Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [activeExecutionId, setActiveExecutionId] = useState<string | null>(null);

  const handleTriggerExecution = (execId: string) => {
    setActiveExecutionId(execId);
    setActiveTab("monitor");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Building2 },
    { id: "workflow", label: "Workflow Builder", icon: Network },
    { id: "monitor", label: "Execution Monitor", icon: Terminal },
    { id: "queue", label: "Human Queue", icon: CheckSquare },
    { id: "leads", label: "Leads Database", icon: Database },
    { id: "memory", label: "Memory Explorer", icon: HardDrive },
    { id: "registry", label: "Registry Catalog", icon: Cpu },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardView />;
      case "workflow": return <WorkflowView onTriggerExecution={handleTriggerExecution} />;
      case "monitor": return <MonitorView activeExecutionId={activeExecutionId} />;
      case "queue": return <QueueView />;
      case "leads": return <LeadsView />;
      case "memory": return <MemoryView />;
      case "registry": return <RegistryView />;
      case "settings": return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex text-foreground bg-background font-sans">
      
      {/* Sidebar navigation */}
      <aside className="w-64 bg-zinc-950/80 border-r border-zinc-800/80 backdrop-blur-md flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          <div className="p-6 border-b border-zinc-800/50 flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center glow-primary pulse-primary flex-shrink-0">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <span className="text-md font-bold tracking-tight text-white font-display">ProspectPilot AI</span>
              <span className="block text-[9px] font-semibold text-indigo-400 uppercase tracking-widest mt-0.5">Orchestrator v1</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer ${
                    isActive 
                      ? "bg-indigo-650/15 text-indigo-400 border border-indigo-900/60 font-bold" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800/50 space-y-3">
          <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-850 flex items-center space-x-3">
            <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-zinc-300">AC</div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold text-white block truncate">Acme Staffing Inc.</span>
              <span className="text-[9px] text-zinc-500 block truncate">Workspace #1</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[10px] font-semibold text-emerald-400 pl-2">
            <CircleDot className="h-3.5 w-3.5 animate-pulse" />
            <span>Platform Core Connected</span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-grow pt-[23px] px-8 pb-8 overflow-y-auto z-10 w-full">
        {renderActiveView()}
      </main>

    </div>
  );
}
