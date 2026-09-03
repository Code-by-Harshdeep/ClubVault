import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  FileSpreadsheet,
  ReceiptText,
  CheckCircle2,
  Clock,
  X,
  Tag,
  Wallet,
  Building2,
} from "lucide-react";
import { useClub } from "../../ClubContext";
import { api } from "../../api";
import "./Transactions.css";

function formatMoney(n) {
  const num = Number(n) || 0;
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function NewTransactionModal({ onClose, onSubmit, defaultType, budgets = [] }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [budgetId, setBudgetId] = useState(budgets[0]?._id || budgets[0]?.id || "");
  const [type, setType] = useState(defaultType === "income" ? "income" : "expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync budgetId if budgets load asynchronously
  useEffect(() => {
    if (!budgetId && budgets.length > 0) {
      setBudgetId(budgets[0]._id || budgets[0].id || "");
    }
  }, [budgets, budgetId]);

  const activeBudgetId = budgetId || budgets[0]?._id || budgets[0]?.id || "";
  const selected = budgets.find((b) => (b._id || b.id) === activeBudgetId);
  const remaining = selected
    ? Number(selected.remaining ?? (selected.allocated - (selected.spent || 0)))
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !amount) {
      setError("Please fill in all fields.");
      return;
    }
    const finalBudgetId = budgetId || budgets[0]?._id || budgets[0]?.id || "";
    if (type === "expense" && !finalBudgetId) {
      setError("Choose a budget line. Expenses cannot be logged outside an allocation.");
      return;
    }
    if (type === "expense" && remaining != null && Number(amount) > remaining + 0.009) {
      setError(`Only ₹${remaining.toLocaleString("en-IN")} remains on this budget line.`);
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        title,
        category: type === "expense" ? selected?.category || category || "General" : category || "Income",
        type,
        amount: Number(amount),
        date: date ? new Date(date) : new Date(),
        budgetId: type === "expense" ? finalBudgetId : undefined,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cv-tx-modal-overlay" onClick={onClose}>
      <div className="cv-tx-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="cv-tx-modal-header">
          <h3>Log New Transaction</h3>
          <button type="button" className="cv-tx-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cv-tx-modal-form">
          <label>Type</label>
          <div className="cv-tx-type-switch">
            <button
              type="button"
              className={type === "expense" ? "active expense" : ""}
              onClick={() => setType("expense")}
            >
              <ArrowDownLeft size={14} /> Expense
            </button>
            <button
              type="button"
              className={type === "income" ? "active income" : ""}
              onClick={() => setType("income")}
            >
              <ArrowUpRight size={14} /> Income
            </button>
          </div>

          <label>Description</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fall Festival Catering, Domain License"
          />

          <label>Transaction Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {type === "expense" ? (
            <>
              <label>Charge to Budget Line</label>
              {budgets.length === 0 ? (
                <p className="cv-tx-modal-hint warning">
                  No budgets exist. Create a budget line in Budgets before logging expenses.
                </p>
              ) : (
                <select
                  value={activeBudgetId}
                  onChange={(e) => setBudgetId(e.target.value)}
                >
                  {budgets.map((b) => {
                    const id = b._id || b.id;
                    const remainingVal = Number(b.remaining ?? (b.allocated - (b.spent || 0)));
                    return (
                      <option key={id} value={id}>
                        {b.title} — ₹{remainingVal.toLocaleString("en-IN")} left
                      </option>
                    );
                  })}
                </select>
              )}
            </>
          ) : (
            <>
              <label>Income Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Member Dues, Sponsorship"
              />
            </>
          )}

          <label>Amount (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />

          {error && <p className="cv-tx-modal-error">{error}</p>}

          <div className="cv-tx-modal-actions">
            <button type="button" className="cv-tx-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cv-tx-submit-btn" disabled={loading}>
              {loading ? "Saving…" : "Save Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Transactions() {
  const { club } = useClub();
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowModal(true);
      searchParams.delete("new");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    if (!club?._id) return;
    setLoading(true);
    setError("");
    try {
      const [txData, budgetData] = await Promise.all([
        api.get(`/api/clubs/${club._id}/transactions`),
        api.get(`/api/clubs/${club._id}/budgets`),
      ]);
      setTransactions(txData.transactions || []);
      setBudgets(budgetData.budgets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [club?._id]);

  const handleCreate = async (payload) => {
    await api.post(`/api/clubs/${club._id}/transactions`, payload);
    await load();
  };

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalExpenses = useMemo(
    () => transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const netFlow = totalIncome - totalExpenses;

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => filter === "all" || t.type === filter)
      .filter((t) => `${t.title} ${t.category}`.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [transactions, filter, searchTerm]);

  const handleExportCsv = () => {
    const rows = [
      ["Date", "Description", "Category", "Type", "Status", "Amount (INR)"],
      ...filtered.map((t) => [
        formatDate(t.date),
        `"${(t.title || "").replace(/"/g, '""')}"`,
        `"${(t.category || "").replace(/"/g, '""')}"`,
        t.type || "expense",
        t.status || "Cleared",
        t.amount,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(club?.name || "club").toLowerCase().replace(/\s+/g, "-")}-transactions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cv-tx-page">
      {showModal && (
        <NewTransactionModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
          defaultType={filter === "income" ? "income" : "expense"}
          budgets={budgets}
        />
      )}

      <main className="cv-tx-container">
        <header className="cv-tx-header">
          <div>
            <div className="cv-dash-club-badge">
              <Building2 size={13} /> {club?.name || "Club Ledger"}
            </div>
            <h1 className="cv-tx-title">Ledger &amp; Transactions</h1>
            <p className="cv-tx-subtitle">
              Comprehensive record of club income, expenses, and reimbursement payouts.
            </p>
          </div>

          <div className="cv-tx-header-actions">
            <button
              type="button"
              className="cv-btn-secondary"
              onClick={handleExportCsv}
            >
              <FileSpreadsheet size={14} />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              className="cv-btn-primary"
              onClick={() => setShowModal(true)}
            >
              <Plus size={15} />
              <span>Log Transaction</span>
            </button>
          </div>
        </header>

        {error && <p className="cv-tx-error">{error}</p>}

        <section className="cv-tx-kpi-grid">
          <div className="cv-tx-kpi-card">
            <div className="cv-tx-kpi-head">
              <span className="cv-tx-kpi-label">TOTAL INCOME</span>
              <div className="cv-tx-icon-bubble income">
                <ArrowUpRight size={15} />
              </div>
            </div>
            <p className="cv-tx-kpi-value">{loading ? "…" : formatMoney(totalIncome)}</p>
            <span className="cv-tx-kpi-sub">Inbound dues &amp; grants</span>
          </div>

          <div className="cv-tx-kpi-card">
            <div className="cv-tx-kpi-head">
              <span className="cv-tx-kpi-label">TOTAL EXPENSES</span>
              <div className="cv-tx-icon-bubble expense">
                <ArrowDownLeft size={15} />
              </div>
            </div>
            <p className="cv-tx-kpi-value">{loading ? "…" : formatMoney(totalExpenses)}</p>
            <span className="cv-tx-kpi-sub">All-time disbursements</span>
          </div>

          <div className="cv-tx-kpi-card">
            <div className="cv-tx-kpi-head">
              <span className="cv-tx-kpi-label">NET CASH FLOW</span>
              <div className="cv-tx-icon-bubble balance">
                <Wallet size={15} />
              </div>
            </div>
            <p className="cv-tx-kpi-value">{loading ? "…" : formatMoney(netFlow)}</p>
            <span className={`cv-tx-badge-trend ${netFlow >= 0 ? "positive" : "negative"}`}>
              {netFlow >= 0 ? "✓ Positive margin" : "⚠️ Incurring net deficit"}
            </span>
          </div>
        </section>

        <section className="cv-tx-ledger-card">
          <div className="cv-tx-ledger-toolbar">
            <div className="cv-tx-filter-tabs">
              {[
                { id: "all", label: "All Records" },
                { id: "expense", label: "Expenses" },
                { id: "income", label: "Income" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`cv-tx-tab-btn ${filter === tab.id ? "active" : ""}`}
                  onClick={() => setFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="cv-tx-search-bar">
              <Search size={14} className="cv-tx-search-icon" />
              <input
                type="text"
                placeholder="Search description, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button type="button" className="cv-tx-clear-btn" onClick={() => setSearchTerm("")}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="cv-tx-table-wrapper">
            <table className="cv-tx-table">
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
                    <td colSpan="5" className="cv-tx-empty-state">Loading transactions…</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="cv-tx-empty-state">
                      <div className="cv-tx-empty-box">
                        <ReceiptText size={28} />
                        <h4>No transactions found</h4>
                        <p>
                          {searchTerm
                            ? `No records matching "${searchTerm}".`
                            : filter === "expense"
                            ? "No expense transactions logged yet."
                            : filter === "income"
                            ? "No income transactions logged yet."
                            : "Your club ledger is clean. Log a transaction to get started."}
                        </p>
                        <button
                          type="button"
                          className="cv-btn-primary"
                          onClick={() => setShowModal(true)}
                        >
                          <Plus size={14} /> Log Transaction
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const statusType =
                      t.status === "Pending Bill"
                        ? "warning"
                        : t.status === "Reimbursed"
                        ? "neutral"
                        : "success";

                    return (
                      <tr key={t._id} className="cv-tx-table-row">
                        <td>
                          <div className="cv-tx-title-col">
                            <strong>{t.title}</strong>
                            {t.description && <span className="cv-tx-desc-hint">{t.description}</span>}
                          </div>
                        </td>
                        <td>
                          <span className="cv-tx-tag">
                            <Tag size={10} /> {t.category}
                          </span>
                        </td>
                        <td className="cv-tx-date">{formatDate(t.date)}</td>
                        <td>
                          <span className={`cv-tx-status-pill ${statusType}`}>
                            {statusType === "success" && <CheckCircle2 size={12} />}
                            {statusType === "warning" && <Clock size={12} />}
                            {t.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }} className={`cv-tx-amount ${t.type}`}>
                          <span className={`cv-tx-amount-chip ${t.type}`}>
                            {t.type === "income" ? "+" : "-"}
                            {formatMoney(t.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="cv-tx-footer-bar">
            <span>
              Showing {filtered.length} of {transactions.length} total entries
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
