import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { CasinoLayout } from "./CasinoLayout";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Info, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

interface Props {
  title: string;
  accent: string;
  children: (apiContext: {
    bet: number;
    setBet: (n: number) => void;
    balance: number;
    isAuthenticated: boolean;
    onBetError: (msg: string) => void;
    updateBalance: (balance: number) => void;
    placeBet: () => boolean;
    payout: (multiplier: number) => void;
    loss: () => void;
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

  const placeBet = (): boolean => {
    if (bet > balance) {
      toast.error("Insufficient balance!");
      return false;
    }
    setBalance(balance - bet);
    return true;
  };

  const payout = (multiplier: number) => {
    const payoutAmount = bet * multiplier;
    const newBal = balance + payoutAmount;
    setBalance(newBal);
    
    // Sync net win to the backend database so the user's winnings persist!
    const netWin = payoutAmount - bet;
    if (netWin > 0) {
      api.deposit(netWin)
        .then((res) => {
          setBalance(res.balance);
        })
        .catch((err) => {
          console.warn("DB Balance sync skipped:", err.message);
        });
    }
  };

  const loss = () => {
    // Bet is already deducted from balance in placeBet()
  };

  if (!isAuthenticated) {
    return (
      <CasinoLayout>
        <div className="max-w-md mx-auto text-center glass rounded-3xl p-8 mt-12 border border-border/80">
          <p className="text-muted-foreground mb-4">Sign in to play {title}</p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold text-white hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Sign in
          </button>
        </div>
      </CasinoLayout>
    );
  }

  return (
    <CasinoLayout>
      <div className="max-w-5xl mx-auto pb-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="size-4" /> Back to Lobby
        </Link>
        <div className="rounded-3xl overflow-hidden border border-border/60 bg-gradient-to-br from-card via-card/90 to-background/90" style={{ boxShadow: `0 12px 60px ${accent}25` }}>
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-border/30 pb-4">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-black tracking-widest" style={{ color: accent, textShadow: `0 0 20px ${accent}80` }}>{title}</h1>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
              </div>
              <div className="glass px-4 py-2.5 rounded-2xl border border-border/80 flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs text-muted-foreground">Lobby Balance:</span>
                <span className="font-display font-black text-neon-gold text-lg drop-shadow-[0_0_8px_rgba(255,179,0,0.3)]">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-[1fr_300px] gap-6 items-start">
              {/* Game workspace (Left) */}
              <div className="rounded-2xl bg-background/50 border border-border/60 p-4 md:p-6 min-h-[380px] flex flex-col justify-center glass">
                {children({ bet, setBet, balance, isAuthenticated, onBetError, updateBalance, placeBet, payout, loss })}
              </div>

              {/* Game controls (Right) */}
              <div className="rounded-2xl bg-card/60 border border-border/60 p-5 space-y-4 glass">
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold block mb-2">Bet Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">$</span>
                    <input
                      type="number"
                      min={1}
                      value={bet}
                      onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-input/80 rounded-xl pl-7 pr-3 py-2.5 text-sm font-semibold border border-border focus:outline-none focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[0.5, 2, "Max"].map((m) => (
                    <button
                      key={String(m)}
                      onClick={() => setBet(m === "Max" ? Math.floor(balance) : Math.max(1, Math.floor(bet * (m as number))))}
                      className="py-2 rounded-xl bg-muted/60 text-xs font-bold hover:bg-muted text-foreground border border-border/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {m === "Max" ? "Max" : `${m}x`}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 50, 100, 500].map((v) => (
                    <button 
                      key={v} 
                      onClick={() => setBet(v)} 
                      className="py-2 rounded-xl bg-muted/40 text-[10px] font-extrabold hover:bg-muted text-muted-foreground hover:text-foreground border border-border/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      ${v}
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-border/30 text-[10px] text-muted-foreground flex gap-1.5 items-start">
                  <Info className="size-3.5 text-neon-cyan shrink-0 mt-0.5" />
                  <p>FastLuck uses cryptographic seeds. Win multipliers are evaluated client-side and net earnings are instantly deposited.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CasinoLayout>
  );
}

