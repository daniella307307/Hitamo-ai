import { useState, CSSProperties, JSX } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL        = "#1a7a6e";
const TEAL_DARK   = "#156b5e";
const TEAL_MID    = "#20b2a0";
const TEAL_LIGHT  = "#4ecdc4";
const TEAL_BG     = "#e6f7f5";
const TEAL_GLOW   = "rgba(32,178,160,0.18)";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem   = "Home" | "Analytics" | "Applications" | "Hitamo AI" | "Profile";
type TimeRange = "Daily" | "Week" | "Month";

interface StatCard  { label: string; value: string; unit?: string; accent?: boolean; trend?: string; trendUp?: boolean }
interface WatchEntry { id: number; time1: string; time2: string; label1: string; label2: string; total: string }
interface ChartPoint { day: string; hours: number; active?: boolean }

// ─── Mock Data ────────────────────────────────────────────────────────────────

const statCards: StatCard[] = [
  { label: "Applicants",            value: "23",    accent: true,  trend: "+12%", trendUp: true },
  { label: "Active Processes",      value: "2",                    trend: "0%",   trendUp: false },
  { label: "Avg. Response Time",    value: "2:57",  unit: "hrs",   trend: "-8%",  trendUp: true },
  { label: "Success Rate",          value: "33.9",  unit: "%",     trend: "+5%",  trendUp: true },
];

const chartData: ChartPoint[] = [
  { day: "MON", hours: 5 },
  { day: "TUE", hours: 7 },
  { day: "WED", hours: 6 },
  { day: "THU", hours: 12, active: true },
  { day: "FRI", hours: 5 },
  { day: "SAT", hours: 8 },
  { day: "SUN", hours: 9 },
];

const watchEntries: WatchEntry[] = [
  { id: 1, time1: "3:47", time2: "1:23", label1: "Web Developer @ Andela — Technical Interview", label2: "DevOps Engineer @ Irembo — Portfolio Review", total: "6:48" },
  { id: 2, time1: "2:15", time2: "0:58", label1: "Full-Stack Role @ MTN — Code Assessment",       label2: "Backend Engineer @ Equity — HR Screen",     total: "3:13" },
  { id: 3, time1: "1:30", time2: "1:05", label1: "React Developer @ Spark — System Design",       label2: "Cloud Eng @ Rwandair — Final Round",         total: "2:35" },
];

const calDays  = ["SEN","SEL","RAB","KAM","JUM","SAB","MIN"];
const padded: (number|null)[] = [null,null,null,null,null,...Array.from({length:31},(_,i)=>i+1)];

// ─── Icons ────────────────────────────────────────────────────────────────────

const HomeIcon        = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
const AnalyticsIcon   = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>;
const ApplicationsIcon= () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>;
const AIIcon          = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const ProfileIcon     = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const SearchIcon      = () => <svg width="17" height="17" fill="none" stroke="#9aa0a6" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>;
const BellIcon        = () => <svg width="17" height="17" fill="none" stroke="#9aa0a6" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const ChevronLeft     = () => <svg width="13" height="13" fill="none" stroke="#9aa0a6" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>;
const ChevronRight    = () => <svg width="13" height="13" fill="none" stroke="#9aa0a6" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>;
const ArrowUpIcon     = () => <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>;
const ArrowDownIcon   = () => <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>;
const ClockIcon       = () => <svg width="14" height="14" fill="none" stroke={TEAL_MID} strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>;

const AppBadge = ({ color, letter }: { color: string; letter: string }) => (
  <div style={{ width: 38, height: 38, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 800, color: "#fff", fontSize: 15, boxShadow: `0 4px 12px ${color}55` }}>
    {letter}
  </div>
);

const BADGE_COLORS = ["#1a7a6e", "#f97316", "#6366f1"];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipProps { active?: boolean; payload?: { value: number }[]; label?: string }
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: TEAL, color: "#fff", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, boxShadow: "0 8px 24px rgba(26,122,110,0.35)", textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 800 }}>{payload[0].value}h</div>
      <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 500 }}>{label}</div>
    </div>
  );
};

// ─── Calendar ─────────────────────────────────────────────────────────────────

const Calendar = () => (
  <div style={{ background: "#fff", borderRadius: 16, padding: "18px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", minWidth: 252, flexShrink: 0 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <span style={{ fontWeight: 700, fontSize: 13, color: "#202124" }}>Januari 2022</span>
      <div style={{ display: "flex", gap: 4 }}>
        {[<ChevronLeft key="l"/>, <ChevronRight key="r"/>].map((icon, i) => (
          <button key={i} style={{ background: "#f7f9f9", border: "none", cursor: "pointer", display: "flex", width: 24, height: 24, alignItems: "center", justifyContent: "center", borderRadius: 6 }}>{icon}</button>
        ))}
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, marginBottom: 4 }}>
      {calDays.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#c0c7cc", fontWeight: 700, padding: "2px 0", letterSpacing: "0.3px" }}>{d}</div>)}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 }}>
      {padded.map((date, i) => (
        <div key={i} style={{
          textAlign: "center", fontSize: 12, borderRadius: "50%",
          width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
          cursor: date ? "pointer" : "default",
          background: date === 1 ? TEAL_MID : "transparent",
          color: date === 1 ? "#fff" : date ? "#3c4043" : "transparent",
          fontWeight: date === 1 ? 700 : 400,
        }}>
          {date ?? ""}
        </div>
      ))}
    </div>
  </div>
);

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS: { name: NavItem; icon: JSX.Element; link: string }[] = [
  { name: "Home",         icon: <HomeIcon />, link: "/home" },
  { name: "Analytics",   icon: <AnalyticsIcon />, link: "/analytics" },
  { name: "Applications",icon: <ApplicationsIcon />, link: "/applications" },
  { name: "Hitamo AI",   icon: <AIIcon />, link: "/hitamo-ai" },
  { name: "Profile",     icon: <ProfileIcon />, link: "/profile" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [activeNav,  setActiveNav]  = useState<NavItem>("Analytics");
  const [timeRange,  setTimeRange]  = useState<TimeRange>("Daily");

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: TEAL,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      overflow: "hidden", borderRadius: 30,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        .card-anim { animation: fadeUp 0.4s ease both; }
        .scale-anim { animation: scaleIn 0.35s ease both; }
        .nav-btn:hover { background: rgba(255,255,255,0.12) !important; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.10) !important; }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .entry-row:hover { background: #f0faf9 !important; }
        .entry-row { transition: background 0.15s ease; }
        .range-btn:hover { background: #f0f0f0 !important; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: TEAL,
        display: "flex", flexDirection: "column",
        padding: "32px 0", color: "#fff",
        borderRadius: "30px 0 0 30px",
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, padding: "0 24px 24px", marginBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.18)", letterSpacing: "-0.3px" }}>
          H- <span style={{ fontWeight: 400, opacity: 0.7 }}>Hitamo AI</span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 12px", flex: 1 }}>
          {NAV_ITEMS.map(({ name, icon, link }) => (
            <button
              key={name}
              className="nav-btn"
              onClick={() =>{ setActiveNav(name); navigation.navigate(link); }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px", borderRadius: 12, cursor: "pointer",
                background: activeNav === name ? "#fff" : "transparent",
                color: activeNav === name ? TEAL_DARK : "rgba(255,255,255,0.82)",
                fontWeight: activeNav === name ? 700 : 500, fontSize: 14,
                border: "none", width: "100%", textAlign: "left",
                transition: "all 0.15s ease", fontFamily: "inherit",
              }}>
              {icon}{name}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <main style={{
        flex: 1, background: "#f7f9f9",
        borderRadius: "0 30px 30px 0",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>

        {/* Topbar */}
        <div style={{
          background: "#fff", padding: "18px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid #f0f0f0",
        }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#202124", margin: 0 }}>Analytics</h1>
            <p style={{ fontSize: 12, color: "#9aa0a6", margin: "2px 0 0" }}>Track your job search performance</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f1f3f4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><SearchIcon /></div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f1f3f4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              <BellIcon />
              <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#e53935", border: "1.5px solid #fff" }} />
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, #f97316, #ef4444)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>DA</div>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* ── ROW 1: Stat cards + Calendar ── */}
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>

            {/* Stat cards */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, color: "#9aa0a6", fontWeight: 500, textAlign: "right" }}>
                Welcome back, <strong style={{ color: "#202124", fontWeight: 700 }}>Daniella</strong>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {statCards.map((card, i) => (
                  <div
                    key={card.label}
                    className="stat-card card-anim"
                    style={{
                      background: card.accent ? `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_MID} 100%)` : "#fff",
                      border: card.accent ? "none" : "1.5px solid #ebebeb",
                      borderRadius: 16, padding: "18px 16px",
                      display: "flex", flexDirection: "column", gap: 8,
                      boxShadow: card.accent ? `0 8px 28px ${TEAL_GLOW}` : "0 1px 6px rgba(0,0,0,0.05)",
                      animationDelay: `${i * 0.07}s`,
                      position: "relative", overflow: "hidden",
                    }}>
                    {/* Subtle circle decoration on accent card */}
                    {card.accent && (
                      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                    )}
                    <span style={{ fontSize: 11, fontWeight: 700, color: card.accent ? "rgba(255,255,255,0.75)" : "#9aa0a6", letterSpacing: "0.4px", textTransform: "uppercase" }}>
                      {card.label}
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontSize: 30, fontWeight: 300, color: card.accent ? "#fff" : "#202124", lineHeight: 1 }}>
                        {card.value}
                      </span>
                      {card.unit && <span style={{ fontSize: 12, color: card.accent ? "rgba(255,255,255,0.65)" : "#aaa" }}>{card.unit}</span>}
                    </div>
                    {card.trend && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ color: card.trendUp ? (card.accent ? "rgba(255,255,255,0.9)" : "#16a34a") : "#dc2626", display: "flex", alignItems: "center" }}>
                          {card.trendUp ? <ArrowUpIcon /> : <ArrowDownIcon />}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: card.trendUp ? (card.accent ? "rgba(255,255,255,0.85)" : "#16a34a") : "#dc2626" }}>
                          {card.trend}
                        </span>
                        <span style={{ fontSize: 11, color: card.accent ? "rgba(255,255,255,0.5)" : "#c0c7cc" }}>vs last week</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <Calendar />
          </div>

          {/* ── ROW 2: Chart ── */}
          <div className="scale-anim" style={{ background: "#fff", borderRadius: 20, padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", animationDelay: "0.2s" }}>

            {/* Chart header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#202124" }}>Activity Overview</div>
                <div style={{ fontSize: 12, color: "#9aa0a6", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                  <ClockIcon /> Total watch time this week
                </div>
              </div>
              <div style={{ display: "flex", gap: 3, background: "#f1f3f4", borderRadius: 10, padding: 3 }}>
                {(["Daily", "Week", "Month"] as TimeRange[]).map((r) => (
                  <button
                    key={r}
                    className="range-btn"
                    onClick={() => setTimeRange(r)}
                    style={{
                      background: timeRange === r ? "#fff" : "transparent",
                      color: timeRange === r ? "#202124" : "#9aa0a6",
                      border: "none", borderRadius: 8,
                      padding: "5px 14px", fontSize: 12, fontWeight: 600,
                      cursor: "pointer", transition: "all 0.15s",
                      fontFamily: "inherit",
                      boxShadow: timeRange === r ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                    }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={TEAL_LIGHT} stopOpacity={0.45} />
                    <stop offset="95%" stopColor={TEAL_LIGHT} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="day" axisLine={false} tickLine={false}
                  tick={({ x, y, payload }) => {
                    const isActive = payload.value === "THU";
                    return (
                      <g transform={`translate(${x},${y})`}>
                        {isActive && <rect x="-20" y="4" width="40" height="22" rx="7" fill={TEAL_MID} />}
                        <text x="0" y="18" textAnchor="middle"
                          fill={isActive ? "#fff" : "#c0c7cc"}
                          fontSize={12} fontWeight={isActive ? 700 : 500}
                          fontFamily="'DM Sans', sans-serif">
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#d0d5d4", fontSize: 11 }} domain={[0, 14]} ticks={[0, 6, 12]} tickFormatter={(v) => `${v}h`} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <ReferenceLine x="THU" stroke={TEAL_LIGHT} strokeWidth={32} strokeOpacity={0.15} />
                <Area type="monotone" dataKey="hours"
                  stroke={TEAL_MID} strokeWidth={2.5}
                  fill="url(#tealGrad)" dot={false}
                  activeDot={{ r: 6, fill: TEAL, stroke: "#fff", strokeWidth: 2.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ── ROW 3: Activity list ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            {/* List header */}
            <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #f1f3f4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#202124" }}>Recent Activity</div>
              <span style={{ fontSize: 11, color: TEAL_MID, fontWeight: 600, cursor: "pointer" }}>View all →</span>
            </div>

            {watchEntries.map((entry, i) => (
              <div
                key={entry.id}
                className="entry-row"
                style={{
                  padding: "14px 20px",
                  display: "flex", alignItems: "center", gap: 14,
                  borderBottom: i < watchEntries.length - 1 ? "1px solid #f7f9f9" : "none",
                  background: "#fff",
                }}>
                <AppBadge color={BADGE_COLORS[i % BADGE_COLORS.length]} letter={String.fromCharCode(65 + i)} />

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                  {/* Row 1 */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      background: TEAL_BG, color: TEAL_DARK,
                      borderRadius: 6, padding: "2px 8px",
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>{entry.time1}</span>
                    <span style={{ fontSize: 12, color: "#5f6368", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 300 }}>{entry.label1}</span>
                  </div>
                  {/* Row 2 */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      background: "#f1f3f4", color: "#9aa0a6",
                      borderRadius: 6, padding: "2px 8px",
                      fontSize: 12, fontWeight: 600, flexShrink: 0,
                    }}>{entry.time2}</span>
                    <span style={{ fontSize: 12, color: "#9aa0a6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 300 }}>{entry.label2}</span>
                  </div>
                </div>

                {/* Total */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 300, color: "#202124", lineHeight: 1 }}>{entry.total}</div>
                  <div style={{ fontSize: 11, color: "#c0c7cc", marginTop: 2 }}>hrs total</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}