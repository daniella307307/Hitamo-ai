import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../service/auth";
import { profileService, TalentProfile } from "../service/profile";

// ── Helpers ────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getDuration(start: string, end: string | null, isCurrent: boolean) {
  const s = new Date(start);
  const e = isCurrent ? new Date() : new Date(end!);
  const months =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  return [yrs > 0 ? `${yrs}y` : "", mos > 0 ? `${mos}m` : ""]
    .filter(Boolean)
    .join(" ");
}

const LEVEL_WIDTH: Record<string, string> = {
  beginner: "25%",
  intermediate: "50%",
  advanced: "75%",
  expert: "100%",
};
const LEVEL_COLOR: Record<string, string> = {
  beginner: "#94d4cc",
  intermediate: "#3fc9b7",
  advanced: "#20b2a0",
  expert: "#1a7a6e",
};

// ── Icons ──────────────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const BarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const BotIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="9" cy="10" r="1.5" fill="currentColor" />
    <circle cx="15" cy="10" r="1.5" fill="currentColor" />
    <path d="M8 15s1 2 4 2 4-2 4-2" />
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const LinkedinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const GraduationIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const LockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// ── Sub-components ─────────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 16px", borderRadius: 50,
        color: active ? "#1a7a6e" : "rgba(255,255,255,0.72)",
        background: active ? "white" : "transparent",
        fontFamily: "inherit", fontSize: 15, fontWeight: active ? 600 : 500,
        border: "none", cursor: "pointer", width: "100%", marginBottom: 4,
        transition: "all 0.18s ease",
      }}
    >
      {icon}{label}
    </button>
  );
}

function SectionCard({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ color: "#20b2a0" }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#202124" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Pill({ label, teal }: { label: string; teal?: boolean }) {
  return (
    <span style={{
      display: "inline-block", padding: "4px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: teal ? "#e6f7f5" : "#f1f3f4",
      color: teal ? "#1a7a6e" : "#5f6368",
    }}>{label}</span>
  );
}

function CompletionRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e8f5f3" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke="#20b2a0" strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#202124", lineHeight: 1 }}>{score}%</span>
      </div>
    </div>
  );
}

function Skeleton({ width, height, radius = 6 }: { width: string | number; height: number; radius?: number }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

function PrivateProfilePlaceholder() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", gap: 14, textAlign: "center" }}>
      <LockIcon />
      <div style={{ fontSize: 16, fontWeight: 700, color: "#202124" }}>Profile is private</div>
      <div style={{ fontSize: 13, color: "#9aa0a6", maxWidth: 300 }}>
        This candidate has set their profile to private. Only public profiles are visible to recruiters.
      </div>
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────────────
interface ProfilePageProps {
  /**
   * "candidate" → My profile (GET /profile/me) with edit access.
   * "recruiter" → Public read-only view (GET /profile/:userId).
   */
  viewMode?: "candidate" | "recruiter";
  /** Required when viewMode === "recruiter" */
  userId?: string;
}

// ── Main Component ─────────────────────────────────────────────────────
export default function Profile({ viewMode = "candidate", userId }: ProfilePageProps) {
  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState("Profile");
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch profile ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data =
          viewMode === "recruiter" && userId
            ? await profileService.getPublicProfile(userId)
            : await profileService.getMyProfile();
        if (!cancelled) setProfile(data);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to load profile. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, [viewMode, userId]);

  // ── Logout ─────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      // Always redirect even if logout API fails
      navigate("/login");
    }
  };

  // ── Nav ────────────────────────────────────────────────────────────
  const navItems = [
    { label: "Home",      icon: <HomeIcon />, link: "/home" },
    { label: "Analytics", icon: <BarIcon />,  link: "/analytics" },
    { label: "Hitamo AI", icon: <BotIcon />,  link: "/hitamo-ai" },
    { label: "Profile",   icon: <UserIcon />, link: "/profile" },
  ];

  const getAvailStyle = (status: TalentProfile["availabilityStatus"]) => ({
    color:  status === "available" ? "#16a34a" : status === "open" ? "#d97706" : "#dc2626",
    bg:     status === "available" ? "#dcfce7" : status === "open" ? "#fef3c7" : "#fee2e2",
    label:  status === "available" ? "Available" : status === "open" ? "Open to offers" : "Not available",
  });

  const getInitial = (p: TalentProfile) =>
    (p.headline?.[0] ?? p.userId?.[0] ?? "?").toUpperCase();

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#e8f0ef", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .profile-content { animation: fadeIn 0.35s ease; }
        .nav-item-btn:hover { background: rgba(255,255,255,0.12) !important; }
        .action-btn:hover { opacity: 0.85; }
        .icon-btn:hover { background: #e8eaed !important; }
      `}</style>

      <div style={{ width: "100vw", minHeight: 680, background: "white", borderRadius: 28, display: "flex", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: 230, flexShrink: 0, background: "#1a7a6e", display: "flex", flexDirection: "column", padding: "32px 20px" }}>
          <div style={{ color: "white", fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px", marginBottom: 36, paddingLeft: 8 }}>
            H- <span style={{ opacity: 0.7, fontWeight: 400 }}>Hitamo AI</span>
          </div>
          <nav>
            {navItems.map(({ label, icon, link }) => (
              <NavItem
                key={label}
                icon={icon}
                label={label}
                active={activeNav === label}
                onClick={() => { setActiveNav(label); navigate(link); }}
              />
            ))}
          </nav>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f7f9f9" }}>

          {/* Top bar */}
          <div style={{ background: "white", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f3f4" }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#202124", margin: 0 }}>
                {viewMode === "recruiter" ? "Candidate Profile" : "My Profile"}
              </h2>
              <p style={{ fontSize: 13, color: "#9aa0a6", marginTop: 1 }}>
                {viewMode === "recruiter" ? "Viewing public profile" : "Manage your professional profile"}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="icon-btn" style={{ width: 38, height: 38, borderRadius: "50%", background: "#f1f3f4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s" }}>
                <SearchIcon />
              </div>
              <div className="icon-btn" style={{ width: 38, height: 38, borderRadius: "50%", background: "#f1f3f4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", transition: "background 0.15s" }}>
                <BellIcon />
                <div style={{ width: 8, height: 8, background: "#e53935", borderRadius: "50%", position: "absolute", top: 6, right: 6, border: "1.5px solid white" }} />
              </div>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {profile ? getInitial(profile) : "?"}
              </div>
            </div>
          </div>

          {/* Scroll area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* ── LOADING ── */}
            {loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ height: 72, background: "linear-gradient(135deg, #e0e0e0 0%, #ececec 100%)" }} />
                  <div style={{ padding: "16px 22px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <Skeleton width={64} height={64} radius={50} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, paddingTop: 4 }}>
                        <Skeleton width="40%" height={16} />
                        <Skeleton width="60%" height={12} />
                        <Skeleton width="30%" height={12} />
                      </div>
                    </div>
                    <Skeleton width="80%" height={12} />
                    <Skeleton width="65%" height={12} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[1, 2].map(n => (
                    <div key={n} style={{ background: "white", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 12 }}>
                      <Skeleton width="40%" height={14} />
                      {[1,2,3].map(i => <Skeleton key={i} width="100%" height={10} />)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ERROR ── */}
            {!loading && error && (
              <div style={{ background: "white", borderRadius: 14, padding: "32px 24px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#202124", marginBottom: 6 }}>Could not load profile</div>
                <div style={{ fontSize: 13, color: "#9aa0a6", marginBottom: 20 }}>{error}</div>
                <button onClick={() => window.location.reload()} style={{ padding: "8px 20px", borderRadius: 8, background: "#1a7a6e", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Retry
                </button>
              </div>
            )}

            {/* ── PRIVATE (recruiter view) ── */}
            {!loading && !error && profile && viewMode === "recruiter" && !profile.isPublic && (
              <div style={{ background: "white", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <PrivateProfilePlaceholder />
              </div>
            )}

            {/* ── PROFILE CONTENT ── */}
            {!loading && !error && profile && (viewMode === "candidate" || profile.isPublic) && (() => {
              const avail = getAvailStyle(profile.availabilityStatus);
              const initial = getInitial(profile);

              return (
                <div className="profile-content" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Hero card */}
                  <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <div style={{ height: 72, background: "linear-gradient(135deg, #1a7a6e 0%, #20b2a0 100%)" }} />
                    <div style={{ padding: "0 22px 20px", marginTop: -28 }}>
                      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
                        {/* Avatar */}
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ef4444)", border: "3px solid white", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 22 }}>
                          {initial}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: 8, paddingBottom: 4, flexWrap: "wrap" }}>
                          {profile.linkedinUrl && (
                            <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ width: 32, height: 32, borderRadius: 8, background: "#e8f5f3", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a7a6e", textDecoration: "none" }}>
                              <LinkedinIcon />
                            </a>
                          )}
                          {profile.githubUrl && (
                            <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ width: 32, height: 32, borderRadius: 8, background: "#e8f5f3", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a7a6e", textDecoration: "none" }}>
                              <GithubIcon />
                            </a>
                          )}
                          {profile.resumeUrl && (
                            <a href={profile.resumeUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: "#1a7a6e", color: "white", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                              <DownloadIcon /> Resume
                            </a>
                          )}
                          {viewMode === "candidate" && (
                            <>
                              <button
                                className="action-btn"
                                onClick={() => navigate("/profile/edit")}
                                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: "#e8f5f3", color: "#1a7a6e", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", transition: "opacity 0.15s" }}
                              >
                                <EditIcon /> Edit
                              </button>
                              <button
                                className="action-btn"
                                onClick={handleLogout}
                                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: "#dc3654", color: "white", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", transition: "opacity 0.15s" }}
                              >
                                <LogoutIcon /> Logout
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "#202124", marginBottom: 2 }}>
                            {profile.headline || "No headline set"}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                            {profile.location && (
                              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9aa0a6" }}>
                                <LocationIcon />{profile.location}
                              </span>
                            )}
                            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: avail.bg, color: avail.color }}>
                              {avail.label}
                            </span>
                            {profile.isPublic
                              ? <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#f1f3f4", color: "#5f6368" }}>Public</span>
                              : <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#fee2e2", color: "#dc2626" }}>Private</span>
                            }
                          </div>
                          {profile.bio && (
                            <p style={{ fontSize: 12, color: "#5f6368", marginTop: 10, lineHeight: 1.6, maxWidth: 480 }}>{profile.bio}</p>
                          )}
                        </div>

                        {/* Completion ring + salary */}
                        <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                          {viewMode === "candidate" && (
                            <div style={{ background: "#f7f9f9", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, minWidth: 140 }}>
                              <CompletionRing score={profile.completionScore} />
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#9aa0a6", marginBottom: 2 }}>PROFILE</div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#202124" }}>Completion</div>
                              </div>
                            </div>
                          )}
                          {(profile.expectedSalaryMin > 0 || profile.expectedSalaryMax > 0) && (
                            <div style={{ background: "#f7f9f9", borderRadius: 12, padding: "12px 16px", minWidth: 130 }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: "#9aa0a6", marginBottom: 4 }}>EXPECTED SALARY</div>
                              <div style={{ fontSize: 16, fontWeight: 800, color: "#202124" }}>
                                {profile.expectedSalaryCurrency} {profile.expectedSalaryMin.toLocaleString()}–{profile.expectedSalaryMax.toLocaleString()}
                              </div>
                              <div style={{ fontSize: 11, color: "#9aa0a6" }}>per month</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills + Languages grid */}
                  {(profile.skills.length > 0 || profile.languages.length > 0) && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      {profile.skills.length > 0 && (
                        <SectionCard title="Skills" icon={
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        }>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {profile.skills.map((skill) => (
                              <div key={skill.name}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: "#202124" }}>{skill.name}</span>
                                  <span style={{ fontSize: 11, color: "#9aa0a6" }}>
                                    {skill.yearsOfExperience}y · <span style={{ color: LEVEL_COLOR[skill.level], fontWeight: 600 }}>{skill.level}</span>
                                  </span>
                                </div>
                                <div style={{ height: 5, background: "#f1f3f4", borderRadius: 3, overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: LEVEL_WIDTH[skill.level], background: LEVEL_COLOR[skill.level], borderRadius: 3, transition: "width 0.6s ease" }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </SectionCard>
                      )}

                      {profile.languages.length > 0 && (
                        <SectionCard title="Languages" icon={
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        }>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {profile.languages.map((lang) => (
                              <div key={lang} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "#e6f7f5", border: "1px solid #b2e8e2" }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#20b2a0", display: "inline-block" }} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#1a7a6e" }}>{lang}</span>
                              </div>
                            ))}
                          </div>
                        </SectionCard>
                      )}
                    </div>
                  )}

                  {/* Experience */}
                  {profile.experience.length > 0 && (
                    <SectionCard title="Experience" icon={<BriefcaseIcon />}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {profile.experience.map((exp, i) => (
                          <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < profile.experience.length - 1 ? 20 : 0, position: "relative" }}>
                            {i < profile.experience.length - 1 && (
                              <div style={{ position: "absolute", left: 17, top: 36, bottom: 0, width: 2, background: "#e8eaed" }} />
                            )}
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e6f7f5", border: "2px solid #20b2a0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#20b2a0", zIndex: 1 }}>
                              <BriefcaseIcon />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 2 }}>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: "#202124" }}>{exp.role}</div>
                                  <div style={{ fontSize: 12, color: "#20b2a0", fontWeight: 600 }}>{exp.company}</div>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                  <div style={{ fontSize: 11, color: "#9aa0a6" }}>
                                    {formatDate(exp.startDate)} – {exp.isCurrent ? "Present" : formatDate(exp.endDate!)}
                                  </div>
                                  <div style={{ fontSize: 11, color: "#9aa0a6" }}>
                                    {getDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                                  </div>
                                </div>
                              </div>
                              <div style={{ fontSize: 11, color: "#9aa0a6", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                                <LocationIcon />{exp.location}
                              </div>
                              <p style={{ fontSize: 12, color: "#5f6368", lineHeight: 1.6, marginBottom: 8 }}>{exp.description}</p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {exp.technologies.map((t) => <Pill key={t} label={t} teal />)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {/* Education */}
                  {profile.education.length > 0 && (
                    <SectionCard title="Education" icon={<GraduationIcon />}>
                      {profile.education.map((edu, i) => (
                        <div key={i} style={{ display: "flex", gap: 16, marginBottom: i < profile.education.length - 1 ? 16 : 0 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e6f7f5", border: "2px solid #20b2a0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#20b2a0" }}>
                            <GraduationIcon />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 2 }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#202124" }}>{edu.degree}</div>
                                <div style={{ fontSize: 12, color: "#20b2a0", fontWeight: 600 }}>{edu.institution}</div>
                              </div>
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontSize: 11, color: "#9aa0a6" }}>
                                  {formatDate(edu.startDate)} – {edu.isCurrent ? "Present" : formatDate(edu.endDate!)}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                              <Pill label={edu.fieldOfStudy} />
                              {edu.grade && <Pill label={edu.grade} teal />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </SectionCard>
                  )}

                  {/* Empty state — low completion */}
                  {viewMode === "candidate" && profile.completionScore < 30 && (
                    <div style={{ background: "white", borderRadius: 14, padding: "24px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#e6f7f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <EditIcon />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#202124", marginBottom: 4 }}>Complete your profile</div>
                        <div style={{ fontSize: 12, color: "#9aa0a6" }}>Add your skills, experience and education to increase your visibility to recruiters.</div>
                      </div>
                      <button
                        onClick={() => navigate("/profile/edit")}
                        style={{ marginLeft: "auto", flexShrink: 0, padding: "8px 18px", borderRadius: 8, background: "#1a7a6e", color: "white", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}
                      >
                        Get started
                      </button>
                    </div>
                  )}

                </div>
              );
            })()}

          </div>
        </main>
      </div>
    </div>
  );
}