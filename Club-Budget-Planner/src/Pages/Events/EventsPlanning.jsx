import React, { useEffect, useState } from "react";
import {
  Plus,
  School,
  Megaphone,
  CircleCheck,
  Calendar,
  Building2,
  X,
  Trash2,
  ReceiptText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";
import { useClub } from "../../ClubContext";
import { api } from "../../api";
import "./EventsPlanning.css";

function iconFor(type) {
  if (type === "Completed") return CircleCheck;
  if (type === "Campaign") return Megaphone;
  return School;
}

function formatDateLine(event) {
  const d = event.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "Date TBD";
  return event.location ? `${d} • ${event.location}` : d;
}

function formatMoney(n) {
  const num = Number(n) || 0;
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function BudgetBar({ progress, isOver }) {
  return (
    <div className={`ev-progress ${isOver ? "over" : ""}`}>
      <div
        className={`ev-progress-fill ${isOver ? "over" : progress >= 80 ? "warn" : ""}`}
        style={{ width: `${Math.min(100, progress)}%` }}
      />
    </div>
  );
}

// Modal to log an expense directly to this event
function AddEventExpenseModal({ event, budgets, onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(event.items?.[0]?.name || "Decoration");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [budgetId, setBudgetId] = useState(event.budgetRef?._id || budgets[0]?._id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount) {
      setError("Please fill in title and amount.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post(`/api/clubs/${event.club}/transactions`, {
        title,
        amount: Number(amount),
        type: "expense",
        date: date ? new Date(date) : new Date(),
        budgetId: budgetId || undefined,
        eventId: event._id,
        category: category || "Event Expense",
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to log expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ev-modal-overlay" onClick={onClose}>
      <div className="ev-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="ev-modal-header">
          <div>
            <h3>Add Expense to Event</h3>
            <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", margin: "2px 0 0" }}>
              Charging to <strong>{event.title}</strong>
            </p>
          </div>
          <button type="button" className="ev-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ev-modal-form">
          <label>Event Category</label>
          {event.items && event.items.length > 0 ? (
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {event.items.map((it, idx) => (
                <option key={idx} value={it.name}>
                  {it.name} (Planned: ₹{Number(it.planned || 0).toLocaleString("en-IN")})
                </option>
              ))}
              <option value="General">Other / General</option>
            </select>
          ) : (
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Decoration, Sound & Stage, Food"
              required
            />
          )}

          <label>Expense Description</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Stage Flowers, DJ Advance"
            required
          />

          <label>Amount (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />

          <label>Transaction Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          <label>Parent Budget Line</label>
          <select value={budgetId} onChange={(e) => setBudgetId(e.target.value)}>
            {budgets.map((b) => (
              <option key={b._id} value={b._id}>
                {b.title} — ₹{Number(b.remaining ?? b.allocated - (b.spent || 0)).toLocaleString("en-IN")} left
              </option>
            ))}
          </select>

          {error && <p className="ev-modal-error">{error}</p>}

          <div className="ev-modal-actions">
            <button type="button" className="ev-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ev-primary-btn" disabled={loading}>
              {loading ? "Saving…" : "Save Event Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal to manage Planning vs Actual line items (e.g. Decoration: Planned 50k vs Actual 51k)
function PlanItemsModal({ event, onClose, onUpdated }) {
  const [items, setItems] = useState(event.items || []);
  const [newName, setNewName] = useState("");
  const [newPlanned, setNewPlanned] = useState("");
  const [newActual, setNewActual] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newName) return;
    setItems([
      ...items,
      {
        name: newName,
        planned: Number(newPlanned) || 0,
        actual: Number(newActual) || 0,
      },
    ]);
    setNewName("");
    setNewPlanned("");
    setNewActual("");
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const totalPlanned = items.reduce((s, it) => s + (Number(it.planned) || 0), 0);
      await api.patch(`/api/clubs/${event.club}/events/${event._id}`, {
        items,
        budget: totalPlanned > 0 ? totalPlanned : event.budget,
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update planned items");
    } finally {
      setLoading(false);
    }
  };

  const totalPlanned = items.reduce((s, it) => s + (Number(it.planned) || 0), 0);
  const totalActual = items.reduce((s, it) => s + (Number(it.actual) || 0), 0);
  const totalVariance = totalPlanned - totalActual;

  return (
    <div className="ev-modal-overlay" onClick={onClose}>
      <div className="ev-modal-box" style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
        <div className="ev-modal-header">
          <div>
            <h3>Plan vs Actual Breakdown</h3>
            <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", margin: "2px 0 0" }}>
              Budget categories for <strong>{event.title}</strong>
            </p>
          </div>
          <button type="button" className="ev-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Existing Items Table */}
        <div className="ev-plan-table-wrap">
          <table className="ev-plan-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Planned (₹)</th>
                <th>Actual (₹)</th>
                <th>Variance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "16px", color: "var(--color-on-surface-variant)" }}>
                    No planned categories added yet. Add items below (e.g. Decoration, Sound, Food).
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => {
                  const variance = (Number(it.planned) || 0) - (Number(it.actual) || 0);
                  const isOver = variance < 0;
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{it.name}</td>
                      <td>{formatMoney(it.planned)}</td>
                      <td>{formatMoney(it.actual)}</td>
                      <td style={{ color: isOver ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                        {isOver ? `Over by ${formatMoney(Math.abs(variance))}` : `Saved ${formatMoney(variance)}`}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="ev-item-del-btn"
                          onClick={() => handleRemoveItem(idx)}
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {items.length > 0 && (
              <tfoot>
                <tr>
                  <th>Total</th>
                  <th>{formatMoney(totalPlanned)}</th>
                  <th>{formatMoney(totalActual)}</th>
                  <th style={{ color: totalVariance < 0 ? "#dc2626" : "#16a34a" }}>
                    {totalVariance < 0 ? `Over by ${formatMoney(Math.abs(totalVariance))}` : `Saved ${formatMoney(totalVariance)}`}
                  </th>
                  <th></th>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Add Row Form */}
        <form onSubmit={handleAddItem} className="ev-plan-add-row">
          <input
            placeholder="e.g. Decoration, DJ, Refreshments"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 2 }}
            required
          />
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Planned (₹)"
            value={newPlanned}
            onChange={(e) => setNewPlanned(e.target.value)}
            style={{ flex: 1.2 }}
            required
          />
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Actual (₹)"
            value={newActual}
            onChange={(e) => setNewActual(e.target.value)}
            style={{ flex: 1.2 }}
          />
          <button type="submit" className="ev-add-item-btn">
            <Plus size={14} /> Add
          </button>
        </form>

        {error && <p className="ev-modal-error">{error}</p>}

        <div className="ev-modal-actions" style={{ marginTop: "20px" }}>
          <button type="button" className="ev-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ev-primary-btn" onClick={handleSave} disabled={loading}>
            {loading ? "Saving…" : "Save Planning"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, budgets, onRefresh }) {
  const Icon = iconFor(event.type);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const budget = Number(event.budget) || 0;
  const spent = Number(event.spent) || 0;
  const pct = budget ? Math.min(100, (spent / budget) * 100) : 0;
  const isOver = spent > budget && budget > 0;
  const variance = budget - spent;
  const completed = event.status === "completed";

  const items = event.items || [];
  const hasDetails = items.length > 0;

  return (
    <>
      {showExpenseModal && (
        <AddEventExpenseModal
          event={event}
          budgets={budgets}
          onClose={() => setShowExpenseModal(false)}
          onSaved={onRefresh}
        />
      )}

      {showPlanModal && (
        <PlanItemsModal
          event={event}
          onClose={() => setShowPlanModal(false)}
          onUpdated={onRefresh}
        />
      )}

      <div className={`ev-event-card ${completed ? "completed" : ""} ${isOver ? "is-over" : ""}`}>
        <div className="ev-event-top-bar">
          <div className="ev-event-type">
            <Icon size={14} />
            {event.type || "Event"}
          </div>
          {isOver && (
            <span className="ev-over-tag">
              <AlertTriangle size={11} /> Over by {formatMoney(Math.abs(variance))}
            </span>
          )}
        </div>

        <h3>{event.title}</h3>
        <p className="ev-date">{formatDateLine(event)}</p>

        {/* Financial Header */}
        <div className="ev-budget">
          <div className="ev-budget-head">
            <span>{completed ? "Final Spend" : "Actual Spend"}</span>
            <strong>
              {formatMoney(spent)}
              <small> / Planned {formatMoney(budget)}</small>
            </strong>
          </div>

          <BudgetBar progress={pct} isOver={isOver} />

          <div className="ev-card-stats-row">
            <span className={`ev-stat-tag ${isOver ? "over" : "ok"}`}>
              {isOver
                ? `Deficit: ${formatMoney(Math.abs(variance))}`
                : `Remaining: ${formatMoney(variance)}`}
            </span>
            <span className="ev-stat-util">
              {budget > 0 ? `${((spent / budget) * 100).toFixed(0)}% Used` : "No Cap"}
            </span>
          </div>

          {/* Planning vs Actual Breakdown - Always Visible */}
          <div className="ev-breakdown-box">
            <div className="ev-breakdown-header-bar">
              <strong>Planned vs Actual Breakdown</strong>
              <span style={{ fontSize: "11px", color: "var(--color-on-surface-variant)" }}>
                {items.length} categories
              </span>
            </div>

            <div className="ev-breakdown-list">
              {items.length === 0 ? (
                <div style={{ padding: "8px", fontSize: "11.5px", color: "var(--color-on-surface-variant)", textAlign: "center" }}>
                  No planned categories yet. Click "Plan Categories" below.
                </div>
              ) : (
                items.map((it, idx) => {
                  const itemVar = (Number(it.planned) || 0) - (Number(it.actual) || 0);
                  const itemOver = itemVar < 0;
                  return (
                    <div className="ev-breakdown-item" key={idx}>
                      <div className="ev-bitem-name">{it.name}</div>
                      <div className="ev-bitem-figures">
                        <span style={{ color: "var(--color-on-surface-variant)" }}>Plan: {formatMoney(it.planned)}</span>
                        <span style={{ fontWeight: 700, color: itemOver ? "#dc2626" : "inherit" }}>
                          Act: {formatMoney(it.actual)}
                        </span>
                        <span className={`ev-bitem-badge ${itemOver ? "over" : "ok"}`}>
                          {itemOver ? `Over by ${formatMoney(Math.abs(itemVar))}` : `Saved ${formatMoney(itemVar)}`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Buttons: Add Expense & Plan Categories */}
          <div className="ev-card-actions">
            <button
              type="button"
              className="ev-btn-add-expense"
              onClick={() => setShowExpenseModal(true)}
            >
              <ReceiptText size={13} /> Add Expense
            </button>
            <button
              type="button"
              className="ev-btn-plan"
              onClick={() => setShowPlanModal(true)}
              title="Edit planned vs actual breakdown"
            >
              <SlidersHorizontal size={13} /> {items.length > 0 ? "Edit Plan" : "Plan Categories"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function NewEventModal({ onClose, onSubmit, budgets = [] }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Workshop");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetId, setBudgetId] = useState("");
  const [description, setDescription] = useState("");

  // Initial plan line items
  const [items, setItems] = useState([
    { name: "Decoration", planned: "", actual: "" },
    { name: "Sound & Stage", planned: "", actual: "" },
    { name: "Refreshments", planned: "", actual: "" },
  ]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);

    // Auto-update total planned budget if items are filled
    const total = updated.reduce((s, it) => s + (Number(it.planned) || 0), 0);
    if (total > 0) setBudget(String(total));
  };

  const handleAddItem = () => {
    setItems([...items, { name: "", planned: "", actual: "" }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title) {
      setError("Event title is required.");
      return;
    }
    const cleanItems = items
      .filter((it) => it.name.trim() !== "")
      .map((it) => ({
        name: it.name.trim(),
        planned: Number(it.planned) || 0,
        actual: Number(it.actual) || 0,
      }));

    const totalPlanned = cleanItems.reduce((s, it) => s + it.planned, 0);
    const finalBudget = Number(budget) || totalPlanned || 0;

    if (finalBudget > 0 && !budgetId) {
      setError("Choose a parent budget line to reserve funds for this event.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title,
        type,
        date,
        location,
        budget: finalBudget,
        budgetId,
        description,
        items: cleanItems,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ev-modal-overlay" onClick={onClose}>
      <div className="ev-modal-box" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
        <div className="ev-modal-header">
          <h3>Create New Event with Budget Plan</h3>
          <button type="button" className="ev-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="ev-modal-form">
          <label>Event Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Koshish Fest, Tech Hackathon"
            required
          />

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option>Workshop</option>
                <option>Campaign</option>
                <option>Social</option>
                <option>Fundraiser</option>
                <option>Festival</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Event Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <label>Location / Venue</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Main Campus Auditorium"
          />

          {/* Planned Items Builder */}
          <div style={{ margin: "14px 0 6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ margin: 0, fontWeight: 700 }}>Planned Expense Categories</label>
              <button
                type="button"
                onClick={handleAddItem}
                style={{
                  fontSize: "12px",
                  background: "transparent",
                  border: "none",
                  color: "var(--color-primary, #2563eb)",
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Plus size={12} /> Add Category
              </button>
            </div>

            {items.map((it, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input
                  placeholder="Category (e.g. Decoration)"
                  value={it.name}
                  onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Planned (₹)"
                  value={it.planned}
                  onChange={(e) => handleItemChange(idx, "planned", e.target.value)}
                  style={{ flex: 1.5 }}
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#dc2626",
                      cursor: "pointer",
                      padding: "0 6px",
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <label>Total Event Budget (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="0.00"
          />

          {Number(budget) > 0 && (
            <>
              <label>Reserve from Parent Budget Line</label>
              <select value={budgetId} onChange={(e) => setBudgetId(e.target.value)}>
                <option value="">Select a budget line</option>
                {budgets.map((line) => {
                  const id = line._id || line.id;
                  const remainingVal = Number(
                    line.remaining ?? line.allocated - (line.spent || 0)
                  );
                  return (
                    <option key={id} value={id}>
                      {line.title} — ₹{remainingVal.toLocaleString("en-IN")} left
                    </option>
                  );
                })}
              </select>
            </>
          )}

          <label>Description / Notes</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional event details"
          />

          {error && <p className="ev-modal-error">{error}</p>}

          <div className="ev-modal-actions">
            <button type="button" className="ev-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ev-primary-btn" disabled={loading}>
              {loading ? "Creating…" : "Create Event & Budget"}
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
      {showModal && (
        <NewEventModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
          budgets={budgets}
        />
      )}

      <header className="cv-events-header">
        <div>
          <div className="cv-dash-club-badge">
            <Building2 size={13} /> {club?.name || "Event Planning"}
          </div>
          <h1 className="cv-events-title">Events Planning &amp; Budgeting</h1>
          <p className="cv-events-subtitle">
            Plan festival category expenses in advance and track Planned vs. Actual spending in real time.
          </p>
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
          events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              budgets={budgets}
              onRefresh={load}
            />
          ))
        )}
      </div>
    </main>
  );
}
