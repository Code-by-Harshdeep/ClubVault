import React, { useEffect, useState } from "react";
import { Bell, CircleAlert, RefreshCw, X } from "lucide-react";
import { useClub } from "../../ClubContext";
import { api } from "../../api";
import "./Notification.css";

export default function Notification({ open, onClose }) {
  const { club } = useClub();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !club?._id) return;
    let active = true;
    setLoading(true);
    api.get(`/api/clubs/${club._id}/dashboard`)
      .then((data) => { if (active) setAlerts(data.budgetAlerts || []); })
      .catch(() => { if (active) setAlerts([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, club?._id]);

  if (!open) return null;

  return (
    <div className="notification-panel">

      <div className="notification-header">

        <div>
          <h3>Notifications</h3>
          <p className="notification-summary">{alerts.length ? `${alerts.length} budget alert${alerts.length === 1 ? "" : "s"}` : "Campus activity"}</p>
        </div>

        <button
          className="close-btn"
          onClick={onClose}
        >
          <X size={18} />
        </button>

      </div>

      {loading ? <div className="notification-empty"><RefreshCw className="notification-spin" size={24} /><p>Checking budget alerts...</p></div> : alerts.length === 0 ? <div className="notification-empty"><div className="notification-icon"><Bell size={32} strokeWidth={1.5} /></div><h4>You're all caught up</h4><p>No budget lines need attention right now.</p></div> : <div className="notification-alert-list">{alerts.slice(0, 5).map((alert) => <div className={`notification-alert ${alert.level === "critical" ? "critical" : ""}`} key={String(alert.budgetId)}><CircleAlert size={17} /><div><strong>{alert.title}</strong><p>{alert.message}</p></div></div>)}</div>}

    </div>
  );
}