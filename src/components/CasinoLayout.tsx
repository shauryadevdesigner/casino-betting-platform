import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Home,
  Radio,
  Trophy,
  Gift,
  BarChart3,
  Crown,
  Target,
  Headphones,
  Search,
  Bell,
  Plus,
  Sparkles,
  LogOut,
  Menu as MenuIcon,
  X as XIcon,
  ChevronDown,
  Wallet
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api/client";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import crownImg from "@/assets/crown.png";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/live", label: "Live Games", icon: Radio, badge: "LIVE" },
  { to: "/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/rewards", label: "Rewards", icon: Gift },
  { to: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/vip", label: "VIP Club", icon: Crown },
  { to: "/missions", label: "Missions", icon: Target, badge: "3" },
  { to: "/support", label: "Support", icon: Headphones },
];

export function CasinoLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, setBalance } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const quickDeposit = async () => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    try {
      const res = await api.deposit(100);
      setBalance(res.balance);
      toast.success("Deposited $100 (Demo Funds)");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deposit failed");
    }
  };

  const initials = user?.displayName?.slice(0, 2).toUpperCase() ?? "??";

  const renderNavLinks = (onLinkClick?: () => void) => {
    return navItems.map((item) => {
      const active = location.pathname === item.to;
      const Icon = item.icon;
      return (
        <Link
          key={item.to}
          to={item.to}
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-350 ${
            active
              ? "bg-gradient-to-r from-neon-purple/20 to-neon-pink/10 text-white border border-neon-purple/40 shadow-[var(--shadow-neon)]"
              : "text-muted-foreground hover:bg-card/45 hover:text-white border border-transparent"
          }`}
        >
          <Icon className={`size-4.5 ${active ? "text-neon-pink" : "text-muted-foreground group-hover:text-white"}`} />
          <span className="flex-1 tracking-wide">{item.label}</span>
          {item.badge && (
            <span
              className={`text-[9px] px-2 py-0.5 rounded-md font-black tracking-widest ${
                item.badge === "LIVE" 
                  ? "bg-destructive/15 text-destructive border border-destructive/20 animate-pulse" 
                  : "bg-neon-pink/20 text-neon-pink border border-neon-pink/30"
              }`}
            >
              {item.badge}
            </span>
          )}
        </Link>
      );
    });
  };

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-sidebar border-r border-sidebar-border sticky top-0 h-screen z-40 shrink-0">
        <div className="px-5 py-4.5 flex items-center gap-2.5 border-b border-sidebar-border bg-gradient-to-b from-black/20 to-transparent">
          <div className="flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
              <path d="M6 8H34L30 16H10L6 8Z" fill="url(#paint0_linear)" />
              <path d="M10 18H30L26 26H14L10 18Z" fill="url(#paint1_linear)" />
              <path d="M14 28H26L23 34H17L14 28Z" fill="url(#paint2_linear)" />
              <defs>
                <linearGradient id="paint0_linear" x1="6" y1="12" x2="34" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00c6ff" />
                  <stop offset="1" stopColor="#0072ff" />
                </linearGradient>
                <linearGradient id="paint1_linear" x1="10" y1="22" x2="30" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0072ff" />
                  <stop offset="1" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="paint2_linear" x1="14" y1="31" x2="26" y2="31" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ec4899" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <span className="font-display text-lg font-black tracking-wide text-white">
              Fast<span className="bg-gradient-to-r from-neon-blue to-neon-pink bg-clip-text text-transparent">Luck</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {renderNavLinks()}
        </nav>

        {/* Sidebar VIP Promo Card */}
        <div className="m-3 p-4 rounded-2xl bg-gradient-to-br from-[#0c0f24] to-[#080b1e] border border-blue-900/30 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-pink/5 blur-xl rounded-full" />
          <div className="relative z-10">
            <div className="size-16 mx-auto flex items-center justify-center mb-1">
              <img 
                src={crownImg} 
                alt="VIP Crown" 
                className="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(255,179,0,0.65)] animate-pulse-glow mix-blend-screen" 
              />
            </div>
            <p className="text-xs font-extrabold text-white tracking-wide">Unlock VIP Perks</p>
            <p className="mt-1 text-[9px] text-slate-400 font-medium leading-normal max-w-[150px] mx-auto">Higher rewards, cashback & exclusive benefits.</p>
            <Link to="/vip" className="mt-3 block w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple text-white font-extrabold text-[9px] uppercase tracking-widest shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:brightness-110 active:scale-[0.98] transition-all">
              Go VIP
            </Link>
          </div>
        </div>
      </aside>

      {/* Sliding Mobile Sidebar Menu */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {/* Backdrop */}
        <div onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
        
        {/* Drawer Panel */}
        <aside className={`absolute inset-y-0 left-0 w-60 bg-sidebar border-r border-sidebar-border p-4.5 flex flex-col justify-between transition-transform duration-300 ease-out transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2.5">
                <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8H34L30 16H10L6 8Z" fill="url(#paint0_linear_mob)" />
                  <path d="M10 18H30L26 26H14L10 18Z" fill="url(#paint1_linear_mob)" />
                  <path d="M14 28H26L23 34H17L14 28Z" fill="url(#paint2_linear_mob)" />
                  <defs>
                    <linearGradient id="paint0_linear_mob" x1="6" y1="12" x2="34" y2="12" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00c6ff" />
                      <stop offset="1" stopColor="#0072ff" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_mob" x1="10" y1="22" x2="30" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0072ff" />
                      <stop offset="1" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="paint2_linear_mob" x1="14" y1="31" x2="26" y2="31" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ec4899" />
                      <stop offset="1" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="font-display text-base font-black tracking-wide text-white">
                  Fast<span className="bg-gradient-to-r from-neon-blue to-neon-pink bg-clip-text text-transparent">Luck</span>
                </span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="size-8 rounded-xl bg-muted/40 grid place-items-center border border-border/60 text-muted-foreground hover:text-white">
                <XIcon className="size-4.5" />
              </button>
            </div>
            
            <nav className="mt-4 space-y-1 overflow-y-auto max-h-[60vh]">
              {renderNavLinks(() => setMobileMenuOpen(false))}
            </nav>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c0f24] to-[#080b1e] border border-blue-900/30 text-center relative overflow-hidden shadow-2xl">
            <img 
              src={crownImg} 
              alt="VIP Crown" 
              className="w-12 h-12 mx-auto object-contain drop-shadow-[0_0_10px_rgba(255,179,0,0.6)] animate-pulse-glow mb-1 mix-blend-screen" 
            />
            <p className="mt-2 text-xs font-extrabold text-white">Unlock VIP Perks</p>
            <Link to="/vip" onClick={() => setMobileMenuOpen(false)} className="mt-3 block w-full py-2 rounded-lg bg-gradient-to-r from-neon-pink to-neon-purple text-white font-extrabold text-[9px] uppercase tracking-widest text-center shadow-md">
              Go VIP
            </Link>
          </div>
        </aside>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#08080c]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5 flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden size-9 rounded-xl bg-muted/40 border border-border/80 grid place-items-center text-muted-foreground hover:text-white">
            <MenuIcon className="size-5" />
          </button>
          
          <div className="flex-1 max-w-sm relative hidden md:block">
            <input
              placeholder="Search games, tournaments..."
              className="w-full bg-[#0c0d14] border border-slate-800/80 rounded-xl pl-4 pr-10 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/20 transition-all font-semibold"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none" />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Online Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0c0d14] border border-slate-800/80 rounded-xl text-[11px] font-semibold text-slate-300">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span>Online: <span className="text-white">1,248</span></span>
            </div>

            {/* Gift Icon Button */}
            <button className="size-9 rounded-xl bg-[#0c0d14] border border-slate-800/80 grid place-items-center text-cyan-400 hover:text-cyan-300 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Gift className="size-4.5" />
            </button>

            {isAuthenticated ? (
              <>
                {/* Balance Badge */}
                <div className="flex items-center gap-2 px-3.5 py-1 rounded-xl bg-[#0c0d14] border border-slate-800/80">
                  <span className="text-xs font-bold text-white tracking-wide">${user!.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <button
                    onClick={quickDeposit}
                    className="size-6 rounded-lg bg-blue-600 hover:bg-blue-500 grid place-items-center hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_0_10px_rgba(37,99,235,0.3)] ml-0.5"
                    title="Quick Deposit $100"
                  >
                    <Plus className="size-3 text-white" />
                  </button>
                </div>
                
                {/* User Profile */}
                <div className="flex items-center gap-2.5 pl-1.5 border-l border-slate-800/50">
                  <div className="size-8.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[1.5px] shadow-[0_0_8px_rgba(59,130,246,0.35)] shrink-0">
                    <div className="w-full h-full rounded-full bg-[#08080c] grid place-items-center text-[10px] font-extrabold text-blue-400 uppercase">
                      {initials}
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col text-left justify-center min-w-[85px] leading-none">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-extrabold text-white tracking-wide">{user!.displayName}</span>
                      <svg className="size-3 text-blue-400 fill-blue-400 verified-badge-glow" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[7.5px] font-black text-amber-400 uppercase tracking-widest">VIP 7</span>
                      <div className="h-0.5 flex-1 rounded-full bg-slate-800 overflow-hidden max-w-[45px]">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "70%" }} />
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="size-3.5 text-slate-400 ml-0.5 pointer-events-none" />
                </div>

                <button onClick={logout} title="Logout" className="size-9 rounded-xl bg-[#0c0d14] border border-slate-800/80 grid place-items-center text-slate-400 hover:text-destructive hover:bg-destructive/10 hover:scale-[1.03] transition-all">
                  <LogOut className="size-4" />
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="px-4.5 py-2.5 rounded-xl text-xs font-bold border border-border hover:bg-card transition-all">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-neon-pink to-neon-purple text-white shadow-[var(--shadow-neon)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gradient-to-b from-background via-background/95 to-black/90">
          {children}
        </main>
      </div>
    </div>
  );
}

