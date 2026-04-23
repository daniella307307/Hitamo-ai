import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../lib/api";
import { Job } from "../service/job";

// ── Icons ──────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1a7a6e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <path d="M2 12h20" />
  </svg>
);
const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
  </svg>
);

// ── Application Service ────────────────────────────────────────────────
interface ApplicationPayload {
  jobId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

interface ApplicationResponse {
  _id: string;
  jobId: string;
  candidateId: string;
  currentStage: string;
  aiScore?: number;
  status: string;
  createdAt: string;
}

async function applyToJob(payload: ApplicationPayload): Promise<ApplicationResponse> {
  const { data } = await api.post("/applications/apply", payload);
  return data.data;
}

// ── Success Screen ────────────────────────────────────────────────────
function SuccessScreen({ application, jobTitle, onBack }: {
  application: ApplicationResponse;
  jobTitle: string;
  onBack: () => void;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", textAlign: "center", padding: "60px 40px",
      flex: 1,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "#e8f5f3", display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24,
      }}>
        <CheckCircleIcon />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#202124", margin: "0 0 10px" }}>
        Application Submitted!
      </h2>
      <p style={{ fontSize: 15, color: "#5f6368", marginBottom: 6, maxWidth: 400, lineHeight: 1.6 }}>
        Your application for <strong style={{ color: "#202124" }}>{jobTitle}</strong> has been received.
      </p>
      {application.aiScore !== undefined && (
        <div style={{
          margin: "20px 0", padding: "16px 28px",
          background: "white", borderRadius: 12, border: "1px solid #e8eaed",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}>
          <div style={{ fontSize: 12, color: "#9aa0a6", marginBottom: 4 }}>AI Match Score</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#1a7a6e" }}>
            {application.aiScore}<span style={{ fontSize: 18, color: "#9aa0a6" }}>/100</span>
          </div>
        </div>
      )}
      <div style={{ fontSize: 13, color: "#9aa0a6", marginBottom: 28 }}>
        Current Stage: <span style={{ color: "#202124", fontWeight: 500 }}>{application.currentStage}</span>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onBack} style={{
          padding: "11px 24px", borderRadius: 24,
          background: "#1a7a6e", color: "white",
          border: "none", cursor: "pointer",
          fontSize: 14, fontWeight: 600, fontFamily: "inherit",
        }}>
          Browse More Jobs
        </button>
      </div>
    </div>
  );
}

// ── Main Apply Page ────────────────────────────────────────────────────
export default function ApplyPage() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const location = useLocation();
  const job = location.state?.job as Job | undefined;

  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<ApplicationResponse | null>(null);

  const effectiveJobId = jobId ?? job?._id ?? "";
  const jobTitle = job?.title ?? "Position";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveJobId) {
      setError("Job ID is missing.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await applyToJob({
        jobId: effectiveJobId,
        coverLetter: coverLetter.trim() || undefined,
        resumeUrl: resumeUrl.trim() || undefined,
      });
      setSuccess(result);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? err.message ?? "Failed to submit application.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#e8f0ef", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "100vw",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>
        <div style={{
          width: "min(680px, 96vw)", background: "white", borderRadius: 24,
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)", display: "flex",
          flexDirection: "column", overflow: "hidden", minHeight: 500,
        }}>
          <SuccessScreen
            application={success}
            jobTitle={jobTitle}
            onBack={() => navigate("/jobs")}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#e8f0ef", minHeight: "100vh",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      width: "100vw", padding: "32px 16px", boxSizing: "border-box",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        textarea:focus, input:focus { outline: none; border-color: #20b2a0 !important; }
        .apply-input { transition: border-color 0.15s; }
      `}</style>

      <div style={{ width: "min(720px, 100%)", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: "#5f6368", fontSize: 14, fontFamily: "inherit", padding: 0,
          }}
        >
          <BackIcon /> Back to jobs
        </button>

        {/* Job summary card */}
        {job && (
          <div style={{
            background: "white", borderRadius: 16, padding: "22px 26px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                background: "linear-gradient(135deg, #1a7a6e, #20b2a0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 700, fontSize: 20,
              }}>
                {job.title.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#202124", marginBottom: 4 }}>{job.title}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#5f6368" }}>
                    <LocationIcon />{job.location}{job.isRemote ? " · Remote" : ""}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#5f6368" }}>
                    <BriefcaseIcon />{job.employmentType.replace("-", " ")}
                  </span>
                  {(job.salaryMin || job.salaryMax) && (
                    <span style={{ fontSize: 13, color: "#1a7a6e", fontWeight: 600 }}>
                      {job.currency} {job.salaryMin?.toLocaleString()} – {job.salaryMax?.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 20,
                background: "#e8f5f3", color: "#1a7a6e",
              }}>
                Active
              </span>
            </div>

            {/* Skills */}
            {job.skills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f3f4" }}>
                {job.skills.map(s => (
                  <span key={s} style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 20,
                    background: "#e8f5f3", color: "#1a7a6e", fontWeight: 500,
                  }}>{s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Application form */}
        <form onSubmit={handleSubmit} style={{
          background: "white", borderRadius: 16, padding: "28px 26px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#202124", marginBottom: 6 }}>
            Your Application
          </div>
          <p style={{ fontSize: 13, color: "#9aa0a6", marginTop: 0, marginBottom: 24 }}>
            Make sure your talent profile is complete before submitting — only one application per job is allowed.
          </p>

          {/* Cover Letter */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#202124", marginBottom: 8 }}>
              Cover Letter <span style={{ color: "#9aa0a6", fontWeight: 400 }}>(optional)</span>
            </label>
            <div style={{ position: "relative" }}>
              <textarea
                className="apply-input"
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're a great fit for this role..."
                rows={7}
                style={{
                  width: "100%", borderRadius: 10, padding: "14px 16px",
                  border: "1.5px solid #e8eaed", fontSize: 14, color: "#202124",
                  fontFamily: "inherit", resize: "vertical", lineHeight: 1.6,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 11, color: "#c5c8cb" }}>
                {coverLetter.length} chars
              </div>
            </div>
            {/* AI tip */}
            <div style={{
              marginTop: 8, display: "flex", alignItems: "flex-start", gap: 7,
              background: "#f0faf8", borderRadius: 8, padding: "8px 12px",
            }}>
              <SparkleIcon />
              <p style={{ margin: 0, fontSize: 12, color: "#1a7a6e", lineHeight: 1.5 }}>
                Tip: Mention specific skills from the job requirements and how your experience maps to the role's responsibilities.
              </p>
            </div>
          </div>

          {/* Resume URL */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#202124", marginBottom: 8 }}>
              Resume URL <span style={{ color: "#9aa0a6", fontWeight: 400 }}>(optional — will use profile resume if left blank)</span>
            </label>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              border: "1.5px solid #e8eaed", borderRadius: 10, padding: "0 14px",
              transition: "border-color 0.15s",
            }}
              onFocusCapture={e => (e.currentTarget.style.borderColor = "#20b2a0")}
              onBlurCapture={e => (e.currentTarget.style.borderColor = "#e8eaed")}
            >
              <LinkIcon />
              <input
                className="apply-input"
                type="url"
                value={resumeUrl}
                onChange={e => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/your-resume"
                style={{
                  flex: 1, border: "none", padding: "13px 0",
                  fontSize: 14, color: "#202124", fontFamily: "inherit",
                  background: "transparent",
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, padding: "12px 14px",
              fontSize: 13, color: "#dc2626", marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: "11px 24px", borderRadius: 24,
                background: "#f1f3f4", color: "#5f6368",
                border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 500, fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "11px 28px", borderRadius: 24,
                background: submitting ? "#9aa0a6" : "#1a7a6e", color: "white",
                border: "none", cursor: submitting ? "not-allowed" : "pointer",
                fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 8,
                transition: "background 0.15s",
              }}
            >
              {submitting ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ animation: "spin 0.9s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity="0.25" />
                    <path d="M21 12a9 9 0 0 0-9-9" />
                  </svg>
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                  Submitting…
                </>
              ) : "Submit Application"}
            </button>
          </div>
        </form>

        {/* What to expect */}
        <div style={{
          background: "white", borderRadius: 16, padding: "20px 26px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#202124", marginBottom: 14 }}>What happens next?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { step: "1", title: "AI Screening", desc: "Hitamo AI will analyse your profile and score your fit for the role." },
              { step: "2", title: "Review", desc: "The recruiter reviews shortlisted candidates and moves you through the pipeline." },
              { step: "3", title: "Interview", desc: "Top candidates are invited to an interview or assessment stage." },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: "#e8f5f3", color: "#1a7a6e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                }}>{step}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#202124" }}>{title}</div>
                  <div style={{ fontSize: 12, color: "#9aa0a6", marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}