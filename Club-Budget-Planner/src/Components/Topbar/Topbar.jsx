import React, { useState } from "react";
import { Search, Bell, Menu, Sun, Moon } from "lucide-react";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import { useTheme } from "../../ThemeContext";
import "./Topbar.css";

const Topbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="cv-topbar">
      {/* LEFT SIDE: Search & Mobile Menu */}
      <div className="cv-topbar-left">
        <button
          type="button"
          className="cv-mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
        >
          <Menu size={22} />
        </button>

        <div className="cv-search">
          <Search size={18} />
          <input type="text" placeholder="Search anything..." />
        </div>
      </div>

      {/* RIGHT SIDE: Theme Toggle, Notifications & Profile */}
      <div className="cv-topbar-right">
        {/* Theme Toggle Button */}
        <button
          type="button"
          className="cv-notification"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          className="cv-notification"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span />
        </button>

        {/* User Profile Dropdown */}
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Topbar;
