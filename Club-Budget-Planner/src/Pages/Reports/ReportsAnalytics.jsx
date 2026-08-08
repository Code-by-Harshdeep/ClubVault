import React, { useEffect, useMemo, useState } from "react";
import { useClub } from "../../ClubContext";
import { api } from "../../api";
import "./ReportsAnalytics.css";

const DOT_CLASSES = ["dot-events", "dot-marketing", "dot-office", "dot-other"];

function formatMoney(n) {
  const num = Number(n) || 0;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

// last 6 calendar months, oldest first
function lastSixMonthKeys() {
  const keys = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-US", { month: "short" }) });
  }
  return keys;
}

const ReportsAnalytics = () => {
  const { club } = useClub();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    load();
  }, [club?._id]);

  const totalExpenditures = useMemo(
    () => transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalAllocated = useMemo(() => budgets.reduce((s, b) => s + (b.allocated || 0), 0), [budgets]);
  const totalSpentOnBudgets = useMemo(() => budgets.reduce((s, b) => s + (b.spent || 0), 0), [budgets]);
  const remainingBudget = totalAllocated - totalSpentOnBudgets;
  const remainingPct = totalAllocated ? Math.max(0, Math.min(100, (remainingBudget / totalAllocated) * 100)) : 0;

  const categoryBreakdown = useMemo(() => {
    const map = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        pct: total ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [transactions]);

  const monthlyExpense = useMemo(() => {
    const months = lastSixMonthKeys();
    const totals = months.map(({ key, label }) => {
      const sum = transactions
        .filter((t) => t.type === "expense")
        .filter((t) => {
          const d = new Date(t.date);
          return `${d.getFullYear()}-${d.getMonth()}` === key;
        })
        .reduce((s, t) => s + t.amount, 0);
      return { label, sum };
    });
    const max = Math.max(1, ...totals.map((t) => t.sum));
    return { totals, max };
  }, [transactions]);

  const linePath = useMemo(() => {
    const { totals, max } = monthlyExpense;
    if (totals.length === 0) return "";
    const step = 100 / (totals.length - 1);
    return totals
      .map((t, i) => {
        const x = (i * step).toFixed(1);
        const y = (100 - (t.sum / max) * 90).toFixed(1); // leave headroom at top
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }, [monthlyExpense]);

  const significantTransactions = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6),
    [transactions]
  );

  const exportCsv = () => {
    const rows = [
      ["Date", "Reference", "Category", "Amount"],
      ...significantTransactions.map((t) => [formatDate(t.date), t.title, t.category, t.amount]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page">
      <header className="mobile-header">
        <h2>Finance Committee</h2>
        <button>
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      <main className="main-content">
        <div className="page-container">
          <section className="page-header">
            <div className="header-left">
              <h1>Reports &amp; Analytics</h1>
              <p>Comprehensive overview of financial performance and categorical spending.</p>
            </div>

            <div className="header-actions">
              <button className="export-btn" onClick={exportCsv}>
                <span className="material-symbols-outlined">download</span>
                <span>CSV</span>
              </button>
            </div>
          </section>

          {error && <p style={{ color: "var(--color-error)" }}>{error}</p>}

          <div className="analytics-grid">
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-top">
                  <h3>Total Expenditures</h3>
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <h2>{loading ? "…" : formatMoney(totalExpenditures)}</h2>
                <div className="kpi-footer">
                  <span>All-time, this club</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <h3>Remaining Budget</h3>
                  <span className="material-symbols-outlined">savings</span>
                </div>
                <h2>{loading ? "…" : formatMoney(remainingBudget)}</h2>
                <div className="kpi-footer">
                  <div className="progress">
                    <div className="progress-fill" style={{ width: `${remainingPct}%` }}></div>
                  </div>
                  <span className="progress-text">{remainingPct.toFixed(0)}% Left</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <h3>Fund Inflow</h3>
                  <span className="material-symbols-outlined">arrow_insert</span>
                </div>
                <h2>{loading ? "…" : formatMoney(totalIncome)}</h2>
                <div className="kpi-footer">
                  <span className="badge success">
                    <span className="material-symbols-outlined">check_circle</span>
                    Live
                  </span>
                  <span>All-time inflow</span>
                </div>
              </div>
            </div>

            <div className="line-chart-card">
              <div className="card-header">
                <div>
                  <h2>Fund Utilization Trend</h2>
                  <p>Monthly expenditure over the last 6 months.</p>
                </div>
              </div>

              <div className="chart-area">
                <div className="chart-grid">
                  <div className="grid-line"><span>{formatMoney(monthlyExpense.max)}</span></div>
                  <div className="grid-line"><span>{formatMoney(monthlyExpense.max * 0.5)}</span></div>
                  <div className="grid-line"><span>0</span></div>
                </div>

                <svg className="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d={linePath} className="actual-line" fill="none" />
                </svg>

                <div className="x-axis">
                  {monthlyExpense.totals.map((t) => (
                    <span key={t.label}>{t.label}</span>
                  ))}
                </div>
              </div>

              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-line actual"></span>
                  <span>Actual Spend</span>
                </div>
              </div>
            </div>

            <div className="donut-card">
              <div className="card-header">
                <div>
                  <h2>Spending by Category</h2>
                  <p>Distribution of expenses, all-time.</p>
                </div>
              </div>

              <div className="donut-wrapper">
                <div className="donut-chart">
                  <div className="donut-center">
                    <strong>{categoryBreakdown.length}</strong>
                    <span>Categories</span>
                  </div>
                </div>

                <div className="category-list">
                  {categoryBreakdown.length === 0 ? (
                    <p>No expenses recorded yet.</p>
                  ) : (
                    categoryBreakdown.map((c, i) => (
                      <div className="category-item" key={c.category}>
                        <div className="category-name">
                          <span className={`category-dot ${DOT_CLASSES[i % DOT_CLASSES.length]}`}></span>
                          <span>{c.category}</span>
                        </div>
                        <span className="category-percent">{c.pct}%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="transaction-card">
              <div className="transaction-header">
                <div>
                  <h3>Significant Transactions</h3>
                  <p>Most recent expenses for this club.</p>
                </div>
              </div>

              <div className="table-wrapper custom-scrollbar">
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reference</th>
                      <th>Category</th>
                      <th className="amount-cell">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4">Loading…</td>
                      </tr>
                    ) : significantTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="4">No expenses recorded yet.</td>
                      </tr>
                    ) : (
                      significantTransactions.map((t) => (
                        <tr key={t._id}>
                          <td>{formatDate(t.date)}</td>
                          <td>{t.title}</td>
                          <td>
                            <span className="category-tag">{t.category}</span>
                          </td>
                          <td className="amount-cell">-{formatMoney(t.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportsAnalytics;
