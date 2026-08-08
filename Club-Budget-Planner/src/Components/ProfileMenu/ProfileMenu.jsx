import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClub } from "../../ClubContext";
import "./ProfileMenu.css";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { club, role } = useClub();

  // Safely parse localStorage
  let user = {};
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      user = JSON.parse(stored);
    }
  } catch (err) {
    user = {};
  }

  const fullName = user?.fullName || "marioo";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("club");
    navigate("/login", { replace: true });
  };
  const initials = fullName
    ? fullName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "M";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="cv-profile-wrapper" ref={menuRef}>
      <button
        className="cv-profile-button"
        onClick={() => setOpen(!open)}
        type="button"
        aria-expanded={open}
      >
        <div className="cv-profile-avatar">
          {initials}
          <span className="cv-online-dot" />
        </div>

        <div className="cv-profile-info">
          <h4 className="cv-profile-name">{fullName}</h4>
          <p className="cv-profile-role">
            {role === "admin" ? "Admin" : "Member"}
          </p>
        </div>

        <ChevronDown
          size={16}
          className={`cv-chevron ${open ? "rotate" : ""}`}
        />
      </button>

      {open && (
        <div className="cv-profile-dropdown">
          <div className="cv-profile-header">
            <div className="cv-large-avatar">{initials}</div>

            <div className="cv-header-details">
              <h3>{fullName}</h3>
              <p>{club?.name || "No club yet"}</p>
            </div>
          </div>

          <div className="cv-profile-status">
            <ShieldCheck size={15} />
            <span>Account verified</span>
          </div>

          <div className="cv-last-login">
            <span>Last login</span>
            <strong>Today, 09:42 AM</strong>
          </div>

          <div className="cv-dropdown-links">
            <button className="cv-dropdown-btn" type="button">
              <User size={16} />
              <span>View Profile</span>
            </button>

            <button className="cv-dropdown-btn" type="button">
              <Settings size={16} />
              <span>Account Settings</span>
            </button>

            <div className="cv-dropdown-divider" />

            <button className="cv-dropdown-btn cv-logout" type="button" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;