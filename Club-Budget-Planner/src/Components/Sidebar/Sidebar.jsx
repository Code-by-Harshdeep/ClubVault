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
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const MENU_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
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
        <NavLink to="/" className="cv-sidebar-logo">
          ClubVault
        </NavLink>

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
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  `cv-sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

        </nav>

      </div>


      <div className="cv-sidebar-footer">

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `cv-sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>


        <NavLink
          to="/support"
          className={({ isActive }) =>
            `cv-sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <HelpCircle size={18} />
          <span>Support</span>
        </NavLink>

      </div>


    </aside>
  );
}