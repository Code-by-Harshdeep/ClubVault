import React from "react";
import {
  Plus,
  LayoutDashboard,
  Wallet,
  Receipt,
  CalendarDays,
  ChartNoAxesColumn,
  Users,
  Settings,
  HelpCircle,
  Building2,
  PieChart,
  Clock3,
  ArrowUp,
  AlertTriangle,
  ArrowRight,
  FileText,
  Upload,
  CalendarCheck,
} from "lucide-react";

import "./Dashboard.css";

const Dashboard = () => {
  const menu = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      active: true,
    },
    {
      name: "Budgets",
      icon: <Wallet size={18} />,
      path: "/budgets",
    },
    {
      name: "Transactions",
      icon: <Receipt size={18} />,
      path:"/transactions",
    },
    {
      name: "Events",
      icon: <CalendarDays size={18} />,
    },
    {
      name: "Analytics",
      icon: <ChartNoAxesColumn size={18} />,
      path: "/reportanalytics",
    },
    {
      name: "Members",
      icon: <Users size={18} />,
    },
  ];

  const transactions = [
    {
      title: "Fall Kickoff Catering",
      category: "Events Committee",
      date: "Oct 12, 2024",
      amount: "-₹1,250.00",
    },
    {
      title: "Alumni Donation Matching",
      category: "Endowment Fund",
      date: "Oct 10, 2024",
      amount: "+₹5,000.00",
    },
    {
      title: "Software Subscriptions (Annual)",
      category: "Operations",
      date: "Oct 05, 2024",
      amount: "-₹840.00",
    },
    {
      title: "Guest Speaker Honorarium",
      category: "Academic Affairs",
      date: "Oct 01, 2024",
      amount: "-₹500.00",
    },
  ];

  const actions = [
    {
      title: "Request Funds",
      icon: <FileText size={20} />,
    },
    {
      title: "Upload Invoice",
      icon: <Upload size={20} />,
    },
    {
      title: "Schedule Audit",
      icon: <CalendarCheck size={20} />,
    },
  ];

  return (
    <div className="dashboard-page">
     
      {/* MAIN CONTENT */}

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-label">Overview</p>

            <h1>Q3 Financial Standing</h1>
          </div>

          <p className="dashboard-date">Last updated: Today, 09:41 AM</p>
        </header>

        {/* METRICS */}

        <section className="metric-grid">
          <div className="metric-card">
            <div className="metric-header">
              Total Funds Available
              <Building2 size={20} />
            </div>

            <div>
              <h2>₹124,500.00</h2>

              <p className="metric-description">
                <ArrowUp size={15} />
                +12% from last term
              </p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              Active Budgets
              <PieChart size={20} />
            </div>

            <div>
              <h2>8</h2>

              <p className="metric-description">Across 3 departments</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              Pending Approvals
              <Clock3 size={20} />
            </div>

            <div>
              <h2>14</h2>

              <p className="metric-description">
                <AlertTriangle size={15} />
                Needs attention
              </p>
            </div>
          </div>
        </section>

        {/* LOWER CONTENT */}

        <section className="dashboard-grid">
          {/* TABLE */}

          <div className="dashboard-panel">
            <div className="panel-title">
              <h3>Recent Ledger Entries</h3>

              <button>View All</button>
            </div>

            <div className="table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Description</th>

                    <th>Date</th>

                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{item.title}</strong>

                        <br />

                        <small>{item.category}</small>
                      </td>

                      <td>{item.date}</td>

                      <td className="amount">{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div>
            <div className="dashboard-panel">
              <div className="quick-actions">
                {actions.map((item, index) => (
                  <button className="quick-action-btn" key={index}>
                    <span>
                      {item.icon} {item.title}
                    </span>

                    <ArrowRight size={18} />
                  </button>
                ))}
              </div>
            </div>

            <div className="report-box">
              <div>
                <small>MONTHLY REPORT</small>

                <h4>
                  September financials are finalized and ready for review.
                </h4>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
