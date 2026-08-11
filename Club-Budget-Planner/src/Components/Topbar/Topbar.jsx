import React from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  PanelsTopLeft,
} from "lucide-react";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import { useTheme } from "../../ThemeContext";
import "./Topbar.css";

const Topbar = () => {
  const { theme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon size={20} />;

      case "light-dark-sidebar":
        return <PanelsTopLeft size={20} />;

      case "light":
      default:
        return <Sun size={20} />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "dark":
        return "Dark mode";

      case "light-dark-sidebar":
        return "Light mode with dark sidebar";

      case "light":
      default:
        return "Light mode";
    }
  };

  const getNextThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Switch to dark mode";

      case "dark":
        return "Switch to light mode with dark sidebar";

      case "light-dark-sidebar":
      default:
        return "Switch to light mode";
    }
  };

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
          title={`${getNextThemeLabel()} — Current: ${getThemeLabel()}`}
          aria-label={getNextThemeLabel()}
        >
          {getThemeIcon()}
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

        {/* User Profile */}
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Topbar;