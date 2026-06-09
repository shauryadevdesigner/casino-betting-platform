import { Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { Sparkles } from "lucide-react";

interface Props {
  to: string;
  name: string;
  image: string;
  players: number;
  accent: string;
  glowClass?: string;
  hideText?: boolean;
}

export function GameCard({ to, name, image, players, accent, glowClass, hideText = true }: Props) {
  return (
    <Link
      to={to}
      className={`group relative rounded-2xl overflow-hidden border border-slate-900/60 bg-[#0c0d14]/40 hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 flex flex-col ${glowClass || ''}`}
    >
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={image} 
          alt={name} 
          loading="lazy" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-[0.85] group-hover:brightness-[0.95]" 
        />
        {!hideText && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/30 to-transparent" />
        )}
      </div>

      {!hideText && (
        <div className="p-3 pt-1 mt-auto relative z-10">
          <p className="font-display font-black text-sm tracking-widest uppercase text-white">
            {name}
          </p>
          
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span>{players.toLocaleString()}</span>
          </div>
        </div>
      )}
    </Link>
  );
}

export function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  accent 
}: { 
  icon: ComponentType<{ className?: string }>; 
  label: string; 
  value: string; 
  accent: string 
}) {
  return (
    <div 
      className="glass rounded-2xl p-4.5 flex items-center gap-4 border border-border/80 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden"
      style={{ 
        boxShadow: `0 6px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)` 
      }}
    >
      <div 
        className="size-12 rounded-xl grid place-items-center shrink-0 border transition-all duration-300" 
        style={{ 
          background: `${accent}15`, 
          color: accent,
          borderColor: `${accent}40`,
          boxShadow: `0 0 12px ${accent}20`
        }}
      >
        <Icon className="size-5.5" />
      </div>
      <div>
        <p className="text-xl font-black font-display tracking-wide text-white">{value}</p>
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] mt-0.5">{label}</p>
      </div>
    </div>
  );
}


