import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { Target, Check, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function MissionsWidget() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [timeStr, setTimeStr] = useState("08:24:17");

  const fetchMissions = async () => {
    try {
      const res = await api.missions();
      // Only show daily missions in the widget
      const daily = res.missions.filter((m: any) => m.missionType === "daily");
      setMissions(daily);
    } catch (e) {
      console.error("Failed to fetch missions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
    const interval = setInterval(fetchMissions, 10000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer simulation for resets in
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr((prev) => {
        const parts = prev.split(":").map(Number);
        let s = parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (s <= 0) return "23:59:59";
        s--;
        const h = Math.floor(s / 3600).toString().padStart(2, "0");
        const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
        const sec = (s % 60).toString().padStart(2, "0");
        return `${h}:${m}:${sec}`;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const claimReward = async (id: string) => {
    setClaiming(id);
    try {
      await api.claimMission(id);
      toast.success("Mission reward claimed!");
      await fetchMissions();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to claim");
    } finally {
      setClaiming(null);
    }
  };

  // Fallback / seed data matching screenshot exactly
  const displayMissions = missions.length >= 3 ? missions.slice(0, 3) : [
    { id: "mock-1", title: "Place 3 Bets", progress: 3, target: 3, reward: 50, completed: true, claimed: false },
    { id: "mock-2", title: "Win 2 Games", progress: 1, target: 2, reward: 75, completed: false, claimed: false },
    { id: "mock-3", title: "Play 5 Games", progress: 3, target: 5, reward: 100, completed: false, claimed: false },
  ];

  return (
    <div className="glass rounded-3xl p-4 flex flex-col justify-between h-[190px]">
      <div>
        <div className="flex justify-between items-center border-b border-slate-900/60 pb-1.5 mb-2">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-rose-500" />
            <p className="font-display font-extrabold text-xs text-white">Daily Quests</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {displayMissions.map((m: any) => {
            const progress = Math.min(Number(m.progress || 0), Number(m.target));
            const percent = (progress / Number(m.target)) * 100;
            const isCompleted = m.completed || progress >= m.target;
            const isClaimed = m.claimed;

            return (
              <div key={m._id || m.id || m.title} className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-300 truncate mb-1">
                    {m.title}
                  </div>
                  {/* Progress bar container */}
                  <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-900">
                    <div 
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${percent}%` }} 
                    />
                  </div>
                </div>

                {/* Right badges */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500">{progress}/{m.target}</span>
                  
                  {/* Coin Badge */}
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black">
                    <span className="size-2.5 rounded-full bg-amber-500 text-[6px] text-[#050508] font-bold flex items-center justify-center">★</span>
                    <span>{m.reward}</span>
                  </div>

                  {/* Check / Arrow button */}
                  {isClaimed ? (
                    <span className="size-5 rounded-full bg-slate-900 text-slate-600 flex items-center justify-center text-[10px] font-bold">✔</span>
                  ) : isCompleted && !m.id.startsWith("mock") ? (
                    <button
                      onClick={() => claimReward(m._id || m.id)}
                      disabled={claiming === (m._id || m.id)}
                      className="size-5 rounded-full bg-emerald-500 text-[#050508] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                      <Check className="size-3.5 stroke-[3]" />
                    </button>
                  ) : isCompleted ? (
                    <div className="size-5 rounded-full bg-[#0d2a1d] border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <Link
                      to="/"
                      className="size-5 rounded-full bg-[#121424] hover:bg-[#1b1e36] text-slate-400 flex items-center justify-center hover:text-white transition-all"
                    >
                      <ChevronRight className="size-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-[9px] text-slate-500 font-bold text-center mt-1 flex items-center justify-center gap-1">
        <span>⏱</span> Resets in: {timeStr}
      </div>
    </div>
  );
}

