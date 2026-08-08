const Event = require("../models/Event");

const listEvents = async (req, res) => {
  try {
    const events = await Event.find({ club: req.club._id })
      .populate("assignedTo", "fullName")
      .sort({ date: 1 });
    return res.status(200).json({ events });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, type, description, date, location, budget } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const event = await Event.create({
      club: req.club._id,
      title,
      type,
      description,
      date,
      location,
      budget: Number(budget) || 0,
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
    const allowed = ["title", "type", "description", "date", "location", "budget", "spent", "status", "assignedTo"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, club: req.club._id },
      updates,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({ message: "Event updated", event });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    await Event.deleteOne({ _id: req.params.id, club: req.club._id });
    return res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { listEvents, createEvent, updateEvent, deleteEvent };
