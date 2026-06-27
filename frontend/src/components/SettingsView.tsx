import React, { useState } from "react";
import { Shield, Key, Eye, EyeOff, Check, Cpu } from "lucide-react";

export default function SettingsView() {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">System Settings</h1>
        <p className="text-zinc-400 mt-1">Manage API Keys, Workspace rules, and Orchestrator presets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Credentials Configuration */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white font-display flex items-center space-x-2">
            <Key className="h-5 w-5 text-indigo-400" />
            <span>API Gateway Credentials</span>
          </h3>
          <p className="text-xs text-zinc-400">Leave blank to leverage the system's Intelligent Mocking Engine. Keys entered here are run securely on your local FastAPI loop.</p>
          
          <form onSubmit={handleSaveKeys} className="space-y-4 pt-4">
            <div className="relative">
              <label className="text-xs text-zinc-400 uppercase font-semibold">OpenAI API Key</label>
              <div className="relative mt-1">
                <input 
                  type={showKey ? "text" : "password"}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button 
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-350 cursor-pointer"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 uppercase font-semibold">Tavily Search API Key</label>
              <input 
                type="password"
                value={tavilyKey}
                onChange={(e) => setTavilyKey(e.target.value)}
                placeholder="tvly-..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 mt-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 uppercase font-semibold">Firecrawl Scrape API Key</label>
              <input 
                type="password"
                value={firecrawlKey}
                onChange={(e) => setFirecrawlKey(e.target.value)}
                placeholder="fc-..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 mt-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800/80">
              <button 
                type="submit"
                className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold glow-primary transition cursor-pointer"
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Keys Configured</span>
                  </>
                ) : (
                  <span>Save Keys</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Workspace details */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-semibold text-white font-display mb-4 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-indigo-400" />
              <span>Security & Policies</span>
            </h3>
            
            <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
              <div>
                <strong className="text-white block mb-1">Human Approval Policy:</strong>
                <span>Lead recommendations are held in review queues until an administrator approves them. Leads are never dispatched for export before review.</span>
              </div>

              <div className="border-t border-zinc-850 pt-3">
                <strong className="text-white block mb-1">Memory Eviction:</strong>
                <span>Long-Term context database uses SQLite transactions. Cache hit entries expire after 7 days to guarantee data freshness.</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 mt-6 text-[10px] text-zinc-500 flex items-center space-x-2.5">
            <Cpu className="h-5 w-5 text-indigo-500 flex-shrink-0" />
            <span>Running ProspectPilot AI Platform Gateway v1.0.0 local mode.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
