import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { useNavigate } from "react-router-dom";
import { jobService, Job, JobStatus } from "../service/job";

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
const BriefcaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="12" />
    <path d="M2 12h20" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ── Nav ────────────────────────────────────────────────────────────────
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
      {icon}{label}
    </button>
  );
}

// ── Job Card ───────────────────────────────────────────────────────────
function JobCard({ job, onApply }: { job: Job; onApply: (job: Job) => void }) {
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : `${n}`;
    if (job.salaryMin && job.salaryMax)
      return `${job.currency} ${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
    if (job.salaryMin) return `${job.currency} ${fmt(job.salaryMin)}+`;
    return null;
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const typeColors: Record<string, string> = {
    "full-time": "#dcfce7",
    "part-time": "#fef9c3",
    "contract": "#dbeafe",
    "internship": "#f3e8ff",
  };
  const typeText: Record<string, string> = {
    "full-time": "#15803d",
    "part-time": "#854d0e",
    "contract": "#1d4ed8",
    "internship": "#7e22ce",
  };

  const salary = formatSalary();

  return (
    <div style={{
      background: "white", borderRadius: 14, padding: "20px 22px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f3f4",
      display: "flex", flexDirection: "column", gap: 12,
      transition: "box-shadow 0.18s ease, transform 0.18s ease",
      cursor: "default",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(26,122,110,0.12)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          {/* Company avatar */}
          <div style={{
            width: 42, height: 42, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #1a7a6e, #20b2a0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: 16,
          }}>
            {job.title.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#202124", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {job.title}
            </div>
            <div style={{ fontSize: 12, color: "#9aa0a6" }}>
              {job.organizationId ? "Company" : "Organization"}
            </div>
          </div>
        </div>
        {/* Employment type badge */}
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
          background: typeColors[job.employmentType] ?? "#f1f3f4",
          color: typeText[job.employmentType] ?? "#5f6368",
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {job.employmentType.replace("-", " ")}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: "#5f6368", margin: 0, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {job.description}
      </p>

      {/* Skills */}
      {job.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {job.skills.slice(0, 4).map((skill: any) => {
              return (
                  <span key={skill} style={{
                      fontSize: 11, padding: "3px 9px", borderRadius: 20,
                      background: "#e8f5f3", color: "#1a7a6e", fontWeight: 500,
                  }}>{skill}</span>
              );
          })}
          {job.skills.length > 4 && (
            <span style={{ fontSize: 11, color: "#9aa0a6", padding: "3px 0" }}>+{job.skills.length - 4} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #f1f3f4", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9aa0a6" }}>
            <LocationIcon />
            {job.location}{job.isRemote ? " · Remote" : ""}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9aa0a6" }}>
            <ClockIcon />
            {timeAgo(job.createdAt)}
          </span>
          {salary && (
            <span style={{ fontSize: 12, color: "#1a7a6e", fontWeight: 600 }}>{salary}</span>
          )}
        </div>
        <button
          onClick={() => onApply(job)}
          style={{
            padding: "8px 18px", borderRadius: 20,
            background: "#1a7a6e", color: "white",
            border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: "inherit",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#20b2a0")}
          onMouseLeave={e => (e.currentTarget.style.background = "#1a7a6e")}
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function JobsPage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const navItems = [
    { label: "Home", icon: <HomeIcon />, path: "/home" },
    { label: "Jobs", icon: <BriefcaseIcon />, path: "/jobs" },
    { label: "Analytics", icon: <BarIcon />, path: "/analytics" },
    { label: "Hitamo AI", icon: <BotIcon />, path: "/hitamo-ai" },
    { label: "Profile", icon: <UserIcon />, path: "/profile" },
    { label: "Logout", icon: <LogoutIcon />, path: "/logout" },
  ];

  const fetchJobs = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jobService.getJobs({
        page: p,
        limit: 9,
        status: "active" as JobStatus,
        search: search.trim(),
      });
      setJobs(result.items);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message ?? "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs(1);
  };

  const displayed = filterType
    ? jobs.filter(j => j.employmentType === filterType)
    : jobs;

  const handleApply = (job: Job) => {
    navigate(`/jobs/${job._id}/apply`, { state: { job } });
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#e8f0ef",
      minHeight: "100vh",
      display: "flex",
      width: "100vw",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      <div style={{
        width: "98vw", minHeight: 680,
        background: "white", borderRadius: 28,
        display: "flex", overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
      }}>

        {/* Sidebar */}
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
            {navItems.map(({ label, icon, path }) => (
              <NavItem
                key={label} icon={icon} label={label}
                active={activeNav === label}
                onClick={() => { setActiveNav(label); navigate(path); }}
              />
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f7f9f9" }}>

          {/* Header */}
          <div style={{
            background: "white", padding: "20px 28px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid #f1f3f4",
          }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#202124", margin: 0 }}>Browse Jobs</h2>
              <p style={{ fontSize: 13, color: "#9aa0a6", marginTop: 1 }}>
                {total > 0 ? `${total} open position${total !== 1 ? "s" : ""} available` : "Discover your next opportunity"}
              </p>
            </div>
            {/* Search form */}
            <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#f1f3f4", borderRadius: 24, padding: "8px 14px",
                border: "1.5px solid transparent", transition: "border-color 0.15s",
              }}
                onFocusCapture={e => (e.currentTarget.style.borderColor = "#20b2a0")}
                onBlurCapture={e => (e.currentTarget.style.borderColor = "transparent")}
              >
                <SearchIcon />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search jobs..."
                  style={{
                    border: "none", background: "transparent",
                    fontSize: 13, color: "#202124", outline: "none",
                    fontFamily: "inherit", width: 180,
                  }}
                />
              </div>
              <button type="submit" style={{
                padding: "9px 18px", borderRadius: 20,
                background: "#1a7a6e", color: "white",
                border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              }}>
                Search
              </button>
            </form>
          </div>

          {/* Filters */}
          <div style={{ background: "white", padding: "12px 28px", borderBottom: "1px solid #f1f3f4", display: "flex", gap: 8 }}>
            {["", "full-time", "part-time", "contract", "internship"].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                  fontFamily: "inherit", cursor: "pointer",
                  background: filterType === type ? "#1a7a6e" : "#f1f3f4",
                  color: filterType === type ? "white" : "#5f6368",
                  border: "none", transition: "all 0.15s",
                }}
              >
                {type === "" ? "All Types" : type.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} style={{
                    borderRadius: 14, padding: "20px 22px",
                    height: 200, border: "1px solid #f1f3f4",
                    background: "linear-gradient(90deg, #f1f3f4 25%, #e8eaed 50%, #f1f3f4 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.4s infinite",
                  }} />
                ))}
                <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ fontSize: 16, color: "#e53935", marginBottom: 8 }}>{error}</div>
                <button onClick={() => fetchJobs(page)} style={{
                  padding: "9px 20px", borderRadius: 20, background: "#1a7a6e",
                  color: "white", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                }}>
                  Retry
                </button>
              </div>
            ) : displayed.length === 0 ? (
              <div style={{ textAlign: "center", padding: 80 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💼</div>
                <div style={{ fontSize: 16, color: "#5f6368" }}>No jobs found</div>
                <div style={{ fontSize: 13, color: "#9aa0a6", marginTop: 4 }}>Try adjusting your search or filters</div>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                  {displayed.map(job => (
                    <JobCard key={job._id} job={job} onApply={handleApply} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 28 }}>
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      style={{
                        width: 36, height: 36, borderRadius: "50%", border: "1px solid #e8eaed",
                        background: "white", cursor: page === 1 ? "default" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: page === 1 ? 0.4 : 1,
                      }}
                    >
                      <ChevronLeftIcon />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce<(number | "...")[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === "..." ? (
                          <span key={`dots-${i}`} style={{ color: "#9aa0a6", fontSize: 13 }}>…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p as number)}
                            style={{
                              width: 36, height: 36, borderRadius: "50%",
                              border: page === p ? "none" : "1px solid #e8eaed",
                              background: page === p ? "#1a7a6e" : "white",
                              color: page === p ? "white" : "#202124",
                              cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: page === p ? 600 : 400,
                            }}
                          >
                            {p}
                          </button>
                        )
                      )
                    }
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      style={{
                        width: 36, height: 36, borderRadius: "50%", border: "1px solid #e8eaed",
                        background: "white", cursor: page === totalPages ? "default" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: page === totalPages ? 0.4 : 1,
                      }}
                    >
                      <ChevronRightIcon />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}