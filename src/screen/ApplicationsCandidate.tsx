import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { applicationService, type Application } from "../service/application";

const TEAL = "#1a7a6e";
const TEAL_BG = "#e6f7f5";
const TEAL_DARK = "#156b5e";
const TEAL_GLOW = "rgba(32,178,160,0.20)";

export default function ApplicationsCandidate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initial = user?.email?.charAt(0).toUpperCase() ?? "U";

  useEffect(() => {
    let cancelled = false;

    const loadApplications = async () => {
      setLoadingList(true);
      setLoadError(null);
      try {
        const items = await applicationService.listApplications({ limit: 100 });
        if (!cancelled) setApplications(items);
      } catch (error) {
        if (!cancelled) {
          const code = (error as { code?: string })?.code;
          if (code === "FORBIDDEN") {
            setLoadError("Your account cannot list applications from this endpoint yet. You can still apply to jobs and manage from recruiter workflows.");
          } else {
            const message = error instanceof Error ? error.message : "Failed to load applications.";
            setLoadError(message);
          }
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    };

    loadApplications();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleWithdraw = async (applicationId: string) => {
    if (!applicationId) return;
    setWithdrawingId(applicationId);
    setLoading(true);
    try {
      await applicationService.withdrawApplication(applicationId);
      toast.success("Application withdrawn successfully.");
      setApplications((current) =>
        current.map((item) => (item._id === applicationId ? { ...item, status: "withdrawn" } : item))
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to withdraw application.";
      toast.error(message);
    } finally {
      setWithdrawingId(null);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: TEAL, fontFamily: "'DM Sans','Segoe UI',sans-serif", overflow: "hidden", borderRadius: 30 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <Sidebar />

      <main style={{ flex: 1, background: "#f7f9f9", borderRadius: "0 30px 30px 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: "#fff", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#202124", margin: 0 }}>My Applications</h1>
            <p style={{ fontSize: 12, color: "#9aa0a6", margin: "2px 0 0" }}>Candidate view: apply to jobs and manage your active applications</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => navigate("/jobs")} style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: `0 8px 24px ${TEAL_GLOW}` }}>
              Browse Jobs
            </button>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>{initial}</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <section style={{ background: "#fff", borderRadius: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#202124", marginBottom: 8 }}>Your submitted applications</div>
            <p style={{ fontSize: 13, color: "#7c8a88", lineHeight: 1.7, marginTop: 0 }}>
              Withdraw directly from the list. No need to copy-paste application IDs.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
              {loadingList ? (
                <div style={{ fontSize: 13, color: "#7c8a88" }}>Loading applications...</div>
              ) : loadError ? (
                <div style={{ fontSize: 13, color: "#b45309", background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 10, padding: "10px 12px" }}>
                  {loadError}
                </div>
              ) : applications.length === 0 ? (
                <div style={{ fontSize: 13, color: "#7c8a88" }}>No applications found yet.</div>
              ) : (
                applications.map((application) => {
                  const status = String(application.status || "active").toLowerCase();
                  const canWithdraw = status === "active";
                  const title =
                    (application as any)?.jobId?.title ||
                    (application as any)?.job?.title ||
                    `Job ${application.jobId}`;
                  return (
                    <div key={application._id} style={{ border: "1px solid #e8eaed", borderRadius: 12, padding: "12px 14px", background: "#fff" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#202124", marginBottom: 4 }}>{title}</div>
                          <div style={{ fontSize: 12, color: "#7c8a88" }}>
                            Stage: {application.currentStage || "Applied"} · Status: {status}
                          </div>
                        </div>
                        <button
                          onClick={() => handleWithdraw(application._id)}
                          disabled={!canWithdraw || loading}
                          style={{
                            background: canWithdraw ? "#fff1f2" : "#f1f3f4",
                            color: canWithdraw ? "#be123c" : "#9aa0a6",
                            border: "none",
                            borderRadius: 10,
                            padding: "8px 12px",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: canWithdraw && !loading ? "pointer" : "not-allowed",
                            opacity: loading && withdrawingId === application._id ? 0.7 : 1,
                          }}
                        >
                          {loading && withdrawingId === application._id ? "Withdrawing..." : "Withdraw"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section style={{ background: "#fff", borderRadius: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#202124", marginBottom: 10 }}>What you can do here</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: TEAL_BG, borderRadius: 12, padding: "12px 14px", fontSize: 13, color: TEAL_DARK }}>
                1. Go to <strong>Jobs</strong> and apply to active roles.
              </div>
              <div style={{ background: "#f7f9f9", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#5f6c6a" }}>
                2. Keep your profile complete to improve shortlist chances.
              </div>
              <div style={{ background: "#f7f9f9", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#5f6c6a" }}>
                3. Withdraw applications only when needed.
              </div>
            </div>
            <button
              onClick={() => navigate("/jobs")}
              style={{ marginTop: 14, background: TEAL, color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              Open Jobs
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
