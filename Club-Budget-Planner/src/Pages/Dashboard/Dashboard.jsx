import React, { useState } from "react";
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
  Filter,
  Search,
  Check,
  X,
  Sparkles
} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Realistic Club Ledger Data with Actionable Statuses
  const allEntries = [
    {
      id: 1,
      title: "Fall Hackathon Catering",
      dept: "Events Committee",
      categoryTag: "Food & Drinks",
      date: "Oct 12, 2026",
      amount: "-₹12,500.00",
      type: "expense",
      status: "Approved",
      statusType: "success"
    },
    {
      id: 2,
      title: "Annual Tech Fest Sponsorship",
      dept: "Sponsorship Team",
      categoryTag: "Sponsorship",
      date: "Oct 10, 2026",
      amount: "+₹45,000.00",
      type: "income",
      status: "Cleared",
      statusType: "success"
    },
    {
      id: 3,
      title: "Domain & Cloud Hosting (Annual)",
      dept: "Tech Committee",
      categoryTag: "Operations",
      date: "Oct 05, 2026",
      amount: "-₹2,840.00",
      type: "expense",
      status: "Reimbursed",
      statusType: "neutral"
    },
    {
      id: 4,
      title: "Official Club Merch Sales",
      dept: "Executive Board",
      categoryTag: "Revenue",
      date: "Sep 28, 2026",
      amount: "+₹18,200.00",
      type: "income",
      status: "Cleared",
      statusType: "success"
    },
    {
      id: 5,
      title: "Sound System Rental Deposit",
      dept: "Logistics Team",
      categoryTag: "Venue",
      date: "Sep 22, 2026",
      amount: "-₹6,500.00",
      type: "expense",
      status: "Pending Bill",
      statusType: "warning"
    }
  ];

  // UX Filtering Logic
  const filteredEntries = allEntries.filter((entry) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "expense" && entry.type === "expense") ||
      (activeTab === "income" && entry.type === "income") ||
      (activeTab === "pending" && entry.statusType === "warning");

    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.categoryTag.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="cv-dash-page">
      {/* Background Ambient Orb */}
      <div className="cv-dash-orb" />

      {/* 1. Header Area with Friendly Context */}
      <div className="cv-dash-page-header">
        <div>
          <span className="cv-dash-eyebrow-badge">
            <Sparkles size={12} className="cv-sparkle-icon" /> Q3 Treasury Workspace
          </span>
          <h1 className="cv-dash-title">Club Financial Standing</h1>
        </div>

        <div className="cv-header-actions">
          <button
            type="button"
            className="cv-btn-secondary-sm"
            onClick={() => alert("Downloading CSV Audit Log...")}
          >
            <FileSpreadsheet size={14} /> Export Audit Sheet
          </button>
        </div>
      </div>

      {/* 2. Stat Cards with Rich Visual Hierarchy */}
      <div className="cv-stats-row">
        {/* Total Vault Balance */}
        <div className="cv-glass-stat-card primary-highlight">
          <div className="cv-stat-header">
            <span className="cv-stat-label">TOTAL VAULT BALANCE</span>
            <div className="cv-icon-bubble">
              <Building2 size={18} />
            </div>
          </div>
          <p className="cv-stat-value">₹124,500.00</p>
          <div className="cv-progress-container">
            <div className="cv-progress-track">
              <div className="cv-progress-fill" style={{ width: "75%" }} />
            </div>
            <span className="cv-badge-trend positive">
              <TrendingUp size={12} /> +12%
            </span>
          </div>
          <div className="cv-card-footer-info">
            <span>75% Allocated</span>
            <span className="cv-dot-separator">•</span>
            <span>₹31,125 Available</span>
          </div>
        </div>

        {/* Active Budgets */}
        <div className="cv-glass-stat-card">
          <div className="cv-stat-header">
            <span className="cv-stat-label">ACTIVE COMMITTEE BUDGETS</span>
            <div className="cv-icon-bubble">
              <PieChart size={18} />
            </div>
          </div>
          <p className="cv-stat-value">8</p>
          <p className="cv-stat-sub">Across 4 active committees</p>
          <div className="cv-stat-meta-pills">
            <span className="cv-mini-pill">Events</span>
            <span className="cv-mini-pill">Tech</span>
            <span className="cv-mini-pill">Media</span>
            <span className="cv-mini-pill">+1 more</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="cv-glass-stat-card warning-highlight">
          <div className="cv-stat-header">
            <span className="cv-stat-label">PENDING REIMBURSEMENTS</span>
            <div className="cv-icon-bubble warning">
              <Clock size={18} />
            </div>
          </div>
          <p className="cv-stat-value">14</p>
          <div className="cv-warning-footer">
            <span className="cv-badge-trend warning">
              <AlertCircle size={12} /> Requires Treasurer Review
            </span>
          </div>
        </div>
      </div>

      {/* 3. Lower Content Grid */}
      <div className="cv-dash-grid">
        {/* Ledger Panel with Search & Tab Filtering */}
        <div className="cv-ledger-panel">
          <div className="cv-panel-header">
            <div>
              <h2 className="cv-panel-title">Recent Ledger Entries</h2>
              <p className="cv-panel-sub">Real-time audited transactions</p>
            </div>

            {/* Quick Filter Tabs */}
            <div className="cv-filter-tabs">
              <button
                type="button"
                className={`cv-tab-btn ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
              <button
                type="button"
                className={`cv-tab-btn ${activeTab === "expense" ? "active" : ""}`}
                onClick={() => setActiveTab("expense")}
              >
                Expenses
              </button>
              <button
                type="button"
                className={`cv-tab-btn ${activeTab === "income" ? "active" : ""}`}
                onClick={() => setActiveTab("income")}
              >
                Income
              </button>
              <button
                type="button"
                className={`cv-tab-btn ${activeTab === "pending" ? "active" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                Pending
              </button>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="cv-table-search-bar">
            <Search size={14} className="cv-search-icon" />
            <input
              type="text"
              placeholder="Search by event, committee, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="cv-clear-btn"
                onClick={() => setSearchTerm("")}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Table View */}
          <table className="cv-ledger-table">
            <thead>
              <tr>
                <th>DESCRIPTION & DEPT</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th style={{ textAlign: "right" }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="cv-table-row">
                    <td>
                      <div className="cv-entry-info">
                        <p className="cv-entry-title">{entry.title}</p>
                        <span className="cv-dept-name">{entry.dept}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`cv-tag cv-tag-${entry.type}`}>
                        {entry.categoryTag}
                      </span>
                    </td>
                    <td className="cv-entry-date">{entry.date}</td>
                    <td>
                      <span className={`cv-status-pill ${entry.statusType}`}>
                        {entry.statusType === "success" && <CheckCircle2 size={12} />}
                        {entry.statusType === "warning" && <Clock size={12} />}
                        {entry.status}
                      </span>
                    </td>
                    <td
                      style={{ textAlign: "right" }}
                      className={`cv-entry-amount ${entry.type}`}
                    >
                      {entry.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="cv-empty-state">
                    No matching ledger entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Executive Action Buttons */}
        <div className="cv-actions-stack">
          <div className="cv-actions-header">
            <h3>Executive Operations</h3>
            <p>Direct treasurer actions</p>
          </div>

          <button
            type="button"
            className="cv-quick-action-pill highlight"
            onClick={() => alert("Opening Reimbursement Form...")}
          >
            <div className="cv-action-left">
              <div className="cv-action-icon">
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
            onClick={() => alert("Opening Invoice Uploader...")}
          >
            <div className="cv-action-left">
              <div className="cv-action-icon">
                <Upload size={18} />
              </div>
              <div>
                <span className="cv-action-title">Upload Receipt / Bill</span>
                <span className="cv-action-sub">Attach for audit log</span>
              </div>
            </div>
            <ArrowUpRight size={16} className="cv-action-arrow" />
          </button>

          <button
            type="button"
            className="cv-quick-action-pill"
            onClick={() => alert("Opening Union Audit Scheduler...")}
          >
            <div className="cv-action-left">
              <div className="cv-action-icon">
                <CalendarCheck2 size={18} />
              </div>
              <div>
                <span className="cv-action-title">Schedule Union Audit</span>
                <span className="cv-action-sub">Submit treasury sheet</span>
              </div>
            </div>
            <ArrowUpRight size={16} className="cv-action-arrow" />
          </button>
        </div>
      </div>
    </div>
  );
}