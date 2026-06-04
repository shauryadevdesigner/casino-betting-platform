import { createFileRoute } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/tournaments")({
  head: () => ({ meta: [{ title: "Tournaments — FastLuck" }] }),
  component: () => (
    <CasinoLayout>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl glass p-8 mb-6 flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-neon-gold to-warning grid place-items-center shadow-[var(--shadow-neon)]"><Trophy className="size-7 text-background" /></div>
          <div><h1 className="font-display text-3xl font-black">Tournaments</h1><p className="text-sm text-muted-foreground">Compete for massive prize pools.</p></div>
        </div>
        <div className="space-y-3">
          {[{ n: "Weekly Championship", p: 250000, e: "2d 14h" }, { n: "Crash Masters", p: 75000, e: "5d 2h" }, { n: "Slots Showdown", p: 120000, e: "1d 8h" }].map((t) => (
            <div key={t.n} className="glass rounded-xl p-5 flex items-center justify-between">
              <div><p className="font-display text-xl">{t.n}</p><p className="text-xs text-muted-foreground">Ends in {t.e}</p></div>
              <div className="text-right"><p className="text-neon-gold font-display text-2xl">${t.p.toLocaleString()}</p><button className="mt-1 px-4 py-1.5 rounded-lg bg-gradient-to-r from-neon-pink to-neon-purple text-xs font-bold">Join</button></div>
            </div>
          ))}
        </div>
      </div>
    </CasinoLayout>
  ),
});
