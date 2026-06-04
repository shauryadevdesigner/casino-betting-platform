import { createFileRoute, Link } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { Radio } from "lucide-react";

export const Route = createFileRoute("/live")({
  head: () => ({ meta: [{ title: "Live Games — FastLuck" }] }),
  component: () => (
    <CasinoLayout>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl glass p-8 mb-6 flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-destructive to-neon-pink grid place-items-center shadow-[var(--shadow-neon)]"><Radio className="size-7" /></div>
          <div><h1 className="font-display text-3xl font-black">Live Games</h1><p className="text-sm text-muted-foreground">Real-time gameplay with live players.</p></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[{ n: "Crash", c: 1248 }, { n: "Roulette", c: 892 }, { n: "Dice", c: 654 }, { n: "Slots", c: 2134 }].map((g) => (
            <Link key={g.n} to={`/games/${g.n.toLowerCase()}`} className="glass rounded-xl p-4 flex justify-between hover:scale-[1.02] transition">
              <span className="font-bold">Live {g.n}</span>
              <span className="text-xs text-success flex items-center gap-1"><span className="size-1.5 rounded-full bg-success animate-pulse" />{g.c} playing</span>
            </Link>
          ))}
        </div>
      </div>
    </CasinoLayout>
  ),
});
