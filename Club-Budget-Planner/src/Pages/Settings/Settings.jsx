import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Monitor,
  Landmark,
  Receipt,
  Tag,
} from "lucide-react";
import { useClub } from "../../ClubContext";
import { api } from "../../api";

import "./Settings.css";

const Toggle = ({ checked, onChange }) => {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span />
    </label>
  );
};

const SettingSection = ({ title, description, children }) => {
  return (
    <section className="settings-section">
      <div className="section-title">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="settings-card">{children}</div>
    </section>
  );
};

export default function Settings() {
  const { club, role, refreshClub } = useClub();
  const isAdmin = role === "admin";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");

  // Local-only preference toggles — not yet backed by a persisted setting.
  const [notifExpense, setNotifExpense] = useState(true);
  const [notifBudget, setNotifBudget] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);

  useEffect(() => {
    if (club) {
      setName(club.name || "");
      setDescription(club.description || "");
    }
  }, [club]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaveMessage("");
    setSaving(true);
    try {
      await api.patch(`/api/clubs/${club._id}`, { name, description });
      await refreshClub();
      setSaveMessage("Saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>
        <p>Manage your club's core details and preferences.</p>
      </header>

      <SettingSection
        title="Organization Info"
        description={
          isAdmin
            ? "Update your club's public profile."
            : "Only club admins can edit these details."
        }
      >
        <form className="form-grid" onSubmit={handleSave}>
          <div className="form-group">
            <label>Club Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={!isAdmin}
            />
          </div>

          <div className="form-group">
            <label>Club ID</label>
            <input value={club?.clubId || ""} readOnly />
          </div>

          <div className="form-group full">
            <label>Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              readOnly={!isAdmin}
            />
          </div>
        </form>

        {error && <p style={{ color: "var(--color-error)" }}>{error}</p>}
        {saveMessage && <p style={{ color: "#15803d" }}>{saveMessage}</p>}

        {isAdmin && (
          <div className="form-actions">
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </SettingSection>

      <SettingSection
        title="Notifications"
        description="Manage how and when you receive alerts. (Preference only — not yet wired to email delivery.)"
      >
        <div className="notification-list">
          <div className="notification-item">
            <div>
              <h3>Expense Approvals</h3>
              <p>Get alerted when expenses need approval.</p>
            </div>
            <Toggle checked={notifExpense} onChange={() => setNotifExpense((v) => !v)} />
          </div>

          <div className="notification-item">
            <div>
              <h3>Budget Threshold Alerts</h3>
              <p>Get notified when budgets reach 80%.</p>
            </div>
            <Toggle checked={notifBudget} onChange={() => setNotifBudget((v) => !v)} />
          </div>

          <div className="notification-item">
            <div>
              <h3>Weekly Summary</h3>
              <p>Receive weekly financial activity reports.</p>
            </div>
            <Toggle checked={notifWeekly} onChange={() => setNotifWeekly((v) => !v)} />
          </div>
        </div>
      </SettingSection>

      <SettingSection
        title="Security"
        description="Protect your account. Password changes go through your account, not this club."
      >
        <div className="security-block">
          <h3>Two-Factor Authentication</h3>
          <div className="security-card">
            <ShieldCheck size={24} />
            <div>
              <strong>Not yet available</strong>
              <p>2FA isn't wired up in this build.</p>
            </div>
          </div>
        </div>

        <div className="security-block">
          <h3>Active Sessions</h3>
          <div className="session">
            <div className="session-info">
              <Monitor />
              <div>
                <strong>This device</strong>
                <p>Current session</p>
              </div>
            </div>
            <span className="badge">Active</span>
          </div>
        </div>
      </SettingSection>

      <SettingSection
        title="Integrations"
        description="Connect ClubVault with external tools. (Not yet implemented — shown for reference.)"
      >
        <div className="integration-grid">
          <div className="integration-card">
            <div className="integration-icon">
              <Landmark />
            </div>
            <h3>Plaid</h3>
            <p>Bank Syncing</p>
            <button className="btn-secondary" disabled>Coming soon</button>
          </div>

          <div className="integration-card">
            <div className="integration-icon">
              <Tag />
            </div>
            <h3>Slack</h3>
            <p>Notifications</p>
            <button className="btn-secondary" disabled>Coming soon</button>
          </div>

          <div className="integration-card">
            <div className="integration-icon">
              <Receipt />
            </div>
            <h3>QuickBooks</h3>
            <p>Accounting</p>
            <button className="btn-secondary" disabled>Coming soon</button>
          </div>
        </div>
      </SettingSection>
    </main>
  );
}
