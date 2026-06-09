import { useEffect, useState } from "react";
import gCrash from "@/assets/game-crash.jpg";
import gRoulette from "@/assets/game-roulette.jpg";
import gDice from "@/assets/game-dice.jpg";
import gMines from "@/assets/game-mines.jpg";
import gTowers from "@/assets/game-towers.jpg";
import gSlots from "@/assets/game-slots.jpg";
import gKeno from "@/assets/game-keno.jpg";

interface WinItem {
  id: string;
  name: string;
  amount: number;
  game: string;
  time: string;
  isWin: boolean;
}

const PLAYER_NAMES = [
  "Zaza***30", "BigWin**20", "Lucky7777", "HighRoller77", "JackpotKing",
  "Zenith", "Nebula", "AlphaBet", "Vortex", "Satoshi", "Shadow", "Apex"
];

const GAMES = ["Crash", "Roulette", "Dice", "Mines", "Towers", "Slots", "Keno"];

const GAME_IMAGES: Record<string, string> = {
  "Crash": gCrash,
  "Roulette": gRoulette,
  "Dice": gDice,
  "Mines": gMines,
  "Towers": gTowers,
  "Slots": gSlots,
  "Keno": gKeno,
};

export function LiveWinsTicker() {
  const [wins, setWins] = useState<WinItem[]>([
    { id: "1", name: "BladeRunner", amount: 12450, game: "Dice", time: "2m ago", isWin: true },
    { id: "2", name: "CryptoQueen", amount: 8920, game: "Roulette", time: "3m ago", isWin: true },
    { id: "3", name: "HighRoller99", amount: 25000, game: "Roulette", time: "5m ago", isWin: true },
    { id: "4", name: "LuckyStar", amount: 3210, game: "Mines", time: "7m ago", isWin: true },
    { id: "5", name: "WinWizard", amount: 6666, game: "Keno", time: "9m ago", isWin: true },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const isWin = Math.random() > 0.15;
      const amount = isWin 
        ? Math.floor(Math.random() * 8000) + 150 
        : Math.floor(Math.random() * 200) + 10;
      
      const game = GAMES[Math.floor(Math.random() * GAMES.length)];
      const newWin: WinItem = {
        id: Date.now().toString(),
        name: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)],
        amount,
        game,
        time: "Just now",
        isWin
      };

      setWins((prev) => {
        const next = [newWin, ...prev.map(item => {
          if (item.time === "Just now") return { ...item, time: "2s ago" };
          if (item.time === "2s ago") return { ...item, time: "5s ago" };
          if (item.time === "5s ago") return { ...item, time: "7s ago" };
          if (item.time === "7s ago") return { ...item, time: "10s ago" };
          if (item.time === "10s ago") return { ...item, time: "12s ago" };
          return { ...item, time: "15s ago" };
        })];
        return next.slice(0, 5);
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2.5">
      {wins.map((w) => {
        const img = GAME_IMAGES[w.game] || gSlots;
        return (
          <div
            key={w.id}
            className="flex items-center gap-3 py-1.5 px-2.5 rounded-xl border border-slate-900 bg-[#0c0d14]/40 hover:bg-[#0c0d14]/75 transition-all duration-300 relative overflow-hidden group"
          >
            {/* Game thumbnail image */}
            <div className="size-9 rounded-lg overflow-hidden border border-slate-800 shrink-0">
              <img src={img} alt={w.game} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>

            {/* Middle text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white group-hover:text-slate-100 transition-colors truncate">{w.name}</p>
              <p className="text-[10px] font-semibold mt-0.5 truncate leading-tight">
                <span className="text-emerald-400 font-extrabold">Won ${w.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                <span className="text-slate-500 font-medium ml-1">on {w.game}</span>
              </p>
            </div>

            {/* Right side data */}
            <div className="text-right shrink-0 self-start pt-0.5">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">{w.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

