import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { Crown, Sparkles, ShieldCheck, Heart, Flame, Landmark, ArrowRight, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/vip")({
  head: () => ({
    meta: [
      { title: "VIP Club — FastLuck" },
      { name: "description", content: "Join the elite VIP Club on FastLuck. Purchase membership levels, compare tier benefits, track rakeback rates, and unlock priority support." }
    ]
  }),
  component: VipPage,
});

type VipTier = {
  tierKey: string;
  name: string;
  minWagered: number;
  dailyRewardBonusPct: number;
  affiliateCommissionRate: number;
  benefits: string[];
};

const BUYABLE_COSTS: Record<string, number> = {
  bronze: 100,
  silver: 250,
  gold: 500,
  platinum: 1000,
};

const TIER_ORDER = ["bronze", "silver", "gold", "platinum"];

function VipPage() {
  const { user, isAuthenticated, setBalance, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [currentTier, setCurrentTier] = useState<string>("bronze");
  const [totalWagered, setTotalWagered] = useState<number>(0);
  const [tiers, setTiers] = useState<VipTier[]>([]);
  const [progressToNext, setProgressToNext] = useState<number>(0);
  const [nextTier, setNextTier] = useState<VipTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  const fetchVipData = async () => {
    try {
      const res = await api.vipTiers();
      if (res.success) {
        setCurrentTier(res.currentTier || "bronze");
        setTotalWagered(res.totalWagered || 0);
        setTiers(res.tiers as VipTier[]);
        setProgressToNext(res.progressToNext || 0);
        setNextTier(res.next as VipTier | null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchVipData();
  }, [isAuthenticated]);

  const handleBuyTier = async (tierKey: string) => {
    setBuying(tierKey);
    try {
      const res = await api.buyVip(tierKey);
      if (res.success) {
        toast.success(`Successfully upgraded to VIP ${tierKey.toUpperCase()}!`);
        // Refresh local auth state and page data
        await refreshUser();
        if (res.user) {
          setBalance(res.user.balance);
        }
        await fetchVipData();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to purchase tier");
    } finally {
      setBuying(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <CasinoLayout>
        <div className="max-w-md mx-auto text-center glass rounded-3xl p-8 mt-12 border border-border">
          <Crown className="size-14 mx-auto text-neon-gold drop-shadow-[0_0_12px_oklch(0.82_0.17_85/0.4)] mb-4 animate-bounce" />
          <h2 className="font-display text-2xl font-black mb-2">VIP Lounge</h2>
          <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
            Enter the elite tier. Unlock daily bonuses, weekly payouts, personal account managers, and priority support.
          </p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-gold to-warning text-background font-bold shadow-md hover:opacity-95 transition-all"
          >
            Sign In to Unlock
          </button>
        </div>
      </CasinoLayout>
    );
  }

  // Calculate distance to next level for display
  const wagersForNext = nextTier ? nextTier.minWagered - totalWagered : 0;

  return (
    <CasinoLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Title Header */}
        <div className="rounded-3xl glass p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-border/60">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-neon-gold to-warning grid place-items-center shadow-[var(--shadow-neon)]">
              <Crown className="size-8 text-background" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black">VIP Club Lounge</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Skip tiers instantly or wager to unlock prestigious gaming benefits.</p>
            </div>
          </div>
          <span className="glass px-4 py-2 rounded-xl text-xs font-bold border border-border flex items-center gap-1.5 text-neon-gold">
            <Sparkles className="size-4 animate-pulse" /> Status: Elite Player
          </span>
        </div>

        {loading ? (
          <div className="glass rounded-3xl p-16 text-center">
            <Crown className="size-8 mx-auto text-muted-foreground animate-spin mb-3" />
            <p className="text-muted-foreground text-sm font-semibold">Loading VIP dashboard...</p>
          </div>
        ) : (
          <>
            {/* VIP Status Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
              {/* Left Side: Current status and progress */}
              <div className="glass rounded-3xl p-6 border border-border/60 bg-gradient-to-br from-neon-gold/10 via-card to-background flex flex-col justify-between space-y-6">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[9px] font-black bg-neon-gold/20 text-neon-gold border border-neon-gold/30 uppercase tracking-widest">
                    Active Membership
                  </span>
                  <div className="flex items-baseline gap-2 mt-4">
                    <h2 className="font-display text-4xl font-black text-neon-gold uppercase tracking-wider">
                      {currentTier}
                    </h2>
                    <span className="text-xs text-muted-foreground">Level</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    You have unlocked all benefits associated with the VIP {currentTier.toUpperCase()} tier. Wager on slots, dice, crash, or mines to level up further for free.
                  </p>
                </div>

                {nextTier ? (
                  <div className="space-y-3 pt-6 border-t border-border/30">
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <p className="text-muted-foreground">Next Tier Progress</p>
                        <p className="font-bold text-foreground mt-0.5">To VIP {nextTier.name}</p>
                      </div>
                      <p className="text-muted-foreground">
                        Need: <span className="font-bold text-neon-cyan">${wagersForNext.toFixed(2)}</span> wagers
                      </p>
                    </div>
                    {/* Animated Progress bar */}
                    <div>
                      <div className="h-3 w-full rounded-full bg-muted overflow-hidden border border-border/40 p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-neon-gold via-warning to-neon-pink shadow-md transition-all duration-1000"
                          style={{ width: `${progressToNext}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-bold text-muted-foreground mt-1.5 uppercase">
                        <span>Wagered: ${totalWagered.toLocaleString()}</span>
                        <span>{progressToNext.toFixed(1)}% Completed</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-6 border-t border-border/30 text-xs text-success font-bold flex items-center gap-2">
                    <ShieldCheck className="size-5" /> Max VIP Tier Reached! You have unlocked all benefits.
                  </div>
                )}
              </div>

              {/* Right Side: Account and Rakeback status */}
              <div className="glass rounded-3xl p-5 border border-border/60 flex flex-col justify-between space-y-4">
                <h3 className="font-display text-sm font-bold tracking-wider uppercase mb-2">VIP Multipliers</h3>
                
                <div className="divide-y divide-border/20 text-xs">
                  <div className="flex justify-between py-2.5">
                    <span className="text-muted-foreground">Daily Claim Boost:</span>
                    <span className="font-bold text-neon-gold">
                      +{currentTier === "platinum" ? "10%" : currentTier === "gold" ? "5%" : currentTier === "silver" ? "2%" : "1%"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-muted-foreground">Affiliate Commission Rate:</span>
                    <span className="font-bold text-neon-cyan">
                      {currentTier === "platinum" ? "15%" : currentTier === "gold" ? "10%" : currentTier === "silver" ? "7%" : "5%"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-muted-foreground">Withdrawal Velocity:</span>
                    <span className="font-bold text-success">Instant Processing</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-muted-foreground">Rakeback Commission:</span>
                    <span className="font-bold text-neon-pink">Enabled</span>
                  </div>
                </div>

                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl text-[10px] text-muted-foreground leading-relaxed">
                  VIP members receive dedicated database slots. Rakeback accumulates instantly and can be monitored on the Rewards page.
                </div>
              </div>
            </div>

            {/* VIP Tier Purchase Panel */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="size-5 text-neon-pink" />
                <h2 className="text-xl font-display font-bold tracking-wide">Buy VIP Upgrades</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["bronze", "silver", "gold", "platinum"].map((key) => {
                  const cost = BUYABLE_COSTS[key];
                  const currentIdx = TIER_ORDER.indexOf(currentTier);
                  const targetIdx = TIER_ORDER.indexOf(key);
                  const owns = currentIdx >= targetIdx;
                  
                  return (
                    <div
                      key={key}
                      className={`glass rounded-2xl p-5 border flex flex-col justify-between min-h-[200px] transition hover:scale-[1.02] ${
                        owns ? "border-success/30 bg-success/5 opacity-60" : "border-border/60"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <Crown className={`size-6 ${owns ? "text-success" : "text-neon-gold"}`} />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">
                            VIP Upgrade
                          </span>
                        </div>
                        <h4 className="font-display text-lg font-black mt-3 uppercase">{key}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {owns ? "Active Membership" : `Skip level requirements`}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border/30">
                        <div className="flex justify-between items-center text-xs mb-3">
                          <span className="text-muted-foreground">Purchase Cost:</span>
                          <span className="font-display font-black text-neon-gold">${cost}</span>
                        </div>
                        
                        {owns ? (
                          <button
                            disabled
                            className="w-full py-2 rounded-xl bg-success/10 border border-success/30 text-success text-[10px] font-bold uppercase tracking-wider cursor-not-allowed"
                          >
                            Purchased
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyTier(key)}
                            disabled={buying !== null || user!.balance < cost}
                            className="w-full py-2 rounded-xl bg-gradient-to-r from-neon-gold to-warning text-background text-[10px] font-bold uppercase tracking-wider shadow-md hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40"
                          >
                            {buying === key ? "Upgrading..." : "Buy Upgrade"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* VIP Tiers Detailed Comparison Table */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Landmark className="size-5 text-neon-cyan" />
                <h2 className="text-xl font-display font-bold tracking-wide">Compare VIP Benefits</h2>
              </div>
              <div className="glass rounded-3xl overflow-hidden border border-border/60">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/40 text-muted-foreground uppercase font-bold">
                        <th className="py-3 px-4">VIP Tier</th>
                        <th className="py-3 px-4">Wager Requirement</th>
                        <th className="py-3 px-4 text-center">Daily Boost</th>
                        <th className="py-3 px-4 text-center">Affiliate Rate</th>
                        <th className="py-3 px-4">Perks Included</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-sm">
                      {tiers.map((t) => (
                        <tr
                          key={t.tierKey}
                          className={`hover:bg-card/25 transition-all ${
                            currentTier === t.tierKey ? "bg-neon-gold/5 font-semibold" : ""
                          }`}
                        >
                          <td className="py-4.5 px-4 font-display font-black text-foreground uppercase flex items-center gap-2">
                            <Crown className={`size-4 ${currentTier === t.tierKey ? "text-neon-gold" : "text-muted-foreground/40"}`} />
                            {t.name}
                          </td>
                          <td className="py-4.5 px-4 text-muted-foreground font-display">
                            ${t.minWagered.toLocaleString()}
                          </td>
                          <td className="py-4.5 px-4 text-center font-bold text-neon-gold">
                            +{t.dailyRewardBonusPct}%
                          </td>
                          <td className="py-4.5 px-4 text-center font-bold text-neon-cyan">
                            {(t.affiliateCommissionRate * 100).toFixed(0)}%
                          </td>
                          <td className="py-4.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {t.benefits.map((b) => (
                                <span
                                  key={b}
                                  className="text-[9px] px-2 py-0.5 rounded bg-muted border border-border/50 text-muted-foreground"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </CasinoLayout>
  );
}
