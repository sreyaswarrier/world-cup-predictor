import React, { useState, useMemo, useRef } from "react";
import {
  ChevronUp, ChevronDown, Trophy, Download, Upload, RotateCcw, Copy, Check,
  Target, Star, Hand, Sparkles, Flame, TrendingDown, ShieldAlert, Users, AlertTriangle,
} from "lucide-react";

// Real, official 2026 FIFA World Cup draw (USA/Canada/Mexico) — 12 groups of 4
const TEAM_DATA = {
  A: [{ id: "MEX", name: "Mexico", flag: "🇲🇽" }, { id: "KOR", name: "South Korea", flag: "🇰🇷" }, { id: "RSA", name: "South Africa", flag: "🇿🇦" }, { id: "CZE", name: "Czechia", flag: "🇨🇿" }],
  B: [{ id: "CAN", name: "Canada", flag: "🇨🇦" }, { id: "SUI", name: "Switzerland", flag: "🇨🇭" }, { id: "QAT", name: "Qatar", flag: "🇶🇦" }, { id: "BIH", name: "Bosnia and Herzegovina", flag: "🇧🇦" }],
  C: [{ id: "BRA", name: "Brazil", flag: "🇧🇷" }, { id: "MAR", name: "Morocco", flag: "🇲🇦" }, { id: "SCO", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" }, { id: "HAI", name: "Haiti", flag: "🇭🇹" }],
  D: [{ id: "USA", name: "United States", flag: "🇺🇸" }, { id: "PAR", name: "Paraguay", flag: "🇵🇾" }, { id: "AUS", name: "Australia", flag: "🇦🇺" }, { id: "TUR", name: "Türkiye", flag: "🇹🇷" }],
  E: [{ id: "GER", name: "Germany", flag: "🇩🇪" }, { id: "ECU", name: "Ecuador", flag: "🇪🇨" }, { id: "CIV", name: "Ivory Coast", flag: "🇨🇮" }, { id: "CUW", name: "Curaçao", flag: "🇨🇼" }],
  F: [{ id: "NED", name: "Netherlands", flag: "🇳🇱" }, { id: "JPN", name: "Japan", flag: "🇯🇵" }, { id: "TUN", name: "Tunisia", flag: "🇹🇳" }, { id: "SWE", name: "Sweden", flag: "🇸🇪" }],
  G: [{ id: "BEL", name: "Belgium", flag: "🇧🇪" }, { id: "IRN", name: "Iran", flag: "🇮🇷" }, { id: "EGY", name: "Egypt", flag: "🇪🇬" }, { id: "NZL", name: "New Zealand", flag: "🇳🇿" }],
  H: [{ id: "ESP", name: "Spain", flag: "🇪🇸" }, { id: "URU", name: "Uruguay", flag: "🇺🇾" }, { id: "KSA", name: "Saudi Arabia", flag: "🇸🇦" }, { id: "CPV", name: "Cape Verde", flag: "🇨🇻" }],
  I: [{ id: "FRA", name: "France", flag: "🇫🇷" }, { id: "SEN", name: "Senegal", flag: "🇸🇳" }, { id: "NOR", name: "Norway", flag: "🇳🇴" }, { id: "IRQ", name: "Iraq", flag: "🇮🇶" }],
  J: [{ id: "ARG", name: "Argentina", flag: "🇦🇷" }, { id: "AUT", name: "Austria", flag: "🇦🇹" }, { id: "ALG", name: "Algeria", flag: "🇩🇿" }, { id: "JOR", name: "Jordan", flag: "🇯🇴" }],
  K: [{ id: "POR", name: "Portugal", flag: "🇵🇹" }, { id: "COL", name: "Colombia", flag: "🇨🇴" }, { id: "UZB", name: "Uzbekistan", flag: "🇺🇿" }, { id: "COD", name: "DR Congo", flag: "🇨🇩" }],
  L: [{ id: "ENG", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, { id: "CRO", name: "Croatia", flag: "🇭🇷" }, { id: "PAN", name: "Panama", flag: "🇵🇦" }, { id: "GHA", name: "Ghana", flag: "🇬🇭" }],
};

const GROUP_KEYS = "ABCDEFGHIJKL".split("");
const ALL_TEAMS = Object.values(TEAM_DATA).flat();
const findTeam = (id) => (id ? ALL_TEAMS.find((t) => t.id === id) || null : null);

// Round of 32 seeding (simplified, token-dense template): 8 group winners face the 8
// user-picked wildcard third-place teams; the other 4 winners + all 12 runners-up fill
// the remaining 8 matches. [tag, idx]: tag is a group letter (idx 0/1 = 1st/2nd place) or
// "W" (idx = sorted position among the checked wildcard groups).
const R32_SEEDS = {
  R32_1: [["A", 0], ["W", 0]], R32_2: [["B", 0], ["W", 1]], R32_3: [["D", 0], ["W", 2]], R32_4: [["E", 0], ["W", 3]],
  R32_5: [["G", 0], ["W", 4]], R32_6: [["I", 0], ["W", 5]], R32_7: [["K", 0], ["W", 6]], R32_8: [["L", 0], ["W", 7]],
  R32_9: [["C", 0], ["D", 1]], R32_10: [["F", 0], ["E", 1]], R32_11: [["H", 0], ["G", 1]], R32_12: [["J", 0], ["I", 1]],
  R32_13: [["A", 1], ["L", 1]], R32_14: [["B", 1], ["K", 1]], R32_15: [["C", 1], ["J", 1]], R32_16: [["F", 1], ["H", 1]],
};
const WC_MATCHES = ["R32_1", "R32_2", "R32_3", "R32_4", "R32_5", "R32_6", "R32_7", "R32_8"];
// Each group feeds exactly two R32 matches: as a 1st-place seed and as a 2nd-place seed.
const GROUP_MATCHES = {
  A: ["R32_1", "R32_13"], B: ["R32_2", "R32_14"], C: ["R32_9", "R32_15"], D: ["R32_3", "R32_9"],
  E: ["R32_4", "R32_10"], F: ["R32_10", "R32_16"], G: ["R32_5", "R32_11"], H: ["R32_11", "R32_16"],
  I: ["R32_6", "R32_12"], J: ["R32_12", "R32_15"], K: ["R32_7", "R32_14"], L: ["R32_8", "R32_13"],
};

const ROUNDS = ["R32", "R16", "QF", "SF", "FINAL"];
const ROUND_SIZES = { R32: 16, R16: 8, QF: 4, SF: 2, FINAL: 1 };
const ROUND_LABELS = { R32: "Round of 32", R16: "Round of 16", QF: "Quarterfinals", SF: "Semifinals", FINAL: "Final" };
const nodesOf = (round) => (round === "FINAL" ? ["FINAL"] : Array.from({ length: ROUND_SIZES[round] }, (_, i) => `${round}_${i + 1}`));

// Build CHILDREN (downstream cascade map) and ADVANCE_SEEDS (which two prior-round nodes
// feed each R16/QF/SF/FINAL node) programmatically — every round halves the previous one.
const CHILDREN = { FINAL: [] };
const ADVANCE_SEEDS = {};
for (let r = 0; r < ROUNDS.length - 1; r++) {
  const cur = nodesOf(ROUNDS[r]);
  const next = nodesOf(ROUNDS[r + 1]);
  cur.forEach((k, i) => { CHILDREN[k] = [next[Math.floor(i / 2)]]; });
  next.forEach((k, i) => { ADVANCE_SEEDS[k] = [cur[i * 2], cur[i * 2 + 1]]; });
}

const KNOCKOUT_KEYS = ROUNDS.flatMap(nodesOf);
const matchLabel = (k) => (k === "FINAL" ? "FINAL" : `${k.split("_")[0]} · M${k.split("_")[1]}`);

const AWARD_FIELDS = [
  { key: "goldenBoot", label: "Golden Boot", sub: "Top scorer of the tournament", Icon: Target, color: "amber" },
  { key: "goldenBall", label: "Golden Ball", sub: "Best overall player", Icon: Star, color: "amber" },
  { key: "goldenGlove", label: "Golden Glove", sub: "Best goalkeeper", Icon: Hand, color: "amber" },
  { key: "youngPoty", label: "Young Player of the Tournament", sub: "Best player under 21", Icon: Sparkles, color: "emerald" },
  { key: "darkHorse", label: "Dark Horse", sub: "Surprise team to watch", Icon: Flame, color: "emerald" },
  { key: "flopPlayer", label: "Biggest Flop — Player", sub: "Didn't live up to the hype", Icon: TrendingDown, color: "rose" },
  { key: "flopTeam", label: "Biggest Flop — Team", sub: "Didn't live up to the hype", Icon: ShieldAlert, color: "rose" },
  { key: "mostAssists", label: "Most Assists", sub: "Tournament's top playmaker", Icon: Users, color: "sky" },
];
const COLOR_MAP = {
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  rose: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400" },
  sky: { bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-400" },
};
const TABS = [
  { key: "groups", label: "Group Stage" },
  { key: "knockout", label: "Knockout Bracket" },
  { key: "awards", label: "Special Awards" },
  { key: "share", label: "Share Hub" },
];

const getInitialGroups = () => Object.fromEntries(GROUP_KEYS.map((g) => [g, [...TEAM_DATA[g]]]));
const getInitialKnockout = () => Object.fromEntries(KNOCKOUT_KEYS.map((k) => [k, null]));
const getInitialWildcards = () => Object.fromEntries(GROUP_KEYS.map((g) => [g, false]));
const getInitialAwards = () => Object.fromEntries(AWARD_FIELDS.map((f) => [f.key, ""]));
const getInitialState = () => ({ groups: getInitialGroups(), knockout: getInitialKnockout(), wildcards: getInitialWildcards(), awards: getInitialAwards() });

function cascadeReset(knockoutObj, startKey) {
  const result = { ...knockoutObj };
  const stack = [...(CHILDREN[startKey] || [])];
  while (stack.length) {
    const k = stack.pop();
    result[k] = null;
    stack.push(...(CHILDREN[k] || []));
  }
  return result;
}

function getSlotTeam(nodeKey, idx, groups, knockout, wildcards) {
  if (nodeKey.startsWith("R32")) {
    const [tag, val] = R32_SEEDS[nodeKey][idx];
    if (tag === "W") {
      const sel = GROUP_KEYS.filter((g) => wildcards[g]);
      const g = sel[val];
      return g ? groups[g][2] : null;
    }
    return groups[tag][val];
  }
  return findTeam(knockout[ADVANCE_SEEDS[nodeKey][idx]]);
}

function getWildcardSlot(group, wildcards) {
  const sel = GROUP_KEYS.filter((g) => wildcards[g]);
  const i = sel.indexOf(group);
  return i === -1 ? null : `R32_${i + 1}`;
}

function MatchCard({ nodeKey, team1, team2, winnerId, onSelect }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/60 overflow-hidden shadow-sm">
      <div className="px-2.5 py-1 bg-slate-900/70 border-b border-slate-700 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{matchLabel(nodeKey)}</span>
        {winnerId && <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">set</span>}
      </div>
      <div className="divide-y divide-slate-700">
        {[team1, team2].map((team, i) => {
          const isWinner = team && winnerId === team.id;
          const isLoser = team && winnerId && winnerId !== team.id;
          return (
            <button
              key={i}
              disabled={!team}
              onClick={() => team && onSelect(nodeKey, team.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left transition-colors
                ${!team ? "cursor-not-allowed" : "cursor-pointer hover:bg-slate-700/60"}
                ${isWinner ? "bg-emerald-500/15" : ""} ${isLoser ? "opacity-40" : ""}`}
            >
              <span className="text-base leading-none w-5 text-center">{team ? team.flag : "•"}</span>
              <span className={`text-sm truncate flex-1 ${team ? "text-slate-100" : "text-slate-600 italic"} ${isWinner ? "font-bold" : "font-medium"}`}>
                {team ? team.name : "TBD"}
              </span>
              {isWinner && <Check size={14} className="text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [bracket, setBracket] = useState(getInitialState);
  const [tab, setTab] = useState("groups");
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [comparison, setComparison] = useState(null);
  const textareaRef = useRef(null);

  const { groups, knockout, wildcards, awards } = bracket;
  const wcCount = Object.values(wildcards).filter(Boolean).length;

  const moveTeam = (group, index, dir) => {
    setBracket((prev) => {
      const arr = [...prev.groups[group]];
      const ni = index + dir;
      if (ni < 0 || ni >= arr.length) return prev;
      [arr[index], arr[ni]] = [arr[ni], arr[index]];
      let nk = { ...prev.knockout };
      GROUP_MATCHES[group].forEach((m) => { nk[m] = null; nk = cascadeReset(nk, m); });
      const wcSlot = getWildcardSlot(group, prev.wildcards);
      if (wcSlot) { nk[wcSlot] = null; nk = cascadeReset(nk, wcSlot); }
      return { ...prev, groups: { ...prev.groups, [group]: arr }, knockout: nk };
    });
  };

  const toggleWildcard = (group) => {
    setBracket((prev) => {
      const checked = prev.wildcards[group];
      if (!checked && Object.values(prev.wildcards).filter(Boolean).length >= 8) return prev;
      let nk = { ...prev.knockout };
      WC_MATCHES.forEach((m) => { nk[m] = null; nk = cascadeReset(nk, m); });
      return { ...prev, wildcards: { ...prev.wildcards, [group]: !checked }, knockout: nk };
    });
  };

  const selectWinner = (nodeKey, teamId) => {
    setBracket((prev) => {
      let nk = cascadeReset({ ...prev.knockout, [nodeKey]: teamId }, nodeKey);
      return { ...prev, knockout: nk };
    });
  };

  const setAward = (key, value) => setBracket((prev) => ({ ...prev, awards: { ...prev.awards, [key]: value } }));

  const handleReset = () => {
    setBracket(getInitialState());
    setComparison(null);
    setImportText("");
    setImportError("");
  };

  const exportCode = useMemo(() => JSON.stringify(bracket), [bracket]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (textareaRef.current) textareaRef.current.select();
    }
  };

  const handleImport = () => {
    try {
      const p = JSON.parse(importText);
      const validGroups = p?.groups && GROUP_KEYS.every((g) => Array.isArray(p.groups[g]) && p.groups[g].length === 4);
      const validKnockout = p?.knockout && KNOCKOUT_KEYS.every((k) => k in p.knockout);
      const validWildcards = p?.wildcards && GROUP_KEYS.every((g) => g in p.wildcards);
      const validAwards = p?.awards && AWARD_FIELDS.every((f) => f.key in p.awards);
      if (!validGroups || !validKnockout || !validWildcards || !validAwards) throw new Error("shape");
      setComparison(p);
      setImportError("");
    } catch {
      setComparison(null);
      setImportError("That code couldn't be read. Double check you copied the full text.");
    }
  };

  const champion = findTeam(knockout.FINAL);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5">
        <header className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <Trophy className="text-amber-400" size={26} />
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-none">World Cup Bracket</h1>
              <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500">2026 · USA · Canada · Mexico · 48 teams · 12 groups</p>
            </div>
          </div>
          <button onClick={handleReset} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 rounded-md px-2.5 py-1.5 transition-colors">
            <RotateCcw size={14} /> Reset
          </button>
        </header>

        <nav className="flex gap-1.5 overflow-x-auto mb-5 border-b border-slate-800 pb-px">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`shrink-0 px-3.5 py-2 text-sm font-semibold rounded-t-md border-b-2 transition-colors ${tab === t.key ? "border-emerald-400 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
              {t.label}
            </button>
          ))}
        </nav>

        {tab === "groups" && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {GROUP_KEYS.map((g) => (
                <div key={g} className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
                  <div className="px-3 py-1.5 bg-slate-900/70 border-b border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Group {g}</span>
                    <span className="text-[10px] font-mono text-emerald-400">top 2 advance</span>
                  </div>
                  <div className="divide-y divide-slate-700/70">
                    {groups[g].map((team, i) => (
                      <div key={team.id} className={`flex items-center gap-2 px-3 py-1.5 border-l-4
                        ${i < 2 ? "border-emerald-500 bg-emerald-500/5" : i === 2 && wildcards[g] ? "border-amber-500 bg-amber-500/5" : "border-slate-700"}`}>
                        <span className="text-[11px] font-mono text-slate-500 w-3">{i + 1}</span>
                        <span className="text-base leading-none">{team.flag}</span>
                        <span className={`text-sm flex-1 truncate font-medium ${i < 2 || (i === 2 && wildcards[g]) ? "text-slate-100" : "text-slate-500"}`}>{team.name}</span>
                        <div className="flex flex-col gap-0.5">
                          <button disabled={i === 0} onClick={() => moveTeam(g, i, -1)} className={`rounded ${i === 0 ? "text-slate-700 cursor-not-allowed" : "text-slate-400 hover:text-emerald-400 hover:bg-slate-700"}`}><ChevronUp size={14} /></button>
                          <button disabled={i === 3} onClick={() => moveTeam(g, i, 1)} className={`rounded ${i === 3 ? "text-slate-700 cursor-not-allowed" : "text-slate-400 hover:text-emerald-400 hover:bg-slate-700"}`}><ChevronDown size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400">Wildcard round — pick the 8 best third-place teams</h3>
                <span className="text-xs font-mono text-slate-400">{wcCount}/8 selected</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                {GROUP_KEYS.map((g) => {
                  const team = groups[g][2];
                  const checked = wildcards[g];
                  const disabled = !checked && wcCount >= 8;
                  return (
                    <label key={g} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-xs ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${checked ? "border-amber-500/50 bg-amber-500/10" : "border-slate-700 bg-slate-800/50"}`}>
                      <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleWildcard(g)} className="accent-amber-500" />
                      <span className="font-mono text-slate-500">{g}3</span>
                      <span className="text-base leading-none">{team.flag}</span>
                      <span className="truncate text-slate-200">{team.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "knockout" && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
              {ROUNDS.map((round, ri) => (
                <div key={round} className={ri === 0 ? "flex flex-col gap-2.5" : ri === ROUNDS.length - 1 ? "h-full flex flex-col justify-center gap-2.5" : "h-full flex flex-col justify-around gap-2.5"}>
                  <h3 className="text-[11px] font-mono uppercase tracking-widest text-slate-500 mb-0.5">{ROUND_LABELS[round]}</h3>
                  {nodesOf(round).map((k) => (
                    <MatchCard key={k} nodeKey={k} team1={getSlotTeam(k, 0, groups, knockout, wildcards)} team2={getSlotTeam(k, 1, groups, knockout, wildcards)} winnerId={knockout[k]} onSelect={selectWinner} />
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-4 flex items-center justify-center gap-3">
              {champion ? (
                <>
                  <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 animate-pulse" /></span>
                  <Trophy className="text-amber-400" size={22} />
                  <span className="text-base sm:text-lg font-bold tracking-tight text-amber-300">{champion.flag} {champion.name} — World Champion</span>
                </>
              ) : (
                <span className="text-sm font-mono uppercase tracking-widest text-slate-600">champion pending final result</span>
              )}
            </div>
          </div>
        )}

        {tab === "awards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AWARD_FIELDS.map(({ key, label, sub, Icon, color }) => {
              const c = COLOR_MAP[color];
              return (
                <div key={key} className={`rounded-lg border ${c.border} ${c.bg} p-3.5`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className={c.text} />
                    <div>
                      <p className="text-sm font-bold text-slate-100 leading-tight">{label}</p>
                      <p className="text-[11px] text-slate-500 leading-tight">{sub}</p>
                    </div>
                  </div>
                  <input type="text" value={awards[key]} onChange={(e) => setAward(key, e.target.value)} placeholder="Type your pick…" className="w-full bg-slate-900/70 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 focus:border-emerald-500/60" />
                </div>
              );
            })}
          </div>
        )}

        {tab === "share" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex items-center gap-2 mb-1"><Download size={16} className="text-emerald-400" /><h3 className="text-sm font-bold text-slate-100">Export your bracket</h3></div>
              <p className="text-xs text-slate-500 mb-3">Copy this code and send it to a friend so they can load your picks.</p>
              <textarea ref={textareaRef} readOnly value={exportCode} rows={6} className="w-full bg-slate-900/70 border border-slate-700 rounded-md px-3 py-2 text-[11px] font-mono text-slate-400 resize-none focus:outline-none" />
              <button onClick={handleCopy} className="mt-2 flex items-center gap-1.5 text-xs font-semibold rounded-md px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors">
                {copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy code"}
              </button>
              <p className="text-[11px] text-slate-600 mt-2">Picks live only in this browser tab for this session — nothing is saved automatically, so export a code if you want to keep it.</p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex items-center gap-2 mb-1"><Upload size={16} className="text-sky-400" /><h3 className="text-sm font-bold text-slate-100">Import a friend's bracket</h3></div>
              <p className="text-xs text-slate-500 mb-3">Paste their code below to load a read-only comparison view.</p>
              <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={6} placeholder="Paste bracket code here…" className="w-full bg-slate-900/70 border border-slate-700 rounded-md px-3 py-2 text-[11px] font-mono text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:ring-1 focus:ring-sky-500/60 focus:border-sky-500/60" />
              <button onClick={handleImport} className="mt-2 flex items-center gap-1.5 text-xs font-semibold rounded-md px-3 py-1.5 bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-colors"><Upload size={14} /> Load comparison</button>
              {importError && <p className="flex items-center gap-1.5 text-[11px] text-rose-400 mt-2"><AlertTriangle size={12} /> {importError}</p>}
            </div>

            {comparison && (
              <div className="lg:col-span-2 rounded-lg border border-sky-500/30 bg-sky-500/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-sky-300">Friend's bracket — read only</h3>
                  <button onClick={() => setComparison(null)} className="text-[11px] text-slate-500 hover:text-slate-300">close</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {GROUP_KEYS.map((g) => {
                    const winner = comparison.groups[g][0];
                    return (
                      <div key={g} className="rounded-md bg-slate-900/60 border border-slate-700 px-2.5 py-1.5">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Group {g} winner</p>
                        <p className="text-sm font-medium text-slate-200">{winner.flag} {winner.name}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={16} className="text-amber-400" />
                  <span className="text-sm font-semibold text-slate-200">Champion pick: {findTeam(comparison.knockout.FINAL) ? `${findTeam(comparison.knockout.FINAL).flag} ${findTeam(comparison.knockout.FINAL).name}` : "Not yet decided"}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AWARD_FIELDS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-md px-2.5 py-1.5">
                      <span className="text-[11px] text-slate-500">{label}</span>
                      <span className="text-xs font-medium text-slate-200 truncate ml-2">{comparison.awards[key] || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
