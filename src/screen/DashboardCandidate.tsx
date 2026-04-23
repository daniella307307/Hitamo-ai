import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Calendar from "../components/Calendar";
// ── Types ──────────────────────────────────────────────────────────────
interface Application {
  id: number;
  title: string;
  company?: string;
  progress: number;
  variant: "dark" | "bright";
}

interface Task {
  id: number;
  role: string;
  description: string;
  done: boolean;
}

// ── Data ───────────────────────────────────────────────────────────────
const applications: Application[] = [
  { id: 1, title: "Web developer", progress: 70, variant: "dark" },
  { id: 2, title: "Devops Engineer at Irembo", progress: 50, variant: "bright" },
  { id: 3, title: "Devops Engineer at Irembo", progress: 50, variant: "dark" },
];

const initialTasks: Task[] = [
  { id: 1, role: "Web developer", description: "Prepare for the virtual interview", done: false },
  { id: 2, role: "Web developer", description: "Prepare for the virtual interview", done: false },
  { id: 3, role: "Web developer", description: "Prepare for the virtual interview", done: true },
];

// January 2022: Mon-Sun grid, Jan 1 = Saturday → 5 leading empty cells
const DAYS_HEADER = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];
const CAL_OFFSET = 5;
const CAL_DAYS = 31;

// ── Icons ──────────────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
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
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const DotsIcon = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3, cursor: "pointer", padding: 2 }}>
    {[0, 1, 2].map((i) => (
      <span key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.7)", display: "block" }} />
    ))}
  </div>
);

const LogoutIcon      = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>;
// ── Sub-components ─────────────────────────────────────────────────────

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 16px", borderRadius: 50,
        color: active ? "#1a7a6e" : "rgba(255,255,255,0.72)",
        background: active ? "white" : "transparent",
        fontFamily: "inherit", fontSize: 15, fontWeight: active ? 600 : 500,
        border: "none", cursor: "pointer", width: "100%",
        marginBottom: 4, transition: "all 0.18s ease",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function AppCard({ app }: { app: Application }) {
  const bg = app.variant === "bright" ? "#20b2a0" : "#1a7a6e";
  return (
    <div style={{
      flex: 1, borderRadius: 12, 
      background: bg, color: "white", padding: 16, marginBottom: 16,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg, #f97316, #ef4444)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 700, fontSize: 13,
        }}>D</div>
        <DotsIcon />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{app.title}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginBottom: 6 }}>{app.progress}% complete</div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.25)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${app.progress}%`, background: "rgba(255,255,255,0.9)", borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <div style={{
      background: "white", borderRadius: 8, padding: "12px 14px",
      marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between",
      borderLeft: "3px solid #20b2a0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#202124", marginBottom: 2 }}>{task.role}</div>
        <div style={{ fontSize: 12, color: "#9aa0a6" }}>{task.description}</div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
          border: task.done ? "none" : "1.5px solid #e8eaed",
          background: task.done ? "#20b2a0" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {task.done && <CheckIcon />}
      </button>
    </div>
  );
}



// ── Main Dashboard ─────────────────────────────────────────────────────
export default function DashboardCandidate() {
  const [activeNav, setActiveNav] = useState("Home");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggleTask = (id: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const navItems = [
    { label: "Home", icon: <HomeIcon />, link: "/home" },
    { label: "Analytics", icon: <BarIcon />,link:'/analytics' },
    { label: "Hitamo AI", icon: <BotIcon />,link:'/hitamo-ai' },
    { label: "Profile", icon: <UserIcon />,link:'/profile' },
    { label:"Logout", icon:<LogoutIcon/> , link:"/logout"}
  ];
  const {user} = useAuth();
  const initial = user?.email.charAt(0).toUpperCase();

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#e8f0ef",
      minHeight: "100vh",
      display: "flex",
      width:'100vw',
    }}>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      <div style={{
        width: "98vw", minHeight: 680,
        background: "white", borderRadius: 28,
        display: "flex", overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
      }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: 230, flexShrink: 0,
          background: "#1a7a6e",
          display: "flex", flexDirection: "column",
          padding: "32px 20px",
        }}>
          <div style={{ color: "white", fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px", marginBottom: 36, paddingLeft: 8 }}>
            H- <span style={{ opacity: 0.7, fontWeight: 400 }}>Hitamo AI</span>
          </div>
          <nav>
            {navItems.map(({ label, icon, link }) => (
              <NavItem key={label} icon={icon} label={label} active={activeNav === label} onClick={() =>{ setActiveNav(label); navigation.navigate(link)}} />
            ))}
          </nav>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f7f9f9" }}>

          {/* Header */}
          <div style={{
            background: "white", padding: "20px 28px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid #f1f3f4",
          }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#202124", margin: 0 }}>Hello Daniella</h2>
              <p style={{ fontSize: 13, color: "#9aa0a6", marginTop: 1 }}>Today is Monday 20 March 2025</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Search */}
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#f1f3f4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <SearchIcon />
              </div>
              {/* Bell */}
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#f1f3f4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                <BellIcon />
                <div style={{ width: 8, height: 8, background: "#e53935", borderRadius: "50%", position: "absolute", top: 6, right: 6, border: "1.5px solid white" }} />
              </div>
              {/* Avatar */}
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{initial}</div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 260px", gap: "0 24px" }}>

            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Ongoing Applications */}
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#202124", marginBottom: 12 }}>Ongoing application</div>
                <div style={{ display: "flex", gap: 12 }}>
                  {applications.map((app) => <AppCard key={app.id} app={app} />)}
                </div>
              </div>

              {/* Tasks + Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                {/* Tasks */}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#202124", marginBottom: 12 }}>Tasks for today</div>
                  {tasks.map((task) => <TaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id)} />)}
                </div>

                {/* Statistics */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#202124" }}>Statistics</div>
                    <a href="#" style={{ fontSize: 11, color: "#20b2a0", textDecoration: "underline" }}>View your probabilities of getting hired</a>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    {[{ num: 2, label: "Ongoing\napplications" }, { num: 5, label: "Completed\nApplications" }].map(({ num, label }) => (
                      <div key={label} style={{ background: "#f1f3f4", borderRadius: 8, padding: 14, textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: "#202124", lineHeight: 1 }}>{num}</div>
                        <div style={{ fontSize: 11, color: "#5f6368", marginTop: 4, lineHeight: 1.3, whiteSpace: "pre-line" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Pro plan */}
                  <div style={{ background: "white", borderRadius: 8, padding: 14, border: "1px solid #e8eaed" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#202124", fontStyle: "italic", marginBottom: 2 }}>$9.99 p/m</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#202124", marginBottom: 3 }}>Pro plan</div>
                    <div style={{ fontSize: 12, color: "#9aa0a6" }}>More features with premium</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right column — Calendar */}
            <div>
              <Calendar/>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}