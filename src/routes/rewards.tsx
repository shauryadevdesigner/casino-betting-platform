import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { Gift, Calendar, Sparkles, CheckCircle2, Coins, Trophy, Zap, Target, History, Gem, Star, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, type Transaction } from "@/lib/api/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards Center — FastLuck" },
      { name: "description", content: "Claim daily bonuses, weekly rewards, achievements, and VIP cashback on the premium FastLuck rewards portal." }
    ]
  }),
  component: Rewards,
});

function Rewards() {
  const { user, isAuthenticated, setBalance } = useAuth();
  const navigate = useNavigate();
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "vip">("daily");

  // VIP Specials state
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [dailyRewardAmt, setDailyRewardAmt] = useState(50);
  const [nextClaimAt, setNextClaimAt] = useState<string | null>(null);
  const [timeLeftStr, setTimeLeftStr] = useState("");
  const [loadingDaily, setLoadingDaily] = useState(false);

  // Missions state
  const [missions, setMissions] = useState<any[]>([]);
  const [claimingMission, setClaimingMission] = useState<string | null>(null);

  // History state
  const [rewardHistory, setRewardHistory] = useState<Transaction[]>([]);

  const fetchData = async () => {
    if (!isAuthenticated) return;
    try {
      const [statusRes, missionsRes, txRes] = await Promise.all([
        api.dailyStatus(),
        api.missions(),
        api.transactions({ limit: 50 })
      ]);
      
      setCanClaimDaily(statusRes.canClaim);
      setDailyRewardAmt(statusRes.rewardAmount);
      setNextClaimAt(statusRes.nextClaimAt);
      
      setMissions(missionsRes.missions || []);

      const rewards = txRes.items.filter(
        (t) =>
          t.type === "daily_reward" ||
          t.type === "mission_reward" ||
          t.type === "tournament_prize" ||
          (t.type === "adjustment" && t.amount > 0)
      );
      setRewardHistory(rewards);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for progress updates
    const interval = setInterval(() => {
      if (isAuthenticated) {
        api.missions().then(res => setMissions(res.missions || [])).catch(() => {});
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.balance]);

  useEffect(() => {
    if (canClaimDaily || !nextClaimAt) {
      setTimeLeftStr("");
      return;
    }
    const updateTimer = () => {
      const diff = new Date(nextClaimAt).getTime() - Date.now();
      if (diff <= 0) {
        setCanClaimDaily(true);
        setTimeLeftStr("");
        return;
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeftStr(`${hrs}h ${mins}m ${secs}s`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [canClaimDaily, nextClaimAt]);

  const claimDaily = async () => {
    setLoadingDaily(true);
    try {
      const res = await api.claimDaily();
      setBalance(res.balance);
      setCanClaimDaily(false);
      setNextClaimAt(res.nextClaimAt);
      toast.success(`Successfully claimed $${res.amount} Daily Reward!`);
      fetchData();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setLoadingDaily(false);
    }
  };

  const claimMissionReward = async (id: string) => {
    setClaimingMission(id);
    try {
      const res = await api.claimMission(id);
      setBalance(res.balance);
      toast.success(`Claimed $${res.reward} mission reward!`);
      await fetchData(); // Refetches missions to generate new ones if needed
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to claim mission");
    } finally {
      setClaimingMission(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <CasinoLayout>
        <div className="max-w-md mx-auto text-center glass rounded-3xl p-8 mt-12 border border-border">
          <Gift className="size-14 mx-auto text-neon-pink drop-shadow-[0_0_12px_oklch(0.72_0.28_340/0.4)] mb-4 animate-bounce" />
          <h2 className="font-display text-2xl font-black mb-2">Rewards Center</h2>
          <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
            Sign in to access your free daily reload, weekly VIP payouts, and special milestones.
          </p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold shadow-[var(--shadow-neon)] hover:opacity-95 transition-all"
          >
            Sign In
          </button>
        </div>
      </CasinoLayout>
    );
  }

  // Determine loyalty progress
  const gamesPlayed = user?.stats?.gamesPlayed || 0;
  const levelTarget = 1000;
  const currentXP = Math.min(gamesPlayed * 10, levelTarget); // Mock XP calculation
  const xpPercent = (currentXP / levelTarget) * 100;
  
  const dailyMissions = missions.filter(m => m.missionType === "daily" || m.missionType === "daily_quest");
  const weeklyMissions = missions.filter(m => m.missionType === "weekly");

  return (
    <CasinoLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12 w-full px-2 sm:px-0">
        
        {/* Loyalty Progress Header */}
        <div className="glass rounded-3xl p-6 md:p-8 border border-border/60 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/5 blur-3xl rounded-full" />
          <div className="flex items-center gap-5 z-10 w-full md:w-auto">
            <div className="relative">
              <div className="size-16 md:size-20 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-pink grid place-items-center shadow-[var(--shadow-neon)]">
                <Trophy className="size-8 md:size-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-card border border-border rounded-lg px-2 py-0.5 text-[10px] font-black uppercase text-neon-gold shadow-md">
                LVL 1
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-xl md:text-2xl font-black uppercase tracking-wide">Standard Tier</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/20 uppercase tracking-widest backdrop-blur-sm">
                  {user?.vipTier || "Bronze"}
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-semibold">Play games to level up your loyalty tier!</p>
            </div>
          </div>
          
          <div className="w-full md:w-1/3 z-10">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">XP Progress</span>
              <span className="text-sm font-display font-black text-white">{currentXP} <span className="text-muted-foreground">/ {levelTarget} XP</span></span>
            </div>
            <div className="h-3 md:h-4 rounded-full bg-background overflow-hidden border border-border/60 p-0.5 shadow-inner">
              <div className="h-full rounded-full bg-gradient-to-r from-neon-pink to-neon-purple relative" style={{ width: `${xpPercent}%` }}>
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-shimmer" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }}></div>
              </div>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right mt-2">
              {(levelTarget - currentXP) / 10} Games remaining to level up
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-border/40 gap-6 px-4 overflow-x-auto no-scrollbar">
          {(["daily", "weekly", "vip"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 text-sm md:text-base font-display font-black uppercase tracking-wider transition-all whitespace-nowrap relative ${
                activeTab === tab ? "text-white" : "text-muted-foreground hover:text-white/80"
              }`}
            >
              {tab === "daily" && "Daily Quests"}
              {tab === "weekly" && "Weekly Milestones"}
              {tab === "vip" && "VIP Specials"}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink to-neon-purple rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-2 animate-in fade-in duration-300">
          
          {/* DAILY & WEEKLY QUESTS VIEW */}
          {(activeTab === "daily" || activeTab === "weekly") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(activeTab === "daily" ? dailyMissions : weeklyMissions).length === 0 ? (
                <div className="col-span-1 md:col-span-2 glass rounded-2xl p-8 text-center border border-border/40">
                  <Target className="size-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <h3 className="font-display font-bold text-lg mb-1">No Active {activeTab === "daily" ? "Quests" : "Milestones"}</h3>
                  <p className="text-sm text-muted-foreground">Check back later for new challenges to complete!</p>
                </div>
              ) : (
                (activeTab === "daily" ? dailyMissions : weeklyMissions).map((m: any) => {
                  const target = Number(m.target);
                  const progress = Math.min(Number(m.progress || 0), target);
                  const isCompleted = m.completed;
                  const isClaimed = m.claimed;
                  const pct = (progress / target) * 100;

                  return (
                    <div 
                      key={m._id || m.id} 
                      className={`rounded-2xl p-5 border relative overflow-hidden flex flex-col justify-between min-h-[140px] transition-all ${
                        isClaimed ? "bg-card/50 border-border/40 opacity-70" 
                        : isCompleted ? "bg-success/5 border-success shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                        : "glass border-border/60 hover:border-border"
                      }`}
                    >
                      {/* Background Accents */}
                      {isCompleted && !isClaimed && <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 blur-2xl rounded-full" />}
                      
                      <div className="flex justify-between items-start z-10 mb-4">
                        <div className="flex gap-3">
                          <div className={`size-10 rounded-xl grid place-items-center shrink-0 ${isCompleted ? "bg-success text-black" : "bg-card border border-border text-white"}`}>
                            {isCompleted ? <CheckCircle2 className="size-5" /> : <Target className="size-5" />}
                          </div>
                          <div>
                            <h3 className="font-display font-black text-sm uppercase tracking-wide">{m.title}</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                              {m.description || `Complete this ${activeTab} goal`}
                            </p>
                          </div>
                        </div>
                        <div className="bg-card border border-border px-3 py-1 rounded-lg">
                          <span className="text-neon-gold font-display font-black text-sm">+${m.reward}</span>
                        </div>
                      </div>

                      <div className="mt-auto z-10">
                        <div className="flex justify-between items-end mb-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? "text-success" : "text-muted-foreground"}`}>
                            Progress: {progress} / {target} {isCompleted && "COMPLETE"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-3 rounded-full bg-background overflow-hidden border border-border/40 p-0.5">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? "bg-success" : "bg-gradient-to-r from-neon-pink to-neon-purple"}`} 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                          
                          {isClaimed ? (
                            <button disabled className="shrink-0 px-4 py-1.5 rounded-lg bg-card border border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-not-allowed">
                              Reward Claimed
                            </button>
                          ) : isCompleted ? (
                            <button 
                              onClick={() => claimMissionReward(m._id || m.id)}
                              disabled={claimingMission === (m._id || m.id)}
                              className="shrink-0 px-4 py-1.5 rounded-lg bg-success hover:bg-success/90 text-[10px] font-black uppercase tracking-widest text-black shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all hover:scale-105 active:scale-95"
                            >
                              {claimingMission === (m._id || m.id) ? "Claiming..." : "Claim Reward"}
                            </button>
                          ) : (
                            <Link 
                              to="/"
                              className="shrink-0 px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-1"
                            >
                              Play Games <Zap className="size-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIP SPECIALS VIEW */}
          {activeTab === "vip" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Daily Login Reward */}
              <div className="glass rounded-3xl p-6 border border-border/60 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/5 blur-2xl rounded-full" />
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-neon-pink/15 text-neon-pink border border-neon-pink/30 uppercase tracking-widest">
                      Daily Reload
                    </span>
                    <Calendar className="size-5 text-muted-foreground/60" />
                  </div>
                  <h3 className="font-display text-lg font-black">Daily Login Bonus</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-normal">
                    Claim free credits every 24 hours to keep playing your favorite games.
                  </p>
                  <p className="text-3xl font-display font-black text-neon-gold mt-4">${dailyRewardAmt}</p>
                </div>

                <div className="mt-6 space-y-3">
                  {!canClaimDaily && timeLeftStr && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Next Claim In:</span>
                      <span className="font-bold font-display text-foreground">{timeLeftStr}</span>
                    </div>
                  )}
                  <button
                    onClick={claimDaily}
                    disabled={!canClaimDaily || loadingDaily}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple text-xs font-bold uppercase tracking-wider text-white shadow-md disabled:opacity-40 disabled:hover:scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {loadingDaily ? "Claiming..." : canClaimDaily ? "Claim Reward" : "Claimed"}
                  </button>
                </div>
              </div>

              {/* VIP Rakeback */}
              <div className="glass rounded-3xl p-6 border border-border/60 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-2xl rounded-full" />
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 uppercase tracking-widest">
                      Instant Rake
                    </span>
                    <Coins className="size-5 text-muted-foreground/60" />
                  </div>
                  <h3 className="font-display text-lg font-black">VIP Rakeback</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-normal">
                    Get instant cashback on every single bet placed, win or lose. Based on your VIP tier.
                  </p>
                  <p className="text-3xl font-display font-black text-neon-cyan mt-4">
                    {user?.vipTier === "platinum" ? "15%" : user?.vipTier === "gold" ? "12%" : user?.vipTier === "silver" ? "8%" : "5%"} <span className="text-xs font-normal text-muted-foreground">Rate</span>
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Accrued Rakeback:</span>
                    <span className="font-bold font-display text-success">$0.00</span>
                  </div>
                  <button
                    onClick={() => toast.info("Rakeback accumulates silently. It will be claimable in a future update!")}
                    className="w-full py-3 rounded-xl bg-card border border-border hover:bg-muted text-xs font-bold uppercase tracking-wider text-foreground hover:scale-[1.02] transition-all"
                  >
                    Details & History
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Claimed Rewards History Logs (Visible on all tabs) */}
        <section className="space-y-4 pt-8">
          <div className="flex items-center gap-2 px-2">
            <History className="size-5 text-muted-foreground" />
            <h2 className="text-sm font-display font-black tracking-widest uppercase text-muted-foreground">Recent Activity</h2>
          </div>

          <div className="glass rounded-3xl p-5 border border-border/60">
            {rewardHistory.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm font-semibold">
                No rewards claimed yet. Play games or claim your daily reload to build your history!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border/40 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                      <th className="py-2.5 px-4">Claim Date</th>
                      <th className="py-2.5 px-4">Reward Type</th>
                      <th className="py-2.5 px-4 text-right">Credit Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {rewardHistory.slice(0, 10).map((item) => (
                      <tr key={item._id} className="hover:bg-card/20 transition-all">
                        <td className="py-3 px-4 text-muted-foreground text-xs font-medium">
                          {new Date(item.createdAt).toLocaleString(undefined, {
                            month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                          })}
                        </td>
                        <td className="py-3 px-4 font-bold text-foreground uppercase tracking-wide text-[11px]">
                          {item.type.replace("_", " ")}
                        </td>
                        <td className="py-3 px-4 text-right font-display font-black text-success text-sm">
                          +${item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </CasinoLayout>
  );
}
