import { useState, CSSProperties, JSX } from "react";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL       = "#1a8a7a";
const TEAL_DARK  = "#156b5e";
const TEAL_BG    = "#e8f5f3";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = "Home" | "Analytics" | "Applications" | "Hitamo AI" | "Profile";

// ─── Icons ────────────────────────────────────────────────────────────────────

const HomeIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="12" width="4" height="9" rx="1" />
    <rect x="10" y="7" width="4" height="14" rx="1" />
    <rect x="17" y="3" width="4" height="18" rx="1" />
  </svg>
);

const ApplicationsIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M9 7h6M9 11h6M9 15h4" />
  </svg>
);

const AIIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" fill="none" stroke="#999" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" fill="none" stroke="#999" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS: { name: NavItem; icon: JSX.Element; link:string }[] = [
  { name: "Home",          icon: <HomeIcon />, link: "/home" },
  { name: "Analytics",    icon: <AnalyticsIcon />, link: "/analytics" },
  { name: "Applications", icon: <ApplicationsIcon />, link: "/applications" },
  { name: "Hitamo AI",    icon: <AIIcon />, link: "/hitamo-ai" },
  { name: "Profile",      icon: <ProfileIcon />, link: "/profile" },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const shell: CSSProperties = {
  display: "flex",
  height: "100vh",
  background: TEAL,
  fontFamily: "'Segoe UI', sans-serif",
  overflow: "hidden",
  margin: 0,

  boxSizing: "border-box" as const,
};

const sidebar: CSSProperties = {
  width: "20%",
  flexShrink: 0,
  background: TEAL,
  display: "flex",
  flexDirection: "column",
  padding: "32px 0",
  color: "#fff",
  borderRadius: "30px",
};

const logoStyle: CSSProperties = {
  fontSize: "18px",
  fontWeight: 800,
  padding: "0 24px 24px",
  marginBottom: "32px",
  borderBottom: "1px solid rgba(255,255,255,0.2)",
  letterSpacing: "-0.02em",
};

const navList: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "0 12px",
  flex: 1,
};

const navItemStyle = (active: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "11px 14px",
  borderRadius: "12px",
  cursor: "pointer",
  background: active ? "#fff" : "transparent",
  color: active ? TEAL_DARK : "rgba(255,255,255,0.85)",
  fontWeight: active ? 700 : 500,
  fontSize: "15px",
  border: "none",
  width: "100%",
  textAlign: "left",
  transition: "background 0.15s, color 0.15s",
});

const mainStyle: CSSProperties = {
  flex: 1,
  background: "#fff",
  borderRadius: "24px 0 0 24px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  padding: 0,
};

const topbar: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "24px 32px 16px",
  borderBottom: "1px solid #eee",
  background: "#fff",
  borderRadius: "24px 0 0 0",
  flexShrink: 0,
};

const heroSection: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "60px 40px",
  background: "#fff",
  gap: "28px",
};

const heroTitle: CSSProperties = {
  fontSize: "52px",
  fontWeight: 300,
  color: "#c8c8c8",
  textAlign: "center",
  margin: 0,
  letterSpacing: "-0.02em",
  lineHeight: 1.15,
};

const heroSubtitle: CSSProperties = {
  fontSize: "16px",
  color: "#c0c0c0",
  textAlign: "center",
  margin: 0,
  lineHeight: 1.6,
  maxWidth: "520px",
  fontWeight: 400,
};

const ctaButton: CSSProperties = {
  background: TEAL,
  color: "#fff",
  border: "none",
  borderRadius: "14px",
  padding: "20px 80px",
  fontSize: "16px",
  fontWeight: 600,
  cursor: "pointer",
  letterSpacing: "0.01em",
  marginTop: "8px",
  transition: "background 0.2s, transform 0.1s",
  boxShadow: "0 4px 16px rgba(26, 138, 122, 0.25)",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HitamoAIPage() {
  const [activeNav, setActiveNav] = useState<NavItem>("Hitamo AI");
  const [btnHovered, setBtnHovered] = useState<boolean>(false);

  const handleStartProcess = (): void => {
    // Replace with your navigation / action
    toast.success("Starting the hiring process...");
    navigation.navigate("/hire");
  };

  return (
    <div style={shell}>

      {/* ── Sidebar ── */}
      <aside style={sidebar}>
        <div style={logoStyle}>H- Hitamo AI</div>
        <nav style={navList}>
          {NAV_ITEMS.map(({ name, icon,link }) => (
            <button
              key={name}
              style={navItemStyle(activeNav === name)}
              onClick={() => {setActiveNav(name); navigation.navigate(link)}}
            >
              {icon}
              {name}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main ── */}
      <main style={mainStyle}>

        {/* Topbar */}
        <div style={topbar}>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>
            HItamo - AI
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <SearchIcon />
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", position: "relative" }}>
              <BellIcon />
              <span style={{
                position: "absolute", top: "-3px", right: "-3px",
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#e53e3e", border: "1.5px solid #fff",
              }} />
            </button>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: TEAL_BG, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "13px", fontWeight: 700,
              color: TEAL_DARK, cursor: "pointer", overflow: "hidden",
            }}>
              DA
            </div>
          </div>
        </div>

        {/* ── Hero Content ── */}
        <div style={heroSection}>
          <h1 style={heroTitle}>Welcome to Hitamo AI</h1>

          <p style={heroSubtitle}>
            make the whole hiring process simpler and better, we aim to<br />
            make your hiring dreams come true
          </p>

          <button
            style={{
              ...ctaButton,
              background: btnHovered ? TEAL_DARK : TEAL,
              transform: btnHovered ? "translateY(-1px)" : "translateY(0)",
            }}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            onClick={handleStartProcess}
          >
            Start the hiring process
          </button>
        </div>

      </main>
    </div>
  );
}