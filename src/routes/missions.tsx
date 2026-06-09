import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { Target, Trophy, Flame, Zap, Award, Compass, Play, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/missions")({
  head: () => ({
    meta: [
      { title: "Missions & Quests — FastLuck" },
      { name: "description", content: "Complete daily quests, weekly challenges, and seasonal missions on FastLuck. Gain XP, level up, and unlock real cash rewards." }
    ]
  }),
  component: MissionsPage,
});

type MissionItem = {
  _id: string;
  missionType: "daily" | "weekly" | "special" | "vip";
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  expiresAt: string | null;
};

function MissionsPage() {
  const { user, isAuthenticated, setBalance } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "special">("daily");
  const [missionsList, setMissionsList] = useState<MissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchMissions = async () => {
    try {
      const res = await api.missions();
      if (res.success) {
        setMissionsList(res.missions as MissionItem[]);
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
    fetchMissions();
  }, [isAuthenticated, user?.balance]);

  const claim = async (id: string) => {
    setClaimingId(id);
    try {
      const res = await api.claimMission(id);
      if (res.success) {
        setBalance(res.balance);
        toast.success(`Successfully claimed $${res.reward} quest reward!`);
        fetchMissions();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaimingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <CasinoLayout>
        <div className="max-w-md mx-auto text-center glass rounded-3xl p-8 mt-12 border border-border">
          <Target className="size-14 mx-auto text-neon-pink drop-shadow-[0_0_12px_oklch(0.72_0.28_340/0.4)] mb-4" />
          <h2 className="font-display text-2xl font-black mb-2">Missions Center</h2>
          <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
            Enter the progression zone. Complete daily tasks and challenges to gain XP and claim financial reload bonuses.
          </p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold shadow-md hover:opacity-95 transition-all"
          >
            Sign In
          </button>
        </div>
      </CasinoLayout>
    );
  }

  // Filter lists based on type
  const dailies = missionsList.filter((m) => m.missionType === "daily");
  const weeklies = missionsList.filter((m) => m.missionType === "weekly");
  const specials = missionsList.filter((m) => m.missionType === "special" || m.missionType === "vip");

  const currentTabMissions = activeTab === "daily" ? dailies : activeTab === "weekly" ? weeklies : specials;

  // XP calculations based on games played (mock level system linked to real statistics!)
  const totalGames = user?.stats.gamesPlayed || 0;
  const currentLevel = Math.floor(totalGames / 10) + 1;
  const xpCurrent = (totalGames % 10) * 100;
  const xpRequired = 1000;
  const xpPct = (xpCurrent / xpRequired) * 100;

  return (
    <CasinoLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Page Header */}
        <div className="rounded-3xl glass p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-border/60">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-neon-pink to-neon-purple grid place-items-center shadow-[var(--shadow-neon)]">
              <Target className="size-8 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black">Missions & Challenges</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Progress wagers and trigger achievements to unlock financial reloads.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="glass px-4 py-2 rounded-xl text-xs font-bold border border-border flex items-center gap-1.5 text-neon-pink">
              <Flame className="size-4 text-neon-pink animate-pulse" /> 5 Day Streak
            </span>
          </div>
        </div>

        {/* Level & XP progression bar */}
        <div className="glass rounded-3xl p-6 border border-border/60 bg-gradient-to-br from-neon-purple/15 via-card to-background flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 w-full md:w-auto text-center md:text-left">
            <span className="px-2.5 py-0.5 rounded text-[9px] font-black bg-neon-purple/20 text-neon-purple border border-neon-purple/30 uppercase tracking-widest">
              Loyalty Progress
            </span>
            <div className="flex items-baseline justify-center md:justify-start gap-2 mt-2">
              <p className="font-display text-3xl font-black text-neon-purple">LEVEL {currentLevel}</p>
              <span className="text-xs text-muted-foreground">Standard Tier</span>
            </div>
            <p className="text-xs text-muted-foreground">Play 10 games of Dice, Crash, or Mines to level up!</p>
          </div>

          <div className="flex-1 w-full max-w-md space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-muted-foreground">XP PROGRESS</span>
              <span className="text-foreground font-display">{xpCurrent} / {xpRequired} XP</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden border border-border/40 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-neon-pink to-neon-purple shadow-md transition-all duration-700"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-right uppercase">
              {10 - (totalGames % 10)} games remaining to level up
            </p>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex border-b border-border/30">
          {[
            { key: "daily", label: "Daily Quests", icon: Zap },
            { key: "weekly", label: "Weekly Milestones", icon: Trophy },
            { key: "special", label: "VIP Specials", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all tracking-wide ${
                  active
                    ? "border-neon-pink text-foreground bg-card/20"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/10"
                }`}
              >
                <Icon className={`size-4 ${active ? "text-neon-pink" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Missions Grid */}
        {loading ? (
          <div className="glass rounded-3xl p-16 text-center">
            <Compass className="size-8 mx-auto text-muted-foreground animate-spin mb-3" />
            <p className="text-muted-foreground text-sm font-semibold">Updating mission rosters...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTabMissions.length === 0 ? (
              <div className="col-span-full glass rounded-3xl p-12 text-center border border-dashed border-border/60">
                <Target className="size-10 mx-auto text-muted-foreground/30 mb-2" />
                <h3 className="font-display text-sm font-bold text-foreground">No Active Quests</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                  Missions are reset daily. Wager on game lobbies to activate new rosters.
                </p>
              </div>
            ) : (
              currentTabMissions.map((m) => {
                const progressPct = Math.min(100, (m.progress / m.target) * 100);
                return (
                  <div
                    key={m._id}
                    className={`glass rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 ${
                      m.claimed
                        ? "border-success/20 opacity-70 bg-success/5"
                        : m.completed
                        ? "border-neon-gold/50 shadow-[var(--shadow-glow)] animate-pulse-glow"
                        : "border-border/60 hover:border-neon-pink/30 hover:scale-[1.01]"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <span className="font-bold text-sm tracking-wide text-foreground uppercase truncate">
                          {m.title}
                        </span>
                        {m.claimed ? (
                          <CheckCircle2 className="size-5 text-success shrink-0" />
                        ) : (
                          <span className="text-[10px] font-bold text-neon-gold font-display shrink-0 mt-0.5">
                            +${m.reward}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal mt-2">
                        {m.description || "Accumulate wagers to fulfill the mission requirements."}
                      </p>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-3 pt-5 border-t border-border/30 mt-6">
                      <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                        <span>Progress: {m.progress} / {m.target}</span>
                        <span className={m.completed ? "text-success" : ""}>
                          {m.completed ? "Complete" : `${progressPct.toFixed(0)}%`}
                        </span>
                      </div>
                      
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-neon-pink to-neon-purple transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {m.claimed ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl bg-success/10 border border-success/30 text-success text-[10px] font-bold uppercase tracking-wider cursor-not-allowed"
                        >
                          Reward Claimed
                        </button>
                      ) : m.completed ? (
                        <button
                          onClick={() => claim(m._id)}
                          disabled={claimingId === m._id}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-gold to-warning text-background text-[10px] font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          {claimingId === m._id ? "Claiming..." : "Claim Reward"}
                        </button>
                      ) : (
                        <Link
                          to="/"
                          className="w-full py-2.5 rounded-xl bg-card border border-border/80 hover:bg-muted text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 text-foreground"
                        >
                          <Play className="size-3 fill-foreground" /> PLAY GAMES
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </CasinoLayout>
  );
}
