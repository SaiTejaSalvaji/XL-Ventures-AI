import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileSearch, 
  Settings, 
  PieChart, 
  FileText,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Briefcase, label: "Opportunities", href: "/opportunity/new" },
    { icon: UploadCloud, label: "Upload Documents", href: "/upload" },
    { icon: FileSearch, label: "Process Documents", href: "/process-documents" },
    { icon: PieChart, label: "Analysis", href: "/analysis" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl transition-transform hidden md:block">
      <div className="flex h-16 items-center border-b border-slate-200/60 dark:border-slate-800/60 px-6">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-primary text-white p-1.5 rounded-lg">
            <PieChart className="h-5 w-5" />
          </div>
          <span className="text-gradient">Nexus AI</span>
        </div>
      </div>
      
      <div className="px-4 py-6 overflow-y-auto h-[calc(100vh-4rem)]">
        <div className="space-y-1">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Workspace
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-50"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-50")} />
                {item.label}
              </NavLink>
            );
          })}
        </div>

        <div className="mt-12 space-y-1">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            System
          </p>
          <NavLink
            to="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 transition-all duration-200 group"
          >
            <Settings className="h-4 w-4 text-slate-500 group-hover:text-slate-900" />
            Settings
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
