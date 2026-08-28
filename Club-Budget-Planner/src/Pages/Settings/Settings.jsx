import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Monitor,
  Landmark,
  Receipt,
  Tag,
  Lock,
} from "lucide-react";
import { useClub } from "../../ClubContext";
import { api } from "../../api";
import { BASIC_FEATURES, EXCLUSIVE_FEATURES, hasFeature } from "../../features";

import "./Settings.css";

const Toggle = ({ checked, onChange, disabled, label }) => {
  return (
    <label className={`toggle ${disabled ? "is-disabled" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={label}
      />
      <span className="toggle-slider" />
    </label>
  );
};

const SettingSection = ({ title, description, children }) => {
  return (
    <section className="settings-section">
      <div className="section-title settings-section-title">
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
  const [institutionType, setInstitutionType] = useState("college");
  const [institutionName, setInstitutionName] = useState("");
  const [annualBudgetCap, setAnnualBudgetCap] = useState("");
  const [features, setFeatures] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");
  const [featureSaving, setFeatureSaving] = useState(null);
  const [featureError, setFeatureError] = useState("");

  const [notifExpense, setNotifExpense] = useState(true);
  const [notifBudget, setNotifBudget] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);

  useEffect(() => {
    if (club) {
      setName(club.name || "");
      setDescription(club.description || "");
      setInstitutionType(club.institutionType || "college");
      setInstitutionName(club.institutionName || "");
      setAnnualBudgetCap(club.annualBudgetCap ? String(club.annualBudgetCap) : "");
      setFeatures(club.features || {});
      setNotifExpense(club.notificationPrefs?.expenseApprovals !== false);
      setNotifBudget(club.notificationPrefs?.budgetThreshold !== false);
      setNotifWeekly(Boolean(club.notificationPrefs?.weeklySummary));
    }
  }, [club]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaveMessage("");
    setSaving(true);
    try {
      await api.patch(`/api/clubs/${club._id}`, {
        name,
        description,
        institutionType,
        institutionName,
        annualBudgetCap: Number(annualBudgetCap),
        features,
        notificationPrefs: {
          expenseApprovals: notifExpense,
          budgetThreshold: notifBudget,
          weeklySummary: notifWeekly,
        },
      });
      await refreshClub();
      setSaveMessage("Saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = async (key) => {
    if (!isAdmin) return;
    const previous = features;
    const next = { ...features, [key]: !features[key] };
    const featureLabel = EXCLUSIVE_FEATURES.find((item) => item.key === key)?.label || "Feature";

    setFeatures(next);
    setFeatureSaving(key);
    setFeatureError("");
    setSaveMessage("");

    try {
      const data = await api.patch(`/api/clubs/${club._id}`, { features: next });
      setFeatures(data.club?.features || next);
      await refreshClub();
      setSaveMessage(`${featureLabel} ${next[key] ? "enabled" : "disabled"}.`);
    } catch (err) {
      setFeatures(previous);
      setFeatureError(err.message);
    } finally {
      setFeatureSaving(null);
    }
  };

  return (
    <main className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>
        <p>
          Every {institutionType} starts with the same basic workspace. Enable exclusive modules
          only if this campus needs them — budgets stay strictly capped either way.
        </p>
      </header>

      <SettingSection
        title="Campus profile"
        description={
          isAdmin
            ? "Update the public profile and the hard annual budget cap."
            : "Only campus admins can edit these details."
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

          <div className="form-group">
            <label>Campus type</label>
            <select
              value={institutionType}
              onChange={(e) => setInstitutionType(e.target.value)}
              disabled={!isAdmin}
            >
              <option value="college">College</option>
              <option value="school">School</option>
            </select>
          </div>

          <div className="form-group">
            <label>College / school name</label>
            <input
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              readOnly={!isAdmin}
            />
          </div>

          <div className="form-group">
            <label>Annual budget cap (₹)</label>
            <input
              type="number"
              min="1"
              value={annualBudgetCap}
              onChange={(e) => setAnnualBudgetCap(e.target.value)}
              readOnly={!isAdmin}
            />
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
        title="Feature pack"
        description={
          isAdmin
            ? "Turn modules on or off for this campus. Changes save instantly."
            : "Only campus admins can change which modules are enabled."
        }
      >
        <div className="feature-pack">
          <div className="feature-pack-heading">
            <div>
              <p className="feature-pack-label">Included for every campus</p>
              <p className="feature-pack-note">These core tools are always available.</p>
            </div>
            <span className="feature-pack-count">
              {EXCLUSIVE_FEATURES.filter((feature) => features[feature.key]).length}/{EXCLUSIVE_FEATURES.length} enabled
            </span>
          </div>
          <ul className="feature-chip-row">
            {BASIC_FEATURES.map((f) => (
              <li key={f.key} className="feature-chip locked">
                <Lock size={12} /> {f.label}
              </li>
            ))}
          </ul>

          <p className="feature-pack-label exclusive-label">Exclusive — customise for this campus</p>
          <div className="feature-pack-list">
            {EXCLUSIVE_FEATURES.map((feat) => (
              <div className={`feature-item ${features[feat.key] ? "is-enabled" : ""}`} key={feat.key}>
                <div className="feature-copy">
                  <h3>{feat.label}</h3>
                  <p>{feat.description}</p>
                  <span className="feature-state">
                    {featureSaving === feat.key ? "Saving..." : features[feat.key] ? "Enabled for this campus" : "Not enabled"}
                  </span>
                </div>
                <Toggle
                  checked={Boolean(features[feat.key])}
                  disabled={!isAdmin || featureSaving !== null}
                  label={`${features[feat.key] ? "Disable" : "Enable"} ${feat.label}`}
                  onChange={() => toggleFeature(feat.key)}
                />
              </div>
            ))}
          </div>
          {featureError && <p className="settings-inline-error">{featureError}</p>}
        </div>
      </SettingSection>

      <SettingSection
        title="Notifications"
        description="Stored on this club workspace. Threshold alerts also need the exclusive alerts feature."
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
            <Toggle
              checked={notifBudget}
              onChange={() => setNotifBudget((v) => !v)}
            />
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

      {hasFeature(club, "integrations") && (
        <SettingSection
          title="Integrations"
          description="Connect ClubVault with external tools. (Not yet implemented — shown because this campus enabled the exclusive module.)"
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
      )}
    </main>
  );
}
