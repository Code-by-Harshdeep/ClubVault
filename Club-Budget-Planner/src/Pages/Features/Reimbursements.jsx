import React, { useEffect, useMemo, useState } from "react";
import { Check, ClipboardCheck, RefreshCw, WalletCards, Receipt, Eye, Plus, X } from "lucide-react";
import { useClub } from "../../ClubContext";
import { api } from "../../api";
import RequireFeature from "../../Components/RequireFeature";
import "./FeaturePages.css";

const money = (value) => `₹${(Number(value) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

function ReimbursementsContent() {
  const { club, role } = useClub();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(null);
  const [error, setError] = useState("");
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Modal form states
  const [claimTitle, setClaimTitle] = useState("");
  const [claimMerchant, setClaimMerchant] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [claimBudgetId, setClaimBudgetId] = useState("");
  const [claimReceiptUrl, setClaimReceiptUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const isAdmin = role === "admin";

  const load = async () => {
    if (!club?._id) return;
    setLoading(true);
    setError("");
    try {
      const [txData, bData] = await Promise.all([
        api.get(`/api/clubs/${club._id}/transactions`),
        api.get(`/api/clubs/${club._id}/budgets`).catch(() => ({ budgets: [] })),
      ]);
      setTransactions((txData.transactions || []).filter((item) => item.type === "expense" && item.status !== "Cleared"));
      setBudgets(bData.budgets || []);
      if (bData.budgets?.length > 0 && !claimBudgetId) {
        setClaimBudgetId(bData.budgets[0]._id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [club?._id]);

  const pending = useMemo(() => transactions.filter((item) => item.status === "Pending Bill"), [transactions]);
  const total = useMemo(() => pending.reduce((sum, item) => sum + Number(item.amount || 0), 0), [pending]);

  const updateStatus = async (id, status) => {
    setWorking(id);
    setError("");
    try {
      await api.patch(`/api/clubs/${club._id}/transactions/${id}/status`, { status });
      await load();
    } catch (err) { setError(err.message); } finally { setWorking(null); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setFormError("Receipt file size must be less than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setClaimReceiptUrl(reader.result);
      setFormError("");
    };
    reader.readAsDataURL(file);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!claimTitle || !claimAmount) {
      setFormError("Please enter title and amount.");
      return;
    }
    const finalBudgetId = claimBudgetId || budgets[0]?._id || budgets[0]?.id || "";
    if (!finalBudgetId) {
      setFormError("Please select a budget line.");
      return;
    }
    setSubmitting(true);
    try {
      const selectedBudget = budgets.find((b) => (b._id || b.id) === finalBudgetId);
      await api.post(`/api/clubs/${club._id}/transactions`, {
        title: claimTitle,
        merchant: claimMerchant,
        receiptUrl: claimReceiptUrl,
        category: selectedBudget?.category || "General",
        budgetId: finalBudgetId,
        type: "expense",
        amount: Number(claimAmount),
        status: "Pending Bill",
      });
      setShowClaimModal(false);
      setClaimTitle("");
      setClaimMerchant("");
      setClaimAmount("");
      setClaimReceiptUrl("");
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="feature-page">
      <header className="feature-page-header">
        <div>
          <p className="feature-page-eyebrow"><ClipboardCheck size={14} /> Expense workflow</p>
          <h1>Reimbursements</h1>
          <p>Submit and review student expense claims, verify receipts, and disburse approved payouts.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="feature-action" onClick={() => setShowClaimModal(true)} style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
            <Plus size={15} /> Submit Claim
          </button>
          <button className="feature-action" onClick={load} disabled={loading}><RefreshCw size={15} /> Refresh</button>
        </div>
      </header>

      {error && <p className="feature-muted" style={{ color: "var(--color-rose-text)" }}>{error}</p>}

      <section className="feature-stat-grid">
        <div className="feature-stat"><span>Awaiting review</span><strong>{loading ? "..." : pending.length}</strong></div>
        <div className="feature-stat"><span>Pending value</span><strong>{loading ? "..." : money(total)}</strong></div>
        <div className="feature-stat"><span>Your role</span><strong>{isAdmin ? "Admin (Approver)" : "Member"}</strong></div>
      </section>

      <section className="feature-panel">
        <h2>Claim queue</h2>
        <p>{isAdmin ? "Review proof of purchase, approve valid claims, or mark them as reimbursed after payment." : "Your pending claims and payment statuses appear here."}</p>
        
        {loading ? (
          <div className="feature-empty">Loading claims...</div>
        ) : transactions.length === 0 ? (
          <div className="feature-empty"><WalletCards size={24} /><p>No reimbursement claims recorded.</p></div>
        ) : (
          <div className="feature-table-wrap">
            <table className="feature-table">
              <thead>
                <tr>
                  <th>Claim Details</th>
                  <th>Budget Line</th>
                  <th>Receipt / Proof</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.title}</strong>
                      {item.merchant && <div style={{ fontSize: "12px", color: "var(--color-on-surface-variant)" }}>Vendor: {item.merchant}</div>}
                      <span className="feature-muted">{item.category}</span>
                    </td>
                    <td>{item.budget?.title || "-"}</td>
                    <td>
                      {item.receiptUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreviewReceipt(item.receiptUrl)}
                          style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px", fontSize: "11px", fontWeight: "600", borderRadius: "4px", background: "var(--color-indigo-bg)", color: "var(--color-indigo-text)", border: "1px solid var(--color-indigo-border)", cursor: "pointer" }}
                        >
                          <Eye size={12} /> View Receipt
                        </button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--color-on-surface-subtle)" }}>No receipt</span>
                      )}
                    </td>
                    <td>{date(item.date)}</td>
                    <td><strong style={{ fontFamily: "monospace", fontSize: "14px" }}>{money(item.amount)}</strong></td>
                    <td>
                      <span className={`feature-badge ${item.status === "Pending Bill" ? "pending" : item.status.toLowerCase()}`}>
                        {item.status === "Pending Bill" ? "Pending" : item.status}
                      </span>
                    </td>
                    <td>
                      {isAdmin && item.status !== "Reimbursed" ? (
                        <div className="feature-row-actions">
                          {item.status === "Pending Bill" && (
                            <button onClick={() => updateStatus(item._id, "Approved")} disabled={working === item._id}>
                              <Check size={13} /> Approve
                            </button>
                          )}
                          <button onClick={() => updateStatus(item._id, "Reimbursed")} disabled={working === item._id}>
                            Mark Paid
                          </button>
                        </div>
                      ) : (
                        <span className="feature-muted">{item.status === "Reimbursed" ? "Paid & Settled" : "Under review"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Receipt Preview Lightbox Modal */}
      {previewReceipt && (
        <div className="cv-modal-overlay" onClick={() => setPreviewReceipt(null)}>
          <div className="cv-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", padding: "20px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Receipt size={18} /> Receipt Proof
              </h3>
              <button type="button" onClick={() => setPreviewReceipt(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ maxHeight: "65vh", overflowY: "auto", borderRadius: "8px", border: "1px solid var(--color-border-soft)", background: "#000" }}>
              <img src={previewReceipt} alt="Receipt proof" style={{ maxWidth: "100%", maxHeight: "100%", display: "block", margin: "0 auto" }} />
            </div>
            <div style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="cv-btn-secondary-sm" onClick={() => setPreviewReceipt(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Claim Modal */}
      {showClaimModal && (
        <div className="cv-modal-overlay" onClick={() => setShowClaimModal(false)}>
          <div className="cv-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <h3>Submit Reimbursement Claim</h3>
            {budgets.length === 0 ? (
              <div style={{ padding: "16px 0", textAlign: "center" }}>
                <p className="cv-modal-error" style={{ marginBottom: "16px" }}>
                  No active budget lines found. An admin must create a budget category before claims can be submitted.
                </p>
                <button type="button" className="cv-btn-secondary-sm cv-btn-primary-sm" onClick={() => setShowClaimModal(false)}>
                  Got It
                </button>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="cv-modal-form">
                <label>Expense / Item Title *</label>
                <input
                  value={claimTitle}
                  onChange={(e) => setClaimTitle(e.target.value)}
                  placeholder="e.g. Printing & Club Banners"
                  required
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label>Merchant / Vendor</label>
                    <input
                      value={claimMerchant}
                      onChange={(e) => setClaimMerchant(e.target.value)}
                      placeholder="e.g. Campus Print Shop"
                    />
                  </div>
                  <div>
                    <label>Amount (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <label>Charge To Budget Line *</label>
                <select
                  value={claimBudgetId || budgets[0]?._id || budgets[0]?.id || ""}
                  onChange={(e) => setClaimBudgetId(e.target.value)}
                >
                  {budgets.map((b) => {
                    const id = b._id || b.id;
                    const remainingVal = Number(b.remaining ?? b.allocated - (b.spent || 0));
                    return (
                      <option key={id} value={id}>
                        {b.title} (₹{remainingVal.toLocaleString("en-IN")} remaining)
                      </option>
                    );
                  })}
                </select>

                <label>Receipt Proof (Image Upload or Link)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ fontSize: "12px", marginBottom: "6px" }}
                />
                <input
                  type="url"
                  value={claimReceiptUrl && !claimReceiptUrl.startsWith("data:") ? claimReceiptUrl : ""}
                  onChange={(e) => setClaimReceiptUrl(e.target.value)}
                  placeholder="Or paste receipt image URL"
                />

                {claimReceiptUrl && (
                  <div style={{ marginTop: "8px", padding: "8px", border: "1px solid var(--color-border-soft)", borderRadius: "6px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <img src={claimReceiptUrl} alt="Receipt preview" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
                    <span style={{ fontSize: "12px", color: "var(--color-on-surface-variant)" }}>Receipt attached</span>
                    <button type="button" onClick={() => setClaimReceiptUrl("")} style={{ marginLeft: "auto", fontSize: "11px", color: "var(--color-rose-text)", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                  </div>
                )}

                {formError && <p className="cv-modal-error">{formError}</p>}

                <div className="cv-modal-actions" style={{ marginTop: "16px" }}>
                  <button type="button" className="cv-btn-secondary-sm" onClick={() => setShowClaimModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="cv-btn-secondary-sm cv-btn-primary-sm" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Claim"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function Reimbursements() {
  return (
    <RequireFeature feature="reimbursements">
      <ReimbursementsContent />
    </RequireFeature>
  );
}
