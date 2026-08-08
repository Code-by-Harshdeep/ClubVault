import React, { useEffect, useState } from "react";
import { Plus, School, Megaphone, CircleCheck, Calendar } from "lucide-react";
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
    <div className="progress">
      <div className="progress-fill" style={{ width: `${progress}%` }} />
    </div>
  );
}

function EventCard({ event }) {
  const Icon = iconFor(event.type);
  const pct = event.budget ? Math.min(100, (event.spent / event.budget) * 100) : 0;
  const completed = event.status === "completed";

  return (
    <div className={`event-card ${completed ? "completed" : ""}`}>
      <div className="event-type">
        <Icon size={16} />
        {event.type || "Event"}
      </div>

      <h3>{event.title}</h3>
      <p className="date">{formatDateLine(event)}</p>

      <div className="budget">
        <div className="budget-head">
          <span>{completed ? "Final Spend" : "Allocated"}</span>
          <strong>
            ₹{event.spent || 0}
            <small> / ₹{event.budget || 0}</small>
          </strong>
        </div>

        <BudgetBar progress={pct} />

        <div className="person">
          {event.assignedTo ? (
            <span>{event.assignedTo.fullName}</span>
          ) : (
            <>
              <div className="empty-avatar">
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

function NewEventModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Workshop");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
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
    setLoading(true);
    try {
      await onSubmit({ title, type, date, location, budget: Number(budget) || 0, description });
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
        <h3>Add Event</h3>
        <form onSubmit={handleSubmit} className="ev-modal-form">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Spring Alumni Gala" />
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>Workshop</option>
            <option>Campaign</option>
            <option>Social</option>
            <option>Fundraiser</option>
          </select>
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <label>Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Student Union Hall" />
          <label>Budget (₹)</label>
          <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0" />
          <label>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          {error && <p className="ev-modal-error">{error}</p>}
          <div className="ev-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="ev-primary-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    if (!club?._id) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/api/clubs/${club._id}/events`);
      setEvents(data.events || []);
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
    <main className="events-page">
      {showModal && <NewEventModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}

      <header>
        <div>
          <h1>Events Planning</h1>
          <p>Coordinate upcoming club activities and monitor dedicated micro-budgets.</p>
        </div>

        <div className="actions">
          <button className="add-btn" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Add Event
          </button>
        </div>
      </header>

      {error && <p style={{ color: "var(--color-error)" }}>{error}</p>}

      <div className="grid">
        {loading ? (
          <p>Loading events…</p>
        ) : events.length === 0 ? (
          <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={16} /> No events yet. Add your first one.
          </p>
        ) : (
          events.map((event) => <EventCard key={event._id} event={event} />)
        )}
      </div>
    </main>
  );
}
