import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, Sun, Moon, Clock, XCircle, LogOut } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { useClub } from "../../ClubContext";
import { api } from "../../api";
import "./ClubSetup.css";

export default function ClubSetup() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { status, club, refreshClub } = useClub();

  const [tab, setTab] = useState("join");

  // Join form
  const [clubIdInput, setClubIdInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");

  // Create form
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // If already approved, bounce straight to dashboard
  useEffect(() => {
    if (status === "approved") {
      navigate("/dashboard", { replace: true });
    }
  }, [status, navigate]);

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
      setJoinMessage(data.message || "Request sent.");
      await refreshClub();
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

    setCreateLoading(true);
    try {
      await api.post("/api/clubs", { name: createName.trim(), description: createDesc.trim() });
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
    navigate("/login", { replace: true });
  };

  if (status === "loading") {
    return (
      <div className="club-setup-page">
        <p className="club-setup-loading">Checking your club status…</p>
      </div>
    );
  }

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
        <div className="club-setup-brand">
          <Landmark size={28} />
          <span>ClubVault</span>
        </div>

        {status === "pending" && (
          <div className="club-setup-state">
            <Clock size={32} className="club-setup-state-icon pending" />
            <h2>Request pending</h2>
            <p>
              Your request to join <strong>{club?.name}</strong> (Club ID:{" "}
              <strong>{club?.clubId}</strong>) is waiting on admin approval.
              You'll get access as soon as they accept it.
            </p>
            <div className="club-setup-state-actions">
              <button type="button" className="club-setup-secondary-btn" onClick={refreshClub}>
                Check again
              </button>
              <button type="button" className="club-setup-link-btn" onClick={handleLogout}>
                <LogOut size={14} /> Log out
              </button>
            </div>
          </div>
        )}

        {status === "rejected" && (
          <div className="club-setup-state">
            <XCircle size={32} className="club-setup-state-icon rejected" />
            <h2>Request declined</h2>
            <p>
              Your request to join <strong>{club?.name}</strong> wasn't accepted. You can try
              joining a different club or another request to the same one below.
            </p>
            <div className="club-setup-state-actions">
              <button
                type="button"
                className="club-setup-secondary-btn"
                onClick={() => {
                  setClubIdInput(club?.clubId || "");
                }}
              >
                Retry same Club ID
              </button>
            </div>
            <form className="club-setup-form" onSubmit={handleJoin}>
              <label>Club ID</label>
              <input
                type="text"
                placeholder="e.g. AB12CD"
                value={clubIdInput}
                onChange={(e) => setClubIdInput(e.target.value)}
              />
              {joinError && <p className="club-setup-error">{joinError}</p>}
              {joinMessage && <p className="club-setup-success">{joinMessage}</p>}
              <button className="club-setup-btn" type="submit" disabled={joinLoading}>
                {joinLoading ? "Sending..." : "Send request"}
              </button>
            </form>
          </div>
        )}

        {status === "none" && (
          <>
            <div className="club-setup-header">
              <h2>You haven't joined a club yet</h2>
              <p>Join an existing club with its Club ID, or create a new one.</p>
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
                <label>Club ID</label>
                <input
                  type="text"
                  placeholder="e.g. AB12CD"
                  value={clubIdInput}
                  onChange={(e) => setClubIdInput(e.target.value)}
                />
                <p className="club-setup-hint">
                  Ask your club admin for the Club ID — it's shown on their Members page.
                </p>
                {joinError && <p className="club-setup-error">{joinError}</p>}
                {joinMessage && <p className="club-setup-success">{joinMessage}</p>}
                <button className="club-setup-btn" type="submit" disabled={joinLoading}>
                  {joinLoading ? "Sending..." : "Request to join"}
                </button>
              </form>
            )}

            {tab === "create" && (
              <form className="club-setup-form" onSubmit={handleCreate}>
                <label>Club or organization name</label>
                <input
                  type="text"
                  placeholder="e.g. Debate Society"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
                <label>Description (optional)</label>
                <textarea
                  rows={3}
                  placeholder="What's this club about?"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                />
                {createError && <p className="club-setup-error">{createError}</p>}
                <button className="club-setup-btn" type="submit" disabled={createLoading}>
                  {createLoading ? "Creating..." : "Create club"}
                </button>
              </form>
            )}
          </>
        )}

        <button type="button" className="club-setup-link-btn club-setup-logout" onClick={handleLogout}>
          <LogOut size={14} /> Log out
        </button>
      </div>
    </div>
  );
}
