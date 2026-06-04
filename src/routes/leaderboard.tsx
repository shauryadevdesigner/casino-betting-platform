import { createFileRoute } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { BarChart3 } from "lucide-react";
import { api, type LeaderboardEntry } from "@/lib/api/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — FastLuck" }] }),
  component: LeaderboardPage,
});

const SORT_OPTIONS = [
  { key: "balance" as const, label: "Highest Balance" },
  { key: "biggestWin" as const, label: "Biggest Win" },
  { key: "gamesPlayed" as const, label: "Most Games" },
];

function LeaderboardPage() {
  const [sort, setSort] = useState<"balance" | "biggestWin" | "gamesPlayed">("balance");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .leaderboard(sort)
      .then((r) => setEntries(r.leaderboard))
      .finally(() => setLoading(false));
  }, [sort]);

  return (
    <CasinoLayout>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl glass p-8 mb-6 flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-neon-gold to-warning grid place-items-center shadow-[var(--shadow-neon)]">
            <BarChart3 className="size-7 text-background" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">Top players on FastLuck.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => setSort(o.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                sort === o.key ? "bg-gradient-to-r from-neon-gold to-warning text-background" : "glass"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="glass rounded-2xl overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-muted-foreground">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No players yet</p>
          ) : (
            entries.map((p) => (
              <div key={p.username} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
                <span
                  className={`size-8 rounded-lg grid place-items-center font-bold ${
                    p.rank <= 3 ? "bg-neon-gold text-background" : "bg-muted"
                  }`}
                >
                  {p.rank}
                </span>
                <span className="flex-1 font-semibold">{p.displayName}</span>
                <span className="text-neon-gold font-bold">
                  {sort === "gamesPlayed" ? p.value.toLocaleString() : `$${p.value.toLocaleString()}`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </CasinoLayout>
  );
}
