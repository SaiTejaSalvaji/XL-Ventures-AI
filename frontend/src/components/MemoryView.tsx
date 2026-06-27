import React, { useState, useEffect } from "react";
import { Search, Database, HardDrive, Cpu, ArrowRight, Zap, CheckCircle } from "lucide-react";

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

export default function MemoryView() {
  const [cache, setCache] = useState<MemoryEntry[]>([]);
  const [filterType, setFilterType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [semanticResults, setSemanticResults] = useState<SemanticResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Animation states for visual mapping helper
  const [lookupStep, setLookupStep] = useState(0);

  useEffect(() => {
    fetchMemory();
  }, [filterType]);

  // Periodic lookup simulation loop to show dynamic pulse inside Memory diagram
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
      if (filterType) {
        url += `?entity_type=${filterType}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCache(data);
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
        const data = await res.json();
        setSemanticResults(data);
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

      {/* Visual Lookup Flow */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-lg font-semibold text-white font-display flex items-center space-x-2">
          <Database className="h-5 w-5 text-indigo-400" />
          <span>Active Cache Resolution Pipeline</span>
        </h3>
        
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-6 border-b border-zinc-800/80">
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
        
        {/* Semantic Search Vector Test */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-1 space-y-4 h-[420px] flex flex-col">
          <h3 className="text-md font-semibold text-white font-display">Semantic Vector Search</h3>
          <p className="text-xs text-zinc-400">Query semantic embeddings database to locate contextually similar companies.</p>
          
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="e.g. PyTorch in London"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button 
              onClick={handleSemanticSearch}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Search
            </button>
          </div>

          <div className="flex-grow bg-zinc-950 border border-zinc-850 rounded-xl p-3 overflow-y-auto space-y-3">
            {searching ? (
              <span className="text-xs text-zinc-600 block text-center mt-8">Embedding query...</span>
            ) : semanticResults.length === 0 ? (
              <span className="text-xs text-zinc-600 block text-center mt-8">No semantic queries run yet.</span>
            ) : (
              semanticResults.map((r, i) => (
                <div key={i} className="text-xs border-b border-zinc-900 pb-2 space-y-1">
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

        {/* Database Long term memory cache list */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col h-[420px]">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
            <h3 className="text-md font-semibold text-white font-display flex items-center space-x-2">
              <HardDrive className="h-4.5 w-4.5 text-indigo-400" />
              <span>Long-Term Cache Records</span>
            </h3>
            
            <div className="flex items-center space-x-2">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-300 rounded-lg px-2.5 py-1 focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="COMPANY">Companies</option>
                <option value="CONTACT">Contacts</option>
              </select>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3">
            {loading ? (
              <span className="text-xs text-zinc-500 block text-center mt-8">Querying database...</span>
            ) : cache.length === 0 ? (
              <span className="text-xs text-zinc-600 block text-center mt-8">No cache records found.</span>
            ) : (
              cache.map((entry) => {
                const data = JSON.parse(entry.data_json);
                return (
                  <div key={entry.id} className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl flex items-center justify-between text-xs hover:border-zinc-700 transition">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${entry.entity_type === "COMPANY" ? "bg-blue-950 text-blue-400 border border-blue-900" : "bg-emerald-950 text-emerald-400 border border-emerald-900"}`}>
                          {entry.entity_type}
                        </span>
                        <strong className="text-white">{entry.entity_key}</strong>
                      </div>
                      <p className="text-zinc-400 mt-1.5 font-sans truncate max-w-md">
                        {entry.entity_type === "COMPANY" 
                          ? `${data.name} | Stack: ${data.tech_stack || "N/A"} | ${data.funding_status || ""}`
                          : `${data.name} (${data.role}) | Email: ${data.email || ""}`
                        }
                      </p>
                    </div>
                    
                    <div className="text-right text-[10px] text-zinc-500">
                      <span className="block">{new Date(entry.updated_at).toLocaleDateString()}</span>
                      <span className="block mt-0.5 font-semibold text-emerald-400">0ms Lookup</span>
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
