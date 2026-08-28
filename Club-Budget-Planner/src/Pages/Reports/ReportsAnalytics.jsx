import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import {
  FileSpreadsheet,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  Building2,
  History,
  Activity as ActivityIcon,
  ShieldCheck,
} from "lucide-react";
import { useClub } from "../../ClubContext";
import { useTheme } from "../../ThemeContext";
import { api } from "../../api";
import "./ReportsAnalytics.css";

const PIE_COLORS = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];

function renderStableSlice(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
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

function formatTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function lastSixMonthKeys() {
  const keys = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-US", { month: "short" }) });
  }
  return keys;
}

export default function ReportsAnalytics() {
  const { club } = useClub();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "audit"
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!club?._id) return;
    setLoading(true);
    setError("");
    try {
      const [bRes, tRes, aRes] = await Promise.all([
        api.get(`/api/clubs/${club._id}/budgets`),
        api.get(`/api/clubs/${club._id}/transactions`),
        api.get(`/api/clubs/${club._id}/activities`).catch(() => ({ activities: [] })),
      ]);
      setBudgets(bRes.budgets || []);
      setSummary(bRes.summary || null);
      setTransactions(tRes.transactions || []);
      setActivities(aRes.activities || []);
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

  const totalExpenditures = useMemo(() => {
    if (summary?.totalSpent != null) return summary.totalSpent;
    return transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  }, [summary, transactions]);

  const totalIncome = useMemo(() => {
    return transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  const remainingBudget = useMemo(() => {
    if (summary?.remaining != null) return summary.remaining;
    const allocated = budgets.reduce((s, b) => s + (Number(b.allocated) || 0), 0);
    return allocated - totalExpenditures;
  }, [summary, budgets, totalExpenditures]);

  const totalAllocated = useMemo(() => {
    return summary?.totalAllocated ?? budgets.reduce((s, b) => s + (Number(b.allocated) || 0), 0);
  }, [summary, budgets]);

  const remainingPct = totalAllocated > 0 ? Math.max(0, Math.min(100, (remainingBudget / totalAllocated) * 100)) : 0;

  const categoryBreakdown = useMemo(() => {
    const byCat = {};
    for (const b of budgets) {
      const cat = b.category || "General";
      byCat[cat] = (byCat[cat] || 0) + (Number(b.spent) || 0);
    }
    const entries = Object.entries(byCat).map(([name, value]) => ({ name, value }));
    const total = entries.reduce((s, e) => s + e.value, 0);
    return entries.map((e) => ({
      ...e,
      pct: total > 0 ? ((e.value / total) * 100).toFixed(1) : "0.0",
    }));
  }, [budgets]);

  const monthlyExpense = useMemo(() => {
    const buckets = {};
    const months = lastSixMonthKeys();
    for (const m of months) buckets[m.key] = { label: m.label, sum: 0 };
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      const d = new Date(t.date || t.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (buckets[key]) buckets[key].sum += t.amount || 0;
    }
    const totals = months.map((m) => buckets[m.key]);
    return { totals };
  }, [transactions]);

  const isDark = theme === "dark";
  const tooltipStyle = isDark
    ? {
        background: "#18181b",
        border: "1px solid #27272a",
        borderRadius: "8px",
        color: "#f4f4f5",
        fontSize: "13px",
      }
    : {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        color: "#0f172a",
        fontSize: "13px",
      };

  const exportCsv = () => {
    const rows = [
      ["Date", "Title / Description", "Category", "Type", "Status", "Amount (INR)"],
      ...transactions.map((t) => [
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
    a.download = `${(club?.name || "club").toLowerCase().replace(/\s+/g, "-")}-financial-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cv-reports-page">
      <main className="cv-reports-container">
        <header className="cv-reports-header">
          <div>
            <div className="cv-dash-club-badge">
              <Building2 size={13} /> {club?.name || "Analytics"}
            </div>
            <h1 className="cv-reports-title">Reports &amp; Analytics</h1>
            <p className="cv-reports-subtitle">Financial performance overview, spend trends, and verifiable governance audit trail.</p>
          </div>

          <div className="cv-reports-actions">
            <button type="button" className="cv-btn-secondary" onClick={exportCsv}>
              <FileSpreadsheet size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </header>

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--color-border-soft)", paddingBottom: "12px", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: "600",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: activeTab === "overview" ? "var(--color-primary)" : "transparent",
              color: activeTab === "overview" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
            }}
          >
            <TrendingUp size={14} /> Financial Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: "600",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: activeTab === "audit" ? "var(--color-primary)" : "transparent",
              color: activeTab === "audit" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
            }}
          >
            <History size={14} /> Audit Trail &amp; Governance
          </button>
        </div>

        {error && <p className="cv-reports-error">{error}</p>}

        {activeTab === "overview" ? (
          <>
            <section className="cv-reports-kpi-grid">
              <div className="cv-report-kpi-card">
                <div className="cv-kpi-head">
                  <span className="cv-kpi-label">TOTAL EXPENDITURES</span>
                  <div className="cv-icon-bubble expense">
                    <Wallet size={16} />
                  </div>
                </div>
                <p className="cv-kpi-value">{loading ? "…" : formatMoney(totalExpenditures)}</p>
                <span className="cv-kpi-sub">All-time charged disbursements</span>
              </div>

              <div className="cv-report-kpi-card">
                <div className="cv-kpi-head">
                  <span className="cv-kpi-label">REMAINING BUDGET</span>
                  <div className="cv-icon-bubble success">
                    <PiggyBank size={16} />
                  </div>
                </div>
                <p className="cv-kpi-value">{loading ? "…" : formatMoney(remainingBudget)}</p>
                <div className="cv-kpi-footer-prog">
                  <div className="cv-report-prog-bar">
                    <div className="cv-report-prog-fill" style={{ width: `${remainingPct}%` }} />
                  </div>
                  <span>{remainingPct.toFixed(0)}% Left</span>
                </div>
              </div>

              <div className="cv-report-kpi-card">
                <div className="cv-kpi-head">
                  <span className="cv-kpi-label">TOTAL FUND INFLOW</span>
                  <div className="cv-icon-bubble income">
                    <ArrowUpRight size={16} />
                  </div>
                </div>
                <p className="cv-kpi-value">{loading ? "…" : formatMoney(totalIncome)}</p>
                <span className="cv-kpi-sub">
                  <CheckCircle2 size={12} className="cv-live-icon" /> Live audited ledger
                </span>
              </div>
            </section>

            <section className="cv-charts-grid">
              <div className="cv-chart-card">
                <div className="cv-chart-head">
                  <div>
                    <h2>Fund Utilization Trend</h2>
                    <p>Monthly expenditure over the last 6 months</p>
                  </div>
                  <TrendingUp size={18} color="#64748b" />
                </div>

                <div className="cv-chart-box">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={monthlyExpense.totals} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-soft, #e2e8f0)" />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--color-on-surface-variant, #64748b)" }} />
                      <YAxis tick={{ fontSize: 12, fill: "var(--color-on-surface-variant, #64748b)" }} tickFormatter={(v) => `₹${v}`} width={60} />
                      <Tooltip formatter={(value) => formatMoney(value)} contentStyle={tooltipStyle} itemStyle={{ color: tooltipStyle.color }} isAnimationActive={false} />
                      <Line
                        type="monotone"
                        dataKey="sum"
                        name="Actual Spend"
                        stroke="var(--color-primary, #0f172a)"
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={true}
                        animationDuration={600}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="cv-chart-card">
                <div className="cv-chart-head">
                  <div>
                    <h2>Category Distribution</h2>
                    <p>Expenditure breakdown by category</p>
                  </div>
                  <PieIcon size={18} color="#64748b" />
                </div>

                <div className="cv-donut-wrap">
                  {categoryBreakdown.length === 0 || categoryBreakdown.every((c) => c.value === 0) ? (
                    <div className="cv-chart-empty">No category spend recorded yet</div>
                  ) : (
                    <>
                      <div className="cv-pie-box">
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie
                              data={categoryBreakdown.filter((c) => c.value > 0)}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={3}
                              activeShape={renderStableSlice}
                              isAnimationActive={false}
                            >
                              {categoryBreakdown
                                .filter((c) => c.value > 0)
                                .map((entry, index) => (
                                  <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v) => formatMoney(v)} contentStyle={tooltipStyle} isAnimationActive={false} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="cv-pie-legend">
                        {categoryBreakdown.map((item, idx) => (
                          <div className="cv-pie-legend-row" key={item.name}>
                            <span className="cv-legend-dot" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                            <span className="cv-legend-name">{item.name}</span>
                            <strong className="cv-legend-pct">{item.pct}%</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          </>
        ) : (
          /* Audit Trail Tab */
          <section className="cv-chart-card" style={{ padding: "24px" }}>
            <div className="cv-chart-head" style={{ marginBottom: "20px" }}>
              <div>
                <h2>Verifiable Treasury Audit Log</h2>
                <p>Immutable history of budget allocations, disbursements, claims, and role changes.</p>
              </div>
              <ShieldCheck size={20} color="var(--color-emerald-solid)" />
            </div>

            {loading ? (
              <div className="cv-chart-empty">Loading audit trail...</div>
            ) : activities.length === 0 ? (
              <div className="cv-chart-empty" style={{ padding: "48px 0" }}>
                <ActivityIcon size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
                <p>No recent treasury activity recorded yet. Events will appear here as transactions and budgets are created.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border-soft)", textAlign: "left" }}>
                      <th style={{ padding: "10px 12px", color: "var(--color-on-surface-variant)", fontWeight: "600" }}>Timestamp</th>
                      <th style={{ padding: "10px 12px", color: "var(--color-on-surface-variant)", fontWeight: "600" }}>Actor</th>
                      <th style={{ padding: "10px 12px", color: "var(--color-on-surface-variant)", fontWeight: "600" }}>Category</th>
                      <th style={{ padding: "10px 12px", color: "var(--color-on-surface-variant)", fontWeight: "600" }}>Action / Event</th>
                      <th style={{ padding: "10px 12px", color: "var(--color-on-surface-variant)", fontWeight: "600" }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((act) => {
                      const isFinance = act.category === "Finance";
                      const isBudget = act.category === "Budget";
                      const isMember = act.category === "Membership";
                      const bg = isFinance ? "var(--color-emerald-bg)" : isBudget ? "var(--color-indigo-bg)" : "var(--color-amber-bg)";
                      const color = isFinance ? "var(--color-emerald-text)" : isBudget ? "var(--color-indigo-text)" : "var(--color-amber-text)";

                      return (
                        <tr key={act._id} style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
                          <td style={{ padding: "12px", color: "var(--color-on-surface-variant)", whiteSpace: "nowrap" }}>
                            {formatDate(act.createdAt)} <span style={{ fontSize: "11px", opacity: 0.7 }}>{formatTime(act.createdAt)}</span>
                          </td>
                          <td style={{ padding: "12px", fontWeight: "600", color: "var(--color-primary)" }}>
                            {act.actorName || "Member"}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px", background: bg, color: color }}>
                              {act.category}
                            </span>
                          </td>
                          <td style={{ padding: "12px", fontWeight: "600", color: "var(--color-primary)" }}>
                            {act.title}
                          </td>
                          <td style={{ padding: "12px", color: "var(--color-on-surface-variant)" }}>
                            {act.details || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}