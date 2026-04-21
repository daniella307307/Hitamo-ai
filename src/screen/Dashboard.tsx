import { useState, JSX } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL       = "#1a7a6e";
const TEAL_DARK  = "#156b5e";
const TEAL_MID   = "#20b2a0";
const TEAL_LIGHT = "#4ecdc4";
const TEAL_BG    = "#e6f7f5";
const TEAL_GLOW  = "rgba(32,178,160,0.20)";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = "Home" | "Analytics" | "Applications" | "Hitamo AI" | "Profile";
interface ChartDataPoint { month: string; applicants: number }

// ─── Mock Data ────────────────────────────────────────────────────────────────

const chartData: ChartDataPoint[] = [
  { month: "Jan", applicants: 25 }, { month: "Feb", applicants: 22 },
  { month: "Mar", applicants: 26 }, { month: "Apr", applicants: 21 },
  { month: "May", applicants: 24 }, { month: "Jun", applicants: 23 },
  { month: "Jul", applicants: 27 }, { month: "Aug", applicants: 22 },
  { month: "Sep", applicants: 25 }, { month: "Oct", applicants: 28 },
  { month: "Nov", applicants: 20 }, { month: "Dec", applicants: 20 },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const HomeIcon         = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
const AnalyticsIcon    = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>;
const ApplicationsIcon = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>;
const AIIcon           = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const ProfileIcon      = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const SearchIcon       = () => <svg width="17" height="17" fill="none" stroke="#9aa0a6" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>;
const BellIcon         = () => <svg width="17" height="17" fill="none" stroke="#9aa0a6" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const DotsIcon         = () => <svg width="16" height="16" fill="#c0c7cc" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
const SparkIcon        = () => <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;
const TrendFlatIcon    = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>;

// ─── Gauge ────────────────────────────────────────────────────────────────────

const Gauge = ({ value, max = 100 }: { value: number; max?: number }) => {
  const pct   = Math.min(value / max, 1);
  const r = 52; const cx = 70; const cy = 68;
  const sx = cx - r; const sy = cy;
  const fx = cx + r * Math.cos(Math.PI - pct * Math.PI);
  const fy = cy - r * Math.sin(pct * Math.PI);
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const angle = Math.PI - (i / 10) * Math.PI;
    const ir = 42; const or = 48;
    return { x1: cx + or * Math.cos(angle), y1: cy - or * Math.sin(angle), x2: cx + ir * Math.cos(angle), y2: cy - ir * Math.sin(angle), active: i / 10 <= pct };
  });
  return (
    <svg width="140" height="82" viewBox="0 0 140 82">
      <defs>
        <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={TEAL_LIGHT}/><stop offset="100%" stopColor={TEAL}/>
        </linearGradient>
      </defs>
      <path d={`M ${sx} ${sy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#edf0f0" strokeWidth="10" strokeLinecap="round"/>
      {pct > 0 && <path d={`M ${sx} ${sy} A ${r} ${r} 0 0 1 ${fx} ${fy}`} fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round"/>}
      {ticks.map((t, i) => <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.active ? TEAL_MID : "#e0e5e5"} strokeWidth="1.5" strokeLinecap="round"/>)}
      {pct > 0 && <circle cx={fx} cy={fy} r="5" fill={TEAL} stroke="white" strokeWidth="2"/>}
      <text x="70" y="58" textAnchor="middle" fontSize="24" fontWeight="700" fill="#202124" fontFamily="'DM Sans',sans-serif">{value}</text>
      <text x="70" y="72" textAnchor="middle" fontSize="10" fill="#9aa0a6" fontFamily="'DM Sans',sans-serif">/ {max}</text>
    </svg>
  );
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: TEAL, color: "#fff", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, boxShadow: `0 8px 24px ${TEAL_GLOW}`, textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 800 }}>{payload[0].value}</div>
      <div style={{ fontSize: 11, opacity: 0.75 }}>{label}</div>
    </div>
  );
};

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS: { name: NavItem; icon: JSX.Element; link: string }[] = [
  { name: "Home",          icon: <HomeIcon />,          link: "/dashboard" },
  { name: "Analytics",    icon: <AnalyticsIcon />,    link: "/analytics" },
  { name: "Applications", icon: <ApplicationsIcon />, link: "/applications" },
  { name: "Hitamo AI",    icon: <AIIcon />,            link: "/ai" },
  { name: "Profile",      icon: <ProfileIcon />,       link: "/profile" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState<NavItem>("Home");
  const [ongoingCount]            = useState(0);
  const [totalApplicants]         = useState(0);
  const chartTotal                = chartData.reduce((s, d) => s + d.applicants, 0);

  return (
    <div style={{ display: "flex", height: "100vh", background: TEAL, fontFamily: "'DM Sans','Segoe UI',sans-serif", overflow: "hidden", borderRadius: 30 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.97)}      to{opacity:1;transform:scale(1)}      }
        .fade-up  { animation: fadeUp  0.38s ease both; }
        .scale-in { animation: scaleIn 0.32s ease both; }
        .nav-btn:hover     { background:rgba(255,255,255,0.12) !important; }
        .stat-hover:hover  { transform:translateY(-2px) !important; box-shadow:0 8px 28px rgba(0,0,0,0.09) !important; }
        .cta-btn:hover     { background:${TEAL_DARK} !important; }
        .details-btn:hover { background:#d0eeeb !important; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: 220, flexShrink: 0, background: TEAL, display: "flex", flexDirection: "column", padding: "32px 0", color: "#fff", borderRadius: "30px 0 0 30px" }}>
        <div style={{ fontSize: 18, fontWeight: 800, padding: "0 24px 24px", marginBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.18)", letterSpacing: "-0.3px" }}>
          H- <span style={{ fontWeight: 400, opacity: 0.7 }}>Hitamo AI</span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 12px", flex: 1 }}>
          {NAV_ITEMS.map(({ name, icon }) => (
            <button key={name} className="nav-btn" onClick={() => setActiveNav(name)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, cursor: "pointer",
              background: activeNav === name ? "#fff" : "transparent",
              color: activeNav === name ? TEAL_DARK : "rgba(255,255,255,0.82)",
              fontWeight: activeNav === name ? 700 : 500, fontSize: 14,
              border: "none", width: "100%", textAlign: "left", transition: "all 0.15s ease", fontFamily: "inherit",
            }}>{icon}{name}</button>
          ))}
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, background: "#f7f9f9", borderRadius: "0 30px 30px 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{ background: "#fff", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#202124", margin: 0 }}>Dashboard</h1>
            <p style={{ fontSize: 12, color: "#9aa0a6", margin: "2px 0 0" }}>Your hiring overview at a glance</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f1f3f4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><SearchIcon /></div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f1f3f4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              <BellIcon />
              <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#e53935", border: "1.5px solid #fff" }} />
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>DA</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* ── TOP ROW ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 16, alignItems: "start" }}>

            {/* Stat: Ongoing */}
            <div className="stat-hover fade-up" style={{ background: TEAL_BG, borderRadius: 18, padding: "20px 22px", transition: "transform 0.2s,box-shadow 0.2s", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", animationDelay: "0s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEAL_DARK, textTransform: "uppercase", letterSpacing: "0.4px" }}>Ongoing Processes</span>
                <button style={{ background: "none", border: "none", cursor: "pointer", padding: 3, display: "flex" }}><DotsIcon /></button>
              </div>
              <div style={{ fontSize: 52, fontWeight: 300, color: "#202124", lineHeight: 1, marginBottom: 10 }}>{ongoingCount}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#9aa0a6", fontSize: 11, fontWeight: 500 }}>
                <TrendFlatIcon /> No active processes yet
              </div>
            </div>

            {/* Stat: Total Applicants */}
            <div className="stat-hover fade-up" style={{ background: `linear-gradient(135deg,${TEAL} 0%,${TEAL_MID} 100%)`, borderRadius: 18, padding: "20px 22px", transition: "transform 0.2s,box-shadow 0.2s", boxShadow: `0 8px 28px ${TEAL_GLOW}`, animationDelay: "0.07s", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -24, right: -24, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              <div style={{ position: "absolute", bottom: -16, right: 24, width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.4px" }}>Total Applicants</span>
                <button style={{ background: "none", border: "none", cursor: "pointer", padding: 3, display: "flex" }}>
                  <svg width="16" height="16" fill="rgba(255,255,255,0.55)" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </button>
              </div>
              <div style={{ fontSize: 52, fontWeight: 300, color: "#fff", lineHeight: 1, marginBottom: 10 }}>{totalApplicants}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Across all processes</div>
            </div>

            {/* CTA */}
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 14, background: "#fff", borderRadius: 18, padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", maxWidth: 210, animationDelay: "0.14s" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${TEAL},${TEAL_LIGHT})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${TEAL_GLOW}` }}>
                <SparkIcon />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#202124", marginBottom: 5 }}>Ready to hire?</div>
                <p style={{ fontSize: 12, color: "#9aa0a6", lineHeight: 1.6, margin: 0 }}>Start a new application process and find your next great hire.</p>
              </div>
              <button className="cta-btn" onClick={()=> navigation.navigate('/hire')} style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 10, padding: "12px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s"}}>
                + Start new Process
              </button>
            </div>
          </div>

          {/* ── BOTTOM ROW ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>

            {/* Chart */}
            <div className="scale-in" style={{ background: "#fff", borderRadius: 18, padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", animationDelay: "0.18s" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 4 }}>
                <div>
                  <div style={{ fontSize: 36, fontWeight: 300, color: "#202124", lineHeight: 1 }}>{chartTotal}</div>
                  <div style={{ fontSize: 12, color: "#9aa0a6", marginTop: 4 }}>Total applicants tracked so far</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: TEAL_MID }} />
                  <span style={{ fontSize: 11, color: "#9aa0a6", fontWeight: 500 }}>Monthly applicants</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={TEAL_LIGHT} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={TEAL_LIGHT} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#c0c7cc", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#c0c7cc", fontSize: 12 }} domain={[10, 35]} ticks={[10, 20, 30]} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: TEAL_BG, strokeWidth: 24 }} />
                  <Area type="monotone" dataKey="applicants" stroke={TEAL_MID} strokeWidth={2.5} fill="url(#tealGrad)" dot={false} activeDot={{ r: 6, fill: TEAL, stroke: "#fff", strokeWidth: 2.5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Gauge */}
            <div className="scale-in" style={{ background: "#fff", borderRadius: 18, padding: "22px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, minWidth: 196, animationDelay: "0.24s" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#202124", textAlign: "center" }}>Hiring Completion</div>
              <Gauge value={0} max={100} />
              <div style={{ width: "100%", background: "#f7f9f9", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#9aa0a6", marginBottom: 2 }}>Current stage</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEAL_DARK }}>Not started</div>
              </div>
              <button className="details-btn" style={{ background: TEAL_BG, color: TEAL_DARK, border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: "pointer", width: "100%", fontFamily: "inherit", transition: "background 0.15s" }}>
                View Details
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}