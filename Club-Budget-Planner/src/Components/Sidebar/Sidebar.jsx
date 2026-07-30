import React from "react";
import {
  LayoutDashboard,
  Wallet,
  ReceiptText,
  Calendar,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  Plus
} from "lucide-react";
import "./Sidebar.css";

const MENU_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: true },
  { label: "Budgets", icon: Wallet, href: "/budgets" },
  { label: "Transactions", icon: ReceiptText, href: "/transactions" },
  { label: "Events", icon: Calendar, href: "/events" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Members", icon: Users, href: "/members" },
];

export default function Sidebar() {
  return (
    <aside className="cv-sidebar">

      <div className="cv-sidebar-header">
        <a href="/" className="cv-sidebar-logo">
          ClubVault
        </a>
        <span className="cv-sidebar-sub">
          STUDENT UNION
        </span>
      </div>


      <button className="cv-btn-sidebar-cta">
        <Plus size={18} />
        <span>New Expense</span>
      </button>


      <div className="cv-sidebar-group">
        <p className="cv-sidebar-label">
          MAIN MENU
        </p>

        <nav className="cv-sidebar-nav">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.href}
                className={`cv-sidebar-link ${
                  item.active ? "active" : ""
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>


      <div className="cv-sidebar-footer">

        <a href="/settings" className="cv-sidebar-link">
          <Settings size={18} />
          <span>Settings</span>
        </a>

        <a href="/support" className="cv-sidebar-link">
          <HelpCircle size={18} />
          <span>Support</span>
        </a>

      </div>

    </aside>
  );
}