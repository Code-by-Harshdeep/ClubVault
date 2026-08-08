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

// Quick "Request Reimbursement" form — posts a pending expense transaction
function ReimbursementModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !category || !amount) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        title,
        category,
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
      <div className="cv-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Request Reimbursement</h3>
        <form onSubmit={handleSubmit} className="cv-modal-form">
          <label>Description</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Printing costs" />
          <label>Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Operations" />
          <label>Amount (₹)</label>
          <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          {error && <p className="cv-modal-error">{error}</p>}
          <div className="cv-modal-actions">
            <button type="button" className="cv-btn-secondary-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="cv-btn-secondary-sm cv-btn-primary-sm" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
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

  return (
    <div className="cv-dash-page">
      <div className="cv-dash-orb" />

      {showReimbursement && (
        <ReimbursementModal
          onClose={() => setShowReimbursement(false)}
          onSubmit={handleAddTransaction}
        />
      )}

      <div className="cv-dash-page-header">
        <div>
          <span className="cv-dash-eyebrow-badge">
            <Sparkles size={12} className="cv-sparkle-icon" /> {club?.name || "Treasury Workspace"}
          </span>
          <h1 className="cv-dash-title">Club Financial Standing</h1>
        </div>

        <div className="cv-header-actions">
          <button
            type="button"
            className="cv-btn-secondary-sm"
            onClick={() => {
              const rows = [
                ["Description", "Category", "Date", "Status", "Amount"],
                ...entries.map((e) => [e.title, e.category, formatDate(e.date), e.status, e.amount]),
              ];
              const csv = rows.map((r) => r.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "audit-log.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
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
            <span className="cv-stat-label">TOTAL VAULT BALANCE</span>
            <div className="cv-icon-bubble primary">
              <Building2 size={18} />
            </div>
          </div>
          <p className="cv-stat-value">
            {loading ? "…" : formatMoney(summary?.totalBalance)}
          </p>
          <div className="cv-card-footer-info">
            <span>{summary?.memberCount ?? 0} members</span>
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
            <MiniSparkline values={[45, 60, 50, 75, 65, 85]} tone="info" />
          </div>
          <p className="cv-stat-sub">Across this club</p>
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
            <MiniSparkline values={[30, 55, 40, 70, 85, 95]} tone="warning" />
          </div>
          <div className="cv-warning-footer">
            <span className="cv-badge-trend warning">
              <AlertCircle size={12} /> Requires Treasurer Review
            </span>
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
                      No ledger entries yet. Add one from Transactions.
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
            <p>Direct treasurer actions</p>
          </div>

          <button
            type="button"
            className="cv-quick-action-pill highlight"
            onClick={() => setShowReimbursement(true)}
          >
            <div className="cv-action-left">
              <div className="cv-action-icon accent">
                <Plus size={18} />
              </div>
              <div>
                <span className="cv-action-title">Request Reimbursement</span>
                <span className="cv-action-sub">Submit expense claim</span>
              </div>
            </div>
            <ArrowUpRight size={16} className="cv-action-arrow" />
          </button>

          <button
            type="button"
            className="cv-quick-action-pill"
            onClick={() => navigate("/transactions")}
          >
            <div className="cv-action-left">
              <div className="cv-action-icon">
                <Upload size={18} />
              </div>
              <div>
                <span className="cv-action-title">Log a Transaction</span>
                <span className="cv-action-sub">Add income or expense</span>
              </div>
            </div>
            <ArrowUpRight size={16} className="cv-action-arrow" />
          </button>

          <button
            type="button"
            className="cv-quick-action-pill"
            onClick={() => navigate("/events")}
          >
            <div className="cv-action-left">
              <div className="cv-action-icon">
                <CalendarCheck2 size={18} />
              </div>
              <div>
                <span className="cv-action-title">Plan an Event</span>
                <span className="cv-action-sub">Set up a micro-budget</span>
              </div>
            </div>
            <ArrowUpRight size={16} className="cv-action-arrow" />
          </button>
        </div>
      </div>
    </div>
  );
}
