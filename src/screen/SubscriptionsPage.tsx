import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { planService, type Plan } from "../service/plan";
import { subscriptionService, type PaymentRecord, type Subscription } from "../service/subscription";

const TEAL = "#1a7a6e";
const TEAL_DARK = "#156b5e";
const TEAL_BG = "#e6f7f5";

export default function SubscriptionsPage() {
  const { role } = useAuth();
  const isOwner = role === "ORG_OWNER";
  const canAllocate = role === "ORG_OWNER" || role === "RECRUITER";

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [planId, setPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [aiUsageMode, setAiUsageMode] = useState<"platform" | "custom">("platform");
  const [msisdn, setMsisdn] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [tokenAmount, setTokenAmount] = useState("100");
  const [candidateId, setCandidateId] = useState("");
  const [allocateJobId, setAllocateJobId] = useState("");
  const [allocateAmount, setAllocateAmount] = useState("20");

  const loadData = async () => {
    setLoading(true);
    try {
      const [current, publicPlans] = await Promise.all([
        subscriptionService.getCurrentSubscription(),
        planService.listPublicPlans(),
      ]);
      setSubscription(current);
      setPlans(publicPlans);
      if (!planId && publicPlans[0]) setPlanId(publicPlans[0]._id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load subscriptions data.");
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    setPaymentsLoading(true);
    try {
      const response = await subscriptionService.getPaymentHistory({ page: 1, limit: 20 });
      setPayments(response.items);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load payment history.");
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadPayments();
  }, []);

  const handleInitiate = async () => {
    if (!isOwner) return;
    if (!planId || !msisdn.trim()) {
      toast.error("Plan and phone are required.");
      return;
    }
    setSubmitting(true);
    try {
      await subscriptionService.initiateSubscription({
        planId,
        billingCycle,
        aiUsageMode,
        msisdn: msisdn.trim(),
      });
      toast.success("Subscription payment initiated.");
      await Promise.all([loadData(), loadPayments()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to initiate subscription.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!isOwner) return;
    setSubmitting(true);
    try {
      await subscriptionService.cancelSubscription(cancelReason.trim() || undefined);
      toast.success("Subscription marked to not auto-renew.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel subscription.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePurchaseTokens = async () => {
    if (!isOwner) return;
    const amount = Number(tokenAmount);
    if (!amount || !msisdn.trim()) {
      toast.error("Token amount and phone are required.");
      return;
    }
    setSubmitting(true);
    try {
      await subscriptionService.purchaseTokens({ tokenAmount: amount, msisdn: msisdn.trim() });
      toast.success("Token purchase initiated.");
      await loadPayments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to purchase tokens.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAllocateTokens = async () => {
    if (!canAllocate) return;
    const amount = Number(allocateAmount);
    if (!candidateId.trim() || !amount) {
      toast.error("Candidate ID and token amount are required.");
      return;
    }
    setSubmitting(true);
    try {
      await subscriptionService.allocateTokens({
        candidateId: candidateId.trim(),
        tokenAmount: amount,
        jobId: allocateJobId.trim() || undefined,
      });
      toast.success("Tokens allocated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to allocate tokens.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: TEAL, fontFamily: "'DM Sans','Segoe UI',sans-serif", overflow: "hidden", borderRadius: 30 }}>
      <Sidebar />
      <main style={{ flex: 1, background: "#f7f9f9", borderRadius: "0 30px 30px 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: "#fff", padding: "18px 28px", borderBottom: "1px solid #f0f0f0" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#202124", margin: 0 }}>Subscriptions & Plans</h1>
          <p style={{ fontSize: 12, color: "#8b9795", margin: "4px 0 0" }}>
            {isOwner ? "ORG_OWNER subscription controls and billing" : "Recruiter token allocation and billing visibility"}
          </p>
        </div>

        <div style={{ padding: "20px 24px", overflowY: "auto", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }}>
          <section style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8eded", padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#202124", marginBottom: 10 }}>Current Subscription</div>
            {loading ? (
              <div style={{ fontSize: 13, color: "#7c8a88" }}>Loading current subscription...</div>
            ) : !subscription ? (
              <div style={{ fontSize: 13, color: "#7c8a88" }}>No active subscription found.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#42514f" }}>
                <div><strong>Plan:</strong> {subscription.planId?.name}</div>
                <div><strong>Status:</strong> {subscription.status}</div>
                <div><strong>Billing:</strong> {subscription.billingCycle}</div>
                <div><strong>AI usage mode:</strong> {subscription.aiUsageMode}</div>
                <div><strong>Tokens:</strong> {subscription.tokensUsedThisPeriod ?? 0}/{subscription.tokensIncludedThisPeriod ?? 0}</div>
                <div><strong>Period End:</strong> {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleString() : "N/A"}</div>
                <div><strong>Auto renew:</strong> {String(subscription.autoRenew)}</div>
              </div>
            )}
          </section>

          <section style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8eded", padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#202124", marginBottom: 10 }}>Available Plans</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {plans.map((plan) => (
                <div key={plan._id} style={{ border: "1px solid #eef2f2", borderRadius: 10, padding: "10px 12px", background: planId === plan._id ? TEAL_BG : "#fff" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#202124" }}>{plan.name}</div>
                  <div style={{ fontSize: 12, color: "#7c8a88" }}>
                    {plan.currency} {plan.monthlyPrice}/mo · {plan.includedTokens} tokens · customAI {String(plan.canUseCustomAI)}
                  </div>
                  {isOwner && (
                    <button onClick={() => setPlanId(plan._id)} style={{ marginTop: 6, border: "none", borderRadius: 8, padding: "6px 10px", background: "#f1f5f5", fontSize: 11, cursor: "pointer" }}>
                      Select
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {isOwner && (
            <section style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8eded", padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#202124", marginBottom: 10 }}>Owner Actions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <select value={planId} onChange={(e) => setPlanId(e.target.value)} style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12 }}>
                  <option value="">Select plan</option>
                  {plans.map((plan) => <option key={plan._id} value={plan._id}>{plan.name}</option>)}
                </select>
                <input value={msisdn} onChange={(e) => setMsisdn(e.target.value)} placeholder="MSISDN (2507...)" style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12 }} />
                <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as "monthly" | "annual")} style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12 }}>
                  <option value="monthly">monthly</option>
                  <option value="annual">annual</option>
                </select>
                <select value={aiUsageMode} onChange={(e) => setAiUsageMode(e.target.value as "platform" | "custom")} style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12 }}>
                  <option value="platform">platform</option>
                  <option value="custom">custom</option>
                </select>
                <button onClick={handleInitiate} disabled={submitting} style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 10, padding: "8px 10px", fontSize: 12, fontWeight: 700 }}>
                  Initiate Subscription
                </button>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={tokenAmount} onChange={(e) => setTokenAmount(e.target.value)} placeholder="Token amount" style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12, width: "100%" }} />
                  <button onClick={handlePurchaseTokens} disabled={submitting} style={{ background: TEAL_BG, color: TEAL_DARK, border: "none", borderRadius: 10, padding: "8px 10px", fontSize: 12, fontWeight: 700 }}>
                    Buy Tokens
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Cancel reason (optional)" style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12, flex: 1 }} />
                <button onClick={handleCancel} disabled={submitting} style={{ background: "#fff1f2", color: "#be123c", border: "none", borderRadius: 10, padding: "8px 10px", fontSize: 12, fontWeight: 700 }}>
                  Cancel Auto-Renew
                </button>
              </div>
            </section>
          )}

          {canAllocate && (
            <section style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8eded", padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#202124", marginBottom: 10 }}>Allocate Tokens</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8 }}>
                <input value={candidateId} onChange={(e) => setCandidateId(e.target.value)} placeholder="Candidate ID" style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12 }} />
                <input value={allocateAmount} onChange={(e) => setAllocateAmount(e.target.value)} placeholder="Token amount" style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12 }} />
                <input value={allocateJobId} onChange={(e) => setAllocateJobId(e.target.value)} placeholder="Job ID (optional)" style={{ border: "1px solid #dce5e5", borderRadius: 10, padding: "8px 10px", fontSize: 12 }} />
                <button onClick={handleAllocateTokens} disabled={submitting} style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 10, padding: "8px 10px", fontSize: 12, fontWeight: 700 }}>
                  Allocate
                </button>
              </div>
            </section>
          )}

          <section style={{ gridColumn: "1 / -1", background: "#fff", borderRadius: 14, border: "1px solid #e8eded", padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#202124", marginBottom: 10 }}>Payment History</div>
            {paymentsLoading ? (
              <div style={{ fontSize: 13, color: "#7c8a88" }}>Loading payments...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {payments.map((payment) => (
                  <div key={payment._id} style={{ border: "1px solid #eef2f2", borderRadius: 10, padding: "10px 12px", display: "grid", gridTemplateColumns: "0.8fr 0.8fr 0.8fr 1.5fr", gap: 8 }}>
                    <div style={{ fontSize: 12, color: "#202124", fontWeight: 700 }}>{payment.status}</div>
                    <div style={{ fontSize: 12, color: "#42514f" }}>{payment.currency} {payment.amount}</div>
                    <div style={{ fontSize: 12, color: "#42514f" }}>{payment.type}</div>
                    <div style={{ fontSize: 11, color: "#7c8a88" }}>
                      {payment.externalProvider || "provider"} · {payment.externalPaymentId || "no ref"} · {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "N/A"}
                    </div>
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

