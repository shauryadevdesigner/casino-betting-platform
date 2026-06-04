import { createFileRoute } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { Crown } from "lucide-react";

export const Route = createFileRoute("/vip")({
  head: () => ({ meta: [{ title: "VIP Club — FastLuck" }] }),
  component: () => (
    <CasinoLayout>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl glass p-8 mb-6 flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-neon-gold to-warning grid place-items-center shadow-[var(--shadow-neon)]"><Crown className="size-7 text-background" /></div>
          <div><h1 className="font-display text-3xl font-black">VIP Club</h1><p className="text-sm text-muted-foreground">Exclusive perks for elite players.</p></div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { l: "Bronze", b: "5%", c: "$50" }, { l: "Silver", b: "8%", c: "$100" }, { l: "Gold", b: "12%", c: "$250" },
            { l: "Platinum", b: "15%", c: "$500" }, { l: "Diamond", b: "18%", c: "$1000" }, { l: "Mythic", b: "25%", c: "$5000" },
          ].map((t) => (
            <div key={t.l} className="glass rounded-2xl p-5 text-center">
              <Crown className="size-8 mx-auto text-neon-gold drop-shadow-[0_0_10px_oklch(0.82_0.17_85)]" />
              <p className="font-display text-xl mt-2">{t.l}</p>
              <p className="text-xs text-muted-foreground mt-2">Cashback {t.b}</p>
              <p className="text-xs text-muted-foreground">Weekly {t.c}</p>
            </div>
          ))}
        </div>
      </div>
    </CasinoLayout>
  ),
});
