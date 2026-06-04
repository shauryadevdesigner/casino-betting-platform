import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Radio,
  Trophy,
  Gift,
  BarChart3,
  Wallet,
  Crown,
  Target,
  LifeBuoy,
  UserPlus,
  Search,
  Bell,
  Plus,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api/client";
import type { ReactNode } from "react";
import { toast } from "sonner";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/live", label: "Live Games", icon: Radio, badge: "LIVE" },
  { to: "/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/rewards", label: "Rewards", icon: Gift },
  { to: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/affiliate", label: "Affiliate", icon: UserPlus },
  { to: "/vip", label: "VIP Club", icon: Crown },
  { to: "/missions", label: "Missions", icon: Target, badge: "3" },
  { to: "/support", label: "Support", icon: LifeBuoy },
];

export function CasinoLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, setBalance } = useAuth();

  const quickDeposit = async () => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    try {
      const res = await api.deposit(100);
      setBalance(res.balance);
      toast.success("Deposited $100");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deposit failed");
    }
  };

  const initials = user?.displayName?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border sticky top-0 h-screen">
        <div className="px-6 py-5 flex items-center gap-2 border-b border-sidebar-border">
          <div className="size-9 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple grid place-items-center shadow-[var(--shadow-neon)]">
            <Sparkles className="size-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-wide">FastLuck</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-sidebar-accent text-foreground shadow-[var(--shadow-glow)]"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      item.badge === "LIVE" ? "bg-destructive text-destructive-foreground" : "bg-neon-pink/20 text-neon-pink"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 p-4 rounded-xl bg-gradient-to-br from-neon-purple/30 to-neon-pink/20 border border-neon-purple/30 text-center">
          <Crown className="size-8 mx-auto text-neon-gold drop-shadow-[0_0_10px_oklch(0.82_0.17_85)]" />
          <p className="mt-2 text-sm font-bold">Unlock VIP Perks</p>
          <p className="mt-1 text-xs text-muted-foreground">Higher rewards, cashback & exclusive benefits.</p>
          <Link to="/vip" className="mt-3 inline-block w-full py-2 rounded-lg bg-gradient-to-r from-neon-gold to-warning text-background font-semibold text-sm">
            Go VIP
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass border-b border-border px-4 lg:px-6 py-3 flex items-center gap-3">
          <div className="lg:hidden size-9 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple grid place-items-center">
            <Sparkles className="size-5 text-white" />
          </div>
          <div className="flex-1 max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search games, tournaments..."
              className="w-full bg-input/60 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button className="size-9 rounded-xl bg-muted/60 grid place-items-center relative">
            <Bell className="size-4" />
          </button>
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 border border-border">
                <span className="text-sm font-bold neon-text">${user!.balance.toFixed(2)}</span>
                <button
                  onClick={quickDeposit}
                  className="size-6 rounded-md bg-gradient-to-br from-neon-pink to-neon-purple grid place-items-center"
                >
                  <Plus className="size-3.5 text-white" />
                </button>
              </div>
              <Link to="/profile" className="flex items-center gap-2">
                <div className="size-9 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center font-bold text-sm">
                  {initials}
                </div>
                <div className="hidden md:block leading-tight">
                  <p className="text-xs font-semibold">{user!.displayName}</p>
                  <p className="text-[10px] text-neon-gold">@{user!.username}</p>
                </div>
              </Link>
              <button onClick={logout} title="Logout" className="size-9 rounded-xl bg-muted/60 grid place-items-center">
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-semibold border border-border">
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-neon-pink to-neon-purple"
              >
                Register
              </Link>
            </div>
          )}
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
