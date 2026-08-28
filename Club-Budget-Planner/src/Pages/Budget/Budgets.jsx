import React, { useEffect, useState } from "react";
import {
  Wallet,
  Plus,
  TrendingUp,
  PiggyBank,
  PieChart,
  Trash2,
  Tag,
  ShieldCheck,
  Building2,
  X,
} from "lucide-react";
import { useClub } from "../../ClubContext";
import { api } from "../../api";
import "./Budgets.css";

function formatMoney(n) {
  const num = Number(n) || 0;
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
      await onSubmit({
        title,
        category,
        description,
        allocated: Number(allocated),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cv-budget-modal-overlay" onClick={onClose} role="presentation">
      <div className="cv-budget-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="cv-budget-modal-header">
          <h3>Create New Budget Line</h3>
          <button type="button" className="cv-modal-close-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="cv-budget-modal-form" onSubmit={handleSubmit}>
          <label htmlFor="budget-title">Budget Line Title</label>
          <input
            id="budget-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Annual Hackathon & Workshops"
          />

          <label htmlFor="budget-category">Category</label>
          <input
            id="budget-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Events, Operations, Tech, Marketing"
          />

          <label htmlFor="budget-description">Description</label>
          <input
            id="budget-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details regarding this allocation"
          />

          <label htmlFor="budget-allocated">Allocated Amount (₹)</label>
          <input
            id="budget-allocated"
            type="number"
            min="0"
            step="0.01"
            value={allocated}
            onChange={(e) => setAllocated(e.target.value)}
            placeholder="0.00"
          />

          {error && <p className="cv-budget-modal-error">{error}</p>}

          <div className="cv-budget-modal-actions">
            <button
              type="button"
              className="cv-budget-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cv-budget-primary-btn"
              disabled={loading}
            >
              {loading ? "Creating…" : "Create Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Budgets() {
  const { club, role } = useClub();
  const isAdmin = role === "admin";

  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    if (!club?._id) return;
    setLoading(true);
    setError("");

    try {
      const data = await api.get(`/api/clubs/${club._id}/budgets`);
      setBudgets(data.budgets || []);
      setSummary(data.summary || null);
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

  const handleDelete = async (budgetId, budgetTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${budgetTitle}"?`)) return;
    setDeletingId(budgetId);
    setError("");
    try {
      await api.delete(`/api/clubs/${club._id}/budgets/${budgetId}`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const totalAllocated = summary?.totalAllocated ?? budgets.reduce(
    (sum, b) => sum + (Number(b.allocated) || 0),
    0
  );

  const totalSpent = summary?.totalSpent ?? budgets.reduce(
    (sum, b) => sum + (Number(b.spent) || 0),
    0
  );

  const remaining = summary?.remaining ?? totalAllocated - totalSpent;

  return (
    <div className="cv-budgets-page">
      {showModal && (
        <NewBudgetModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
        />
      )}

      <main className="cv-budgets-content">
        <header className="cv-budgets-header">
          <div>
            <div className="cv-dash-club-badge">
              <Building2 size={13} /> {club?.name || "Club Budget"}
            </div>
            <h1 className="cv-budgets-title">Budgets &amp; Allocations</h1>
            <p className="cv-budgets-subtitle">
              Manage category allocations and monitor spend vs approved limits.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="cv-btn-primary"
              onClick={() => setShowModal(true)}
            >
              <Plus size={15} />
              <span>Create New Budget</span>
            </button>
          )}
        </header>

        {error && <p className="cv-budgets-error">{error}</p>}

        <section className="cv-budgets-kpi-grid">
          <div className="cv-budget-kpi-card">
            <div className="cv-kpi-header">
              <span className="cv-kpi-label">TOTAL ALLOCATED</span>
              <div className="cv-kpi-icon primary">
                <Wallet size={16} />
              </div>
            </div>
            <p className="cv-kpi-value">{loading ? "…" : formatMoney(totalAllocated)}</p>
            <p className="cv-kpi-sub">{budgets.length} active category line{budgets.length === 1 ? "" : "s"}</p>
          </div>

          <div className="cv-budget-kpi-card">
            <div className="cv-kpi-header">
              <span className="cv-kpi-label">TOTAL SPENT TO DATE</span>
              <div className="cv-kpi-icon info">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="cv-kpi-value">{loading ? "…" : formatMoney(totalSpent)}</p>
            <div className="cv-kpi-progress-bar">
              <div
                className="cv-kpi-progress-fill"
                style={{
                  width: `${totalAllocated ? Math.min(100, (totalSpent / totalAllocated) * 100) : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="cv-budget-kpi-card">
            <div className="cv-kpi-header">
              <span className="cv-kpi-label">REMAINING BALANCE</span>
              <div className="cv-kpi-icon success">
                <PiggyBank size={16} />
              </div>
            </div>
            <p className="cv-kpi-value">{loading ? "…" : formatMoney(remaining)}</p>
            <p className={`cv-kpi-sub ${remaining < 0 ? "warning-text" : "success-text"}`}>
              {remaining >= 0 ? "✓ Within allocation limits" : "⚠️ Over allocation detected"}
            </p>
          </div>
        </section>

        <section className="cv-active-allocations-section">
          <div className="cv-allocations-header">
            <h2>Active Allocations</h2>
            <span className="cv-allocations-count">{budgets.length} Categories</span>
          </div>

          <div className="cv-budget-card-grid">
            {loading ? (
              <div className="cv-budget-empty-state">
                <p>Loading budget lines…</p>
              </div>
            ) : budgets.length === 0 ? (
              <div className="cv-budget-empty-state">
                <div className="cv-empty-icon-wrap">
                  <PieChart size={28} />
                </div>
                <h3>No budget lines created yet</h3>
                <p>
                  Create budget lines to allocate funds toward events, operational costs, or equipment.
                </p>
                {isAdmin && (
                  <button
                    type="button"
                    className="cv-btn-primary"
                    onClick={() => setShowModal(true)}
                  >
                    <Plus size={15} /> Create First Budget
                  </button>
                )}
              </div>
            ) : (
              budgets.map((b) => {
                const allocated = Number(b.allocated) || 0;
                const spent = Number(b.spent) || 0;
                const pct = allocated ? Math.min(100, (spent / allocated) * 100) : 0;
                const warning = pct >= 80;
                const over = Boolean(b.overBudget) || spent > allocated;

                return (
                  <article className={`cv-budget-card ${over ? "is-over" : ""}`} key={b._id}>
                    <div className="cv-bcard-top">
                      <div className="cv-bcard-info">
                        <div className="cv-bcard-title-row">
                          <h3>{b.title}</h3>
                          <span className="cv-bcard-tag">
                            <Tag size={11} /> {b.category}
                          </span>
                        </div>
                        <p className="cv-bcard-desc">
                          {b.description || "No description provided."}
                        </p>
                      </div>

                      <div className="cv-bcard-right">
                        <div className="cv-bcard-amount">
                          <h3>
                            {formatMoney(spent)}
                            <span className="cv-bcard-allocated"> / {formatMoney(allocated)}</span>
                          </h3>
                          <p className={`cv-bcard-status ${over ? "over" : warning ? "warn" : "ok"}`}>
                            {over
                              ? `Over budget by ${formatMoney(spent - allocated)}`
                              : warning
                              ? `${pct.toFixed(0)}% Utilized`
                              : `${formatMoney(allocated - spent)} left`}
                          </p>
                        </div>
                        {isAdmin && (
                          <button
                            type="button"
                            className="cv-budget-delete-btn"
                            title="Delete this budget line"
                            disabled={deletingId === b._id}
                            onClick={() => handleDelete(b._id, b.title)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="cv-bcard-progress-bar">
                      <div
                        className={`cv-bcard-progress-fill ${over ? "is-over" : warning ? "is-warn" : ""}`}
                        style={{ width: `${pct}%` }}
                      />
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
}
