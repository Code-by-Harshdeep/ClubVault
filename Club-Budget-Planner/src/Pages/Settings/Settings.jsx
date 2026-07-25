// src/pages/Settings.jsx

import React from "react";
import {
  ShieldCheck,
  Monitor,
  Smartphone,
  Landmark,
  Receipt,
  Tag,
  CheckCircle,
  Settings as SettingsIcon,
} from "lucide-react";

import "../styles/Settings.css";

const Toggle = ({ checked = false }) => {
  return (
    <label className="toggle">
      <input type="checkbox" defaultChecked={checked} />
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
  return (
    <main className="settings-page">
      {/* Header */}
      <header className="settings-header">
        <h1>Settings</h1>
        <p>
          Manage your organization's core details, security preferences, and
          external connections.
        </p>
      </header>

      {/* Organization */}

      <SettingSection
        title="Organization Info"
        description="Update your club's public profile and contact details."
      >
        <div className="avatar-box">
          <div className="avatar">
            <img
              src="https://via.placeholder.com/150"
              alt="Organization logo"
            />
          </div>

          <div>
            <button className="btn-secondary">Change Avatar</button>

            <p>JPG, GIF or PNG. 1MB max.</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Organization Name</label>

            <input value="Finance Committee" readOnly />
          </div>

          <div className="form-group">
            <label>Short Name / Acronym</label>

            <input value="FinCom" readOnly />
          </div>

          <div className="form-group full">
            <label>Description</label>

            <textarea
              rows="3"
              readOnly
              value="Managing the student union budget and funding allocations."
            />
          </div>

          <div className="form-group full">
            <label>Primary Contact Email</label>

            <input value="finance@studentunion.edu" readOnly />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-primary">Save Changes</button>
        </div>
      </SettingSection>

      {/* Notifications */}

      <SettingSection
        title="Notifications"
        description="Manage how and when you receive alerts."
      >
        <div className="notification-list">
          <div className="notification-item">
            <div>
              <h3>Expense Approvals</h3>

              <p>Receive email alerts when expenses need approval.</p>
            </div>

            <Toggle checked />
          </div>

          <div className="notification-item">
            <div>
              <h3>Budget Threshold Alerts</h3>

              <p>Get notified when budgets reach 80%.</p>
            </div>

            <Toggle checked />
          </div>

          <div className="notification-item">
            <div>
              <h3>Weekly Summary</h3>

              <p>Receive weekly financial activity reports.</p>
            </div>

            <Toggle />
          </div>
        </div>
      </SettingSection>

      {/* Security */}

      <SettingSection
        title="Security"
        description="Protect your organization's sensitive data."
      >
        <div className="security-block">
          <h3>Password</h3>

          <button className="btn-secondary">Update Password</button>
        </div>

        <div className="security-block">
          <h3>Two-Factor Authentication</h3>

          <div className="security-card">
            <ShieldCheck size={24} />

            <div>
              <strong>Authenticator App</strong>

              <p>Configured via Google Authenticator</p>
            </div>

            <button className="btn-danger">Disable</button>
          </div>
        </div>

        <div className="security-block">
          <h3>Active Sessions</h3>

          <div className="session">
            <div className="session-info">
              <Monitor />

              <div>
                <strong>Mac OS X · Chrome</strong>

                <p>Current Session</p>
              </div>
            </div>

            <span className="badge">Active</span>
          </div>

          <div className="session">
            <div className="session-info">
              <Smartphone />

              <div>
                <strong>iOS · Safari</strong>

                <p>Last active 2 hours ago</p>
              </div>
            </div>

            <button className="btn-danger">Revoke</button>
          </div>
        </div>
      </SettingSection>

      {/* Integrations */}

      <SettingSection
        title="Integrations"
        description="Connect ClubVault with external tools."
      >
        <div className="integration-grid">
          <div className="integration-card">
            <div className="integration-icon">
              <Landmark />
            </div>

            <h3>Plaid</h3>

            <p>Bank Syncing</p>

            <div className="connected">
              <CheckCircle size={16} />
              Connected
            </div>
          </div>

          <div className="integration-card">
            <div className="integration-icon">
              <Tag />
            </div>

            <h3>Slack</h3>

            <p>Notifications</p>

            <button className="btn-secondary">Connect</button>
          </div>

          <div className="integration-card">
            <div className="integration-icon">
              <Receipt />
            </div>

            <h3>QuickBooks</h3>

            <p>Accounting</p>

            <button className="btn-secondary">Connect</button>
          </div>
        </div>
      </SettingSection>
    </main>
  );
}
