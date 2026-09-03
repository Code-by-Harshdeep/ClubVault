import React, { useEffect, useState } from "react";
import {
  Building2,
  PieChart,
  Clock,
  ArrowUpRight,
  Plus,
  Upload,
  CalendarCheck2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Search,
  X,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClub } from "../../ClubContext";
import { api } from "../../api";
import { hasFeature } from "../../features";
import "./Dashboard.css";

function MiniSparkline({ values, tone }) {
  return (
    <div className={`cv-mini-sparkline ${tone}`}>
      {values.map((h, i) => (
        <span key={i} style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

function formatMoney(n) {
  const num = Number(n) || 0;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

// Quick "Request Reimbursement" form — posts a pending expense transaction charged to a valid budget line
function ReimbursementModal({ onClose, onSubmit, budgets = [] }) {
  const [title, setTitle] = useState("");
  const [merchant, setMerchant] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [budgetId, setBudgetId] = useState(budgets[0]?._id || budgets[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!budgetId && budgets.length > 0) {
      setBudgetId(budgets[0]._id || budgets[0].id || "");
    }
  }, [budgets, budgetId]);

  const activeBudgetId = budgetId || budgets[0]?._id || budgets[0]?.id || "";
  const selectedBudget = budgets.find((b) => (b._id || b.id) === activeBudgetId);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Receipt image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptUrl(reader.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !amount) {
      setError("Please fill in all required fields.");
      return;
    }
    const finalBudgetId = budgetId || budgets[0]?._id || budgets[0]?.id || "";
    if (!finalBudgetId) {
      setError("Please select a budget line. Expenses cannot be logged outside an allocation.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        title,
        merchant,
        receiptUrl,
        category: selectedBudget?.category || "General",
        budgetId: finalBudgetId,
        type: "expense",
        amount: Number(amount),
        status: "Pending Bill",
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cv-modal-overlay" onClick={onClose}>
      <div className="cv-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
        <h3>Request Reimbursement</h3>
        {budgets.length === 0 ? (
          <div style={{ padding: "16px 0", textAlign: "center" }}>
            <p className="cv-modal-error" style={{ marginBottom: "16px" }}>
              No active budget lines found. An admin must create a budget category in Budgets before submitting expense claims.
            </p>
            <button type="button" className="cv-btn-secondary-sm cv-btn-primary-sm" onClick={onClose}>
              Got It
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="cv-modal-form">
            <label>Item / Expense Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Workshop Supplies, Snacks"
              required
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label>Merchant / Vendor</label>
                <input
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g. Amazon, Stationery"
                />
              </div>
              <div>
                <label>Amount (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <label>Charge To Budget Line *</label>
            <select
              value={activeBudgetId}
              onChange={(e) => setBudgetId(e.target.value)}
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

            <label>Receipt Bill / Proof of Purchase (Upload or URL)</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ fontSize: "12px", flex: 1, padding: "6px" }}
              />
            </div>
            <input
              type="url"
              value={receiptUrl && !receiptUrl.startsWith("data:") ? receiptUrl : ""}
              onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder="Or paste receipt image link (https://...)"
            />

            {receiptUrl && (
              <div style={{ marginTop: "8px", padding: "8px", border: "1px solid var(--color-border-soft)", borderRadius: "6px", display: "flex", alignItems: "center", gap: "10px" }}>
                <img src={receiptUrl} alt="Receipt preview" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
                <span style={{ fontSize: "12px", color: "var(--color-on-surface-variant)" }}>Receipt attached</span>
                <button type="button" onClick={() => setReceiptUrl("")} style={{ marginLeft: "auto", fontSize: "11px", color: "var(--color-rose-text)", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
              </div>
            )}

            {error && <p className="cv-modal-error">{error}</p>}
            <div className="cv-modal-actions" style={{ marginTop: "16px" }}>
              <button type="button" className="cv-btn-secondary-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="cv-btn-secondary-sm cv-btn-primary-sm" disabled={loading}>
                {loading ? "Submitting..." : "Submit Claim"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


export default function Dashboard() {
  const { club } = useClub();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReimbursement, setShowReimbursement] = useState(false);

  const loadDashboard = async () => {
    if (!club?._id) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/api/clubs/${club._id}/dashboard`);
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [club?._id]);

  const handleAddTransaction = async (payload) => {
    await api.post(`/api/clubs/${club._id}/transactions`, payload);
    await loadDashboard();
  };

  const entries = summary?.recentTransactions || [];

  const filteredEntries = entries.filter((entry) => {
    const statusType =
      entry.status === "Pending Bill"
        ? "warning"
        : entry.status === "Reimbursed"
        ? "neutral"
        : "success";

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "expense" && entry.type === "expense") ||
      (activeTab === "income" && entry.type === "income") ||
      (activeTab === "pending" && statusType === "warning");

    const haystack = `${entry.title} ${entry.category}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const reimbursementsEnabled = hasFeature(club, "reimbursements");
  const eventsEnabled = hasFeature(club, "events");

  const handleExportCsv = async () => {
    try {
      let exportRows = entries;
      if (club?._id) {
        const fullTx = await api.get(`/api/clubs/${club._id}/transactions`);
        if (fullTx?.transactions?.length) {
          exportRows = fullTx.transactions;
        }
      }
      const rows = [
        ["Description", "Category", "Date", "Status", "Type", "Amount"],
        ...exportRows.map((e) => [
          `"${(e.title || "").replace(/"/g, '""')}"`,
          `"${(e.category || "").replace(/"/g, '""')}"`,
          formatDate(e.date),
          e.status || "Cleared",
          e.type || "expense",
          e.amount,
        ]),
      ];
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(club?.name || "club").toLowerCase().replace(/\s+/g, "-")}-audit-ledger.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  return (
    <div className="cv-dash-page">
      {showReimbursement && (
        <ReimbursementModal
          budgets={summary?.budgets || []}
          onClose={() => setShowReimbursement(false)}
          onSubmit={handleAddTransaction}
        />
      )}

      <div className="cv-dash-page-header">
        <div>
          <div className="cv-dash-club-badge">
            <Building2 size={13} /> {club?.name || "Club Treasury"}
          </div>
          <h1 className="cv-dash-title">Financial Overview</h1>
          <p className="cv-dash-subtitle">Track your club's available funds, budgets, and recent transactions.</p>
        </div>

        <div className="cv-header-actions">
          <button
            type="button"
            className="cv-btn-secondary-sm"
            onClick={handleExportCsv}
          >
            <FileSpreadsheet size={14} /> Export Audit Sheet
          </button>
        </div>
      </div>

      {error && <p className="cv-dash-error">{error}</p>}

      <div className="cv-stats-row">
        <div className="cv-glass-stat-card primary-highlight">
          <div className="cv-stat-accent-bar primary" />
          <div className="cv-stat-header">
            <span className="cv-stat-label">AVAILABLE TREASURY FUNDS</span>
            <div className="cv-icon-bubble primary">
              <Building2 size={18} />
            </div>
          </div>
          <p className="cv-stat-value">
            {loading ? "…" : formatMoney(summary?.availableFunds ?? summary?.remainingBudget ?? summary?.totalBalance)}
          </p>
          <div className="cv-card-footer-info">
            <span>
              {(summary?.totalAllocated || 0) > 0 ? (
                <>Allocated: ₹{Number(summary.totalAllocated).toLocaleString("en-IN")} · Spent: ₹{Number(summary.totalBudgetSpent || 0).toLocaleString("en-IN")}</>
              ) : (
                <>{summary?.memberCount ?? 0} member{summary?.memberCount === 1 ? "" : "s"} · Live ledger</>
              )}
              {(summary?.pendingExpenses || 0) > 0 && ` · ₹${summary.pendingExpenses.toLocaleString("en-IN")} pending`}
            </span>
          </div>
        </div>


        <div className="cv-glass-stat-card">
          <div className="cv-stat-accent-bar info" />
          <div className="cv-stat-header">
            <span className="cv-stat-label">ACTIVE BUDGETS</span>
            <div className="cv-icon-bubble info">
              <PieChart size={18} />
            </div>
          </div>
          <div className="cv-stat-value-row">
            <p className="cv-stat-value">{loading ? "…" : summary?.activeBudgets ?? 0}</p>
            {(summary?.activeBudgets || 0) > 0 && (
              <MiniSparkline values={[45, 60, 50, 75, 65, 85]} tone="info" />
            )}
          </div>
          <p className="cv-stat-sub">
            {(summary?.activeBudgets || 0) > 0
              ? `${summary.activeBudgets} active categor${summary.activeBudgets === 1 ? "y" : "ies"}`
              : "No budgets created yet"}
          </p>
        </div>

        <div className="cv-glass-stat-card warning-highlight">
          <div className="cv-stat-accent-bar warning" />
          <div className="cv-stat-header">
            <span className="cv-stat-label">PENDING REIMBURSEMENTS</span>
            <div className="cv-icon-bubble warning">
              <Clock size={18} />
            </div>
          </div>
          <div className="cv-stat-value-row">
            <p className="cv-stat-value">{loading ? "…" : summary?.pendingReimbursements ?? 0}</p>
            {(summary?.pendingReimbursements || 0) > 0 && (
              <MiniSparkline values={[30, 55, 40, 70, 85, 95]} tone="warning" />
            )}
          </div>
          <div className="cv-warning-footer">
            {(summary?.pendingReimbursements || 0) > 0 ? (
              <span className="cv-badge-trend warning">
                <AlertCircle size={12} /> Requires Treasurer Review
              </span>
            ) : (
              <span className="cv-badge-trend success">
                <CheckCircle2 size={12} /> All claims settled
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="cv-dash-grid">
        <div className="cv-ledger-panel">
          <div className="cv-panel-header">
            <div>
              <h2 className="cv-panel-title">Recent Ledger Entries</h2>
              <p className="cv-panel-sub">Real-time audited transactions</p>
            </div>

            <div className="cv-filter-tabs">
              {["all", "expense", "income", "pending"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`cv-tab-btn ${activeTab === t ? "active" : ""}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="cv-table-search-bar">
            <Search size={14} className="cv-search-icon" />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button type="button" className="cv-clear-btn" onClick={() => setSearchTerm("")}>
                <X size={12} />
              </button>
            )}
          </div>

          <div className="cv-table-scroll">
            <table className="cv-ledger-table">
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th>CATEGORY</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="cv-empty-state">Loading ledger…</td>
                  </tr>
                ) : filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => {
                    const statusType =
                      entry.status === "Pending Bill"
                        ? "warning"
                        : entry.status === "Reimbursed"
                        ? "neutral"
                        : "success";
                    return (
                      <tr key={entry._id} className="cv-table-row">
                        <td>
                          <div className="cv-entry-info">
                            <p className="cv-entry-title">{entry.title}</p>
                          </div>
                        </td>
                        <td>
                          <span className={`cv-tag cv-tag-${entry.type}`}>{entry.category}</span>
                        </td>
                        <td className="cv-entry-date">{formatDate(entry.date)}</td>
                        <td>
                          <span className={`cv-status-pill ${statusType}`}>
                            {statusType === "success" && <CheckCircle2 size={12} />}
                            {statusType === "warning" && <Clock size={12} />}
                            {entry.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }} className={`cv-entry-amount ${entry.type}`}>
                          <span className={`cv-amount-chip ${entry.type}`}>
                            {entry.type === "income" ? "+" : "-"}
                            {formatMoney(entry.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="cv-empty-state">
                      {searchTerm
                        ? `No ledger entries found matching "${searchTerm}".`
                        : activeTab === "expense"
                        ? "No expense entries recorded yet."
                        : activeTab === "income"
                        ? "No income entries recorded yet."
                        : activeTab === "pending"
                        ? "No pending reimbursement claims."
                        : "No ledger entries yet. Log a transaction to get started."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="cv-actions-stack">
          <div className="cv-actions-header">
            <h3>Executive Operations</h3>
            <p>Direct treasurer &amp; officer actions</p>
          </div>

          <div className="cv-actions-list">
            <button
              type="button"
              className={`cv-quick-action-pill ${!reimbursementsEnabled ? "disabled-feature" : ""}`}
              onClick={() => {
                if (reimbursementsEnabled) {
                  setShowReimbursement(true);
                } else {
                  alert("Reimbursements are currently disabled. An admin can enable them in Settings.");
                }
              }}
            >
              <div className="cv-action-left">
                <div className="cv-action-icon accent">
                  <Plus size={18} />
                </div>
                <div className="cv-action-text-box">
                  <span className="cv-action-title">Request Reimbursement</span>
                  <span className="cv-action-sub">
                    {reimbursementsEnabled ? "Submit expense claim" : "Feature disabled in Settings"}
                  </span>
                </div>
              </div>
              <ArrowUpRight size={16} className="cv-action-arrow" />
            </button>

            <button
              type="button"
              className="cv-quick-action-pill"
              onClick={() => navigate("/transactions?new=1")}
            >
              <div className="cv-action-left">
                <div className="cv-action-icon">
                  <Upload size={18} />
                </div>
                <div className="cv-action-text-box">
                  <span className="cv-action-title">Log a Transaction</span>
                  <span className="cv-action-sub">Record income or expense</span>
                </div>
              </div>
              <ArrowUpRight size={16} className="cv-action-arrow" />
            </button>

            <button
              type="button"
              className={`cv-quick-action-pill ${!eventsEnabled ? "disabled-feature" : ""}`}
              onClick={() => {
                if (eventsEnabled) {
                  navigate("/events");
                } else {
                  alert("Events Planning is currently disabled. An admin can enable it in Settings.");
                }
              }}
            >
              <div className="cv-action-left">
                <div className="cv-action-icon">
                  <CalendarCheck2 size={18} />
                </div>
                <div className="cv-action-text-box">
                  <span className="cv-action-title">Plan an Event</span>
                  <span className="cv-action-sub">
                    {eventsEnabled ? "Allocate event budget" : "Feature disabled in Settings"}
                  </span>
                </div>
              </div>
              <ArrowUpRight size={16} className="cv-action-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
