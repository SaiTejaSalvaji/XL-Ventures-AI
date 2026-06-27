import React, { useEffect, useState } from "react";
import { Cpu, RotateCcw, Box, HardDrive } from "lucide-react";

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

export default function RegistryView() {
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
      if (agentsRes.ok) {
        setAgents(await agentsRes.json());
      }
      
      const toolsRes = await fetch("http://localhost:8000/api/registry/tools");
      if (toolsRes.ok) {
        setTools(await toolsRes.json());
      }
    } catch (e) {
      console.error("Error loading registry catalog:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-zinc-500 flex items-center justify-center h-48">
        <span>Loading registries catalog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Registry Catalog</h1>
          <p className="text-zinc-400 mt-1">Browse registered agents, capacities, parameters schemas, and active tools.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 flex">
          <button 
            onClick={() => setActiveTab("agents")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${activeTab === "agents" ? "bg-indigo-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            AI Agents ({agents.length})
          </button>
          <button 
            onClick={() => setActiveTab("tools")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${activeTab === "tools" ? "bg-indigo-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            External Tools ({tools.length})
          </button>
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
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-900/60">
                    Priority {agent.priority}
                  </span>
                </div>
                
                <p className="text-xs text-zinc-400 leading-relaxed">{agent.description}</p>
                
                {/* Capabilities tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {agent.capabilities.map((cap) => (
                    <span key={cap} className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-800/80 pt-4 mt-4 grid grid-cols-2 gap-4 text-[10px] text-zinc-500">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-4 w-4 text-zinc-650" />
                  <span>Max Retries: <strong className="text-zinc-300">{agent.retry_policy.max_retries}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-zinc-650" />
                  <span>Memory Access: <strong className="text-emerald-500">Enabled</strong></span>
                </div>
                <div className="col-span-2 flex items-center space-x-2 mt-1">
                  <Box className="h-4 w-4 text-zinc-650" />
                  <span>Required Tools: <strong className="text-indigo-400">{agent.tool_dependencies.join(", ") || "None"}</strong></span>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <div key={tool.name} className="glass-card p-6 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-md font-bold text-white uppercase font-display tracking-wide">{tool.name.replace("_", " ")}</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{tool.description}</p>
              
              {tool.args_schema && (
                <div className="bg-zinc-950/80 border border-zinc-850 rounded-xl p-3 mt-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-2">Input Schema Fields</span>
                  <div className="space-y-1.5 text-[10px] font-mono text-zinc-400">
                    {Object.entries(tool.args_schema.properties || {}).map(([prop, val]: [string, any]) => (
                      <div key={prop} className="flex justify-between">
                        <span className="text-indigo-400 font-semibold">{prop}</span>
                        <span className="text-zinc-600">{val.type || "string"}</span>
                      </div>
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
