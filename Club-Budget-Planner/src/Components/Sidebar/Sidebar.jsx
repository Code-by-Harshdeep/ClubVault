import React from "react";
// 1. Import hooks from react-router-dom
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Settings, HelpCircle, LayoutDashboard, Wallet, Receipt, Calendar, BarChart3, Users } from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  // 2. Grab the current active path from the URL
  const location = useLocation();

  // 3. Keep paths clean (removed duplicate keys)
  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Budgets", path: "/budgets", icon: <Wallet size={18} /> },
    { name: "Transactions", path: "/transactions", icon: <Receipt size={18} /> },
    { name: "Events", path: "/events", icon: <Calendar size={18} /> },
    { name: "Analytics", path: "/reportanalytics", icon: <BarChart3 size={18} /> },
    { name: "Members", path: "/members", icon: <Users size={18} /> },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <img
          className="sidebar-logo"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpx4HmEQVhoa-2c7YtaScfpr9w6Lp_06DydiiAE2NkehYw77NgEXqRDNGQ5hizrvcTeaC3S6quaw1DR7D_olWng4le06FQUdE6WOW5Cy8bh_dC4Sw5jN6otYUuQkEYlDe6za9m3_5rsQY5S1nYFNZA8ooqyzUqyDuEFg326eSf9VCnF8Vl8FpDGZzK3fIqTmTe7XCbdJJJrLzxkXaboiK_znwGhp0UYz676ID1bOYwP9pKz3rI3ArDDa8IPikWHlPObQ_dnnKspV-3"
          alt="logo"
        />
        <div>
          <h2 className="sidebar-title">Finance Committee</h2>
          <p className="sidebar-subtitle">Student Union</p>
        </div>
      </div>

      <button className="new-expense-btn">
        <Plus size={18} />
        New Expense
      </button>

      <nav className="sidebar-nav">
        {menu.map((item, index) => {
          // 4. Check if the current URL matches this item's path dynamically
          const isActive = location.pathname === item.path;

          return (
            <a
              href="#"
              key={index}
              // 5. Apply the active (black background) style dynamically
              className={isActive ? "sidebar-link active" : "sidebar-link"}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path); // 6. Navigate smoothly without full-page reloads
              }}
            >
              {item.icon}
              <span>{item.name}</span>
            </a>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <a 
          href="#" 
          className={location.pathname === "/settings" ? "sidebar-link active" : "sidebar-link"}
          onClick={(e) => { e.preventDefault(); navigate("/settings"); }}
        >
          <Settings size={18} />
          <span>Settings</span>
        </a>
        <a 
          href="#" 
          className={location.pathname === "/support" ? "sidebar-link active" : "sidebar-link"}
          onClick={(e) => { e.preventDefault(); navigate("/support"); }}
        >
          <HelpCircle size={18} />
          <span>Support</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;