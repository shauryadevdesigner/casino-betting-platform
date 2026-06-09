import { createFileRoute, Link } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { Radio, Search, SlidersHorizontal, Flame, Heart, History, Sparkles, Star, Users } from "lucide-react";
import { useState } from "react";

import gCrash from "@/assets/game-crash.jpg";
import gRoulette from "@/assets/game-roulette.jpg";
import gDice from "@/assets/game-dice.jpg";
import gMines from "@/assets/game-mines.jpg";
import gTowers from "@/assets/game-towers.jpg";
import gSlots from "@/assets/game-slots.jpg";
import gKeno from "@/assets/game-keno.jpg";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Lobby & Games — FastLuck" },
      { name: "description", content: "Explore the live casino lobby with real-time player counts, trending games, categories, and elite providers." }
    ]
  }),
  component: LiveLobby,
});

const ALL_GAMES = [
  { id: "crash", name: "CRASH", image: gCrash, category: "Originals", players: 2457, provider: "FastLuck Studios", badge: "Trending" },
  { id: "roulette", name: "ROULETTE", image: gRoulette, category: "Live Casino", players: 1876, provider: "Evolution Gaming", badge: "Popular" },
  { id: "dice", name: "DICE", image: gDice, category: "Originals", players: 3124, provider: "FastLuck Studios", badge: null },
  { id: "coinflip", name: "COIN FLIP", image: gDice, category: "Originals", players: 1890, provider: "FastLuck Studios", badge: "New" },
  { id: "mines", name: "MINES", image: gMines, category: "Originals", players: 2113, provider: "FastLuck Studios", badge: "Hot" },
  { id: "towers", name: "TOWERS", image: gTowers, category: "Originals", players: 1653, provider: "FastLuck Studios", badge: null },
  { id: "slots", name: "SLOTS", image: gSlots, category: "Slots", players: 4892, provider: "Pragmatic Play", badge: "Feature Buy" },
  { id: "keno", name: "KENO", image: gKeno, category: "Table Games", players: 2038, provider: "Hacksaw Gaming", badge: null },
];

const PROVIDERS = [
  { name: "FastLuck Studios", logo: "⚡", gamesCount: 5 },
  { name: "Pragmatic Play", logo: "👑", gamesCount: 124 },
  { name: "Evolution Gaming", logo: "🎡", gamesCount: 82 },
  { name: "Hacksaw Gaming", logo: "🪓", gamesCount: 45 },
  { name: "Play'n GO", logo: "🎲", gamesCount: 96 },
];

const CATEGORIES = ["All Games", "Originals", "Slots", "Live Casino", "Table Games"];

function LiveLobby() {
  const [selectedCategory, setSelectedCategory] = useState("All Games");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGames = ALL_GAMES.filter(g => {
    const matchesCategory = selectedCategory === "All Games" || g.category === selectedCategory;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredGames = ALL_GAMES.filter(g => g.badge === "Trending" || g.badge === "Hot" || g.badge === "New");

  return (
    <CasinoLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-border/50 bg-gradient-to-r from-neon-purple/20 via-background/40 to-neon-pink/10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="space-y-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20 animate-pulse">
              <span className="size-2 rounded-full bg-destructive animate-ping" />
              LIVE LOBBY
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight">
              Live <span className="neon-text">Gaming Lobby</span>
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed">
              Join thousands of active players in real-time. Discover original, highly interactive, provably fair casino gaming.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-card/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-border/60 shadow-[var(--shadow-glow)]">
            <div className="size-12 rounded-xl bg-destructive/20 grid place-items-center text-destructive">
              <Radio className="size-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Active Players</p>
              <p className="text-2xl font-display font-black text-success flex items-center gap-1">
                24,984
              </p>
            </div>
          </div>
        </div>

        {/* Lobby Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-neon-pink to-neon-purple text-white shadow-[var(--shadow-neon)] hover:brightness-110"
                    : "glass text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex gap-2 w-full md:w-96">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search games, providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-input/40 border border-border/60 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-input transition-all placeholder:text-muted-foreground/60"
              />
            </div>
            <button className="glass px-3 rounded-xl hover:bg-card border border-border/60 transition-all text-muted-foreground hover:text-foreground">
              <SlidersHorizontal className="size-4" />
            </button>
          </div>
        </div>

        {/* Featured Games Carousel Section */}
        {selectedCategory === "All Games" && !searchQuery && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-neon-gold" />
              <h2 className="text-xl font-display font-bold tracking-wide">Featured Lobby Games</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredGames.slice(0, 3).map((g) => (
                <Link
                  key={g.id}
                  to={`/games/${g.id}` as any}
                  className="group relative h-48 rounded-2xl overflow-hidden border border-border/50 shadow-lg hover:border-neon-pink/50 transition-all duration-500 scale-100 hover:scale-[1.015]"
                >
                  <img
                    src={g.image}
                    alt={g.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-[0.85]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  
                  {/* Badge */}
                  <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-[10px] font-bold bg-gradient-to-r from-neon-pink to-neon-purple text-white tracking-widest shadow-md">
                    {g.badge || "Featured"}
                  </span>

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-neon-cyan font-bold tracking-wider mb-1">{g.provider}</p>
                      <h3 className="font-display text-lg font-black tracking-wide">{g.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                      <Users className="size-3 text-success" />
                      <span className="text-[10px] font-bold text-success">{g.players} live</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Games Lobby Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="size-5 text-neon-pink" />
              <h2 className="text-xl font-display font-bold tracking-wide">
                {selectedCategory === "All Games" ? "All Lobby Games" : selectedCategory}
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-semibold">
              Showing {filteredGames.length} games
            </span>
          </div>

          {filteredGames.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center border border-dashed border-border">
              <Star className="size-10 mx-auto text-muted-foreground/40 mb-3 animate-pulse" />
              <p className="text-muted-foreground text-sm font-bold">No games match your search filters.</p>
              <button
                onClick={() => { setSelectedCategory("All Games"); setSearchQuery(""); }}
                className="mt-4 px-4 py-2 rounded-lg bg-muted text-xs font-semibold hover:bg-card transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredGames.map((g) => (
                <Link
                  key={g.id}
                  to={`/games/${g.id}` as any}
                  className="group relative rounded-xl overflow-hidden glass border border-border/60 flex flex-col hover:border-neon-pink/30 hover:scale-[1.03] transition-all duration-300 shadow-sm"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <img
                      src={g.image}
                      alt={g.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                    
                    {g.badge && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-background/80 text-neon-gold border border-neon-gold/20 backdrop-blur-sm tracking-wider uppercase">
                        {g.badge}
                      </span>
                    )}

                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-semibold border border-white/5">
                      <span className="size-1.5 rounded-full bg-success animate-pulse" />
                      <span className="text-success">{g.players}</span>
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between gap-1">
                    <div>
                      <h4 className="font-display text-xs font-extrabold tracking-wider truncate group-hover:text-neon-pink transition-colors">
                        {g.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground truncate">{g.provider}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border/30 flex justify-between items-center">
                      <span className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase">PLAY NOW</span>
                      <Star className="size-3 text-muted-foreground/30 hover:text-neon-gold hover:scale-125 transition-all cursor-pointer" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recently Played & Recommended Side-By-Side */}
        <div className="grid md:grid-cols-2 gap-6 pb-8">
          {/* Recently Played */}
          <div className="glass rounded-2xl p-5 border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <History className="size-4 text-neon-cyan" />
              <h3 className="font-display text-sm font-bold tracking-wider">Recently Played Games</h3>
            </div>
            <div className="space-y-3">
              {ALL_GAMES.slice(0, 3).map((g) => (
                <div key={g.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-card/40 transition border border-transparent hover:border-border/40">
                  <img src={g.image} alt={g.name} className="size-11 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-xs font-black truncate">{g.name}</p>
                    <p className="text-[10px] text-muted-foreground">{g.provider}</p>
                  </div>
                  <Link to={`/games/${g.id}` as any} className="px-3 py-1.5 rounded-lg bg-muted text-[10px] font-bold hover:bg-gradient-to-r hover:from-neon-pink hover:to-neon-purple hover:text-white transition">
                    PLAY
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended For You */}
          <div className="glass rounded-2xl p-5 border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="size-4 text-neon-pink" />
              <h3 className="font-display text-sm font-bold tracking-wider">Recommended For You</h3>
            </div>
            <div className="space-y-3">
              {ALL_GAMES.slice(4, 7).map((g) => (
                <div key={g.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-card/40 transition border border-transparent hover:border-border/40">
                  <img src={g.image} alt={g.name} className="size-11 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-xs font-black truncate">{g.name}</p>
                    <p className="text-[10px] text-muted-foreground">{g.provider}</p>
                  </div>
                  <Link to={`/games/${g.id}` as any} className="px-3 py-1.5 rounded-lg bg-muted text-[10px] font-bold hover:bg-gradient-to-r hover:from-neon-pink hover:to-neon-purple hover:text-white transition">
                    PLAY
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Provider Showcase Logos */}
        <section className="space-y-4 border-t border-border/30 pt-8 pb-12">
          <div className="flex items-center gap-2">
            <Star className="size-5 text-neon-gold" />
            <h2 className="text-xl font-display font-bold tracking-wide">Elite Game Providers</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {PROVIDERS.map((prov) => (
              <div
                key={prov.name}
                className="glass rounded-xl p-4 text-center border border-border/60 hover:border-neon-gold/30 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className="text-3xl mb-1.5">{prov.logo}</div>
                <h4 className="text-xs font-bold truncate">{prov.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{prov.gamesCount} games</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </CasinoLayout>
  );
}
