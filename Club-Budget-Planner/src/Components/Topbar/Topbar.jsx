import React, { useState } from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
} from "lucide-react";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import { useTheme } from "../../ThemeContext";
import Notification from "../Alerts/Notification";
import "./Topbar.css";

const Topbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const isDark = theme === "dark";

  return (
    <header className="cv-topbar">
      {/* LEFT SIDE: Search */}
      <div className="cv-topbar-left">
        <div className="cv-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search anything..."
            aria-label="Search"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="cv-topbar-right">

        {/* Theme Toggle */}
        <button
          type="button"
          className="cv-theme-toggle"
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* Notification Bell */}
        <div className="cv-notification-wrap">
          <button
            type="button"
            className="cv-notification"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell size={20} />
            <span />
          </button>
          <Notification open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        </div>

        {/* User Profile */}
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Topbar;