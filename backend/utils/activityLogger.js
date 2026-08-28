const Activity = require("../models/Activity");
const User = require("../models/User");

/**
 * Logs an audited activity event for a club.
 */
async function logActivity({ clubId, actorId, action, title, details = "", category = "Finance" }) {
  try {
    let actorName = "Club Member";
    if (actorId) {
      const user = await User.findById(actorId).select("fullName name email");
      if (user) {
        actorName = user.fullName || user.name || user.email || "Member";
      }
    }

    await Activity.create({
      club: clubId,
      actor: actorId,
      actorName,
      action,
      title,
      details,
      category,
    });
  } catch (err) {
    // Non-blocking logger failure
    console.error("Activity log error:", err.message);
  }
}

module.exports = { logActivity };
