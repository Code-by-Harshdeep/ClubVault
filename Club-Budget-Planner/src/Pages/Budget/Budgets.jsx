import React, { useEffect, useState } from "react";
import { useClub } from "../../ClubContext";
import { api } from "../../api";
import "./Budgets.css";

function formatMoney(n) {
  const num = Number(n) || 0;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function NewBudgetModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [allocated, setAllocated] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !category || !allocated) {
      setError("Title, category and allocated amount are required.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ title, category, description, allocated: Number(allocated) });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Budget</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fall Gala 2026" />
          <label>Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Event" />
          <label>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          <label>Allocated Amount (₹)</label>
          <input type="number" min="0" value={allocated} onChange={(e) => setAllocated(e.target.value)} placeholder="0.00" />
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="filter-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Budgets = () => {
  const { club } = useClub();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    if (!club?._id) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/api/clubs/${club._id}/budgets`);
      setBudgets(data.budgets || []);
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
    await api.post(`/api/clubs/${club._id}/budgets`, payload);
    await load();
  };

  const totalAllocated = budgets.reduce((sum, b) => sum + (b.allocated || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const remaining = totalAllocated - totalSpent;

  return (
    <div className="dashboard-content">
      <main className="budgets-container">
        {showModal && (
          <NewBudgetModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />
        )}

        <header className="page-header">
          <div>
            <h1 className="page-title">Budgets</h1>
            <p className="page-subtitle">
              Allocate funds and monitor expenditure across all committee initiatives.
            </p>
          </div>

          <button className="primary-btn" onClick={() => setShowModal(true)}>
            <span className="material-symbols-outlined">add_circle</span>
            Create New Budget
          </button>
        </header>

        {error && <p style={{ color: "var(--color-error)" }}>{error}</p>}

        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="material-symbols-outlined">account_balance</span>
              <h3>Total Allocated</h3>
            </div>
            <div className="kpi-body">
              <h2>{loading ? "…" : formatMoney(totalAllocated)}</h2>
              <p>Across {budgets.length} budgets</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="material-symbols-outlined">trending_up</span>
              <h3>Total Spent</h3>
            </div>
            <div className="kpi-body">
              <h2>{loading ? "…" : formatMoney(totalSpent)}</h2>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${totalAllocated ? Math.min(100, (totalSpent / totalAllocated) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="material-symbols-outlined">savings</span>
              <h3>Remaining Balance</h3>
            </div>
            <div className="kpi-body">
              <h2>{loading ? "…" : formatMoney(remaining)}</h2>
              <p className={remaining >= 0 ? "status-success" : "warning"}>
                {remaining >= 0 ? "Healthy status" : "Over budget"}
              </p>
            </div>
          </div>
        </section>

        <section className="budget-section">
          <div className="section-header">
            <h2>Active Allocations</h2>
          </div>

          <div className="budget-list">
            {loading ? (
              <p>Loading budgets…</p>
            ) : budgets.length === 0 ? (
              <p>No budgets yet. Create one to get started.</p>
            ) : (
              budgets.map((b) => {
                const pct = b.allocated ? Math.min(100, (b.spent / b.allocated) * 100) : 0;
                const warning = pct >= 70;
                return (
                  <article className="budget-card" key={b._id}>
                    <div className="budget-top">
                      <div className="budget-info">
                        <div className="budget-title-row">
                          <h3>{b.title}</h3>
                          <span className="budget-tag">{b.category}</span>
                        </div>
                        <p>{b.description}</p>
                      </div>

                      <div className="budget-amount">
                        <h3>
                          {formatMoney(b.spent)}
                          <span> / {formatMoney(b.allocated)}</span>
                        </h3>
                        <p className={warning ? "warning" : ""}>
                          {pct.toFixed(1)}% Utilized{warning ? " - Warning" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Budgets;
