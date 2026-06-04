import { Link } from "@tanstack/react-router";
import type { ComponentType } from "react";

interface Props {
  to: string;
  name: string;
  image: string;
  players: number;
  accent: string;
}

export function GameCard({ to, name, image, players, accent }: Props) {
  return (
    <Link
      to={to}
      className="group relative rounded-2xl overflow-hidden border border-border bg-card hover:scale-[1.03] transition-transform duration-300"
      style={{ boxShadow: `0 8px 30px ${accent}33` }}
    >
      <div className="aspect-square overflow-hidden">
        <img src={image} alt={name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-3">
        <p className="font-display font-bold text-lg tracking-wider" style={{ color: accent, textShadow: `0 0 12px ${accent}` }}>{name}</p>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          {players.toLocaleString()}
        </div>
      </div>
    </Link>
  );
}

export function StatCard({ icon: Icon, label, value, accent }: { icon: ComponentType<{ className?: string }>; label: string; value: string; accent: string }) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3">
      <div className="size-10 rounded-xl grid place-items-center" style={{ background: `${accent}22`, color: accent }}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-lg font-bold font-display">{value}</p>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
