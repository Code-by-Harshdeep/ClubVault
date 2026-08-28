const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    actorName: {
      type: String,
      default: "System",
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      enum: ["Finance", "Budget", "Membership", "Events", "Settings"],
      default: "Finance",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
