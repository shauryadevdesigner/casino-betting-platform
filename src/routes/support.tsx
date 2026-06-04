import { createFileRoute } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — FastLuck" }] }),
  component: () => (
    <CasinoLayout>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl glass p-8 mb-6 flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-blue grid place-items-center shadow-[var(--shadow-neon)]"><LifeBuoy className="size-7" /></div>
          <div><h1 className="font-display text-3xl font-black">Support</h1><p className="text-sm text-muted-foreground">We're here 24/7.</p></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-5"><p className="font-bold">Live Chat</p><p className="text-xs text-muted-foreground mt-1">Avg response: 30s</p><button className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-neon-pink to-neon-purple font-bold">Start Chat</button></div>
          <div className="glass rounded-2xl p-5"><p className="font-bold">Email Us</p><p className="text-xs text-muted-foreground mt-1">support@fastluck.app</p><button className="mt-3 w-full py-2 rounded-lg bg-muted font-bold">Send Email</button></div>
        </div>
        <div className="glass rounded-2xl p-5 mt-3">
          <p className="font-bold mb-3">FAQ</p>
          {[
            { q: "How do I deposit?", a: "Use the Wallet page or the + button in the topbar to top up instantly." },
            { q: "Are games provably fair?", a: "Yes — every outcome is generated client-side with a verifiable seed." },
            { q: "How fast are withdrawals?", a: "Crypto: under 5 minutes. Fiat: 1–3 business days." },
          ].map((f) => (
            <details key={f.q} className="py-2 border-b border-border last:border-0">
              <summary className="cursor-pointer text-sm font-semibold">{f.q}</summary>
              <p className="text-xs text-muted-foreground mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </CasinoLayout>
  ),
});
