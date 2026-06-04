import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { CasinoLayout } from "./CasinoLayout";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

interface Props {
  title: string;
  accent: string;
  children: (api: {
    bet: number;
    setBet: (n: number) => void;
    balance: number;
    isAuthenticated: boolean;
    onBetError: (msg: string) => void;
    updateBalance: (balance: number) => void;
  }) => ReactNode;
  description?: string;
}

export function GameShell({ title, accent, children, description }: Props) {
  const { user, isAuthenticated, setBalance } = useAuth();
  const navigate = useNavigate();
  const [bet, setBet] = useState(10);
  const balance = user?.balance ?? 0;

  const onBetError = (msg: string) => toast.error(msg);

  const updateBalance = (b: number) => setBalance(b);

  if (!isAuthenticated) {
    return (
      <CasinoLayout>
        <div className="max-w-md mx-auto text-center glass rounded-2xl p-8 mt-12">
          <p className="text-muted-foreground mb-4">Sign in to play {title}</p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold"
          >
            Sign in
          </button>
        </div>
      </CasinoLayout>
    );
  }

  return (
    <CasinoLayout>
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="size-4" /> Back to Lobby
        </Link>
        <div className="rounded-3xl overflow-hidden border border-border" style={{ boxShadow: `0 8px 60px ${accent}55` }}>
          <div className="p-6 md:p-8 bg-gradient-to-br from-card to-background">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-display text-3xl md:text-4xl font-black" style={{ color: accent, textShadow: `0 0 16px ${accent}` }}>{title}</h1>
              <p className="text-sm">Balance: <span className="font-bold neon-text">${balance.toFixed(2)}</span></p>
            </div>
            {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}

            <div className="grid md:grid-cols-[1fr_280px] gap-6">
              <div className="rounded-2xl bg-background/60 border border-border p-4 md:p-6 min-h-[360px]">
                {children({ bet, setBet, balance, isAuthenticated, onBetError, updateBalance })}
              </div>
              <div className="rounded-2xl bg-background/60 border border-border p-4 space-y-3 h-fit">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Bet Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={bet}
                    onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
                    className="flex-1 bg-input rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[0.5, 2, "Max"].map((m) => (
                    <button
                      key={String(m)}
                      onClick={() => setBet(m === "Max" ? Math.floor(balance) : Math.max(1, Math.floor(bet * (m as number))))}
                      className="py-2 rounded-lg bg-muted text-xs font-semibold hover:bg-muted/70"
                    >
                      {m === "Max" ? "Max" : `${m}x`}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 50, 100, 500].map((v) => (
                    <button key={v} onClick={() => setBet(v)} className="py-2 rounded-lg bg-muted text-xs font-semibold hover:bg-muted/70">
                      ${v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CasinoLayout>
  );
}
