import React, { useState, useEffect, useRef } from "react";
import {
  Home, Gamepad2, Users, ShoppingBag, User, Search, Star, Download,
  Play, Trophy, Zap, Coins, Gem, MessageCircle, TrendingUp, Award,
  Bell, ChevronRight, ChevronLeft, Clock, Flame, Sword, Swords,
  Target, Puzzle, Car, Shield, Gauge, X, Check, Send, Plus,
  Sparkles, Crown, Wifi, Heart, Settings, Camera, Mic, MicOff,
  UserPlus, HardDrive, Globe, Volume2, Vibrate, LogOut, Inbox,
  Moon, ChevronDown, Trash2, ShieldCheck, Baby, Smartphone, Lock
} from "lucide-react";

/* ---------------------------------------------------------------
   GLITCH — premium neon mobile gaming platform, concept mockup
   Signature device: the "energy ring" — a conic-gradient glow ring
   reused for level, downloads, matchmaking + tournament countdowns
----------------------------------------------------------------*/

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800;900&family=Sora:wght@400;500;600;700&display=swap');
`;

const GAMES = [
  { id: 1, title: "NEON REQUIEM", genre: "RPG", rating: 4.8, tag: "Featured",
    grad: ["#3B0764", "#00E5FF"], icon: Sword, size: "3.2 GB", installed: true },
  { id: 2, title: "VOLT DRIFT", genre: "Racing", rating: 4.6, tag: "Trending",
    grad: ["#1E1B4B", "#FF2FA0"], icon: Car, size: "5.1 GB", installed: false },
  { id: 3, title: "CINDER PROTOCOL", genre: "Action", rating: 4.9, tag: "Featured",
    grad: ["#0F172A", "#A855F7"], icon: Swords, size: "6.4 GB", installed: true },
  { id: 4, title: "GLASSWEAVE", genre: "Puzzle", rating: 4.4, tag: "New",
    grad: ["#082F49", "#00E5FF"], icon: Puzzle, size: "890 MB", installed: false },
  { id: 5, title: "IRON ECHELON", genre: "Strategy", rating: 4.7, tag: "Trending",
    grad: ["#1C1917", "#FFC94D"], icon: Shield, size: "2.8 GB", installed: true },
  { id: 6, title: "HALFLIFE ARENA", genre: "Sports", rating: 4.3, tag: "New",
    grad: ["#1E1B4B", "#00E5FF"], icon: Target, size: "1.9 GB", installed: false },
  { id: 7, title: "WRAITHFALL", genre: "Adventure", rating: 4.9, tag: "Featured",
    grad: ["#2E1065", "#FF2FA0"], icon: Sparkles, size: "4.7 GB", installed: false },
  { id: 8, title: "GRIDLOCK X", genre: "Racing", rating: 4.5, tag: "Trending",
    grad: ["#0C0A1A", "#A855F7"], icon: Gauge, size: "3.9 GB", installed: false },
  { id: 9, title: "GRIDIRON LEGENDS", genre: "Sports", rating: 4.7, tag: "New",
    grad: ["#0B1F14", "#7CFF9E"], icon: Shield, size: "4.4 GB", installed: false },
  { id: 10, title: "IRON FANG BOXING", genre: "Sports", rating: 4.6, tag: "Trending",
    grad: ["#2A0A0A", "#FF2FA0"], icon: Swords, size: "3.6 GB", installed: false },
];

const FRIENDS = [
  { n: "NovaBlade", status: "In-game · Cinder Protocol", on: true },
  { n: "GhostPixel", status: "Online", on: true },
  { n: "Rin_Vex", status: "Offline · 3h ago", on: false },
];

const SHOP_ITEMS = [
  { id: "c1", n: "Blitz — Star Quarterback", game: "GRIDIRON LEGENDS", price: 850, grad: ["#0B1F14", "#7CFF9E"], icon: Shield },
  { id: "c2", n: "\u2018Iron Fang\u2019 Champion Skin", game: "IRON FANG BOXING", price: 1200, grad: ["#2A0A0A", "#FF2FA0"], icon: Swords },
  { id: "c3", n: "Kestrel — Legendary Racer", game: "VOLT DRIFT", price: 950, grad: ["#1E1B4B", "#FF2FA0"], icon: Car },
  { id: "c4", n: "Void Reaper Character Pack", game: "CINDER PROTOCOL", price: 1500, grad: ["#0F172A", "#A855F7"], icon: Swords },
];

// ── Backend link ──────────────────────────────────────────────
// Replace with your deployed Render URL, e.g. "https://glitch-api.onrender.com"
// Leave as-is and the app runs in local-only demo mode (no real network calls).
const API_BASE_URL = "https://mygame-paystack-server-1.onrender.com";

async function apiFetch(path, options = {}, token) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const PACKS = [
  { id: "gems_500", g: 500, price: 4.99, bonus: null },
  { id: "gems_1200", g: 1200, price: 9.99, bonus: "+10%" },
  { id: "gems_2600", g: 2600, price: 19.99, bonus: "+20%" },
  { id: "gems_7000", g: 7000, price: 49.99, bonus: "+35%" },
];

const GENRES = ["All", "Action", "Adventure", "Racing", "Puzzle", "Sports", "RPG", "Strategy"];

const ACCENT_BLUE = "#00E5FF";
const ACCENT_VIOLET = "#A855F7";
const ACCENT_PINK = "#FF2FA0";
const GOLD = "#FFC94D";

/* ---------- Energy Ring — the signature motif ---------- */
function EnergyRing({ pct = 70, size = 56, stroke = 4, children, color = ACCENT_BLUE, color2 = ACCENT_VIOLET, glow = true }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const gid = useRef(`grad-${Math.random().toString(36).slice(2, 9)}`);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0" style={glow ? { filter: `drop-shadow(0 0 6px ${color}aa)` } : {}}>
        <defs>
          <linearGradient id={gid.current} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#ffffff14" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={`url(#${gid.current})`} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="relative z-10 flex items-center justify-center">{children}</div>
    </div>
  );
}

function GlassCard({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${className}`}
    >
      {children}
    </div>
  );
}

function NeonButton({ children, onClick, variant = "primary", className = "", full = false, disabled = false, style = {} }) {
  const styles = {
    primary: `text-black font-bold`,
    ghost: `text-white/90 border border-white/15 bg-white/[0.04]`,
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative ${full ? "w-full" : ""} px-5 py-3 rounded-xl text-sm tracking-wide transition-transform active:scale-95 ${styles[variant]} ${className}`}
      style={{
        ...(variant === "primary" ? {
          background: `linear-gradient(135deg, ${ACCENT_BLUE}, ${ACCENT_VIOLET})`,
          boxShadow: `0 0 20px ${ACCENT_BLUE}55, 0 0 40px ${ACCENT_VIOLET}33`,
        } : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function GameCover({ game, size = "md", onClick, wishlisted = false, onToggleWishlist }) {
  const Icon = game.icon;
  const dims = size === "lg" ? "w-44 h-60" : size === "sm" ? "w-28 h-36" : "w-36 h-48";
  const tagColor = game.tag === "Featured" ? ACCENT_PINK : game.tag === "Trending" ? ACCENT_BLUE : "#7CFF9E";
  return (
    <div onClick={onClick} className={`relative ${dims} shrink-0 rounded-2xl overflow-hidden cursor-pointer group transition-transform duration-300 active:scale-95 hover:-translate-y-1`}
      style={{ boxShadow: "0 12px 24px rgba(0,0,0,0.5)" }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${game.grad[0]}, ${game.grad[1]})` }} />
      <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
        backgroundImage: "radial-gradient(circle at 30% 20%, #ffffff55, transparent 40%)"
      }} />
      <div className="absolute inset-0 flex items-center justify-center opacity-25 group-hover:opacity-40 transition-opacity">
        <Icon size={size === "lg" ? 72 : 52} color="#fff" strokeWidth={1.2} />
      </div>
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider backdrop-blur-md"
        style={{ background: `${tagColor}26`, color: tagColor, border: `1px solid ${tagColor}55` }}>
        {game.tag.toUpperCase()}
      </div>
      {game.installed && (
        <div className="absolute top-2 right-9 w-5 h-5 rounded-md bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
          <Check size={10} color="#7CFF9E" />
        </div>
      )}
      {onToggleWishlist && (
        <button
          onClick={e => { e.stopPropagation(); onToggleWishlist(game.id); }}
          className="absolute top-2 right-2 w-5 h-5 rounded-md bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
        >
          <Heart size={10} fill={wishlisted ? ACCENT_PINK : "transparent"} color={wishlisted ? ACCENT_PINK : "#fff"} />
        </button>
      )}
      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <p className="font-display text-white text-[11px] font-bold leading-tight tracking-wide">{game.title}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-white/50 text-[9px]">{game.genre}</span>
          <span className="flex items-center gap-0.5 text-[9px] text-white/80">
            <Star size={9} fill={GOLD} color={GOLD} /> {game.rating}
          </span>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="w-10 h-6 rounded-full relative transition-colors shrink-0"
      style={{ background: on ? `linear-gradient(90deg, ${ACCENT_BLUE}, ${ACCENT_VIOLET})` : "#ffffff1a" }}
    >
      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
        style={{ left: on ? 18 : 2, boxShadow: on ? `0 0 8px ${ACCENT_BLUE}aa` : "none" }} />
    </button>
  );
}

function SectionHeader({ title, icon: Icon, iconColor = ACCENT_BLUE }) {
  return (
    <div className="flex items-center justify-between mb-3 px-5">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={15} color={iconColor} />}
        <h2 className="font-display text-white text-[13px] font-bold tracking-[0.08em]">{title}</h2>
      </div>
      <button className="flex items-center gap-0.5 text-[11px] text-white/40 hover:text-white/70 transition-colors">
        See all <ChevronRight size={12} />
      </button>
    </div>
  );
}

/* ---------------------- HOME ---------------------- */
function HomeScreen({ onSelectGame, wishlist, onToggleWishlist, onOpenNotifications }) {
  const [heroIdx, setHeroIdx] = useState(0);
  const featured = GAMES.filter(g => g.tag === "Featured");
  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % featured.length), 4500);
    return () => clearInterval(t);
  }, []);
  const hero = featured[heroIdx];
  const HeroIcon = hero.icon;

  return (
    <div className="pb-4">
      {/* top bar */}
      <div className="flex items-center justify-between px-5 pt-2 pb-4">
        <div>
          <p className="text-white/40 text-[10px] tracking-widest">WELCOME BACK</p>
          <p className="font-display text-white font-bold text-base tracking-wide">Kairo</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onOpenNotifications} className="relative w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
            <Bell size={15} color="#fff" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: ACCENT_PINK, boxShadow: `0 0 6px ${ACCENT_PINK}` }} />
          </button>
          <EnergyRing size={38} stroke={3} pct={68} color={ACCENT_BLUE} color2={ACCENT_VIOLET}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-[10px] font-bold text-white">K</div>
          </EnergyRing>
        </div>
      </div>

      {/* hero */}
      <div className="px-5 mb-6">
        <div className="relative h-56 rounded-3xl overflow-hidden transition-all duration-700"
          style={{ boxShadow: `0 20px 40px -12px ${hero.grad[1]}66` }}>
          <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${hero.grad[0]}, ${hero.grad[1]})` }} />
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 75% 15%, #ffffff66, transparent 45%)" }} />
          <HeroIcon size={140} className="absolute -right-6 -bottom-4 opacity-20" color="#fff" strokeWidth={1} />
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider backdrop-blur-md"
            style={{ background: `${ACCENT_PINK}26`, color: ACCENT_PINK, border: `1px solid ${ACCENT_PINK}55` }}>
            <Flame size={10} /> FEATURED
          </div>
          <div className="absolute bottom-0 inset-x-0 p-5">
            <p className="font-display text-white text-2xl font-black tracking-wide drop-shadow-lg">{hero.title}</p>
            <p className="text-white/70 text-xs mt-0.5 mb-3">{hero.genre} · {hero.size}</p>
            <div className="flex gap-2">
              <NeonButton onClick={() => onSelectGame(hero)} className="flex items-center gap-1.5"><Play size={14} fill="black" /> Play Now</NeonButton>
              <button className="px-3 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md">
                <Plus size={15} color="#fff" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-1.5 mt-3">
          {featured.map((_, i) => (
            <div key={i} className="h-1 rounded-full transition-all duration-300"
              style={{ width: i === heroIdx ? 18 : 6, background: i === heroIdx ? ACCENT_BLUE : "#ffffff26" }} />
          ))}
        </div>
      </div>

      {/* daily reward + event banners */}
      <div className="px-5 flex gap-3 mb-6 overflow-x-auto no-scrollbar">
        <GlassCard className="min-w-[190px] p-3.5 flex items-center gap-3">
          <EnergyRing size={44} pct={40} color={GOLD} color2={ACCENT_PINK}>
            <Gift size={18} color={GOLD} />
          </EnergyRing>
          <div>
            <p className="text-white text-xs font-bold">Daily Reward</p>
            <p className="text-white/40 text-[10px]">Day 4 of 7 · claim now</p>
          </div>
        </GlassCard>
        <div className="min-w-[190px] rounded-2xl p-3.5 flex items-center gap-3 border border-white/10 relative overflow-hidden"
          style={{ background: `linear-gradient(120deg, ${ACCENT_VIOLET}33, transparent)` }}>
          <Trophy size={26} color={ACCENT_VIOLET} />
          <div>
            <p className="text-white text-xs font-bold">Summer Clash</p>
            <p className="text-white/40 text-[10px]">Ends in 2d 14h</p>
          </div>
        </div>
      </div>

      {/* missions strip */}
      <div className="px-5 mb-6">
        <SectionHeader title="ACTIVE MISSIONS" icon={Target} iconColor={ACCENT_PINK} />
        <div className="flex flex-col gap-2 px-0">
          {[
            { t: "Win 3 ranked matches", p: 66, r: "250 XP" },
            { t: "Log in 5 days in a row", p: 80, r: "80 Gems" },
          ].map((m, i) => (
            <GlassCard key={i} className="mx-5 p-3 flex items-center gap-3">
              <EnergyRing size={36} stroke={3} pct={m.p} color={ACCENT_BLUE} color2="#7CFF9E">
                <span className="text-[9px] text-white font-bold">{m.p}%</span>
              </EnergyRing>
              <div className="flex-1">
                <p className="text-white text-[11px] font-semibold">{m.t}</p>
                <p className="text-white/40 text-[10px]">Reward: {m.r}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* trending */}
      <SectionHeader title="TRENDING NOW" icon={TrendingUp} iconColor={ACCENT_BLUE} />
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-1 mb-6">
        {GAMES.filter(g => g.tag === "Trending").concat(GAMES.slice(0, 2)).map((g, i) => (
          <GameCover key={i} game={g} onClick={() => onSelectGame(g)} wishlisted={wishlist.includes(g.id)} onToggleWishlist={onToggleWishlist} />
        ))}
      </div>

      {/* new releases */}
      <SectionHeader title="NEW RELEASES" icon={Sparkles} iconColor={ACCENT_VIOLET} />
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-1">
        {GAMES.filter(g => g.tag === "New").concat(GAMES.slice(4, 6)).map((g, i) => (
          <GameCover key={i} game={g} size="sm" onClick={() => onSelectGame(g)} wishlisted={wishlist.includes(g.id)} onToggleWishlist={onToggleWishlist} />
        ))}
      </div>
    </div>
  );
}
function Gift(props) { return <Award {...props} />; }

/* ---------------------- GAMES / SEARCH / LIBRARY / WISHLIST ---------------------- */
function GamesScreen({ onSelectGame, wishlist, onToggleWishlist }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [mode, setMode] = useState("discover");

  const base = mode === "library" ? GAMES.filter(g => g.installed)
    : mode === "wishlist" ? GAMES.filter(g => wishlist.includes(g.id))
    : GAMES;
  const filtered = base.filter(g =>
    (filter === "All" || g.genre === filter) &&
    g.title.toLowerCase().includes(query.toLowerCase())
  );
  const usedGB = GAMES.filter(g => g.installed).length * 4.2;

  return (
    <div className="pb-4">
      <div className="px-5 pt-2 pb-4">
        <p className="font-display text-white font-bold text-lg tracking-wide mb-3">
          {mode === "library" ? "My Library" : mode === "wishlist" ? "Wishlist" : "Discover"}
        </p>

        <div className="flex gap-1.5 mb-3 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          {[["discover", "Discover"], ["library", "Library"], ["wishlist", "Wishlist"]].map(([k, l]) => (
            <button key={k} onClick={() => setMode(k)}
              className="flex-1 py-1.5 rounded-lg text-[10.5px] font-bold transition-all"
              style={mode === k ? { background: `linear-gradient(135deg, ${ACCENT_BLUE}, ${ACCENT_VIOLET})`, color: "#000" } : { color: "#ffffff66" }}>
              {l}
            </button>
          ))}
        </div>

        {mode === "library" && (
          <GlassCard className="p-3.5 mb-3 flex items-center gap-3">
            <HardDrive size={18} color={ACCENT_BLUE} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-white text-[11px] font-semibold">Storage used</p>
                <p className="text-white/40 text-[10px]">{usedGB.toFixed(1)} GB / 128 GB</p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(usedGB / 128) * 100}%`, background: `linear-gradient(90deg, ${ACCENT_BLUE}, ${ACCENT_VIOLET})` }} />
              </div>
            </div>
          </GlassCard>
        )}

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5">
          <Search size={16} color="#8C8CA8" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search games, genres..."
            className="bg-transparent outline-none text-white text-[13px] placeholder:text-white/30 flex-1"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 pb-1">
          {GENRES.map(g => (
            <button key={g} onClick={() => setFilter(g)}
              className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all"
              style={filter === g ? {
                background: `linear-gradient(135deg, ${ACCENT_BLUE}, ${ACCENT_VIOLET})`,
                color: "#000",
              } : { background: "#ffffff0d", color: "#ffffff99", border: "1px solid #ffffff1a" }}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 grid grid-cols-2 gap-3.5">
        {filtered.map(g => (
          <div key={g.id} className="flex flex-col gap-1.5">
            <GameCover game={g} size="lg" onClick={() => onSelectGame(g)} wishlisted={wishlist.includes(g.id)} onToggleWishlist={onToggleWishlist} />
            {mode === "library" && (
              <NeonButton variant="ghost" className="!py-1.5 text-[10px] flex items-center justify-center gap-1" onClick={() => onSelectGame(g)}>
                <Play size={11} /> Play
              </NeonButton>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-white/30 text-center text-xs py-10">
            {mode === "wishlist" ? "Tap the heart on any game to save it here." : mode === "library" ? "No installed games match." : "No games match your search."}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------------- COMMUNITY ---------------------- */
function CommunityScreen() {
  const [tab, setTab] = useState("leaderboard");
  const [muted, setMuted] = useState(true);
  const leaders = [
    { n: "Zephyrion", pts: 98230, av: "from-fuchsia-500 to-indigo-500" },
    { n: "Kairo", pts: 91120, av: "from-cyan-400 to-blue-600", me: true },
    { n: "NovaBlade", pts: 87650, av: "from-amber-400 to-pink-500" },
    { n: "GhostPixel", pts: 84210, av: "from-emerald-400 to-cyan-500" },
    { n: "Rin_Vex", pts: 79040, av: "from-violet-500 to-fuchsia-600" },
  ];
  const chat = [
    { u: "NovaBlade", m: "anyone up for a Cinder Protocol raid?", me: false },
    { u: "Kairo", m: "yeah give me 2 min, queuing now", me: true },
    { u: "GhostPixel", m: "count me in 🔥", me: false },
  ];
  return (
    <div className="pb-4 px-5 pt-2">
      <p className="font-display text-white font-bold text-lg tracking-wide mb-4">Community</p>

      <div className="flex gap-2 mb-4">
        {[["leaderboard", "Leaderboard", Trophy], ["tournaments", "Tournaments", Crown], ["chat", "Live Chat", MessageCircle]].map(([k, l, Icon]) => (
          <button key={k} onClick={() => setTab(k)}
            className="flex-1 py-2 rounded-xl text-[10.5px] font-bold flex flex-col items-center gap-1 transition-all"
            style={tab === k ? { background: "#ffffff12", color: "#fff", border: `1px solid ${ACCENT_BLUE}55`, boxShadow: `0 0 14px ${ACCENT_BLUE}22` } : { color: "#ffffff55", border: "1px solid #ffffff12" }}>
            <Icon size={15} color={tab === k ? ACCENT_BLUE : "#ffffff55"} />{l}
          </button>
        ))}
      </div>

      {tab === "leaderboard" && (
        <div className="flex flex-col gap-2">
          {leaders.map((p, i) => (
            <GlassCard key={i} className={`p-3 flex items-center gap-3 ${p.me ? "ring-1" : ""}`} >
              <span className="w-5 text-center font-display font-bold text-sm" style={{ color: i === 0 ? GOLD : i === 1 ? "#C4C4D6" : i === 2 ? "#CD8A4E" : "#ffffff55" }}>{i + 1}</span>
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${p.av} flex items-center justify-center text-[11px] font-bold text-white`}>{p.n[0]}</div>
              <div className="flex-1">
                <p className="text-white text-[12px] font-semibold">{p.n}{p.me && <span className="text-[9px] text-cyan-300 ml-1">(you)</span>}</p>
                <p className="text-white/40 text-[10px]">{p.pts.toLocaleString()} pts</p>
              </div>
              {i < 3 && <Crown size={15} color={i === 0 ? GOLD : "#ffffff66"} />}
            </GlassCard>
          ))}
        </div>
      )}

      {tab === "tournaments" && (
        <div className="flex flex-col gap-3">
          {[
            { t: "Neon Requiem Invitational", prize: "12,000 Gems", time: "1d 06h", ppl: 512 },
            { t: "Volt Drift Grand Prix", prize: "9,500 Gems", time: "3d 02h", ppl: 256 },
          ].map((tt, i) => (
            <GlassCard key={i} className="p-4 flex items-center gap-3">
              <EnergyRing size={50} pct={65} color={ACCENT_VIOLET} color2={ACCENT_PINK}>
                <Clock size={16} color="#fff" />
              </EnergyRing>
              <div className="flex-1">
                <p className="text-white text-[12.5px] font-bold">{tt.t}</p>
                <p className="text-white/40 text-[10px] mt-0.5">Prize pool: {tt.prize} · {tt.ppl} players</p>
                <p className="text-[10px] mt-1" style={{ color: ACCENT_BLUE }}>Starts in {tt.time}</p>
              </div>
              <NeonButton variant="ghost" className="!px-3 !py-2 text-[10px]">Join</NeonButton>
            </GlassCard>
          ))}
          <GlassCard className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi size={16} color="#7CFF9E" />
              <p className="text-white text-[12px] font-semibold">Quick Matchmaking</p>
            </div>
            <NeonButton className="!px-4 !py-2 text-[11px]">Find Match</NeonButton>
          </GlassCard>
        </div>
      )}

      {tab === "chat" && (
        <div className="flex flex-col gap-3">
          <GlassCard className="p-3 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["NovaBlade", "Kairo", "GhostPixel"].map((n, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 border-2 border-[#0F0F1C] flex items-center justify-center text-[10px] font-bold text-white relative">
                  {n[0]}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#7CFF9E] border border-[#0F0F1C]" />
                </div>
              ))}
            </div>
            <div className="flex-1">
              <p className="text-white text-[11px] font-semibold">Party Voice Chat</p>
              <p className="text-white/40 text-[9.5px]">3 members connected</p>
            </div>
            <button onClick={() => setMuted(m => !m)}
              className="w-9 h-9 rounded-full flex items-center justify-center border"
              style={muted ? { borderColor: "#ffffff22", background: "#ffffff0d" } : { borderColor: `${ACCENT_BLUE}66`, background: `${ACCENT_BLUE}22`, boxShadow: `0 0 12px ${ACCENT_BLUE}44` }}>
              {muted ? <MicOff size={14} color="#ffffff66" /> : <Mic size={14} color={ACCENT_BLUE} />}
            </button>
          </GlassCard>
        <GlassCard className="p-3 flex flex-col h-[340px]">
          <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
            {chat.map((c, i) => (
              <div key={i} className={`max-w-[75%] ${c.me ? "self-end items-end" : "self-start items-start"} flex flex-col`}>
                {!c.me && <span className="text-[9px] text-white/40 mb-0.5 ml-1">{c.u}</span>}
                <div className="px-3 py-2 rounded-2xl text-[11.5px] text-white"
                  style={c.me ? { background: `linear-gradient(135deg, ${ACCENT_BLUE}55, ${ACCENT_VIOLET}55)`, border: `1px solid ${ACCENT_BLUE}55` } : { background: "#ffffff0d", border: "1px solid #ffffff14" }}>
                  {c.m}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
            <input placeholder="Message the squad..." className="flex-1 bg-white/5 rounded-full px-3.5 py-2 text-[11.5px] text-white placeholder:text-white/30 outline-none border border-white/10" />
            <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT_BLUE}, ${ACCENT_VIOLET})` }}>
              <Send size={13} color="#000" />
            </button>
          </div>
        </GlassCard>
        </div>
      )}
    </div>
  );
}

/* ---------------------- STORE / WALLET ---------------------- */
function StoreScreen({ coins, gems, ownedItems, onOpenDeposit, onBuyItem, onOpenGift }) {
  return (
    <div className="pb-4 px-5 pt-2">
      <p className="font-display text-white font-bold text-lg tracking-wide mb-4">Wallet</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <GlassCard className="p-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full" style={{ background: `${GOLD}22`, filter: "blur(18px)" }} />
          <div className="flex items-center justify-between">
            <Coins size={20} color={GOLD} />
            <button onClick={() => onOpenDeposit(PACKS[0])} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${GOLD}26` }}>
              <Plus size={12} color={GOLD} />
            </button>
          </div>
          <p className="text-white font-display font-black text-xl mt-2">{coins.toLocaleString()}</p>
          <p className="text-white/40 text-[10px]">Coins</p>
        </GlassCard>
        <GlassCard className="p-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full" style={{ background: `${ACCENT_BLUE}22`, filter: "blur(18px)" }} />
          <div className="flex items-center justify-between">
            <Gem size={20} color={ACCENT_BLUE} />
            <button onClick={() => onOpenDeposit(PACKS[1])} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${ACCENT_BLUE}26` }}>
              <Plus size={12} color={ACCENT_BLUE} />
            </button>
          </div>
          <p className="text-white font-display font-black text-xl mt-2">{gems.toLocaleString()}</p>
          <p className="text-white/40 text-[10px]">Gems</p>
        </GlassCard>
      </div>

      <SectionHeader title="DEPOSIT — GET GEMS" icon={Gem} />
      <div className="grid grid-cols-2 gap-3 px-5 mb-6">
        {PACKS.map((p, i) => (
          <GlassCard key={i} onClick={() => onOpenDeposit(p)} className="p-3.5 flex flex-col items-center gap-1.5 relative cursor-pointer active:scale-95 transition-transform">
            {p.bonus && <span className="absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${ACCENT_PINK}26`, color: ACCENT_PINK }}>{p.bonus}</span>}
            <Gem size={22} color={ACCENT_BLUE} />
            <p className="text-white font-bold text-sm mt-1">{p.g.toLocaleString()}</p>
            <NeonButton className="w-full !py-1.5 text-[11px] mt-1">${p.price.toFixed(2)}</NeonButton>
          </GlassCard>
        ))}
      </div>

      <SectionHeader title="FEATURED BUNDLE" icon={Crown} iconColor={GOLD} />
      <div className="px-5 mb-6">
        <div className="rounded-2xl p-4 border relative overflow-hidden" style={{ borderColor: `${GOLD}44`, background: `linear-gradient(120deg, ${GOLD}1a, transparent)` }}>
          <Crown size={90} className="absolute -right-3 -bottom-4 opacity-10" color={GOLD} />
          <p className="text-white font-bold text-sm">Season Pass — Vol. 7</p>
          <p className="text-white/50 text-[11px] mt-1 mb-3">50 tiers · exclusive skins · 3,000 bonus gems</p>
          <NeonButton className="!py-2 text-[11px]" onClick={() => onOpenDeposit({ g: 3000, price: 9.99, bonus: "Season Pass" })}>Unlock — $9.99</NeonButton>
        </div>
      </div>

      <SectionHeader title="CHARACTERS & ITEMS" icon={Sword} iconColor={ACCENT_VIOLET} />
      <div className="grid grid-cols-2 gap-3.5 px-5 pb-2">
        {SHOP_ITEMS.map(item => {
          const Icon = item.icon;
          const owned = ownedItems.includes(item.id);
          return (
            <GlassCard key={item.id} className="overflow-hidden">
              <div className="h-24 relative flex items-center justify-center" style={{ background: `linear-gradient(150deg, ${item.grad[0]}, ${item.grad[1]})` }}>
                <Icon size={40} color="#fff" strokeWidth={1.2} opacity={0.85} />
                {owned && (
                  <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-black/50" style={{ color: "#7CFF9E" }}>
                    <Check size={9} /> OWNED
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-white text-[10.5px] font-bold leading-tight">{item.n}</p>
                <p className="text-white/35 text-[9px] mt-0.5 mb-2">{item.game}</p>
                {owned ? (
                  <button onClick={() => onOpenGift(item)} className="w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border border-white/15 text-white/80">
                    <UserPlus size={11} /> Gift to friend
                  </button>
                ) : (
                  <button onClick={() => onBuyItem(item)} className="w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 text-black"
                    style={{ background: `linear-gradient(135deg, ${ACCENT_BLUE}, ${ACCENT_VIOLET})` }}>
                    <Gem size={11} /> {item.price.toLocaleString()}
                  </button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------- WALLET / SHOP OVERLAYS ---------------------- */
function DepositModal({ pack, method, setMethod, phone, setPhone, momoProvider, setMomoProvider, processing, onConfirm, onClose }) {
  const paymentMethods = [
    { k: "mobilemoney", l: "Mobile Money", icon: Smartphone },
    { k: "card", l: "Credit / Debit Card", icon: ShieldCheck },
  ];
  const momoProviders = [
    { k: "mtn", l: "MTN" },
    { k: "vod", l: "Vodafone" },
    { k: "atl", l: "AirtelTigo" },
    { k: "mpesa", l: "M-Pesa" },
  ];
  const canPay = method !== "mobilemoney" || phone.trim().length >= 9;
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <GlassCard className="w-full p-5 pb-8 !bg-[#0F0F1C] !rounded-b-none max-h-full overflow-y-auto no-scrollbar">
        {!processing ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-bold text-sm">Confirm Deposit</p>
              <button onClick={onClose}><X size={16} color="#ffffff88" /></button>
            </div>
            <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-white/[0.04] border border-white/10">
              <Gem size={22} color={ACCENT_BLUE} />
              <div className="flex-1">
                <p className="text-white text-[13px] font-bold">{pack.g.toLocaleString()} Gems</p>
                {pack.bonus && <p className="text-[10px]" style={{ color: ACCENT_PINK }}>{pack.bonus}</p>}
              </div>
              <p className="text-white font-display font-bold text-base">${pack.price.toFixed(2)}</p>
            </div>
            <p className="text-white/40 text-[10px] tracking-widest mb-2">PAYMENT METHOD</p>
            <div className="flex flex-col gap-2 mb-3">
              {paymentMethods.map(m => {
                const Icon = m.icon;
                const sel = method === m.k;
                return (
                  <button key={m.k} onClick={() => setMethod(m.k)}
                    className="flex items-center gap-3 p-3 rounded-xl border transition-all"
                    style={sel ? { borderColor: `${ACCENT_BLUE}66`, background: `${ACCENT_BLUE}14` } : { borderColor: "#ffffff14", background: "transparent" }}>
                    <Icon size={15} color={sel ? ACCENT_BLUE : "#ffffff88"} />
                    <span className="text-[12px] text-white/85 flex-1 text-left">{m.l}</span>
                    <div className="w-4 h-4 rounded-full border flex items-center justify-center" style={{ borderColor: sel ? ACCENT_BLUE : "#ffffff33" }}>
                      {sel && <div className="w-2 h-2 rounded-full" style={{ background: ACCENT_BLUE }} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {method === "mobilemoney" && (
              <div className="mb-5">
                <p className="text-white/40 text-[10px] tracking-widest mb-2">NETWORK</p>
                <div className="flex gap-2 mb-3">
                  {momoProviders.map(p => (
                    <button key={p.k} onClick={() => setMomoProvider(p.k)}
                      className="flex-1 py-2 rounded-lg text-[10.5px] font-bold transition-all"
                      style={momoProvider === p.k
                        ? { background: `linear-gradient(135deg, ${ACCENT_BLUE}, ${ACCENT_VIOLET})`, color: "#000" }
                        : { background: "#ffffff0d", color: "#ffffff99", border: "1px solid #ffffff1a" }}>
                      {p.l}
                    </button>
                  ))}
                </div>
                <p className="text-white/40 text-[10px] tracking-widest mb-2">MOBILE MONEY NUMBER</p>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5">
                  <Smartphone size={15} color="#8C8CA8" />
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 0551234567"
                    inputMode="tel"
                    className="bg-transparent outline-none text-white text-[13px] placeholder:text-white/30 flex-1"
                  />
                </div>
                <p className="text-white/35 text-[9.5px] mt-1.5">You'll get a prompt on this number to authorize the payment.</p>
              </div>
            )}

            <div className="flex items-start gap-2 mb-4 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <Lock size={11} color="#ffffff55" className="mt-0.5 shrink-0" />
              <p className="text-white/40 text-[9.5px] leading-relaxed">
                Deposits settle to your linked Paystack merchant account automatically — no per-transaction routing needed.
              </p>
            </div>

            <NeonButton full className="!py-3" onClick={onConfirm} disabled={!canPay} style={!canPay ? { opacity: 0.4, pointerEvents: "none" } : {}}>
              Pay ${pack.price.toFixed(2)}
            </NeonButton>
            <p className="text-white/25 text-[9px] text-center mt-3">Encrypted checkout via Paystack</p>
          </>
        ) : (
          <div className="py-10 flex flex-col items-center gap-3">
            <EnergyRing size={48} pct={80} color={ACCENT_BLUE} color2={ACCENT_VIOLET}><Zap size={18} color="#fff" /></EnergyRing>
            <p className="text-white text-[12px] font-semibold">
              {method === "mobilemoney" ? "Awaiting mobile money authorization..." : "Processing payment..."}
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function GiftModal({ item, onSend, onClose, sending }) {
  const [email, setEmail] = useState("");
  const valid = /\S+@\S+\.\S+/.test(email);
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <GlassCard className="w-full p-5 pb-8 !bg-[#0F0F1C] !rounded-b-none">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-bold text-sm">Gift {item.n}</p>
          <button onClick={onClose}><X size={16} color="#ffffff88" /></button>
        </div>
        <p className="text-white/40 text-[10px] tracking-widest mb-2">RECIPIENT'S GLITCH EMAIL</p>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 mb-4">
          <UserPlus size={15} color="#8C8CA8" />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="friend@email.com"
            inputMode="email"
            className="bg-transparent outline-none text-white text-[13px] placeholder:text-white/30 flex-1"
          />
        </div>
        <NeonButton
          full
          className="!py-3 flex items-center justify-center gap-2"
          disabled={!valid || sending}
          style={!valid || sending ? { opacity: 0.4, pointerEvents: "none" } : {}}
          onClick={() => onSend(email.trim())}
        >
          <Send size={13} /> {sending ? "Sending..." : "Send Gift"}
        </NeonButton>
        <p className="text-white/30 text-[9.5px] text-center mt-3">They'll need a GLITCH account with this email to receive it.</p>
      </GlassCard>
    </div>
  );
}

function Toast({ message }) {
  return (
    <div className="absolute bottom-24 inset-x-4 z-50 px-4 py-3 rounded-xl border flex items-center gap-2 backdrop-blur-md"
      style={{ background: "#0F0F1Ce6", borderColor: `${ACCENT_BLUE}44` }}>
      <Check size={14} color={ACCENT_BLUE} />
      <span className="text-white text-[11.5px] font-medium">{message}</span>
    </div>
  );
}

/* ---------------------- PROFILE ---------------------- */
function ProfileScreen({ onOpenSettings }) {
  const achievements = [
    { n: "First Blood", icon: Sword, done: true },
    { n: "Speed Demon", icon: Gauge, done: true },
    { n: "Strategist", icon: Shield, done: true },
    { n: "Untouchable", icon: Target, done: false },
    { n: "Legend", icon: Crown, done: false },
    { n: "Completionist", icon: Award, done: false },
  ];
  const friends = FRIENDS;
  const [requests, setRequests] = useState([{ n: "Astra_Wolf" }, { n: "PixieByte" }]);
  const [addValue, setAddValue] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="pb-4 px-5 pt-2">
      <div className="flex justify-end">
        <button onClick={onOpenSettings} className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
          <Settings size={14} color="#fff" />
        </button>
      </div>
      <div className="flex flex-col items-center mt-2 mb-6">
        <EnergyRing size={92} stroke={4} pct={68} color={ACCENT_BLUE} color2={ACCENT_VIOLET}>
          <div className="w-[74px] h-[74px] rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-2xl font-black text-white font-display">K</div>
        </EnergyRing>
        <p className="font-display text-white font-bold text-lg mt-3 tracking-wide">Kairo_</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${ACCENT_VIOLET}26`, color: ACCENT_VIOLET }}>LEVEL 42</span>
          <span className="text-white/40 text-[10px]">6,820 / 10,000 XP</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: "68%", background: `linear-gradient(90deg, ${ACCENT_BLUE}, ${ACCENT_VIOLET})`, boxShadow: `0 0 8px ${ACCENT_BLUE}` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[["Games", "128"], ["Trophies", "56"], ["Hours", "340"]].map(([l, v], i) => (
          <GlassCard key={i} className="py-3 flex flex-col items-center">
            <p className="text-white font-display font-bold text-base">{v}</p>
            <p className="text-white/40 text-[9.5px] mt-0.5">{l}</p>
          </GlassCard>
        ))}
      </div>

      <SectionHeader title="ACHIEVEMENTS" icon={Award} iconColor={GOLD} />
      <div className="grid grid-cols-3 gap-3 px-5 mb-6">
        {achievements.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5 py-3 rounded-xl border"
              style={a.done ? { borderColor: `${GOLD}44`, background: `${GOLD}0d` } : { borderColor: "#ffffff10", background: "#ffffff05" }}>
              <Icon size={18} color={a.done ? GOLD : "#ffffff33"} />
              <span className="text-[8.5px] text-center px-1" style={{ color: a.done ? "#ffffffcc" : "#ffffff40" }}>{a.n}</span>
            </div>
          );
        })}
      </div>

      {requests.length > 0 && (
        <>
          <SectionHeader title="FRIEND REQUESTS" icon={UserPlus} iconColor={ACCENT_PINK} />
          <div className="flex flex-col gap-2 px-5 mb-4">
            {requests.map((r, i) => (
              <GlassCard key={i} className="p-2.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-[11px] font-bold text-white">{r.n[0]}</div>
                <p className="flex-1 text-white text-[11.5px] font-semibold">{r.n}</p>
                <button onClick={() => setRequests(rs => rs.filter((_, idx) => idx !== i))}
                  className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${ACCENT_BLUE}22`, border: `1px solid ${ACCENT_BLUE}55` }}>
                  <Check size={12} color={ACCENT_BLUE} />
                </button>
                <button onClick={() => setRequests(rs => rs.filter((_, idx) => idx !== i))}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/10">
                  <X size={12} color="#ffffff88" />
                </button>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      <SectionHeader title="FRIENDS" icon={Users} iconColor={ACCENT_BLUE} />
      <div className="px-5 flex items-center gap-2 mb-3">
        <input value={addValue} onChange={e => { setAddValue(e.target.value); setSent(false); }} placeholder="Add friend by username"
          className="flex-1 bg-white/5 rounded-full px-3.5 py-2 text-[11px] text-white placeholder:text-white/30 outline-none border border-white/10" />
        <button onClick={() => { if (addValue.trim()) { setSent(true); setAddValue(""); } }}
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${ACCENT_BLUE}, ${ACCENT_VIOLET})` }}>
          <UserPlus size={13} color="#000" />
        </button>
      </div>
      {sent && <p className="px-5 text-[10px] mb-3" style={{ color: "#7CFF9E" }}>Friend request sent.</p>}
      <div className="flex flex-col gap-2 px-5 mb-6">
        {friends.map((f, i) => (
          <GlassCard key={i} className="p-2.5 flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center text-[11px] font-bold text-white">{f.n[0]}</div>
              {f.on && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0A0A14]" style={{ background: "#7CFF9E" }} />}
            </div>
            <div className="flex-1">
              <p className="text-white text-[11.5px] font-semibold">{f.n}</p>
              <p className="text-white/40 text-[9.5px]">{f.status}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <SectionHeader title="RECENT ACTIVITY" icon={Clock} />
      <div className="flex flex-col gap-2 px-5">
        {[
          "Unlocked \u2018Strategist\u2019 in IRON ECHELON",
          "Reached Level 42",
          "Won Volt Drift Grand Prix qualifier",
        ].map((t, i) => (
          <div key={i} className="flex items-center gap-2.5 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT_BLUE, boxShadow: `0 0 6px ${ACCENT_BLUE}` }} />
            <p className="text-white/60 text-[11px]">{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------- GAME DETAIL ---------------------- */
function GameDetailScreen({ game, onClose, wishlisted, onToggleWishlist }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const Icon = game.icon;
  useEffect(() => {
    if (!downloading) return;
    const t = setInterval(() => setProgress(p => (p >= 100 ? 100 : p + 4)), 120);
    return () => clearInterval(t);
  }, [downloading]);

  const [reviews, setReviews] = useState([
    { u: "NovaBlade", r: 5, c: "Absolutely stunning visuals, combat feels incredible." },
    { u: "Rin_Vex", r: 4, c: "Great game, matchmaking could be a bit faster." },
  ]);
  const [writing, setWriting] = useState(false);
  const [draftRating, setDraftRating] = useState(5);
  const [draftText, setDraftText] = useState("");

  return (
    <div className="absolute inset-0 bg-[#06060C] z-50 overflow-y-auto no-scrollbar">
      <div className="relative h-64">
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${game.grad[0]}, ${game.grad[1]})` }} />
        <Icon size={160} className="absolute -right-6 -bottom-8 opacity-20" color="#fff" strokeWidth={1} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06060C] via-transparent to-black/30" />
        <button onClick={onClose} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
          <ChevronLeft size={16} color="#fff" />
        </button>
        <button onClick={() => onToggleWishlist(game.id)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
          <Heart size={14} fill={wishlisted ? ACCENT_PINK : "transparent"} color={wishlisted ? ACCENT_PINK : "#fff"} />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <p className="font-display text-white text-2xl font-black tracking-wide">{game.title}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-white/80"><Star size={12} fill={GOLD} color={GOLD} /> {game.rating}</span>
            <span className="text-white/40 text-xs">{game.genre}</span>
            <span className="text-white/40 text-xs">{game.size}</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        {!downloading ? (
          <div className="flex gap-2">
            <NeonButton full className="flex items-center justify-center gap-2" onClick={() => setDownloading(true)}>
              <Download size={15} /> Download & Play
            </NeonButton>
          </div>
        ) : (
          <GlassCard className="p-3.5 flex items-center gap-3">
            <EnergyRing size={44} pct={progress} color={ACCENT_BLUE} color2="#7CFF9E">
              <span className="text-[9px] text-white font-bold">{progress}%</span>
            </EnergyRing>
            <div className="flex-1">
              <p className="text-white text-[12px] font-semibold">{progress < 100 ? "Downloading..." : "Ready to play"}</p>
              <p className="text-white/40 text-[10px]">{game.size} · {progress < 100 ? "estimating..." : "installed"}</p>
            </div>
            {progress >= 100 && <NeonButton className="!px-4 !py-2 text-[11px] flex items-center gap-1"><Play size={12} fill="black" />Play</NeonButton>}
          </GlassCard>
        )}
      </div>

      <SectionHeader title="TRAILER & SCREENSHOTS" icon={Play} />
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 mb-6 pb-1">
        <div className="min-w-[220px] h-32 rounded-xl relative overflow-hidden shrink-0" style={{ background: `linear-gradient(140deg, ${game.grad[0]}, ${game.grad[1]})` }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
              <Play size={16} color="#fff" fill="#fff" />
            </div>
          </div>
          <span className="absolute bottom-2 left-2 text-[9px] text-white/80 bg-black/40 px-1.5 py-0.5 rounded">Official Trailer · 1:42</span>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="min-w-[150px] h-32 rounded-xl shrink-0 opacity-90" style={{ background: `linear-gradient(${120 + i * 30}deg, ${game.grad[1]}, ${game.grad[0]})` }} />
        ))}
      </div>

      <SectionHeader title="YOUR CLIPS" icon={Camera} />
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 mb-6 pb-1">
        <button className="min-w-[110px] h-28 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-1.5 shrink-0 bg-white/[0.02]">
          <Camera size={18} color="#ffffff88" />
          <span className="text-[9px] text-white/50">Record clip</span>
        </button>
        {[1, 2].map(i => (
          <div key={i} className="min-w-[110px] h-28 rounded-xl relative overflow-hidden shrink-0" style={{ background: `linear-gradient(${100 + i * 40}deg, ${game.grad[0]}, ${game.grad[1]})` }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Play size={18} color="#fff" fill="#fff" />
            </div>
            <span className="absolute bottom-1.5 left-1.5 text-[8.5px] text-white/80 bg-black/40 px-1.5 py-0.5 rounded">0:{18 + i * 6}s</span>
          </div>
        ))}
      </div>

      <SectionHeader title="ABOUT" />
      <p className="px-5 text-white/50 text-[12px] leading-relaxed mb-6">
        Step into a fractured neon metropolis where every choice rewrites the skyline. {game.title} blends
        fluid {game.genre.toLowerCase()} mechanics with a reactive world that remembers what you do — built for
        players who want their skill to actually mean something.
      </p>

      <SectionHeader title="SYSTEM REQUIREMENTS" icon={Gauge} />
      <div className="px-5 grid grid-cols-2 gap-3 mb-6">
        <GlassCard className="p-3">
          <p className="text-white/40 text-[9px] mb-1.5 tracking-wider">MINIMUM</p>
          <p className="text-white/70 text-[10.5px] leading-relaxed">OS 14+ · 4GB RAM<br />Snapdragon 730 / A12<br />{game.size} free space</p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-white/40 text-[9px] mb-1.5 tracking-wider">RECOMMENDED</p>
          <p className="text-white/70 text-[10.5px] leading-relaxed">OS 16+ · 8GB RAM<br />Snapdragon 8 Gen2 / A16<br />120Hz display</p>
        </GlassCard>
      </div>

      <SectionHeader title="REVIEWS" icon={Star} iconColor={GOLD} />
      <div className="px-5 mb-3">
        {!writing ? (
          <NeonButton variant="ghost" className="!py-2 text-[11px] flex items-center justify-center gap-1.5" onClick={() => setWriting(true)}>
            <Star size={12} /> Write a Review
          </NeonButton>
        ) : (
          <GlassCard className="p-3.5">
            <div className="flex gap-1 mb-2.5">
              {Array.from({ length: 5 }).map((_, s) => (
                <button key={s} onClick={() => setDraftRating(s + 1)}>
                  <Star size={18} fill={s < draftRating ? GOLD : "transparent"} color={GOLD} />
                </button>
              ))}
            </div>
            <textarea value={draftText} onChange={e => setDraftText(e.target.value)} placeholder="Share your thoughts on this game..."
              className="w-full h-16 bg-white/5 rounded-xl px-3 py-2 text-[11.5px] text-white placeholder:text-white/30 outline-none border border-white/10 resize-none" />
            <div className="flex gap-2 mt-2.5">
              <NeonButton className="!py-1.5 text-[11px] flex-1" onClick={() => {
                if (draftText.trim()) { setReviews(r => [{ u: "Kairo_", r: draftRating, c: draftText }, ...r]); }
                setWriting(false); setDraftText(""); setDraftRating(5);
              }}>Post Review</NeonButton>
              <NeonButton variant="ghost" className="!py-1.5 text-[11px] flex-1" onClick={() => setWriting(false)}>Cancel</NeonButton>
            </div>
          </GlassCard>
        )}
      </div>
      <div className="px-5 flex flex-col gap-2.5 pb-8">
        {reviews.map((r, i) => (
          <GlassCard key={i} className="p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600" />
                <span className="text-white text-[11px] font-semibold">{r.u}</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => <Star key={s} size={10} fill={s < r.r ? GOLD : "transparent"} color={GOLD} />)}
              </div>
            </div>
            <p className="text-white/50 text-[11px] leading-relaxed">{r.c}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/* ---------------------- NOTIFICATIONS ---------------------- */
function NotificationsScreen({ onClose }) {
  const items = [
    { icon: UserPlus, color: ACCENT_PINK, t: "Astra_Wolf sent you a friend request", time: "2m ago" },
    { icon: Award, color: GOLD, t: "Achievement unlocked: Strategist", time: "1h ago" },
    { icon: Trophy, color: ACCENT_VIOLET, t: "Summer Clash tournament starts in 2h", time: "3h ago" },
    { icon: Gem, color: ACCENT_BLUE, t: "Daily reward is ready to claim", time: "6h ago" },
    { icon: TrendingUp, color: "#7CFF9E", t: "WRAITHFALL just dropped 30% off", time: "1d ago" },
  ];
  return (
    <div className="absolute inset-0 bg-[#06060C] z-50 overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 sticky top-0 bg-[#06060C]/90 backdrop-blur-md z-10">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
          <ChevronLeft size={16} color="#fff" />
        </button>
        <p className="font-display text-white font-bold text-base tracking-wide">Notifications</p>
      </div>
      <div className="px-5 flex flex-col gap-2 pb-8">
        {items.map((n, i) => {
          const Icon = n.icon;
          return (
            <GlassCard key={i} className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${n.color}22` }}>
                <Icon size={15} color={n.color} />
              </div>
              <div className="flex-1">
                <p className="text-white text-[11.5px] leading-snug">{n.t}</p>
                <p className="text-white/35 text-[9.5px] mt-0.5">{n.time}</p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------- SETTINGS ---------------------- */
function SettingsScreen({ onClose, onLogOut, userEmail }) {
  const [pushOn, setPushOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [hapticsOn, setHapticsOn] = useState(true);
  const [amoled, setAmoled] = useState(false);
  const [parental, setParental] = useState(false);

  const Row = ({ icon: Icon, label, sub, control }) => (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.06] last:border-0">
      <Icon size={16} color="#ffffff99" />
      <div className="flex-1">
        <p className="text-white text-[12px] font-medium">{label}</p>
        {sub && <p className="text-white/35 text-[10px] mt-0.5">{sub}</p>}
      </div>
      {control}
    </div>
  );

  return (
    <div className="absolute inset-0 bg-[#06060C] z-50 overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 sticky top-0 bg-[#06060C]/90 backdrop-blur-md z-10">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
          <ChevronLeft size={16} color="#fff" />
        </button>
        <p className="font-display text-white font-bold text-base tracking-wide">Settings</p>
      </div>

      <div className="px-5 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-xl font-black text-white font-display">K</div>
          <div>
            <p className="text-white font-bold text-sm">Kairo_</p>
            <p className="text-white/40 text-[10.5px]">{userEmail || "Not signed in"} · Level 42</p>
          </div>
        </div>

        <p className="text-white/40 text-[10px] tracking-widest mb-1 mt-2">NOTIFICATIONS</p>
        <GlassCard className="px-3.5 mb-5">
          <Row icon={Bell} label="Push notifications" sub="Friend requests, rewards, events" control={<ToggleSwitch on={pushOn} onChange={setPushOn} />} />
          <Row icon={Volume2} label="Sound effects" control={<ToggleSwitch on={soundOn} onChange={setSoundOn} />} />
          <Row icon={Vibrate} label="Haptics" control={<ToggleSwitch on={hapticsOn} onChange={setHapticsOn} />} />
        </GlassCard>

        <p className="text-white/40 text-[10px] tracking-widest mb-1">DISPLAY</p>
        <GlassCard className="px-3.5 mb-5">
          <Row icon={Moon} label="AMOLED true black" sub="Deeper blacks, saves battery" control={<ToggleSwitch on={amoled} onChange={setAmoled} />} />
          <Row icon={Globe} label="Language" sub="English (US)" control={<ChevronDown size={15} color="#ffffff66" />} />
        </GlassCard>

        <p className="text-white/40 text-[10px] tracking-widest mb-1">ACCOUNT & SAFETY</p>
        <GlassCard className="px-3.5 mb-5">
          <Row icon={ShieldCheck} label="Linked accounts" sub="PSN, Xbox, Steam" control={<ChevronRight size={15} color="#ffffff66" />} />
          <Row icon={Baby} label="Parental controls" sub="Screen time & content limits" control={<ToggleSwitch on={parental} onChange={setParental} />} />
          <Row icon={Trash2} label="Clear cache" sub="1.2 GB of temporary files" control={<ChevronRight size={15} color="#ffffff66" />} />
        </GlassCard>

        <button onClick={() => { onLogOut?.(); onClose(); }} className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center gap-2 text-white/70 text-[12px] font-semibold">
          <LogOut size={14} /> Log Out
        </button>
      </div>
    </div>
  );
}

/* ---------------------- AUTH ---------------------- */
function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { email: email.trim(), password }
        : { email: email.trim(), password, display_name: displayName.trim() || undefined };
      const data = await apiFetch(path, { method: "POST", body: JSON.stringify(body) });
      onAuthed(data.token, data.user);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-center px-7"
      style={{ background: "radial-gradient(circle at 20% 10%, #1a1032 0%, #06060C 55%)" }}>
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: `linear-gradient(135deg, ${ACCENT_BLUE}, ${ACCENT_VIOLET})`, boxShadow: `0 0 30px ${ACCENT_BLUE}55` }}>
          <Zap size={30} color="#000" />
        </div>
        <p className="font-display text-white font-black text-2xl tracking-widest">GLITCH</p>
        <p className="text-white/40 text-[11px] mt-1">{mode === "login" ? "Welcome back" : "Create your account"}</p>
      </div>

      <div className="flex gap-1.5 mb-5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        {["login", "register"].map(m => (
          <button key={m} onClick={() => { setMode(m); setError(null); }}
            className="flex-1 py-2 rounded-lg text-[11px] font-bold capitalize transition-all"
            style={mode === m ? { background: `linear-gradient(135deg, ${ACCENT_BLUE}, ${ACCENT_VIOLET})`, color: "#000" } : { color: "#ffffff66" }}>
            {m === "login" ? "Log In" : "Sign Up"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {mode === "register" && (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3">
            <User size={15} color="#8C8CA8" />
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display name"
              className="bg-transparent outline-none text-white text-[13px] placeholder:text-white/30 flex-1" />
          </div>
        )}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3">
          <Globe size={15} color="#8C8CA8" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" inputMode="email"
            className="bg-transparent outline-none text-white text-[13px] placeholder:text-white/30 flex-1" />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3">
          <Lock size={15} color="#8C8CA8" />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 8 characters)" type="password"
            className="bg-transparent outline-none text-white text-[13px] placeholder:text-white/30 flex-1" />
        </div>

        {error && <p className="text-[10.5px]" style={{ color: ACCENT_PINK }}>{error}</p>}

        <NeonButton full className="!py-3 mt-1" onClick={submit} disabled={loading || !email || password.length < 8}
          style={loading || !email || password.length < 8 ? { opacity: 0.4, pointerEvents: "none" } : {}}>
          {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
        </NeonButton>
      </div>

      <p className="text-white/25 text-[9.5px] text-center mt-6">
        Connects to {API_BASE_URL.includes("YOUR-APP-NAME") ? "your backend (set API_BASE_URL first)" : API_BASE_URL}
      </p>
    </div>
  );
}

/* ---------------------- APP SHELL ---------------------- */
export default function GlitchApp() {
  const [tab, setTab] = useState("home");
  const [selectedGame, setSelectedGame] = useState(null);
  const [wishlist, setWishlist] = useState([7]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const toggleWishlist = id => setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

  // Auth — kept in memory only (no localStorage in artifacts), so a page
  // refresh signs the user out. In your own deployment, swap this for
  // secure storage appropriate to the platform (Keychain/EncryptedSharedPrefs
  // on native, an httpOnly cookie for web).
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [ownedItems, setOwnedItems] = useState([]);
  const [depositPack, setDepositPack] = useState(null);
  const [payMethod, setPayMethod] = useState("mobilemoney");
  const [depositPhone, setDepositPhone] = useState("");
  const [momoProvider, setMomoProvider] = useState("mtn");
  const [processing, setProcessing] = useState(false);
  const [giftItem, setGiftItem] = useState(null);
  const [giftSending, setGiftSending] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const refreshWallet = async token => {
    setWalletLoading(true);
    try {
      const data = await apiFetch("/api/wallet", {}, token || authToken);
      setGems(data.gems);
      setCoins(data.coins);
    } catch (e) {
      showToast("Could not load wallet");
    } finally {
      setWalletLoading(false);
    }
  };

  const refreshOwnedItems = async token => {
    try {
      const data = await apiFetch("/api/shop/owned", {}, token || authToken);
      setOwnedItems(data.owned || []);
    } catch (e) {
      // non-fatal — shop still works, just starts with nothing marked owned
    }
  };

  const handleAuthed = (token, user) => {
    setAuthToken(token);
    setCurrentUser(user);
    refreshWallet(token);
    refreshOwnedItems(token);
  };

  const logOut = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setGems(0);
    setCoins(0);
    setOwnedItems([]);
  };

  // Polls the deposit's status after Paystack has been asked to charge the
  // user. Falls back to the server's /verify endpoint (which asks Paystack
  // directly) if nothing's arrived via webhook after ~20s.
  const pollDeposit = transactionId => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const status = await apiFetch(`/api/deposits/${transactionId}/status`, {}, authToken);
        if (status.status === "completed") {
          clearInterval(interval);
          setGems(g => g + status.gems_amount);
          setProcessing(false);
          setDepositPack(null);
          showToast(`+${status.gems_amount.toLocaleString()} gems added`);
          return;
        }
        if (status.status === "failed") {
          clearInterval(interval);
          setProcessing(false);
          showToast("Payment failed or was cancelled");
          return;
        }
        if (attempts === 8) {
          // ~20s in and still pending — ask Paystack directly rather than
          // waiting indefinitely on a webhook that may have been missed.
          await apiFetch(`/api/deposits/${transactionId}/verify`, { method: "POST" }, authToken).catch(() => {});
        }
        if (attempts >= 24) {
          clearInterval(interval);
          setProcessing(false);
          showToast("Still processing — check Wallet shortly");
        }
      } catch {
        // transient network hiccup — keep polling until the attempt cap
      }
    }, 2500);
  };

  const confirmDeposit = async () => {
    if (!depositPack) return;
    setProcessing(true);
    try {
      const idempotencyKey = `${currentUser.id}-${depositPack.id}-${Date.now()}`;
      const body = {
        pack_id: depositPack.id,
        provider: payMethod === "mobilemoney" ? "mobilemoney" : "card",
        idempotency_key: idempotencyKey,
        ...(payMethod === "mobilemoney" ? { phone: depositPhone, momo_provider: momoProvider } : {}),
      };
      const init = await apiFetch("/api/deposits/initiate", { method: "POST", body: JSON.stringify(body) }, authToken);

      if (init.provider_action === "redirect" && init.redirect_url) {
        // Card path opens Paystack's hosted checkout. window.open may be
        // blocked in a sandboxed preview — in your own deployed app this
        // opens normally (or use an in-app WebView on native).
        window.open(init.redirect_url, "_blank");
      }
      pollDeposit(init.transaction_id);
    } catch (e) {
      setProcessing(false);
      showToast(e.message || "Could not start deposit");
    }
  };

  const buyItem = async item => {
    if (ownedItems.includes(item.id)) return;
    if (gems < item.price) { showToast("Not enough gems — deposit more"); return; }
    try {
      const idempotencyKey = `${currentUser.id}-${item.id}-buy`;
      await apiFetch("/api/shop/purchase", { method: "POST", body: JSON.stringify({ item_id: item.id, idempotency_key: idempotencyKey }) }, authToken);
      setGems(g => g - item.price);
      setOwnedItems(o => [...o, item.id]);
      showToast(`${item.n} unlocked`);
    } catch (e) {
      showToast(e.message || "Purchase failed");
    }
  };

  const sendGift = async email => {
    if (!giftItem) return;
    setGiftSending(true);
    try {
      await apiFetch("/api/gifts/send", { method: "POST", body: JSON.stringify({ item_id: giftItem.id, to_email: email }) }, authToken);
      showToast(`Sent ${giftItem.n} to ${email}`);
      setGiftItem(null);
    } catch (e) {
      showToast(e.message || "Could not send gift");
    } finally {
      setGiftSending(false);
    }
  };

  const tabs = [
    { k: "home", l: "Home", icon: Home },
    { k: "games", l: "Games", icon: Gamepad2 },
    { k: "community", l: "Community", icon: Users },
    { k: "store", l: "Store", icon: ShoppingBag },
    { k: "profile", l: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-8" style={{ background: "#020204" }}>
      <style>{`
        ${FONTS}
        .font-display { font-family: 'Orbitron', sans-serif; }
        body, .font-body { font-family: 'Sora', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pulseGlow { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>

      {/* phone frame */}
      <div className="relative" style={{ width: 390, height: 844 }}>
        <div className="absolute -inset-6 rounded-[64px] opacity-40" style={{
          background: `radial-gradient(circle at 30% 20%, ${ACCENT_BLUE}33, transparent 55%), radial-gradient(circle at 75% 80%, ${ACCENT_VIOLET}33, transparent 55%)`,
          filter: "blur(30px)"
        }} />
        <div className="relative w-full h-full rounded-[52px] border-[6px] border-[#151520] bg-[#020204] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.7)] font-body">
          {/* status bar */}
          <div className="absolute top-0 inset-x-0 h-11 flex items-center justify-between px-8 z-40 text-white text-[11px] font-semibold">
            <span>9:41</span>
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full" />
            <div className="flex items-center gap-1"><Wifi size={12} /><span>100%</span></div>
          </div>

          <div className="absolute inset-0 pt-11 pb-[78px] overflow-y-auto no-scrollbar" style={{
            background: "radial-gradient(circle at 15% 0%, #1a1032 0%, #06060C 45%)"
          }}>
            {tab === "home" && <HomeScreen onSelectGame={setSelectedGame} wishlist={wishlist} onToggleWishlist={toggleWishlist} onOpenNotifications={() => setNotifOpen(true)} />}
            {tab === "games" && <GamesScreen onSelectGame={setSelectedGame} wishlist={wishlist} onToggleWishlist={toggleWishlist} />}
            {tab === "community" && <CommunityScreen />}
            {tab === "store" && <StoreScreen coins={coins} gems={gems} ownedItems={ownedItems} onOpenDeposit={setDepositPack} onBuyItem={buyItem} onOpenGift={setGiftItem} />}
            {tab === "profile" && <ProfileScreen onOpenSettings={() => setSettingsOpen(true)} />}
          </div>

          {!authToken && <AuthScreen onAuthed={handleAuthed} />}

          {selectedGame && (
            <GameDetailScreen
              game={selectedGame}
              onClose={() => setSelectedGame(null)}
              wishlisted={wishlist.includes(selectedGame.id)}
              onToggleWishlist={toggleWishlist}
            />
          )}
          {notifOpen && <NotificationsScreen onClose={() => setNotifOpen(false)} />}
          {settingsOpen && <SettingsScreen onClose={() => setSettingsOpen(false)} onLogOut={logOut} userEmail={currentUser?.email} />}
          {depositPack && (
            <DepositModal
              pack={depositPack}
              method={payMethod}
              setMethod={setPayMethod}
              phone={depositPhone}
              setPhone={setDepositPhone}
              momoProvider={momoProvider}
              setMomoProvider={setMomoProvider}
              processing={processing}
              onConfirm={confirmDeposit}
              onClose={() => setDepositPack(null)}
            />
          )}
          {giftItem && <GiftModal item={giftItem} onSend={sendGift} onClose={() => setGiftItem(null)} sending={giftSending} />}
          {toast && <Toast message={toast} />}

          {/* bottom nav */}
          {authToken && (
          <div className="absolute bottom-0 inset-x-0 h-[78px] border-t border-white/[0.06] backdrop-blur-2xl flex items-center justify-around px-2 z-40"
            style={{ background: "rgba(6,6,12,0.85)" }}>
            {tabs.map(t => {
              const Icon = t.icon;
              const active = tab === t.k;
              return (
                <button key={t.k} onClick={() => { setTab(t.k); setSelectedGame(null); }} className="flex flex-col items-center gap-1 px-3 py-1.5 relative">
                  {active && <div className="absolute -top-[13px] w-8 h-[3px] rounded-full" style={{ background: `linear-gradient(90deg, ${ACCENT_BLUE}, ${ACCENT_VIOLET})`, boxShadow: `0 0 8px ${ACCENT_BLUE}` }} />}
                  <Icon size={19} color={active ? ACCENT_BLUE : "#ffffff40"} style={active ? { filter: `drop-shadow(0 0 5px ${ACCENT_BLUE}aa)` } : {}} />
                  <span className="text-[9px] font-semibold" style={{ color: active ? "#fff" : "#ffffff40" }}>{t.l}</span>
                </button>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
