import React from "react";
import {
  Plus,
  School,
  Megaphone,
  CircleCheck,
  MoreHorizontal,
} from "lucide-react";

import "./EventsPlanning.css";

const events = [
  {
    type: "Workshop",
    icon: School,
    title: "Tech Leadership Panel",
    date: "APR 02, 2024 • Student Union Hall",
    spent: "$350",
    budget: "$500",
    progress: "70%",
    person: "MR",
    name: "Mike R.",
  },
  {
    type: "Campaign",
    icon: Megaphone,
    title: "Fall Recruitment Drive",
    date: "SEP 10, 2024 • Main Quad",
    spent: "$0",
    budget: "$1,200",
    progress: "5%",
    unassigned: true,
  },
  {
    type: "Completed",
    icon: CircleCheck,
    title: "Winter Charity Bake Sale",
    date: "DEC 12, 2023 • Library Lobby",
    spent: "$180",
    budget: "$200",
    progress: "90%",
    completed: true,
  },
];

function BudgetBar({ progress }) {
  return (
    <div className="progress">
      <div
        className="progress-fill"
        style={{
          width: progress,
        }}
      />
    </div>
  );
}

function EventCard({ event }) {
  const Icon = event.icon;

  return (
    <div className={`event-card ${event.completed ? "completed" : ""}`}>
      <div className="event-type">
        <Icon size={16} />

        {event.type}
      </div>

      <h3>{event.title}</h3>

      <p className="date">{event.date}</p>

      <div className="budget">
        <div className="budget-head">
          <span>{event.completed ? "Final Spend" : "Allocated"}</span>

          <strong>
            {event.spent}

            <small>
              {" / "}
              {event.budget}
            </small>
          </strong>
        </div>

        <BudgetBar progress={event.progress} />

        <div className="person">
          {event.unassigned ? (
            <>
              <div className="empty-avatar">
                <Plus size={12} />
              </div>

              <span>Unassigned</span>
            </>
          ) : event.completed ? (
            <span>Reconciled & Closed</span>
          ) : (
            <>
              <div className="avatar">{event.person}</div>

              <span>{event.name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturedEvent() {
  return (
    <div className="featured-card">
      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuByzvtLN7G0x5tESEAf64n0fB6NkhfeECNijJ-Lvt6QrmiGIJMeXvf6o9xTz3g2ZX698q72xXboDHBnr-aF1Mm3l6DTOOfViqE24OnWMQSh269IYwwRpqwEWeJeT8eck3YeatTvlHWu64hD8JRPLWgoQoizoA879F89FfTA-UiAzF4wMyIUaT8iDvZ4HbIK4ZfPunmDtbiS75810nFtFs1ts0kOJiGly9Rlskm5ANsxJtP7Hl9y4DfuyMyctODgINCOggt0RuBp_6ZP" />

      <div className="featured-content">
        <div className="featured-title">
          <div>
            <span className="tag">Marquee Event</span>

            <h3>Spring Alumni Gala</h3>
          </div>

          <MoreHorizontal size={20} />
        </div>

        <p>
          The flagship networking event connecting current student leaders with
          distinguished university alumni. Requires final catering confirmation
          by Friday.
        </p>

        <div className="featured-budget">
          <div className="budget-head">
            <span>Budget Utilization</span>

            <strong>
              $4,250
              <small>/ $5,000</small>
            </strong>
          </div>

          <BudgetBar progress="85%" />

          <div className="person">
            <div className="avatar">SJ</div>

            <span>Sarah J. (Coordinator)</span>

            <span className="warning">Action Required</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventsPlanning() {
  return (
    <main className="events-page">
      <header>
        <div>
          <h1>Events Planning</h1>

          <p>
            Coordinate upcoming club activities and monitor dedicated
            micro-budgets.
          </p>
        </div>

        <div className="actions">
          <div className="switch">
            <button>Board</button>

            <button>Calendar</button>
          </div>

          <button className="add-btn">
            <Plus size={16} />
            Add Event
          </button>
        </div>
      </header>

      <div className="grid">
        <FeaturedEvent />

        {events.map((event) => (
          <EventCard key={event.title} event={event} />
        ))}
      </div>
    </main>
  );
}
