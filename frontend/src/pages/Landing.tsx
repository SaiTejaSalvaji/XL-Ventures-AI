import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Lock, Mail, Shield, Zap, BarChart3, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Landing = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate auth delay
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: isLogin ? "Welcome back" : "Account created successfully",
        description: "Redirecting to your dashboard...",
      });
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col md:flex-row">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
      </div>

      {/* Left side: Hero & Features (Hidden on mobile when auth is focus, or stacked) */}
      <div className="flex-1 p-8 md:p-16 lg:p-24 flex flex-col justify-center animate-fade-in order-2 md:order-1 relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Aura Wealth AI Platform v2.0
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-6 text-white animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Unleash <span className="text-gradient animate-shimmer inline-block">Golden</span> <br />
          Investment Intelligence.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl animate-slide-up leading-relaxed" style={{ animationDelay: '0.3s' }}>
          Elevate your investment strategy with Aura Wealth. Our premium AI agents analyze documents, extract insights, and identify opportunities with unprecedented precision.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-start gap-4 p-4 rounded-2xl glass-panel">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Instant Analysis</h3>
              <p className="text-sm text-slate-400">Process hundreds of pages in seconds.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl glass-panel">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Enterprise Security</h3>
              <p className="text-sm text-slate-400">Bank-grade encryption for your data.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Auth Form */}
      <div className="w-full md:w-[450px] lg:w-[550px] p-8 md:p-12 lg:p-16 flex flex-col justify-center animate-fade-in order-1 md:order-2 border-l border-white/5 bg-black/40 backdrop-blur-3xl z-20 shadow-2xl">
        
        <div className="mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.4)]">
              <BarChart3 className="h-6 w-6 text-black" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Aura <span className="text-primary">Wealth</span></span>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-slate-400">
            {isLogin ? "Enter your credentials to access your dashboard" : "Join the elite network of intelligent investors"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input 
                type="email" 
                placeholder="you@company.com" 
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-primary h-12 rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">Password</label>
              {isLogin && (
                <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-primary h-12 rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-primary text-black hover:bg-primary/90 text-base font-semibold shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_25px_rgba(250,204,21,0.4)] transition-all duration-300 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors focus:outline-none"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default Landing;
