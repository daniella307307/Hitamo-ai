import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────
interface Skill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  yearsOfExperience: number;
}

interface Experience {
  role: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  location: string;
  technologies: string[];
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  grade: string;
}

interface ProfileData {
  _id: string;
  userId: string;
  headline: string;
  bio: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  languages: string[];
  availabilityStatus: "available" | "open" | "not_available";
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  expectedSalaryCurrency: string;
  isPublic: boolean;
  completionScore: number;
  createdAt: string;
  updatedAt: string;
}

// ── Mock Data (replace with API response) ─────────────────────────────
const mockProfile: ProfileData = {
  _id: "6643f2a1c8b2d4e5f6a7b890",
  userId: "6643f2a1c8b2d4e5f6a7b890",
  headline: "Senior Full-Stack Engineer | 6 Years Experience",
  bio: "Passionate engineer specializing in building scalable, user-centric web applications. I thrive at the intersection of clean architecture and great UX.",
  location: "Kigali, Rwanda",
  linkedinUrl: "https://linkedin.com/in/alice",
  githubUrl: "https://github.com/alice",
  resumeUrl: "https://cdn.umuravax.com/resumes/alice.pdf",
  skills: [
    { name: "TypeScript", level: "advanced", yearsOfExperience: 4 },
    { name: "React", level: "advanced", yearsOfExperience: 5 },
    { name: "Node.js", level: "advanced", yearsOfExperience: 4 },
    { name: "PostgreSQL", level: "intermediate", yearsOfExperience: 3 },
    { name: "Docker", level: "intermediate", yearsOfExperience: 2 },
    { name: "GraphQL", level: "intermediate", yearsOfExperience: 2 },
  ],
  experience: [
    {
      role: "Senior Backend Engineer",
      company: "Andela",
      description: "Built scalable microservices handling 1M+ daily requests. Led a team of 4 engineers delivering high-availability APIs.",
      startDate: "2021-01-01",
      endDate: "2023-12-31",
      isCurrent: false,
      location: "Kigali, Rwanda",
      technologies: ["Node.js", "PostgreSQL", "Redis", "AWS"],
    },
    {
      role: "Full-Stack Developer",
      company: "Irembo",
      description: "Developed citizen-facing e-government services used by 500k+ Rwandans.",
      startDate: "2019-03-01",
      endDate: "2020-12-31",
      isCurrent: false,
      location: "Kigali, Rwanda",
      technologies: ["React", "Django", "MySQL"],
    },
  ],
  education: [
    {
      institution: "University of Rwanda",
      degree: "BSc Computer Science",
      fieldOfStudy: "Computer Science",
      startDate: "2016-09-01",
      endDate: "2020-06-01",
      isCurrent: false,
      grade: "First Class Honours",
    },
  ],
  languages: ["English", "Kinyarwanda", "French"],
  availabilityStatus: "available",
  expectedSalaryMin: 2500,
  expectedSalaryMax: 4000,
  expectedSalaryCurrency: "USD",
  isPublic: true,
  completionScore: 85,
  createdAt: "2024-05-15T10:30:00.000Z",
  updatedAt: "2024-05-15T10:30:00.000Z",
};

// ── Helpers ────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getDuration(start: string, end: string | null, isCurrent: boolean) {
  const s = new Date(start);
  const e = isCurrent ? new Date() : new Date(end!);
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  return [yrs > 0 ? `${yrs}y` : "", mos > 0 ? `${mos}m` : ""].filter(Boolean).join(" ");
}

const LEVEL_WIDTH: Record<string, string> = {
  beginner: "25%", intermediate: "50%", advanced: "75%", expert: "100%",
};
const LEVEL_COLOR: Record<string, string> = {
  beginner: "#94d4cc", intermediate: "#3fc9b7", advanced: "#20b2a0", expert: "#1a7a6e",
};

// ── Icons ──────────────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const BarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const BotIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="9" cy="10" r="1.5" fill="currentColor" /><circle cx="15" cy="10" r="1.5" fill="currentColor" />
    <path d="M8 15s1 2 4 2 4-2 4-2" />
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const LinkedinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
);
const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const GraduationIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// ── Nav Item ───────────────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "12px 16px", borderRadius: 50,
      color: active ? "#1a7a6e" : "rgba(255,255,255,0.72)",
      background: active ? "white" : "transparent",
      fontFamily: "inherit", fontSize: 15, fontWeight: active ? 600 : 500,
      border: "none", cursor: "pointer", width: "100%", marginBottom: 4,
      transition: "all 0.18s ease",
    }}>
      {icon}{label}
    </button>
  );
}

// ── Section Card ───────────────────────────────────────────────────────
function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
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

// ── Tag Pill ───────────────────────────────────────────────────────────
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

// ── Completion Ring ────────────────────────────────────────────────────
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
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#202124", lineHeight: 1 }}>{score}%</span>
      </div>
    </div>
  );
}

// ── Main Profile Page ──────────────────────────────────────────────────
export default function Profile() {
  const [activeNav, setActiveNav] = useState("Profile");
  const profile = mockProfile; // swap with real API call

  const navItems = [
    { label: "Home", icon: <HomeIcon />, link: "/home" },
    { label: "Analytics", icon: <BarIcon /> , link:'/analytics'},
    { label: "Hitamo AI", icon: <BotIcon />,link:'/hitamo-ai' },
    { label: "Profile", icon: <UserIcon />, link: "/profile" },
  ];

  const availColor = profile.availabilityStatus === "available" ? "#16a34a" : profile.availabilityStatus === "open" ? "#d97706" : "#dc2626";
  const availBg   = profile.availabilityStatus === "available" ? "#dcfce7" : profile.availabilityStatus === "open" ? "#fef3c7" : "#fee2e2";
  const availLabel = profile.availabilityStatus === "available" ? "Available" : profile.availabilityStatus === "open" ? "Open to offers" : "Not available";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#e8f0ef", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>

      <div style={{ width: "100vw", minHeight: 680, background: "white", borderRadius: 28, display: "flex", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: 230, flexShrink: 0, background: "#1a7a6e", display: "flex", flexDirection: "column", padding: "32px 20px" }}>
          <div style={{ color: "white", fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px", marginBottom: 36, paddingLeft: 8 }}>
            H- <span style={{ opacity: 0.7, fontWeight: 400 }}>Hitamo AI</span>
          </div>
          <nav>{navItems.map(({ label, icon, link }) => <NavItem key={label} icon={icon} label={label} active={activeNav === label} onClick={() => { setActiveNav(label); navigation.navigate(link) }} />)}</nav>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f7f9f9" }}>

          {/* Header */}
          <div style={{ background: "white", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f3f4" }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#202124", margin: 0 }}>My Profile</h2>
              <p style={{ fontSize: 13, color: "#9aa0a6", marginTop: 1 }}>Manage your professional profile</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#f1f3f4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><SearchIcon /></div>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#f1f3f4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                <BellIcon />
                <div style={{ width: 8, height: 8, background: "#e53935", borderRadius: "50%", position: "absolute", top: 6, right: 6, border: "1.5px solid white" }} />
              </div>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>D</div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* ── HERO CARD ── */}
            <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {/* Teal banner */}
              <div style={{ height: 72, background: "linear-gradient(135deg, #1a7a6e 0%, #20b2a0 100%)" }} />
              <div style={{ padding: "0 22px 20px", marginTop: -28 }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
                  {/* Avatar */}
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ef4444)", border: "3px solid white", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 22 }}>D</div>
                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
                    <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ width: 32, height: 32, borderRadius: 8, background: "#e8f5f3", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a7a6e", textDecoration: "none" }}><LinkedinIcon /></a>
                    <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ width: 32, height: 32, borderRadius: 8, background: "#e8f5f3", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a7a6e", textDecoration: "none" }}><GithubIcon /></a>
                    <a href={profile.resumeUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: "#1a7a6e", color: "white", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                      <DownloadIcon /> Resume
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#202124", marginBottom: 2 }}>Daniella</div>
                    <div style={{ fontSize: 13, color: "#5f6368", marginBottom: 6 }}>{profile.headline}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9aa0a6" }}><LocationIcon />{profile.location}</span>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: availBg, color: availColor }}>{availLabel}</span>
                      {profile.isPublic && <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#f1f3f4", color: "#5f6368" }}>Public</span>}
                    </div>
                    <p style={{ fontSize: 12, color: "#5f6368", marginTop: 10, lineHeight: 1.6, maxWidth: 480 }}>{profile.bio}</p>
                  </div>

                  {/* Completion + Salary */}
                  <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                    <div style={{ background: "#f7f9f9", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, minWidth: 140 }}>
                      <CompletionRing score={profile.completionScore} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#9aa0a6", marginBottom: 2 }}>PROFILE</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#202124" }}>Completion</div>
                      </div>
                    </div>
                    <div style={{ background: "#f7f9f9", borderRadius: 12, padding: "12px 16px", minWidth: 130 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#9aa0a6", marginBottom: 4 }}>EXPECTED SALARY</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#202124" }}>
                        {profile.expectedSalaryCurrency} {profile.expectedSalaryMin.toLocaleString()}–{profile.expectedSalaryMax.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: "#9aa0a6" }}>per month</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── TWO COLUMN GRID ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* Skills */}
              <SectionCard title="Skills" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {profile.skills.map((skill) => (
                    <div key={skill.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#202124" }}>{skill.name}</span>
                        <span style={{ fontSize: 11, color: "#9aa0a6" }}>{skill.yearsOfExperience}y · <span style={{ color: LEVEL_COLOR[skill.level], fontWeight: 600 }}>{skill.level}</span></span>
                      </div>
                      <div style={{ height: 5, background: "#f1f3f4", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: LEVEL_WIDTH[skill.level], background: LEVEL_COLOR[skill.level], borderRadius: 3, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Languages */}
              <SectionCard title="Languages" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {profile.languages.map((lang) => (
                    <div key={lang} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "#e6f7f5", border: "1px solid #b2e8e2" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#20b2a0", display: "inline-block" }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1a7a6e" }}>{lang}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* Experience */}
            <SectionCard title="Experience" icon={<BriefcaseIcon />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {profile.experience.map((exp, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < profile.experience.length - 1 ? 20 : 0, position: "relative" }}>
                    {/* Timeline line */}
                    {i < profile.experience.length - 1 && (
                      <div style={{ position: "absolute", left: 17, top: 36, bottom: 0, width: 2, background: "#e8eaed" }} />
                    )}
                    {/* Dot */}
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
                          <div style={{ fontSize: 11, color: "#9aa0a6" }}>{formatDate(exp.startDate)} – {exp.isCurrent ? "Present" : formatDate(exp.endDate!)}</div>
                          <div style={{ fontSize: 11, color: "#9aa0a6" }}>{getDuration(exp.startDate, exp.endDate, exp.isCurrent)}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "#9aa0a6", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><LocationIcon />{exp.location}</div>
                      <p style={{ fontSize: 12, color: "#5f6368", lineHeight: 1.6, marginBottom: 8 }}>{exp.description}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {exp.technologies.map((t) => <Pill key={t} label={t} teal />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Education */}
            <SectionCard title="Education" icon={<GraduationIcon />}>
              {profile.education.map((edu, i) => (
                <div key={i} style={{ display: "flex", gap: 16 }}>
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
                        <div style={{ fontSize: 11, color: "#9aa0a6" }}>{formatDate(edu.startDate)} – {edu.isCurrent ? "Present" : formatDate(edu.endDate!)}</div>
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

          </div>
        </main>
      </div>
    </div>
  );
}