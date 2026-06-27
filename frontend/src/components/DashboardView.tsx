import React, { useEffect, useState } from "react";
import { Building2, CheckCircle2, Cpu, Zap, Clock, Database } from "lucide-react";

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

export default function DashboardView() {
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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Error fetching analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Companies Discovered",
      value: stats.discovered_companies,
      icon: Building2,
      color: "text-blue-400",
      bg: "rgba(96, 165, 250, 0.1)"
    },
    {
      title: "Qualified Leads",
      value: stats.qualified_leads,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "rgba(52, 211, 153, 0.1)"
    },
    {
      title: "Memory Hits",
      value: stats.memory_hits,
      icon: Database,
      color: "text-amber-400",
      bg: "rgba(245, 158, 11, 0.1)"
    },
    {
      title: "Avg Confidence",
      value: `${Math.round(stats.avg_confidence * 100)}%`,
      icon: Cpu,
      color: "text-indigo-400",
      bg: "rgba(129, 140, 248, 0.1)"
    },
    {
      title: "Avg Latency",
      value: `${stats.avg_execution_time}s`,
      icon: Clock,
      color: "text-violet-400",
      bg: "rgba(167, 139, 250, 0.1)"
    },
    {
      title: "Active Agents",
      value: stats.agents_registered,
      icon: Zap,
      color: "text-pink-400",
      bg: "rgba(244, 114, 182, 0.1)"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Real-time telemetry and qualification metrics for ProspectPilot AI.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-2 font-display">{card.value}</p>
              </div>
              <div 
                className="p-3.5 rounded-xl"
                style={{ backgroundColor: card.bg }}
              >
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Lead Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Lead Chart */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white font-display">Lead Conversion Funnel</h3>
            <span className="text-xs text-zinc-400">Live Updates</span>
          </div>
          
          <div className="h-64 flex items-end justify-around pt-6 relative border-b border-zinc-800">
            {/* Chart Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-zinc-600 pb-1">
              <div className="border-t border-zinc-800/50 w-full pt-1">100%</div>
              <div className="border-t border-zinc-800/50 w-full pt-1">75%</div>
              <div className="border-t border-zinc-800/50 w-full pt-1">50%</div>
              <div className="border-t border-zinc-800/50 w-full pt-1">25%</div>
              <div className="w-full"></div>
            </div>

            {/* Funnel bars */}
            <div className="flex flex-col items-center z-10 w-24 group">
              <div 
                className="w-12 bg-blue-500/80 rounded-t-lg transition-all duration-500 glow-primary hover:bg-blue-400"
                style={{ height: stats.discovered_companies ? "160px" : "15px" }}
              />
              <span className="text-xs font-semibold text-white mt-2">Discovered</span>
              <span className="text-[10px] text-zinc-400">{stats.discovered_companies}</span>
            </div>

            <div className="flex flex-col items-center z-10 w-24">
              <div 
                className="w-12 bg-amber-500/80 rounded-t-lg transition-all duration-500 hover:bg-amber-400"
                style={{ height: stats.pending_leads ? `${(stats.pending_leads / (stats.discovered_companies || 1)) * 160}px` : "15px" }}
              />
              <span className="text-xs font-semibold text-white mt-2">Reviewing</span>
              <span className="text-[10px] text-zinc-400">{stats.pending_leads}</span>
            </div>

            <div className="flex flex-col items-center z-10 w-24">
              <div 
                className="w-12 bg-emerald-500/80 rounded-t-lg transition-all duration-500 glow-success hover:bg-emerald-400"
                style={{ height: stats.qualified_leads ? `${(stats.qualified_leads / (stats.discovered_companies || 1)) * 160}px` : "15px" }}
              />
              <span className="text-xs font-semibold text-white mt-2">Approved</span>
              <span className="text-[10px] text-zinc-400">{stats.qualified_leads}</span>
            </div>

            <div className="flex flex-col items-center z-10 w-24">
              <div 
                className="w-12 bg-red-500/80 rounded-t-lg transition-all duration-500 hover:bg-red-400"
                style={{ height: stats.rejected_leads ? `${(stats.rejected_leads / (stats.discovered_companies || 1)) * 160}px` : "15px" }}
              />
              <span className="text-xs font-semibold text-white mt-2">Rejected</span>
              <span className="text-[10px] text-zinc-400">{stats.rejected_leads}</span>
            </div>
          </div>
        </div>

        {/* Live System Diagnostics */}
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
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ 
                      width: stats.discovered_companies > 0 
                        ? `${(stats.memory_hits / (stats.discovered_companies + stats.memory_hits)) * 100}%`
                        : "100%" 
                    }}
                  />
                </div>
              </div>

              <div className="text-xs text-zinc-500 leading-relaxed border-t border-zinc-800/80 pt-4">
                Memory Engine automatically caches companies and contacts. Subsequent runs query this context cache first, resulting in <strong>0ms API latency</strong> and <strong>$0 external API cost</strong>.
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800/80 pt-4 mt-4 flex items-center space-x-3 text-emerald-400 text-xs font-semibold">
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
