import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — FastLuck" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [stats, setStats] = useState(user?.stats);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setDisplayName(user.displayName);
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.stats().then((r) => setStats(r.stats));
  }, [isAuthenticated, user?.balance]);

  if (!isAuthenticated || !user) {
    return (
      <CasinoLayout>
        <div className="max-w-md mx-auto text-center glass rounded-2xl p-8 mt-12">
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

  const save = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ displayName });
      await refreshUser();
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CasinoLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-3xl glass p-8 flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center">
            <User className="size-7" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black">Profile</h1>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full bg-input rounded-lg px-3 py-2 border border-border"
            />
          </div>
          <p className="text-sm text-muted-foreground">Email: {user.email}</p>
          <p className="text-sm">Balance: <span className="font-bold neon-text">${user.balance.toFixed(2)}</span></p>
          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-neon-pink to-neon-purple font-semibold disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
        {stats && (
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold mb-4">Statistics</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Stat label="Total Bets" value={stats.totalBets} />
              <Stat label="Games Played" value={stats.gamesPlayed} />
              <Stat label="Total Wins" value={stats.totalWins} />
              <Stat label="Total Losses" value={stats.totalLosses} />
              <Stat label="Biggest Win" value={`$${stats.biggestWin.toFixed(2)}`} />
              <Stat
                label="Profit / Loss"
                value={`${stats.profitLoss >= 0 ? "+" : ""}$${stats.profitLoss.toFixed(2)}`}
                highlight={stats.profitLoss >= 0 ? "success" : "destructive"}
              />
            </div>
          </div>
        )}
      </div>
    </CasinoLayout>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: "success" | "destructive";
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className={`font-bold ${highlight === "success" ? "text-success" : highlight === "destructive" ? "text-destructive" : ""}`}>
        {value}
      </p>
    </div>
  );
}
