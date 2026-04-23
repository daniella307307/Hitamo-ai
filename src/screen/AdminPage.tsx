import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import { adminService, type AdminStats, type AdminUser, type AuditLog } from "../service/admin";
import { planService, type Plan } from "../service/plan";

const TEAL = "#1a7a6e";
const TEAL_BG = "#e6f7f5";
const TEAL_DARK = "#156b5e";

const defaultStats: AdminStats = {
  totalUsers: 0,
  activeOrgs: 0,
  totalJobs: 0,
  totalApplications: 0,
  activeSubscriptions: 0,
};

function statCard(label: string, value: number) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid #e8eded" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.4px", color: "#8b9795", fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 28, fontWeight: 700, color: "#202124" }}>{value.toLocaleString()}</div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>(defaultStats);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);
  const [userRole, setUserRole] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [userSearchDraft, setUserSearchDraft] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPages, setAuditPages] = useState(1);
  const [auditResourceType, setAuditResourceType] = useState("");
  const [auditAction, setAuditAction] = useState("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanMonthly, setNewPlanMonthly] = useState("0");
  const [newPlanAnnual, setNewPlanAnnual] = useState("0");
  const [newPlanTokens, setNewPlanTokens] = useState("0");

  useEffect(() => {
    let cancelled = false;
    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const data = await adminService.getStats();
        if (!cancelled) setStats(data);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load admin stats.";
          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    };
    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await adminService.getUsers({
          page: userPage,
          limit: 20,
          role: userRole,
          status: userStatus,
          search: userSearch,
        });
        if (cancelled) return;
        setUsers(response.items);
        setUserPages(response.totalPages || 1);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load users.";
          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    };
    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [userPage, userRole, userStatus, userSearch]);

  useEffect(() => {
    let cancelled = false;
    const loadAuditLogs = async () => {
      setLoadingAudit(true);
      try {
        const response = await adminService.getAuditLogs({
          page: auditPage,
          limit: 20,
          resourceType: auditResourceType,
          action: auditAction,
        });
        if (cancelled) return;
        setAuditLogs(response.items);
        setAuditPages(response.totalPages || 1);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load audit logs.";
          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoadingAudit(false);
      }
    };
    loadAuditLogs();
    return () => {
      cancelled = true;
    };
  }, [auditPage, auditResourceType, auditAction]);

  useEffect(() => {
    let cancelled = false;
    const loadPlans = async () => {
      setLoadingPlans(true);
      try {
        const items = await planService.listAllPlans();
        if (!cancelled) setPlans(items);
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : "Failed to load plans.");
      } finally {
        if (!cancelled) setLoadingPlans(false);
      }
    };
    loadPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUserStatusUpdate = async (userId: string, status: string) => {
    setUpdatingUserId(userId);
    try {
      await adminService.updateUserStatus(userId, status);
      setUsers((current) => current.map((user) => (user._id === userId ? { ...user, status } : user)));
      toast.success("User status updated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update user status.";
      toast.error(message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) {
      toast.error("Plan name is required.");
      return;
    }
    setCreatingPlan(true);
    try {
      const created = await planService.createPlan({
        name: newPlanName.trim(),
        monthlyPrice: Number(newPlanMonthly) || 0,
        annualPrice: Number(newPlanAnnual) || 0,
        includedTokens: Number(newPlanTokens) || 0,
      });
      setPlans((current) => [created, ...current]);
      setNewPlanName("");
      setNewPlanMonthly("0");
      setNewPlanAnnual("0");
      setNewPlanTokens("0");
      toast.success("Plan created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create plan.");
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleDeactivatePlan = async (planId: string) => {
    try {
      await planService.deactivatePlan(planId);
      setPlans((current) => current.map((plan) => (plan._id === planId ? { ...plan, isActive: false } : plan)));
      toast.success("Plan deactivated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to deactivate plan.");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: TEAL, fontFamily: "'DM Sans','Segoe UI',sans-serif", overflow: "hidden", borderRadius: 30 }}>
      <Sidebar />
      <main style={{ flex: 1, background: "#f7f9f9", borderRadius: "0 30px 30px 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: "#fff", padding: "18px 28px", borderBottom: "1px solid #f0f0f0" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#202124", margin: 0 }}>Admin Console</h1>
          <p style={{ fontSize: 12, color: "#8b9795", margin: "4px 0 0" }}>Platform administration (ADMIN only)</p>
        </div>

        <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
          <section>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#202124", marginBottom: 10 }}>Platform Stats</div>
            {loadingStats ? (
              <div style={{ fontSize: 13, color: "#7c8a88" }}>Loading stats...</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                {statCard("Total Users", stats.totalUsers)}
                {statCard("Active Orgs", stats.activeOrgs)}
                {statCard("Total Jobs", stats.totalJobs)}
                {statCard("Applications", stats.totalApplications)}
                {statCard("Subscriptions", stats.activeSubscriptions)}
              </div>
            )}
          </section>

          <section style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8eded", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#202124" }}>Users</div>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={userRole} onChange={(e) => { setUserPage(1); setUserRole(e.target.value); }} style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12 }}>
                  <option value="">All roles</option>
                  <option value="CANDIDATE">Candidate</option>
                  <option value="RECRUITER">Recruiter</option>
                  <option value="ORG_OWNER">Org Owner</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <select value={userStatus} onChange={(e) => { setUserPage(1); setUserStatus(e.target.value); }} style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12 }}>
                  <option value="">All status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="archived">Archived</option>
                </select>
                <input value={userSearchDraft} onChange={(e) => setUserSearchDraft(e.target.value)} placeholder="Search email/name" style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12 }} />
                <button onClick={() => { setUserPage(1); setUserSearch(userSearchDraft.trim()); }} style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700 }}>Apply</button>
              </div>
            </div>

            {loadingUsers ? (
              <div style={{ fontSize: 13, color: "#7c8a88" }}>Loading users...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {users.map((user) => (
                  <div key={user._id} style={{ border: "1px solid #eef2f2", borderRadius: 12, padding: "10px 12px", display: "grid", gridTemplateColumns: "1.2fr 0.7fr 0.7fr 0.8fr", gap: 8, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#202124" }}>{user.email}</div>
                      <div style={{ fontSize: 11, color: "#8b9795" }}>{user.name || "No name"}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#42514f", fontWeight: 700 }}>{user.role}</div>
                    <div style={{ fontSize: 12, color: "#42514f" }}>{user.status || "unknown"}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["active", "suspended", "archived"].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUserStatusUpdate(user._id, status)}
                          disabled={updatingUserId === user._id}
                          style={{
                            background: status === "active" ? TEAL_BG : "#f3f4f6",
                            color: status === "active" ? TEAL_DARK : "#4b5563",
                            border: "none",
                            borderRadius: 8,
                            padding: "6px 8px",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: updatingUserId === user._id ? "not-allowed" : "pointer",
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, color: "#7c8a88" }}>Page {userPage} of {Math.max(userPages, 1)}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setUserPage((p) => Math.max(1, p - 1))} disabled={userPage === 1} style={{ border: "1px solid #d9e5e4", background: "#fff", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>Prev</button>
                <button onClick={() => setUserPage((p) => Math.min(userPages, p + 1))} disabled={userPage >= userPages} style={{ border: "none", background: TEAL, color: "#fff", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>Next</button>
              </div>
            </div>
          </section>

          <section style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8eded", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#202124" }}>Audit Logs</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={auditResourceType} onChange={(e) => { setAuditPage(1); setAuditResourceType(e.target.value); }} placeholder="Resource type" style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12 }} />
                <input value={auditAction} onChange={(e) => { setAuditPage(1); setAuditAction(e.target.value); }} placeholder="Action (e.g. application.status_changed)" style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12, width: 260 }} />
              </div>
            </div>

            {loadingAudit ? (
              <div style={{ fontSize: 13, color: "#7c8a88" }}>Loading audit logs...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {auditLogs.map((log) => (
                  <div key={log._id} style={{ border: "1px solid #eef2f2", borderRadius: 12, padding: "10px 12px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#202124" }}>{log.action || "unknown.action"}</div>
                    <div style={{ fontSize: 11, color: "#8b9795", marginTop: 4 }}>
                      {log.actorEmail || log.actorId || "unknown actor"} · {log.resourceType || "resource"} · {log.createdAt ? new Date(log.createdAt).toLocaleString() : "unknown time"}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, color: "#7c8a88" }}>Page {auditPage} of {Math.max(auditPages, 1)}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setAuditPage((p) => Math.max(1, p - 1))} disabled={auditPage === 1} style={{ border: "1px solid #d9e5e4", background: "#fff", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>Prev</button>
                <button onClick={() => setAuditPage((p) => Math.min(auditPages, p + 1))} disabled={auditPage >= auditPages} style={{ border: "none", background: TEAL, color: "#fff", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>Next</button>
              </div>
            </div>
          </section>

          <section style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8eded", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#202124" }}>Plans</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} placeholder="Plan name" style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12 }} />
                <input value={newPlanMonthly} onChange={(e) => setNewPlanMonthly(e.target.value)} placeholder="Monthly" style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12, width: 90 }} />
                <input value={newPlanAnnual} onChange={(e) => setNewPlanAnnual(e.target.value)} placeholder="Annual" style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12, width: 90 }} />
                <input value={newPlanTokens} onChange={(e) => setNewPlanTokens(e.target.value)} placeholder="Tokens" style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12, width: 90 }} />
                <button onClick={handleCreatePlan} disabled={creatingPlan} style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700 }}>
                  {creatingPlan ? "Creating..." : "Create Plan"}
                </button>
              </div>
            </div>

            {loadingPlans ? (
              <div style={{ fontSize: 13, color: "#7c8a88" }}>Loading plans...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {plans.map((plan) => (
                  <div key={plan._id} style={{ border: "1px solid #eef2f2", borderRadius: 12, padding: "10px 12px", display: "grid", gridTemplateColumns: "1.3fr 0.7fr 0.8fr auto", gap: 8, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#202124" }}>{plan.name}</div>
                      <div style={{ fontSize: 11, color: "#8b9795" }}>{plan.slug} · {plan.currency} {plan.monthlyPrice}/mo · {plan.includedTokens} tokens</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#42514f" }}>{plan.isActive ? "active" : "inactive"}</div>
                    <div style={{ fontSize: 12, color: "#42514f" }}>BulkOps: {String(plan.canAccessBulkOps)}</div>
                    <button
                      onClick={() => handleDeactivatePlan(plan._id)}
                      disabled={!plan.isActive}
                      style={{ background: "#fff1f2", color: "#be123c", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: plan.isActive ? "pointer" : "not-allowed", opacity: plan.isActive ? 1 : 0.6 }}
                    >
                      Deactivate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
