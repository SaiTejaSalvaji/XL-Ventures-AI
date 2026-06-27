import React, { useState } from "react";
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
  CircleDot
} from "lucide-react";

// Import custom subviews
import DashboardView from "./components/DashboardView";
import WorkflowView from "./components/WorkflowView";
import MonitorView from "./components/MonitorView";
import QueueView from "./components/QueueView";
import LeadsView from "./components/LeadsView";
import MemoryView from "./components/MemoryView";
import RegistryView from "./components/RegistryView";
import SettingsView from "./components/SettingsView";

type ActiveTab = 
  | "dashboard" 
  | "workflow" 
  | "monitor" 
  | "queue" 
  | "leads" 
  | "memory" 
  | "registry" 
  | "settings";

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
      case "dashboard":
        return <DashboardView />;
      case "workflow":
        return <WorkflowView onTriggerExecution={handleTriggerExecution} />;
      case "monitor":
        return <MonitorView activeExecutionId={activeExecutionId} />;
      case "queue":
        return <QueueView />;
      case "leads":
        return <LeadsView />;
      case "memory":
        return <MemoryView />;
      case "registry":
        return <RegistryView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex text-foreground bg-background font-sans">
      
      {/* Sidebar navigation */}
      <aside className="w-64 bg-zinc-950/80 border-r border-zinc-800/80 backdrop-blur-md flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          {/* Glowing Brand Logotype */}
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

        {/* Tenancy Selector & System indicator */}
        <div className="p-4 border-t border-zinc-800/50 space-y-3">
          <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-850 flex items-center space-x-3">
            <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-zinc-300">
              AC
            </div>
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
