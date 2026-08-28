const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: "Event",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    budget: {
      type: Number,
      default: 0,
    },
    budgetRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
    },
    spent: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["upcoming", "in-progress", "completed"],
      default: "upcoming",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
