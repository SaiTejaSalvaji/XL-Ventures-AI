import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-slate-900 dark:text-slate-50 antialiased selection:bg-primary/30">
      <Sidebar />
      <div className="flex flex-col md:pl-64 min-h-screen">
        <Header />
        <main className="flex-1 overflow-x-hidden pt-16">
          <div className="animate-fade-in max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
