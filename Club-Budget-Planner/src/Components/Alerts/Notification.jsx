import React from "react";
import { Bell, X } from "lucide-react";
import "./Notification.css";

export default function Notification({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="notification-panel">

      <div className="notification-header">

        <h3>
          Notifications
        </h3>

        <button
          className="close-btn"
          onClick={onClose}
        >
          <X size={18} />
        </button>

      </div>

      <div className="notification-empty">

        <div className="notification-icon">

          <Bell size={40} strokeWidth={1.5} />

        </div>

        <h4>No notifications yet</h4>

        <p>
          You're all caught up!
          <br />
          Updates and activity will appear here once they're available.
        </p>

      </div>

    </div>
  );
}