import { useEffect, useMemo, useState, JSX } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getJobIdentifiers, jobService, type Job, type JobStatus } from "../service/job";
import { applicationService, type Application } from "../service/application";
import Sidebar from "../components/Sidebar";
import { aiService, type ScreenJobResult } from "../service/ai";
import { useOrganisation } from "../context/OrganisationContext";
import { jsPDF } from "jspdf";

const TEAL = "#1a7a6e";
const TEAL_DARK = "#156b5e";
const TEAL_MID = "#20b2a0";
const TEAL_LIGHT = "#4ecdc4";
const TEAL_BG = "#e6f7f5";
const TEAL_GLOW = "rgba(32,178,160,0.20)";

const STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  closed: "Closed",
  archived: "Archived",
};

const STATUS_OPTIONS: Record<JobStatus, JobStatus[]> = {
  draft: ["active", "archived"],
  active: ["paused", "closed", "archived"],
  paused: ["active", "archived"],
  closed: ["archived"],
  archived: [],
};

const STATUS_STYLES: Record<JobStatus, { bg: string; color: string }> = {
  draft: { bg: "#eef2ff", color: "#4338ca" },
  active: { bg: "#dcfce7", color: "#166534" },
  paused: { bg: "#fff7d6", color: "#a16207" },
  closed: { bg: "#fee2e2", color: "#b91c1c" },
  archived: { bg: "#f3f4f6", color: "#4b5563" },
};

const SearchIcon = () => <svg width="17" height="17" fill="none" stroke="#9aa0a6" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>;
const BellIcon = () => <svg width="17" height="17" fill="none" stroke="#9aa0a6" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const CalendarIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const EyeIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>;
const UsersIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

const getJobId = (job: Partial<Job>) => getJobIdentifiers(job)[0] ?? "";

const formatDate = (value?: string) => {
  if (!value) return "No deadline";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "No deadline"
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const formatMoney = (job: Job) => {
  if (typeof job.salaryMin !== "number" && typeof job.salaryMax !== "number") {
    return "Salary not set";
  }

  if (typeof job.salaryMin === "number" && typeof job.salaryMax === "number") {
    return `${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`;
  }

  const singleValue = job.salaryMin ?? job.salaryMax ?? 0;
  return `${job.currency} ${singleValue.toLocaleString()}`;
};

const statCard = (title: string, value: string | number, tone: "light" | "solid" | "plain") => {
  const styles =
    tone === "solid"
      ? {
          background: `linear-gradient(135deg,${TEAL} 0%,${TEAL_MID} 100%)`,
          color: "#fff",
          sub: "rgba(255,255,255,0.72)",
          shadow: `0 10px 28px ${TEAL_GLOW}`,
        }
      : tone === "light"
        ? {
            background: TEAL_BG,
            color: "#202124",
            sub: TEAL_DARK,
            shadow: "0 2px 10px rgba(0,0,0,0.04)",
          }
        : {
            background: "#fff",
            color: "#202124",
            sub: "#7c8a88",
            shadow: "0 2px 10px rgba(0,0,0,0.04)",
          };

  return (
    <div style={{ background: styles.background, borderRadius: 18, padding: "18px 20px", boxShadow: styles.shadow }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: styles.sub, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ fontSize: 38, fontWeight: 300, color: styles.color, lineHeight: 1 }}>{value}</div>
    </div>
  );
};

export default function Applications() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "">("");
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState<JobStatus | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [jobApplications, setJobApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedPipelineApplicationId, setSelectedPipelineApplicationId] = useState("");
  const [pipelineStage, setPipelineStage] = useState("");
  const [pipelineNote, setPipelineNote] = useState("");
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [selectedBulkStageIds, setSelectedBulkStageIds] = useState<string[]>([]);
  const [bulkStage, setBulkStage] = useState("");
  const [bulkStageNote, setBulkStageNote] = useState("");
  const [bulkStageLoading, setBulkStageLoading] = useState(false);
  const [screening, setScreening] = useState(false);
  const [screeningMode, setScreeningMode] = useState<"platform" | "custom">("platform");
  const [screeningResult, setScreeningResult] = useState<ScreenJobResult | null>(null);

  const initial = user?.email?.charAt(0).toUpperCase() ?? "U";
  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicationCount, 0);
  const activeJobs = jobs.filter((job) => job.status === "active").length;
  const canManagePipeline = role === "RECRUITER" || role === "ORG_OWNER" || role === "ADMIN";
  const { organization, refreshMyOrganization } = useOrganisation();
  const tokenBalance = organization?.tokenBalance;

  const aiEnabled = !!selectedJob?.aiScreeningEnabled;
  const pipelineStages = useMemo(() => selectedJob?.pipelineStages ?? [], [selectedJob]);

  useEffect(() => {
    let cancelled = false;

    const loadJobs = async () => {
      setLoading(true);

      try {
        const response = await jobService.getJobs({
          page,
          limit: 20,
          status: statusFilter,
          search,
        });

        if (cancelled) return;

        setJobs(response.items);
        setTotalPages(response.totalPages || 1);
        setSelectedIds((current) => current.filter((id) => response.items.some((job) => getJobId(job) === id)));

        if (!response.items.length) {
          setSelectedJobId(null);
          setSelectedJob(null);
          return;
        }

        setSelectedJob((current) =>
          current && response.items.some((job) => getJobId(job) === getJobId(current))
            ? response.items.find((job) => getJobId(job) === getJobId(current)) ?? current
            : response.items[0]
        );

        setSelectedJobId((current) =>
          current && response.items.some((job) => getJobId(job) === current)
            ? current
            : getJobId(response.items[0])
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load jobs.";
        toast.error(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, [page, search, statusFilter]);

  useEffect(() => {
    if (!selectedJobId) return;

    let cancelled = false;

    const loadJobDetails = async () => {
      setDetailLoading(true);

      try {
        const job = await jobService.getJobById(selectedJobId);
        if (!cancelled) setSelectedJob(job);
      } catch (error) {
        if (!cancelled) {
          const fallbackJob = jobs.find((job) => getJobId(job) === selectedJobId) ?? null;
          if (fallbackJob) {
            setSelectedJob(fallbackJob);
          } else {
            const message = error instanceof Error ? error.message : "Failed to load job details.";
            toast.error(message);
          }
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };

    loadJobDetails();

    return () => {
      cancelled = true;
    };
  }, [jobs, selectedJobId]);

  useEffect(() => {
    if (!selectedJobId) {
      setJobApplications([]);
      setSelectedPipelineApplicationId("");
      setSelectedBulkStageIds([]);
      return;
    }

    let cancelled = false;

    const loadApplications = async () => {
      setApplicationsLoading(true);
      try {
        const items = await applicationService.listApplications({
          page: 1,
          limit: 200,
          jobId: selectedJobId,
        });

        if (cancelled) return;

        setJobApplications(items);
        setSelectedPipelineApplicationId((current) =>
          current && items.some((item) => item._id === current) ? current : items[0]?._id ?? ""
        );
        setSelectedBulkStageIds((current) => current.filter((id) => items.some((item) => item._id === id)));
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load applications.";
          toast.error(message);
        }
      } finally {
        if (!cancelled) setApplicationsLoading(false);
      }
    };

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, [selectedJobId]);

  const refreshJobs = async () => {
    const response = await jobService.getJobs({
      page,
      limit: 20,
      status: statusFilter,
      search,
    });

    setJobs(response.items);
    setTotalPages(response.totalPages || 1);
  };

  const applyLocalStatusUpdate = (jobId: string, status: JobStatus) => {
    setJobs((current) =>
      current.map((job) => (getJobId(job) === jobId ? { ...job, status } : job))
    );
    setSelectedJob((current) =>
      current && getJobId(current) === jobId ? { ...current, status } : current
    );
  };

  const handleStatusUpdate = async (status: JobStatus) => {
    if (!selectedJob) return;

    const jobIds = getJobIdentifiers(selectedJob);
    const primaryJobId = jobIds[0];

    if (!primaryJobId) {
      toast.error("This job is missing an id, so its status cannot be updated.");
      return;
    }

    setSubmittingStatus(status);

    try {
      let updatedJob: Job | null = null;
      let notFoundCount = 0;

      for (const jobId of jobIds) {
        try {
          updatedJob = await jobService.updateJobStatus(jobId, status);
          break;
        } catch (error: any) {
          if (error?.status === 404) {
            notFoundCount += 1;
            continue;
          }

          throw error;
        }
      }

      if (!updatedJob) {
        if (notFoundCount === jobIds.length) {
          applyLocalStatusUpdate(primaryJobId, status);
          toast.success(`Status updated locally to ${STATUS_LABELS[status].toLowerCase()}.`);
          return;
        }

        throw new Error("Failed to update job status.");
      }

      setSelectedJob(updatedJob);
      setJobs((current) => current.map((job) => (getJobId(job) === getJobId(updatedJob) ? updatedJob : job)));
      toast.success(`Job moved to ${STATUS_LABELS[status].toLowerCase()}.`);
    } catch (error: any) {
      const statusCode = error?.status;

      if (statusCode === 404) {
        applyLocalStatusUpdate(primaryJobId, status);
        toast.success(`Status updated locally to ${STATUS_LABELS[status].toLowerCase()}.`);
      } else {
        const message = error instanceof Error ? error.message : "Failed to update job status.";
        toast.error(message);
      }
    } finally {
      setSubmittingStatus(null);
    }
  };

  const handleBulkArchive = async () => {
    if (!selectedIds.length) {
      toast.error("Select at least one job first.");
      return;
    }

    setBulkLoading(true);

    try {
      const result = await jobService.bulkAction(selectedIds, "archive");
      await refreshJobs();

      if (selectedJobId && selectedIds.includes(selectedJobId)) {
        setSelectedJobId(null);
        setSelectedJob(null);
      }

      setSelectedIds([]);
      toast.success(`Archived ${result.affectedCount ?? result.affected ?? selectedIds.length} job(s).`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bulk archive failed.";
      toast.error(message);
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelected = (jobId: string) => {
    setSelectedIds((current) =>
      current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId]
    );
  };

  const toggleBulkApplicationSelection = (applicationId: string) => {
    setSelectedBulkStageIds((current) =>
      current.includes(applicationId)
        ? current.filter((id) => id !== applicationId)
        : [...current, applicationId]
    );
  };

  const getApplicationTitle = (application: Application) => {
    const jobRef = (application as any)?.jobId;
    const candidateRef = (application as any)?.candidateId;
    const jobTitle = typeof jobRef === "object" ? jobRef?.title : null;
    const candidateName = typeof candidateRef === "object" ? candidateRef?.name ?? candidateRef?.email : null;
    return `${jobTitle ?? selectedJob?.title ?? "Application"}${candidateName ? ` · ${candidateName}` : ""}`;
  };

  const handleMoveStage = async () => {
    if (!canManagePipeline) {
      toast.error("Only recruiter, org owner, or admin can move application stages.");
      return;
    }
    if (!selectedPipelineApplicationId || !pipelineStage.trim()) {
      toast.error("Select an application and stage.");
      return;
    }

    setPipelineLoading(true);
    try {
      const updated = await applicationService.moveApplicationToStage(selectedPipelineApplicationId, {
        stage: pipelineStage.trim(),
        note: pipelineNote.trim() || undefined,
      });
      toast.success(`Moved to "${updated.currentStage}".`);
      setPipelineNote("");
      setJobApplications((current) =>
        current.map((item) =>
          item._id === updated._id
            ? { ...item, currentStage: updated.currentStage, status: updated.status ?? item.status }
            : item
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to move stage.";
      toast.error(message);
    } finally {
      setPipelineLoading(false);
    }
  };

  const handleBulkMoveStage = async () => {
    if (!canManagePipeline) {
      toast.error("Only recruiter, org owner, or admin can run bulk stage updates.");
      return;
    }
    const applicationIds = selectedBulkStageIds;
    if (!applicationIds.length || !bulkStage.trim()) {
      toast.error("Provide at least one application ID and a stage.");
      return;
    }

    setBulkStageLoading(true);
    try {
      const result = await applicationService.bulkMoveStage({
        applicationIds,
        stage: bulkStage.trim(),
        note: bulkStageNote.trim() || undefined,
      });
      const affected = result.affectedCount ?? result.affected ?? applicationIds.length;
      toast.success(`Bulk update complete for ${affected} application(s).`);
      setBulkStageNote("");
      setSelectedBulkStageIds([]);
      setJobApplications((current) =>
        current.map((item) =>
          applicationIds.includes(item._id) ? { ...item, currentStage: bulkStage.trim() } : item
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to run bulk stage update.";
      toast.error(message);
    } finally {
      setBulkStageLoading(false);
    }
  };

  const handleScreenApplicants = async () => {
    if (!selectedJobId) return;
    if (!aiEnabled) {
      toast.error("AI screening is disabled for this job.");
      return;
    }

    setScreening(true);
    try {
      const result = await aiService.screenJobApplicants(selectedJobId, { mode: screeningMode });
      setScreeningResult(result);
      toast.success(`Screened ${result.screened} candidate(s).`);
      await refreshMyOrganization();

      // Refresh job applications list after screening so AI score shows up.
      const items = await applicationService.listApplications({ page: 1, limit: 200, jobId: selectedJobId });
      setJobApplications(items);
    } catch (error: any) {
      const code = error?.code;
      if (code === "SUBSCRIPTION_REQUIRED") toast.error("Active subscription required to use AI screening.");
      else if (error?.status === 400) toast.error(error?.message || "Insufficient token balance.");
      else if (error?.status === 429) toast.error("AI rate limit exceeded. Please try again shortly.");
      else toast.error(error instanceof Error ? error.message : "AI screening failed.");
    } finally {
      setScreening(false);
    }
  };

  const handleDownloadScreeningReport = () => {
    if (!screeningResult || !selectedJob) {
      toast.error("No AI screening report available yet.");
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 48;
    let y = 56;

    const writeLine = (text: string, size = 11, weight: "normal" | "bold" = "normal", gap = 16) => {
      doc.setFont("helvetica", weight);
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, pageWidth - marginX * 2);
      lines.forEach((line: string) => {
        if (y > pageHeight - 48) {
          doc.addPage();
          y = 56;
        }
        doc.text(line, marginX, y);
        y += gap;
      });
    };

    writeLine("AI Screening Report", 18, "bold", 24);
    writeLine(`Generated At: ${new Date().toLocaleString()}`);
    writeLine(`Job: ${selectedJob.title} (${screeningResult.jobId})`);
    writeLine(`Mode: ${screeningMode}`);
    writeLine(`Screened: ${screeningResult.screened}`);
    writeLine(`Tokens Consumed: ${screeningResult.tokensConsumed}`);
    writeLine(`Screened At: ${screeningResult.screenedAt || "N/A"}`);
    y += 8;
    writeLine("Ranked Candidates", 14, "bold", 20);

    const ranked = screeningResult.rankedCandidates ?? [];
    if (!ranked.length) {
      writeLine("No ranked candidates were returned.");
    } else {
      ranked.forEach((candidate, index) => {
        writeLine(`${index + 1}. Candidate: ${candidate.candidateId} | Application: ${candidate.applicationId}`, 11, "bold");
        writeLine(`Score: ${candidate.aiScore} | Tokens: ${candidate.tokensConsumed ?? 0}`);
        writeLine(`Recommendation: ${candidate.aiAnalysis?.recommendation || "N/A"}`);
        writeLine(`Summary: ${candidate.aiAnalysis?.summary || "N/A"}`);
        const strengths = (candidate.aiAnalysis?.strengths ?? []).join(", ") || "N/A";
        const gaps = (candidate.aiAnalysis?.gaps ?? []).join(", ") || "N/A";
        writeLine(`Strengths: ${strengths}`);
        writeLine(`Gaps: ${gaps}`);
        y += 8;
      });
    }

    const datePart = new Date().toISOString().slice(0, 10);
    doc.save(`ai-screening-report-${screeningResult.jobId}-${datePart}.pdf`);
    toast.success("AI screening PDF report downloaded.");
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: TEAL, fontFamily: "'DM Sans','Segoe UI',sans-serif", overflow: "hidden", borderRadius: 30 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        .nav-btn:hover { background: rgba(255,255,255,0.12) !important; }
        .job-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.08) !important; }
        .subtle-btn:hover { background: #d8f2ee !important; }
      `}</style>

      <Sidebar />

      <main style={{ flex: 1, background: "#f7f9f9", borderRadius: "0 30px 30px 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: "#fff", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#202124", margin: 0 }}>Applications</h1>
            <p style={{ fontSize: 12, color: "#9aa0a6", margin: "2px 0 0" }}>Monitor all jobs, statuses, and applicant volume in one place</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => navigate("/hire")} style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: `0 8px 24px ${TEAL_GLOW}` }}>
              + New Job
            </button>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f1f3f4", display: "flex", alignItems: "center", justifyContent: "center" }}><BellIcon /></div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>{initial}</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {statCard("Total Jobs", jobs.length, "light")}
            {statCard("Active Jobs", activeJobs, "solid")}
            {statCard("Applicants", totalApplicants, "plain")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr", gap: 18, alignItems: "start", minHeight: 0 }}>
            <section style={{ background: "#fff", borderRadius: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden", minHeight: 540, display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "18px 20px", borderBottom: "1px solid #eef2f2", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#202124" }}>Open Roles</div>
                    <div style={{ fontSize: 12, color: "#8b9795" }}>All jobs created by your organization</div>
                  </div>
                  <button
                    onClick={handleBulkArchive}
                    disabled={bulkLoading}
                    className="subtle-btn"
                    style={{ background: TEAL_BG, color: TEAL_DARK, border: "none", borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 700, cursor: bulkLoading ? "not-allowed" : "pointer", opacity: bulkLoading ? 0.7 : 1 }}
                  >
                    {bulkLoading ? "Archiving..." : "Archive Selected"}
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 170px", gap: 12 }}>
                  <div style={{ position: "relative" }}>
                    <input
                      value={searchDraft}
                      onChange={(e) => setSearchDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setPage(1);
                          setSearch(searchDraft.trim());
                        }
                      }}
                      placeholder="Search jobs by title..."
                      style={{ width: "100%", border: "1.5px solid #e5ecec", borderRadius: 12, padding: "12px 14px 12px 40px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    />
                    <div style={{ position: "absolute", left: 14, top: 12 }}><SearchIcon /></div>
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setPage(1);
                      setStatusFilter(e.target.value as JobStatus | "");
                    }}
                    style={{ border: "1.5px solid #e5ecec", borderRadius: 12, padding: "12px 14px", fontSize: 13, outline: "none", background: "#fff" }}
                  >
                    <option value="">All statuses</option>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => {
                      setPage(1);
                      setSearch(searchDraft.trim());
                    }}
                    style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    Apply Search
                  </button>
                  <button
                    onClick={() => {
                      setSearchDraft("");
                      setSearch("");
                      setStatusFilter("");
                      setPage(1);
                    }}
                    style={{ background: "#fff", color: "#60706d", border: "1.5px solid #d9e5e4", borderRadius: 10, padding: "10px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                {loading ? (
                  <div style={{ padding: 24, color: "#7c8a88", fontSize: 13 }}>Loading jobs...</div>
                ) : !jobs.length ? (
                  <div style={{ padding: 24, background: "#f8fbfb", borderRadius: 16, color: "#7c8a88", fontSize: 13 }}>
                    No jobs found for this filter yet.
                  </div>
                ) : (
                  jobs.map((job) => {
                    const statusTone = STATUS_STYLES[job.status];
                    const jobId = getJobId(job);
                    const isActive = selectedJobId === jobId;

                    return (
                      <div
                        key={jobId}
                        className="job-card"
                        onClick={() => {
                          setSelectedJobId(jobId);
                          setSelectedJob(job);
                        }}
                        style={{
                          background: isActive ? "#f7fdfc" : "#fff",
                          border: isActive ? `1.5px solid ${TEAL_MID}` : "1.5px solid #eef2f2",
                          borderRadius: 18,
                          padding: 16,
                          boxShadow: isActive ? `0 10px 28px ${TEAL_GLOW}` : "0 2px 10px rgba(0,0,0,0.03)",
                          marginBottom: 12,
                          cursor: "pointer",
                          transition: "all 0.18s ease",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ display: "flex", gap: 12 }}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(jobId)}
                              onChange={() => toggleSelected(jobId)}
                              onClick={(e) => e.stopPropagation()}
                              style={{ marginTop: 3 }}
                            />
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: "#202124", marginBottom: 6 }}>{job.title}</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, color: "#7c8a88" }}>
                                <span>{job.location}</span>
                                <span>{job.employmentType}</span>
                                <span>{job.isRemote ? "Remote" : "On-site"}</span>
                              </div>
                            </div>
                          </div>
                          <span style={{ alignSelf: "flex-start", background: statusTone.bg, color: statusTone.color, borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 700 }}>
                            {STATUS_LABELS[job.status]}
                          </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
                          <div style={{ background: "#f6f8f8", borderRadius: 12, padding: "10px 12px" }}>
                            <div style={{ fontSize: 11, color: "#8b9795", marginBottom: 4 }}>Applicants</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#202124" }}>{job.applicationCount}</div>
                          </div>
                          <div style={{ background: "#f6f8f8", borderRadius: 12, padding: "10px 12px" }}>
                            <div style={{ fontSize: 11, color: "#8b9795", marginBottom: 4 }}>Views</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#202124" }}>{job.viewCount}</div>
                          </div>
                          <div style={{ background: "#f6f8f8", borderRadius: 12, padding: "10px 12px" }}>
                            <div style={{ fontSize: 11, color: "#8b9795", marginBottom: 4 }}>Deadline</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#202124" }}>{formatDate(job.applicationDeadline)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: "1px solid #eef2f2" }}>
                <div style={{ fontSize: 12, color: "#7c8a88" }}>Page {page} of {Math.max(totalPages, 1)}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} style={{ background: "#fff", color: "#60706d", border: "1.5px solid #d9e5e4", borderRadius: 10, padding: "10px 14px", fontSize: 12, fontWeight: 700, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.6 : 1 }}>
                    Previous
                  </button>
                  <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages} style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 12, fontWeight: 700, cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.6 : 1 }}>
                    Next
                  </button>
                </div>
              </div>
            </section>

            <section style={{ background: "#fff", borderRadius: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", minHeight: 540, display: "flex", flexDirection: "column" }}>
              {detailLoading ? (
                <div style={{ padding: 24, color: "#7c8a88", fontSize: 13 }}>Loading job details...</div>
              ) : !selectedJob ? (
                <div style={{ padding: 24, color: "#7c8a88", fontSize: 13 }}>Select a job to view its details.</div>
              ) : (
                <>
                  <div style={{ padding: "22px 24px", borderBottom: "1px solid #eef2f2" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{ background: STATUS_STYLES[selectedJob.status].bg, color: STATUS_STYLES[selectedJob.status].color, borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 700 }}>
                            {STATUS_LABELS[selectedJob.status]}
                          </span>
                          <span style={{ fontSize: 12, color: "#7c8a88" }}>{selectedJob.employmentType}</span>
                        </div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#202124", margin: 0 }}>{selectedJob.title}</h2>
                        <p style={{ fontSize: 13, color: "#7c8a88", margin: "8px 0 0", lineHeight: 1.6 }}>
                          {selectedJob.location} · {selectedJob.isRemote ? "Remote" : "On-site"} · {formatMoney(selectedJob)}
                        </p>
                      </div>
                      <button onClick={() => navigate("/hire")} style={{ background: TEAL_BG, color: TEAL_DARK, border: "none", borderRadius: 12, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
                        Create Another
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18 }}>
                      <div style={{ background: "#f7f9f9", borderRadius: 14, padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#7c8a88", textTransform: "uppercase" }}>
                          <UsersIcon /> Applicants
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 300, color: "#202124", marginTop: 8 }}>{selectedJob.applicationCount}</div>
                      </div>
                      <div style={{ background: "#f7f9f9", borderRadius: 14, padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#7c8a88", textTransform: "uppercase" }}>
                          <EyeIcon /> Views
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 300, color: "#202124", marginTop: 8 }}>{selectedJob.viewCount}</div>
                      </div>
                      <div style={{ background: "#f7f9f9", borderRadius: 14, padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#7c8a88", textTransform: "uppercase" }}>
                          <CalendarIcon /> Deadline
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#202124", marginTop: 10 }}>{formatDate(selectedJob.applicationDeadline)}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "22px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#202124", marginBottom: 8 }}>Description</div>
                      <p style={{ fontSize: 13, color: "#5f6c6a", lineHeight: 1.8, margin: 0 }}>{selectedJob.description}</p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div style={{ background: "#f8fbfb", borderRadius: 16, padding: 18 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#202124", marginBottom: 10 }}>Responsibilities</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {selectedJob.responsibilities.map((item) => (
                            <div key={item} style={{ fontSize: 13, color: "#5f6c6a", lineHeight: 1.6 }}>- {item}</div>
                          ))}
                        </div>
                      </div>

                      <div style={{ background: "#f8fbfb", borderRadius: 16, padding: 18 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#202124", marginBottom: 10 }}>Requirements</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {selectedJob.requirements.map((item) => (
                            <div key={item} style={{ fontSize: 13, color: "#5f6c6a", lineHeight: 1.6 }}>- {item}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ background: "#f8fbfb", borderRadius: 16, padding: 18 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#202124", marginBottom: 10 }}>Skills</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {selectedJob.skills.map((skill) => (
                          <span key={skill} style={{ background: "#fff", border: "1px solid #d9e5e4", borderRadius: 999, padding: "8px 12px", fontSize: 12, fontWeight: 700, color: TEAL_DARK }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "#f8fbfb", borderRadius: 16, padding: 18 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#202124", marginBottom: 10 }}>Pipeline Stages</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {selectedJob.pipelineStages.map((stage, index) => (
                          <span key={`${stage}-${index}`} style={{ background: index === 0 ? TEAL : "#fff", color: index === 0 ? "#fff" : "#42514f", border: index === 0 ? "none" : "1px solid #d9e5e4", borderRadius: 999, padding: "8px 12px", fontSize: 12, fontWeight: 700 }}>
                            {stage}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "#f8fbfb", borderRadius: 16, padding: 18 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#202124", marginBottom: 10 }}>AI Screening</div>
                      <div style={{ fontSize: 13, color: "#5f6c6a", lineHeight: 1.7 }}>
                        {selectedJob.aiScreeningEnabled
                          ? selectedJob.aiScreeningCriteria || "AI screening is enabled for this job."
                          : "AI screening is disabled for this job."}
                      </div>

                      {selectedJob.aiScreeningEnabled && (
                        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                            <div style={{ fontSize: 12, color: "#7c8a88" }}>
                              Mode:{" "}
                              <strong style={{ color: "#202124" }}>
                                {screeningMode === "platform" ? "Platform (uses org tokens)" : "Custom (uses org key)"}
                              </strong>
                              {typeof tokenBalance === "number" && screeningMode === "platform" && (
                                <span> · Tokens: <strong style={{ color: TEAL_DARK }}>{tokenBalance}</strong></span>
                              )}
                            </div>
                            <select
                              value={screeningMode}
                              onChange={(e) => setScreeningMode(e.target.value as "platform" | "custom")}
                              style={{ border: "1.5px solid #d9e5e4", borderRadius: 10, padding: "8px 10px", fontSize: 12, background: "#fff" }}
                            >
                              <option value="platform">platform</option>
                              <option value="custom">custom</option>
                            </select>
                          </div>

                          <button
                            onClick={handleScreenApplicants}
                            disabled={screening}
                            style={{
                              background: TEAL,
                              color: "#fff",
                              border: "none",
                              borderRadius: 10,
                              padding: "10px 12px",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: screening ? "not-allowed" : "pointer",
                              opacity: screening ? 0.7 : 1,
                            }}
                          >
                            {screening ? "Screening..." : "Run AI Screening"}
                          </button>

                          {screeningResult && (
                            <button
                              onClick={handleDownloadScreeningReport}
                              style={{
                                background: "#fff",
                                color: TEAL_DARK,
                                border: "1.5px solid #d9e5e4",
                                borderRadius: 10,
                                padding: "10px 12px",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Download Screening PDF
                            </button>
                          )}

                          {screeningResult && (
                            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: "12px 12px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: "#202124" }}>Ranked candidates</div>
                                <div style={{ fontSize: 11, color: "#7c8a88" }}>
                                  screened {screeningResult.screened} · tokens {screeningResult.tokensConsumed}
                                </div>
                              </div>
                              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                                {(screeningResult.rankedCandidates ?? []).slice(0, 5).map((c) => (
                                  <div key={c.applicationId} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 10px", borderRadius: 10, background: "#f7f9f9" }}>
                                    <div style={{ fontSize: 12, color: "#202124", fontWeight: 700 }}>
                                      {c.candidateId}
                                      <div style={{ fontSize: 11, fontWeight: 500, color: "#7c8a88", marginTop: 2 }}>
                                        {c.aiAnalysis?.summary || c.aiAnalysis?.recommendation || "No summary"}
                                      </div>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: TEAL_DARK }}>{c.aiScore}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ background: "#f8fbfb", borderRadius: 16, padding: 18 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#202124", marginBottom: 10 }}>Status Actions</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <span
                          style={{
                            background: STATUS_STYLES[selectedJob.status].bg,
                            color: STATUS_STYLES[selectedJob.status].color,
                            borderRadius: 999,
                            padding: "7px 12px",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {STATUS_LABELS[selectedJob.status]}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {STATUS_OPTIONS[selectedJob.status].length ? (
                          STATUS_OPTIONS[selectedJob.status].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusUpdate(status)}
                              disabled={submittingStatus !== null}
                              style={{
                                background: status === "archived" ? "#fff1f2" : TEAL_BG,
                                color: status === "archived" ? "#be123c" : TEAL_DARK,
                                border: "none",
                                borderRadius: 10,
                                padding: "10px 14px",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: submittingStatus ? "not-allowed" : "pointer",
                                opacity: submittingStatus ? 0.7 : 1,
                              }}
                            >
                              {submittingStatus === status ? "Updating..." : `Move to ${STATUS_LABELS[status]}`}
                            </button>
                          ))
                        ) : (
                          <div style={{ fontSize: 13, color: "#7c8a88" }}>No further status transitions available.</div>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#7c8a88", lineHeight: 1.7, marginTop: 12 }}>
                        If the backend status route returns `404`, the page will keep the new status locally so your workflow is not blocked.
                      </div>
                    </div>

                    <div style={{ background: "#f8fbfb", borderRadius: 16, padding: 18 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#202124", marginBottom: 10 }}>Application Pipeline Actions</div>
                      {applicationsLoading && (
                        <div style={{ fontSize: 12, color: "#7c8a88", marginBottom: 10 }}>Loading submitted applications...</div>
                      )}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ fontSize: 12, color: "#5f6c6a" }}>
                            Move stage for one or multiple submitted applications.
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <select
                              value={selectedPipelineApplicationId}
                              onChange={(e) => setSelectedPipelineApplicationId(e.target.value)}
                              style={{ border: "1.5px solid #d9e5e4", borderRadius: 10, padding: "10px 12px", fontSize: 12, background: "#fff" }}
                            >
                              <option value="">Select application</option>
                              {jobApplications.map((application) => (
                                <option key={application._id} value={application._id}>
                                  {getApplicationTitle(application)} · {application.currentStage}
                                </option>
                              ))}
                            </select>
                            <input
                              value={pipelineStage}
                              onChange={(e) => setPipelineStage(e.target.value)}
                              placeholder="Target stage (e.g. Technical Interview)"
                              style={{ border: "1.5px solid #d9e5e4", borderRadius: 10, padding: "10px 12px", fontSize: 12, background: "#fff" }}
                            />
                          </div>
                          <input
                            value={pipelineNote}
                            onChange={(e) => setPipelineNote(e.target.value)}
                            placeholder="Optional note"
                            style={{ border: "1.5px solid #d9e5e4", borderRadius: 10, padding: "10px 12px", fontSize: 12, background: "#fff" }}
                          />
                          <button
                            onClick={handleMoveStage}
                            disabled={pipelineLoading || !selectedPipelineApplicationId}
                            style={{ background: TEAL_BG, color: TEAL_DARK, border: "none", borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 700, cursor: pipelineLoading ? "not-allowed" : "pointer", opacity: pipelineLoading ? 0.7 : 1 }}
                          >
                            {pipelineLoading ? "Moving..." : "Move Single Application Stage"}
                          </button>

                          <div style={{ background: "#fff", border: "1.5px solid #d9e5e4", borderRadius: 10, padding: "10px 12px", maxHeight: 140, overflowY: "auto" }}>
                            {jobApplications.length === 0 ? (
                              <div style={{ fontSize: 12, color: "#7c8a88" }}>No submitted applications for this job yet.</div>
                            ) : (
                              jobApplications.map((application) => (
                                <label key={application._id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#42514f", marginBottom: 6 }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedBulkStageIds.includes(application._id)}
                                    onChange={() => toggleBulkApplicationSelection(application._id)}
                                  />
                                  {getApplicationTitle(application)}
                                </label>
                              ))
                            )}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <input
                              value={bulkStage}
                              onChange={(e) => setBulkStage(e.target.value)}
                              placeholder="Bulk target stage"
                              style={{ border: "1.5px solid #d9e5e4", borderRadius: 10, padding: "10px 12px", fontSize: 12, background: "#fff" }}
                            />
                            <input
                              value={bulkStageNote}
                              onChange={(e) => setBulkStageNote(e.target.value)}
                              placeholder="Optional bulk note"
                              style={{ border: "1.5px solid #d9e5e4", borderRadius: 10, padding: "10px 12px", fontSize: 12, background: "#fff" }}
                            />
                          </div>
                          <button
                            onClick={handleBulkMoveStage}
                            disabled={bulkStageLoading || selectedBulkStageIds.length === 0}
                            style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 700, cursor: bulkStageLoading ? "not-allowed" : "pointer", opacity: bulkStageLoading ? 0.7 : 1 }}
                          >
                            {bulkStageLoading ? "Updating..." : "Bulk Move Stage"}
                          </button>
                        </div>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
