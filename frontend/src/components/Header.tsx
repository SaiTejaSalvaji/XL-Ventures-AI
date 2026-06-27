import { Search, Bell, User } from "lucide-react";
import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard": return "Dashboard";
      case "/opportunity/new": return "New Opportunity";
      case "/upload": return "Upload Documents";
      case "/process-documents": return "Process Documents";
      case "/analysis": return "Investment Analysis";
      default: return "Nexus AI";
    }
  };

  return (
    <header className="h-16 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl fixed top-0 right-0 left-0 md:left-64 z-30 transition-all">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 hidden sm:block">
            {getPageTitle()}
          </h2>
          
          <div className="relative max-w-md w-full ml-4 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search companies, analyses, documents..." 
              className="w-full h-9 pl-10 pr-4 rounded-full bg-slate-100 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white dark:ring-slate-950"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Alex Investor</p>
              <p className="text-xs text-slate-500">Managing Partner</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
              AI
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
