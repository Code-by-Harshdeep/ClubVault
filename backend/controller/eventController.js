const Event = require("../models/Event");
const { remainingOnBudget } = require("../utils/budgetGuard");
const { roundMoney } = require("../utils/campusDefaults");

const listEvents = async (req, res) => {
  try {
    const events = await Event.find({ club: req.club._id })
      .populate("assignedTo", "fullName")
      .populate("budgetRef", "title category allocated")
      .sort({ date: 1 });
    return res.status(200).json({ events });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createEvent = async (req, res) => {
  try {
    const {
      title,
      type,
      description,
      date,
      location,
      budget,
      budgetId,
      assignedTo,
    } = req.body;

    if (!String(title || "").trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const eventBudget = roundMoney(Number(budget || 0));
    if (!Number.isFinite(eventBudget) || eventBudget < 0) {
      return res
        .status(400)
        .json({ message: "Event budget must be a valid non-negative number" });
    }
    if (
      date !== undefined &&
      date !== "" &&
      Number.isNaN(new Date(date).getTime())
    ) {
      return res.status(400).json({ message: "Invalid event date" });
    }
    let budgetRef;

    if (eventBudget > 0 && req.club.strictBudgets !== false) {
      if (!budgetId) {
        return res.status(400).json({
          message:
            "Choose a budget line for this event so spend stays inside the campus cap.",
        });
      }

      try {
        const { budget: parent, remaining } = await remainingOnBudget(
          req.club._id,
          budgetId,
        );
        if (eventBudget > remaining + 0.009) {
          return res.status(400).json({
            message: `Event budget ₹${eventBudget.toLocaleString("en-IN")} exceeds remaining funds on "${parent.title}" (₹${remaining.toLocaleString("en-IN")} left).`,
          });
        }
        budgetRef = parent._id;
      } catch (err) {
        return res.status(err.status || 400).json({ message: err.message });
      }
    }

    if (assignedTo) {
      const assignedMember = req.club.members.find(
        (member) =>
          member.user.toString() === String(assignedTo) &&
          member.status === "approved",
      );
      if (!assignedMember) {
        return res
          .status(400)
          .json({ message: "Assigned member was not found for this campus" });
      }
    }

    const event = await Event.create({
      club: req.club._id,
      title: String(title).trim(),
      type,
      description,
      date,
      location,
      budget: eventBudget,
      budgetRef,
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Event created", event });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      club: req.club._id,
    });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const allowed = [
      "title",
      "type",
      "description",
      "date",
      "location",
      "budget",
      "spent",
      "status",
      "assignedTo",
      "budgetRef",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.title !== undefined && !String(updates.title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (
      updates.date !== undefined &&
      updates.date !== "" &&
      Number.isNaN(new Date(updates.date).getTime())
    ) {
      return res.status(400).json({ message: "Invalid event date" });
    }
    if (
      updates.status !== undefined &&
      !["upcoming", "in-progress", "completed"].includes(updates.status)
    ) {
      return res.status(400).json({ message: "Invalid event status" });
    }
    if (updates.budget !== undefined) {
      updates.budget = roundMoney(Number(updates.budget));
      if (!Number.isFinite(updates.budget) || updates.budget < 0) {
        return res.status(400).json({
          message: "Event budget must be a valid non-negative number",
        });
      }
    }

    const budgetId = updates.budgetRef || req.body.budgetId || event.budgetRef;
    if (
      (updates.budget ?? event.budget ?? 0) > 0 &&
      req.club.strictBudgets !== false
    ) {
      if (!budgetId) {
        return res
          .status(400)
          .json({ message: "Choose a budget line for this event" });
      }
      try {
        const { remaining, budget } = await remainingOnBudget(
          req.club._id,
          budgetId,
          undefined,
          event._id,
        );
        if ((updates.budget ?? event.budget) > remaining + 0.009) {
          return res.status(400).json({
            message: `Updated event budget exceeds remaining funds on "${budget.title}".`,
          });
        }
        updates.budgetRef = budget._id;
      } catch (err) {
        return res.status(err.status || 400).json({ message: err.message });
      }
    } else if (updates.budget !== undefined) {
      updates.budgetRef = undefined;
    }

    if (updates.assignedTo) {
      const assignedMember = req.club.members.find(
        (member) =>
          member.user.toString() === String(updates.assignedTo) &&
          member.status === "approved",
      );
      if (!assignedMember) {
        return res
          .status(400)
          .json({ message: "Assigned member was not found for this campus" });
      }
    }

    if (updates.title !== undefined)
      updates.title = String(updates.title).trim();
    const updatedEvent = await Event.findByIdAndUpdate(event._id, updates, {
      new: true,
      runValidators: true,
    });

    return res
      .status(200)
      .json({ message: "Event updated", event: updatedEvent });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const result = await Event.deleteOne({
      _id: req.params.id,
      club: req.club._id,
    });
    if (!result.deletedCount)
      return res.status(404).json({ message: "Event not found" });
    return res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { listEvents, createEvent, updateEvent, deleteEvent };
