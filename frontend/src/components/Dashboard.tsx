import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, PieChart } from "lucide-react";

const Dashboard = () => {
  const portfolioData = [
    { month: 'Jan', value: 100000, benchmark: 100000 },
    { month: 'Feb', value: 108000, benchmark: 103000 },
    { month: 'Mar', value: 112000, benchmark: 105000 },
    { month: 'Apr', value: 118000, benchmark: 107000 },
    { month: 'May', value: 125000, benchmark: 110000 },
    { month: 'Jun', value: 132000, benchmark: 112000 },
  ];

  const sectorData = [
    { sector: 'Technology', allocation: 35, performance: 12.5 },
    { sector: 'Healthcare', allocation: 20, performance: 8.3 },
    { sector: 'Finance', allocation: 18, performance: 6.7 },
    { sector: 'Energy', allocation: 15, performance: -2.1 },
    { sector: 'Consumer', allocation: 12, performance: 4.2 },
  ];

  const metrics = [
    { title: "Total Portfolio Value", value: "$2.4M", change: "+12.4%", trend: "up", icon: DollarSign },
    { title: "Active Opportunities", value: "14", change: "+2", trend: "up", icon: Target },
    { title: "Avg AI Confidence", value: "92%", change: "+4.1%", trend: "up", icon: Activity },
    { title: "Risk Exposure", value: "Low-Med", change: "-1.2%", trend: "down", icon: PieChart },
  ];

  return (
    <section id="dashboard" className="py-6 px-2 sm:px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          Executive Summary
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Real-time portfolio intelligence powered by Nexus AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="glass-card rounded-xl p-6 transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{metric.title}</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{metric.value}</h3>
              </div>
              <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
                <metric.icon className="h-5 w-5" />
              </div>
            </div>
            
            <div className="flex items-center mt-2 bg-slate-50 dark:bg-slate-800/50 w-fit px-2.5 py-1 rounded-full">
              {metric.trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500 mr-1.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-emerald-500 mr-1.5" />
              )}
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {metric.change}
              </span>
              <span className="text-xs text-slate-400 ml-1">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700/50">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Performance vs Benchmark</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={portfolioData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    color: '#1e293b',
                    fontWeight: 500
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4f46e5" 
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  strokeWidth={3} 
                  name="Portfolio"
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#94a3b8" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  dot={false}
                  name="Benchmark"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700/50">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sector Allocation</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={sectorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="sector" stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  cursor={{fill: 'rgba(226, 232, 240, 0.4)'}}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    color: '#1e293b',
                    fontWeight: 500
                  }} 
                />
                <Bar dataKey="allocation" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Allocation %" barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
