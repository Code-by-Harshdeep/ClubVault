import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useClub } from "../../ClubContext";
import { api } from "../../api";
import "./Transactions.css";

function formatMoney(n) {
  const num = Number(n) || 0;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function NewTransactionModal({ onClose, onSubmit, defaultType }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState(defaultType || "expense");
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
      await onSubmit({ title, category, type, amount: Number(amount) });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tx-modal-overlay" onClick={onClose}>
      <div className="tx-modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Log Transaction</h3>
        <form onSubmit={handleSubmit} className="tx-modal-form">
          <label>Type</label>
          <div className="tx-modal-type-switch">
            <button type="button" className={type === "income" ? "active" : ""} onClick={() => setType("income")}>
              Income
            </button>
            <button type="button" className={type === "expense" ? "active" : ""} onClick={() => setType("expense")}>
              Expense
            </button>
          </div>
          <label>Description</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fall Festival Catering" />
          <label>Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Events" />
          <label>Amount (₹)</label>
          <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          {error && <p className="tx-modal-error">{error}</p>}
          <div className="tx-modal-actions">
            <button type="button" className="action-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="action-btn tx-primary-btn" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Transactions = () => {
  const { club } = useClub();
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("income");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Support being deep-linked here with ?new=1 (e.g. the sidebar's
  // "New Expense" button) so it opens straight into the add form.
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setFilter("expense");
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
      const data = await api.get(`/api/clubs/${club._id}/transactions`);
      setTransactions(data.transactions || []);
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

  const filtered = transactions
    .filter((t) => t.type === filter)
    .filter((t) => `${t.title} ${t.category}`.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="transactions-page">
      <main className="transactions-container">
        {showModal && (
          <NewTransactionModal
            onClose={() => setShowModal(false)}
            onSubmit={handleCreate}
            defaultType={filter}
          />
        )}

        <section className="transactions-header">
          <div>
            <h1 className="transactions-title">Income &amp; Expenses</h1>
            <p className="transactions-subtitle">{club?.name || "Ledger overview"}</p>
          </div>

          <div className="transactions-toggle">
            <button
              className={`toggle-btn ${filter === "income" ? "active" : ""}`}
              onClick={() => setFilter("income")}
            >
              Income
            </button>
            <button
              className={`toggle-btn ${filter === "expense" ? "active" : ""}`}
              onClick={() => setFilter("expense")}
            >
              Expenses
            </button>
          </div>
        </section>

        {error && <p style={{ color: "var(--color-error)" }}>{error}</p>}

        <section className="transactions-kpi-grid">
          <div className="transactions-kpi-card">
            <span className="kpi-label">Total Income</span>
            <h2>{loading ? "…" : formatMoney(totalIncome)}</h2>
          </div>

          <div className="transactions-kpi-card">
            <span className="kpi-label">Total Expenses</span>
            <h2>{loading ? "…" : formatMoney(totalExpenses)}</h2>
          </div>

          <div className="transactions-kpi-card">
            <span className="kpi-label">Net Cash Flow</span>
            <h2>{loading ? "…" : formatMoney(netFlow)}</h2>
            <p className="kpi-muted">{netFlow >= 0 ? "Positive margin" : "Negative margin"}</p>
          </div>
        </section>

        <section className="transactions-ledger">
          <div className="ledger-header">
            <h2>Transaction Ledger</h2>

            <div className="ledger-actions">
              <div className="search-box">
                <span className="material-symbols-outlined">search</span>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button className="action-btn" onClick={() => setShowModal(true)}>
                <span className="material-symbols-outlined">add</span>
                Add
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="amount-column">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4">Loading…</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="4">No transactions yet.</td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t._id}>
                      <td>{formatDate(t.date)}</td>
                      <td>
                        <div className="transaction-title">{t.title}</div>
                        <div className="transaction-subtitle">{t.status}</div>
                      </td>
                      <td>
                        <span className="category-tag">{t.category}</span>
                      </td>
                      <td className={`amount ${t.type === "income" ? "positive" : "negative"}`}>
                        {t.type === "income" ? "+" : "-"}
                        {formatMoney(t.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="transactions-pagination">
            <span className="pagination-text">
              Showing {filtered.length} of {transactions.filter((t) => t.type === filter).length} transactions
            </span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Transactions;
