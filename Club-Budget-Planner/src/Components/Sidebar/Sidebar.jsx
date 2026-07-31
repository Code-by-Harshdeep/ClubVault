import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Wallet,
  ReceiptText,
  Calendar,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  Plus,
  Menu,
  X
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close the drawer if the viewport is resized back to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 768) setIsOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <button
        className="cv-sidebar-toggle"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        className={`cv-sidebar-overlay ${isOpen ? "is-active" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`cv-sidebar ${isOpen ? "is-open" : ""}`}>

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
    </>
  );
}