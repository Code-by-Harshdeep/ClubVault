import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Wallet,
  ReceiptText,
  Calendar,
  BarChart3,
  ClipboardCheck,
  Building2,
  Users,
  Settings,
  HelpCircle,
  Plus,
  Menu,
  X
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useClub } from "../../ClubContext";
import { hasFeature } from "../../features";
import "./Sidebar.css";

const MENU_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Budgets", icon: Wallet, href: "/budgets" },
  { label: "Transactions", icon: ReceiptText, href: "/transactions" },
  { label: "Events", icon: Calendar, href: "/events", feature: "events" },
  { label: "Analytics", icon: BarChart3, href: "/analytics", feature: "analytics" },
  { label: "Reimbursements", icon: ClipboardCheck, href: "/reimbursements", feature: "reimbursements" },
  { label: "Members", icon: Users, href: "/members" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { club, clubs, selectClub } = useClub();

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
            {club?.institutionName
              ? club.institutionName.toUpperCase()
              : club?.name
                ? club.name.toUpperCase()
                : "CLUB WORKSPACE"}
          </span>
          {clubs.filter((item) => item.status === "approved").length > 1 && (
            <label className="cv-club-switcher">
              <span>Active club</span>
              <select
                value={club?._id || ""}
                onChange={(event) => {
                  selectClub(event.target.value);
                  navigate("/dashboard");
                }}
                aria-label="Select active club"
              >
                {clubs.filter((item) => item.status === "approved").map((item) => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
            </label>
          )}
        </div>


        <button
          className="cv-btn-sidebar-cta"
          onClick={() => navigate("/transactions?new=1")}
        >
          <Plus size={18} />
          <span>New Expense</span>
        </button>


        <div className="cv-sidebar-group">

          <p className="cv-sidebar-label">
            MAIN MENU
          </p>


          <nav className="cv-sidebar-nav">

            {MENU_ITEMS.filter((item) => !item.feature || hasFeature(club, item.feature)).map((item) => {
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