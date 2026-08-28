import React, { useEffect, useState } from "react";
import { Plus, School, Megaphone, CircleCheck, Calendar, Building2, X } from "lucide-react";
import { useClub } from "../../ClubContext";
import { api } from "../../api";
import "./EventsPlanning.css";

function iconFor(type) {
  if (type === "Completed") return CircleCheck;
  if (type === "Campaign") return Megaphone;
  return School;
}

function formatDateLine(event) {
  const d = event.date ? new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Date TBD";
  return event.location ? `${d} • ${event.location}` : d;
}

function BudgetBar({ progress }) {
  return (
    <div className="ev-progress">
      <div className="ev-progress-fill" style={{ width: `${progress}%` }} />
    </div>
  );
}

function EventCard({ event }) {
  const Icon = iconFor(event.type);
  const pct = event.budget ? Math.min(100, (event.spent / event.budget) * 100) : 0;
  const completed = event.status === "completed";

  return (
    <div className={`ev-event-card ${completed ? "completed" : ""}`}>
      <div className="ev-event-type">
        <Icon size={14} />
        {event.type || "Event"}
      </div>

      <h3>{event.title}</h3>
      <p className="ev-date">{formatDateLine(event)}</p>

      <div className="ev-budget">
        <div className="ev-budget-head">
          <span>{completed ? "Final Spend" : "Allocated"}</span>
          <strong>
            ₹{(event.spent || 0).toLocaleString("en-IN")}
            <small> / ₹{(event.budget || 0).toLocaleString("en-IN")}</small>
          </strong>
        </div>

        <BudgetBar progress={pct} />

        <div className="ev-person">
          {event.assignedTo ? (
            <span>{event.assignedTo.fullName}</span>
          ) : (
            <>
              <div className="ev-empty-avatar">
                <Plus size={12} />
              </div>
              <span>Unassigned</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NewEventModal({ onClose, onSubmit, budgets }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Workshop");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetId, setBudgetId] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title) {
      setError("Event title is required.");
      return;
    }
    if (Number(budget) > 0 && !budgetId) {
      setError("Choose a budget line for this event.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ title, type, date, location, budget: Number(budget) || 0, budgetId, description });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ev-modal-overlay" onClick={onClose}>
      <div className="ev-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="ev-modal-header">
          <h3>Add New Event</h3>
          <button type="button" className="ev-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="ev-modal-form">
          <label>Event Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Annual Hackathon" />
          
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>Workshop</option>
            <option>Campaign</option>
            <option>Social</option>
            <option>Fundraiser</option>
          </select>
          
          <label>Event Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          
          <label>Location / Venue</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Main Auditorium" />
          
          <label>Micro-Budget (₹)</label>
          <input type="number" min="0" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0.00" />
          
          {Number(budget) > 0 && (
            <>
              <label>Charge to Budget Line</label>
              <select value={budgetId} onChange={(e) => setBudgetId(e.target.value)}>
                <option value="">Select a budget allocation</option>
                {budgets.map((line) => (
                  <option key={line._id} value={line._id}>
                    {line.title} — ₹{Number(line.remaining ?? line.allocated - line.spent).toLocaleString("en-IN")} left
                  </option>
                ))}
              </select>
            </>
          )}
          
          <label>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional event notes" />
          
          {error && <p className="ev-modal-error">{error}</p>}
          
          <div className="ev-modal-actions">
            <button type="button" className="ev-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="ev-primary-btn" disabled={loading}>
              {loading ? "Creating…" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventsPlanning() {
  const { club } = useClub();
  const [events, setEvents] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    if (!club?._id) return;
    setLoading(true);
    setError("");
    try {
      const [eventData, budgetData] = await Promise.all([
        api.get(`/api/clubs/${club._id}/events`),
        api.get(`/api/clubs/${club._id}/budgets`),
      ]);
      setEvents(eventData.events || []);
      setBudgets(budgetData.budgets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [club?._id]);

  const handleCreate = async (payload) => {
    await api.post(`/api/clubs/${club._id}/events`, payload);
    await load();
  };

  return (
    <main className="cv-events-page">
      {showModal && <NewEventModal onClose={() => setShowModal(false)} onSubmit={handleCreate} budgets={budgets} />}

      <header className="cv-events-header">
        <div>
          <div className="cv-dash-club-badge">
            <Building2 size={13} /> {club?.name || "Event Planning"}
          </div>
          <h1 className="cv-events-title">Events Planning</h1>
          <p className="cv-events-subtitle">Coordinate upcoming activities and assign dedicated micro-budgets.</p>
        </div>

        <div className="cv-events-actions">
          <button type="button" className="cv-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} />
            <span>Add Event</span>
          </button>
        </div>
      </header>

      {error && <p className="cv-events-error">{error}</p>}

      <div className="cv-events-grid">
        {loading ? (
          <div className="cv-events-empty">Loading events…</div>
        ) : events.length === 0 ? (
          <div className="cv-events-empty">
            <Calendar size={28} />
            <p>No events scheduled yet.</p>
            <button type="button" className="cv-btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Schedule First Event
            </button>
          </div>
        ) : (
          events.map((event) => <EventCard key={event._id} event={event} />)
        )}
      </div>
    </main>
  );
}
