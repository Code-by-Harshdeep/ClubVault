import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark,
  Sun,
  Moon,
  Clock,
  XCircle,
  LogOut,
  ArrowLeft,
  Calendar,
  BarChart3,
  Receipt,
  BellRing,
  Layers,
  Check,
  Sparkles,
} from "lucide-react";
import { EXCLUSIVE_FEATURES } from "../../features";
import { useTheme } from "../../ThemeContext";
import { useClub } from "../../ClubContext";
import { api } from "../../api";
import "./ClubSetup.css";

const FEATURE_ICONS = {
  events: Calendar,
  analytics: BarChart3,
  reimbursements: Receipt,
  notifications: BellRing,
  integrations: Layers,
};

export default function ClubSetup() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { status, club, refreshClub } = useClub();

  const [tab, setTab] = useState("join");
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  // Join form
  const [clubIdInput, setClubIdInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");

  // Create form
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [institutionType, setInstitutionType] = useState("college");
  const [institutionName, setInstitutionName] = useState("");
  const [annualBudgetCap, setAnnualBudgetCap] = useState("");
  const [exclusive, setExclusive] = useState({
    events: false,
    analytics: false,
    reimbursements: false,
    notifications: false,
    integrations: false,
  });
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError("");
    setJoinMessage("");

    if (!clubIdInput.trim()) {
      setJoinError("Please enter a Club ID.");
      return;
    }

    setJoinLoading(true);
    try {
      const data = await api.post("/api/clubs/join", { clubId: clubIdInput.trim() });
      setJoinMessage(data.message || "Request sent successfully.");
      await refreshClub();
      navigate("/dashboard");
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (!createName.trim()) {
      setCreateError("Please enter a club name.");
      return;
    }
    if (!annualBudgetCap || Number(annualBudgetCap) <= 0) {
      setCreateError("Set a positive annual budget cap.");
      return;
    }

    setCreateLoading(true);
    try {
      await api.post("/api/clubs", {
        name: createName.trim(),
        description: createDesc.trim(),
        institutionType,
        institutionName: institutionName.trim() || createName.trim(),
        annualBudgetCap: Number(annualBudgetCap),
        features: exclusive,
      });
      await refreshClub();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("club");
    localStorage.removeItem("activeClubId");
    navigate("/login", { replace: true });
  };

  if (status === "loading") {
    return (
      <div className="club-setup-page">
        <p className="club-setup-loading">Checking your club status…</p>
      </div>
    );
  }

  const isApproved = status === "approved";
  const isPending = status === "pending" && !showOverrideForm;
  const isRejected = status === "rejected" && !showOverrideForm;

  return (
    <div className="club-setup-page">
      <button
        className="club-setup-theme-toggle"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        onClick={toggleTheme}
        type="button"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="club-setup-card">
        {isApproved && (
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "transparent",
                border: "none",
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--color-primary)",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <span style={{ fontSize: "12px", color: "var(--color-on-surface-variant)" }}>
              Active: <strong>{club?.name}</strong>
            </span>
          </div>
        )}

        <div className="club-setup-brand">
          <Landmark size={28} />
          <span>ClubVault</span>
        </div>

        {isPending && (
          <div className="club-setup-state">
            <Clock size={32} className="club-setup-state-icon pending" />
            <h2>Request pending</h2>
            <p>
              Your request to join <strong>{club?.name}</strong> (Club ID:{" "}
              <strong>{club?.clubId}</strong>) is waiting on admin approval.
            </p>
            <div className="club-setup-state-actions">
              <button type="button" className="club-setup-secondary-btn" onClick={refreshClub}>
                Check again
              </button>
              <button type="button" className="club-setup-secondary-btn" onClick={() => setShowOverrideForm(true)}>
                Join or Create another club
              </button>
              <button type="button" className="club-setup-link-btn" onClick={handleLogout}>
                <LogOut size={14} /> Log out
              </button>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="club-setup-state">
            <XCircle size={32} className="club-setup-state-icon rejected" />
            <h2>Request declined</h2>
            <p>
              Your request to join <strong>{club?.name}</strong> wasn't accepted. You can try
              joining a different club or create your own organization below.
            </p>
            <div className="club-setup-state-actions">
              <button
                type="button"
                className="club-setup-secondary-btn"
                onClick={() => setShowOverrideForm(true)}
              >
                Join or Create another club
              </button>
            </div>
          </div>
        )}

        {(!isPending && !isRejected) && (
          <>
            <div className="club-setup-header">
              <h2>{isApproved ? "Join or Create Another Club" : "You haven't joined a club yet"}</h2>
              <p>
                {isApproved
                  ? "Enter a 6-character Club ID to request access to another organization, or establish a brand-new club treasury."
                  : "Every student organization starts with a clean financial ledger. Admins can configure custom budgets and exclusive features."}
              </p>
            </div>

            <div className="club-setup-tabs">
              <button
                type="button"
                className={`club-setup-tab ${tab === "join" ? "active" : ""}`}
                onClick={() => setTab("join")}
              >
                Join a club
              </button>
              <button
                type="button"
                className={`club-setup-tab ${tab === "create" ? "active" : ""}`}
                onClick={() => setTab("create")}
              >
                Create a club
              </button>
            </div>

            {tab === "join" && (
              <form className="club-setup-form" onSubmit={handleJoin}>
                <label>Club ID Code</label>
                <input
                  type="text"
                  placeholder="e.g. AB12CD"
                  value={clubIdInput}
                  onChange={(e) => setClubIdInput(e.target.value.toUpperCase())}
                  maxLength={10}
                />
                <p className="club-setup-hint">
                  Ask your club president or treasurer for their 6-character Club ID.
                </p>
                {joinError && <p className="club-setup-error">{joinError}</p>}
                {joinMessage && <p className="club-setup-success">{joinMessage}</p>}
                <button className="club-setup-btn" type="submit" disabled={joinLoading}>
                  {joinLoading ? "Sending request..." : "Send Join Request"}
                </button>
              </form>
            )}

            {tab === "create" && (
              <form className="club-setup-form" onSubmit={handleCreate}>
                <label>Club Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Robotics & AI Club"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                />

                <label>Description</label>
                <textarea
                  placeholder="What is the mission of this club?"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  rows={3}
                />

                <label>Institution Name</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                />

                <label>Annual Approved Budget Cap (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 250000"
                  min="1"
                  step="1"
                  value={annualBudgetCap}
                  onChange={(e) => setAnnualBudgetCap(e.target.value)}
                  required
                />
                <p className="club-setup-hint">
                  Total maximum annual budget authorized for all club activities.
                </p>

                <div className="club-setup-features-section">
                  <div className="club-setup-features-header">
                    <h3>Optional Modular Features</h3>
                    <span className="club-setup-features-counter">
                      {Object.values(exclusive).filter(Boolean).length} / {EXCLUSIVE_FEATURES.length} enabled
                    </span>
                  </div>
                  <p className="club-setup-features-subtitle">
                    You can also toggle any of these on or off later in Settings.
                  </p>
                  <div className="club-setup-features-list">
                    {EXCLUSIVE_FEATURES.map((feat) => {
                      const IconComponent = FEATURE_ICONS[feat.key] || Layers;
                      const isChecked = !!exclusive[feat.key];
                      return (
                        <div
                          key={feat.key}
                          className={`club-setup-feature-card ${isChecked ? "is-active" : ""}`}
                          onClick={() =>
                            setExclusive((prev) => ({
                              ...prev,
                              [feat.key]: !prev[feat.key],
                            }))
                          }
                          role="checkbox"
                          aria-checked={isChecked}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              setExclusive((prev) => ({
                                ...prev,
                                [feat.key]: !prev[feat.key],
                              }));
                            }
                          }}
                        >
                          <div className="club-setup-feature-left">
                            <div className={`club-setup-feature-icon ${isChecked ? "active-icon" : ""}`}>
                              <IconComponent size={18} />
                            </div>
                            <div className="club-setup-feature-info">
                              <span className="club-setup-feature-title">{feat.label}</span>
                              <span className="club-setup-feature-desc">{feat.description}</span>
                            </div>
                          </div>
                          <div className={`club-setup-toggle-pill ${isChecked ? "checked" : ""}`}>
                            <div className="club-setup-toggle-thumb">
                              {isChecked && <Check size={11} strokeWidth={3} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {createError && <p className="club-setup-error">{createError}</p>}
                <button className="club-setup-btn" type="submit" disabled={createLoading}>
                  {createLoading ? "Creating club..." : "Launch Club Treasury"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
