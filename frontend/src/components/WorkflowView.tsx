import React, { useState, useEffect } from "react";
import { Play, Save, Server, ArrowRight, Check, Network } from "lucide-react";

interface WorkflowViewProps {
  onTriggerExecution: (execId: string) => void;
}

export default function WorkflowView({ onTriggerExecution }: WorkflowViewProps) {
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
          
          try {
            const config = JSON.parse(wf.config_json);
            setIndustry(config.industry || "");
            setLocation(config.location || "");
            setMinSize(config.min_size || 10);
            setTargetTechs(Array.isArray(config.target_technologies) ? config.target_technologies.join(", ") : "");
            setTargetPersonas(Array.isArray(config.target_personas) ? config.target_personas.join(", ") : "");
          } catch (e) {
            console.error("Error parsing workflow config JSON:", e);
          }
        }
      }
    } catch (e) {
      console.error("Error loading workflow:", e);
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

      const payload = {
        name,
        description,
        config
      };

      const res = await fetch("http://localhost:8000/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
      alert("Please save the workflow first.");
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
        alert("Failed to initiate agent execution graph.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error starting agent execution.");
    } finally {
      setRunning(false);
    }
  };

  const graphNodes = [
    { name: "Planner Agent", desc: "Formulates DAG Graph" },
    { name: "Discovery Agent", desc: "Web Search Leads" },
    { name: "Validation Agent", desc: "Checks LTM Cache" },
    { name: "Enrichment Agent", desc: "Scrapes Tech Stack" },
    { name: "Decision Maker Agent", desc: "Locates Personas" },
    { name: "Contact Agent", desc: "Finds Emails & LinkedIn" },
    { name: "Recommendation Agent", desc: "Lead Qualification" },
    { name: "Approval Gateway", desc: "Human Sign-off" }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Workflow Builder</h1>
          <p className="text-zinc-400 mt-1">Configure targeting rules, criteria filters, and agent dependencies.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            {saveStatus === "success" ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Saved</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{saving ? "Saving..." : "Save Config"}</span>
              </>
            )}
          </button>

          <button 
            onClick={handleExecute}
            disabled={running || !workflowId}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold glow-primary transition cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{running ? "Starting..." : "Run Pipeline"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-1 space-y-5">
          <h3 className="text-lg font-semibold text-white font-display border-b border-zinc-800 pb-3">Pipeline Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Workflow Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 mt-1 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Industry</label>
              <input 
                type="text" 
                value={industry} 
                onChange={(e) => setIndustry(e.target.value)} 
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 mt-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. IT Staffing"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Location</label>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 mt-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. London, UK"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Min Headcount</label>
              <input 
                type="number" 
                value={minSize} 
                onChange={(e) => setMinSize(Number(e.target.value))} 
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 mt-1 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Technologies (comma separated)</label>
              <input 
                type="text" 
                value={targetTechs} 
                onChange={(e) => setTargetTechs(e.target.value)} 
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 mt-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. React, Python"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Personas (comma separated)</label>
              <input 
                type="text" 
                value={targetPersonas} 
                onChange={(e) => setTargetPersonas(e.target.value)} 
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 mt-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. CTO, VP of Engineering"
              />
            </div>
          </div>
        </div>

        {/* Visual Graph Panel */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white font-display mb-2 flex items-center space-x-2">
              <Network className="h-5 w-5 text-indigo-400" />
              <span>Orchestration Graph (DAG)</span>
            </h3>
            <p className="text-xs text-zinc-400">The Planner Agent dynamically matches the target criteria, creates dependencies, and maps outputs between tools and agents.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            {graphNodes.map((node, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl relative">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center font-display font-bold text-xs text-zinc-400">
                  0{i + 1}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-white">{node.name}</p>
                  <p className="text-[10px] text-zinc-500">{node.desc}</p>
                </div>
                
                {/* Visual arrow connector if not last element */}
                {i < graphNodes.length - 1 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 transform -translate-y-1/2 z-10 bg-zinc-900 border border-zinc-800 rounded-full p-0.5 text-zinc-600">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-4 flex items-start space-x-3">
            <Server className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs leading-relaxed text-zinc-400">
              <strong className="text-white">DAG Parallel Processing Enabled:</strong> Agents that do not depend on each other are automatically grouped by the execution engine and run in parallel pipelines.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
