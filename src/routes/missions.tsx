import { createFileRoute } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { Target } from "lucide-react";

export const Route = createFileRoute("/missions")({
  head: () => ({ meta: [{ title: "Missions — FastLuck" }] }),
  component: () => (
    <CasinoLayout>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl glass p-8 mb-6 flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-neon-pink to-neon-purple grid place-items-center shadow-[var(--shadow-neon)]"><Target className="size-7" /></div>
          <div><h1 className="font-display text-3xl font-black">Missions</h1><p className="text-sm text-muted-foreground">Complete missions for bonus rewards.</p></div>
        </div>
        <div className="space-y-3">
          {[
            { n: "Play 10 Crash games", p: 60, r: 150 }, { n: "Win 5 in Mines", p: 40, r: 200 },
            { n: "Spin Slots 25 times", p: 80, r: 100 }, { n: "Hit 5x on Dice", p: 20, r: 75 },
          ].map((m) => (
            <div key={m.n} className="glass rounded-xl p-4">
              <div className="flex justify-between"><span className="font-semibold">{m.n}</span><span className="text-neon-gold">+${m.r}</span></div>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-to-r from-neon-pink to-neon-purple" style={{ width: `${m.p}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </CasinoLayout>
  ),
});
