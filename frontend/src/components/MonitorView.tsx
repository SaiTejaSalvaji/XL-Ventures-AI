import React, { useState, useEffect, useRef } from "react";
import { Terminal, RefreshCw } from "lucide-react";

interface MonitorViewProps {
  activeExecutionId: string | null;
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

export default function MonitorView({ activeExecutionId }: MonitorViewProps) {
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
    
    const interval = setInterval(() => {
      fetchExecutionDetails();
    }, 1500);

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
        const data = await logsRes.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const parseStepStatuses = () => {
    if (!execution || !execution.step_status_json) return {};
    try {
      return JSON.parse(execution.step_status_json);
    } catch (e) {
      return {};
    }
  };

  const steps = parseStepStatuses();

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
      case "CANCELLED":
        return <div className="h-4 w-4 rounded-full bg-zinc-500 flex-shrink-0" />;
      default:
        return <div className="h-4 w-4 rounded-full border border-zinc-700 flex-shrink-0" />;
    }
  };

  const getLogLevelClass = (level: string) => {
    switch (level) {
      case "SUCCESS": return "text-emerald-400 font-semibold";
      case "WARNING": return "text-amber-400 font-semibold";
      case "ERROR": return "text-red-400 font-semibold";
      default: return "text-zinc-300";
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
          <select 
            value={selectedId || ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            {executions.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.id.substring(0, 8)}... ({ex.status}) - {new Date(ex.created_at).toLocaleTimeString()}
              </option>
            ))}
          </select>
          <button 
            onClick={fetchExecutions}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline Status */}
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
            <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-zinc-800" />
            
            {Object.keys(steps).length === 0 ? (
              <p className="text-sm text-zinc-500">No execution steps logged.</p>
            ) : (
              Object.entries(steps).map(([taskId, step]: [string, any]) => (
                <div key={taskId} className="flex items-start space-x-4 relative z-10">
                  {getStepIndicator(step.status)}
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-white">
                        {step.agent_name.replace("_", " ").toUpperCase()}
                      </span>
                      {step.latency > 0 && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {step.latency}s
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">Task: {taskId}</p>
                    {step.error && (
                      <p className="text-[10px] text-red-400 font-mono mt-1 leading-normal">
                        Error: {step.error}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Console Terminal logs */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col h-[500px]">
          <div className="border-b border-zinc-800 pb-3 flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white font-display flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-indigo-400" />
              <span>Audit Log stream</span>
            </h3>
            {execution && (
              <div className="flex items-center space-x-3 text-xs text-zinc-500">
                <span>Hits: <strong className="text-amber-400">{execution.memory_hits}</strong></span>
                <span>Time: <strong className="text-white">{execution.execution_time}s</strong></span>
              </div>
            )}
          </div>

          <div className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-2.5">
            {logs.length === 0 ? (
              <div className="text-zinc-600 flex items-center justify-center h-full">
                <span>Waiting for execution logs...</span>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="leading-relaxed whitespace-pre-wrap">
                  <span className="text-zinc-600 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className="text-indigo-400 mr-2">[{log.agent_name}]</span>
                  <span className={`${getLogLevelClass(log.log_level)} mr-2`}>
                    [{log.log_level}]
                  </span>
                  <span className="text-zinc-100">{log.message}</span>
                  
                  {log.data_payload_json && log.data_payload_json !== "{}" && (
                    <details className="mt-1 ml-4 cursor-pointer text-[10px] text-zinc-500">
                      <summary className="hover:text-zinc-300">View Node Payload</summary>
                      <pre className="mt-1 bg-zinc-900/60 p-2 rounded border border-zinc-800 text-zinc-400 overflow-x-auto whitespace-pre">
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
