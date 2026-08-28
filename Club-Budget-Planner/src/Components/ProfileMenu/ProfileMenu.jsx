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
  const { club, clubs = [], selectClub, role } = useClub();

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

  const fullName = user?.fullName || user?.name || "Club Member";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("club");
    localStorage.removeItem("activeClubId");
    navigate("/login", { replace: true });
  };

  const openSettings = () => {
    setOpen(false);
    navigate("/settings");
  };
  const initials = fullName
    ? fullName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "CM";

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
            <span>Session Status</span>
            <strong>Active now</strong>
          </div>

          {clubs.length > 0 && (
            <div style={{ padding: "8px 12px", borderTop: "1px solid var(--color-border-soft, #e2e8f0)", borderBottom: "1px solid var(--color-border-soft, #e2e8f0)" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-on-surface-subtle, #94a3b8)", marginBottom: "6px" }}>
                My Clubs ({clubs.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "120px", overflowY: "auto" }}>
                {clubs.map((c) => {
                  const isCurrent = c._id === club?._id;
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => {
                        selectClub(c._id);
                        setOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 8px",
                        fontSize: "12.5px",
                        fontWeight: isCurrent ? "600" : "500",
                        background: isCurrent ? "var(--color-surface-container-low, #f1f5f9)" : "transparent",
                        color: isCurrent ? "var(--color-primary, #0f172a)" : "var(--color-on-surface-variant, #64748b)",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                      {isCurrent && <span style={{ fontSize: "10px", padding: "1px 6px", background: "var(--color-emerald-bg, rgba(16, 185, 129, 0.1))", color: "var(--color-emerald-text, #059669)", borderRadius: "4px", fontWeight: "700" }}>Active</span>}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/club-setup");
                }}
                style={{
                  marginTop: "6px",
                  display: "block",
                  width: "100%",
                  fontSize: "11.5px",
                  fontWeight: "600",
                  color: "var(--color-indigo-text, #2563eb)",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                + Create / Join another club
              </button>
            </div>
          )}

          <div className="cv-dropdown-links">
            <button className="cv-dropdown-btn" type="button" onClick={openSettings}>
              <User size={16} />
              <span>View Profile</span>
            </button>

            <button className="cv-dropdown-btn" type="button" onClick={openSettings}>
              <Settings size={16} />
              <span>Club Settings</span>
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