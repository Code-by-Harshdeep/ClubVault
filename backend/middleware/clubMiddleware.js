const mongoose = require("mongoose");
const Club = require("../models/Club");

// Verifies req.user is an APPROVED member of the club in the :clubId route param.
// Attaches req.club (the club document) and req.membership (their member subdoc).
const clubMember = async (req, res, next) => {
  try {
    const { clubId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return res.status(400).json({ message: "Invalid club id" });
    }

    const club = await Club.findById(clubId);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const membership = club.members.find(
      (m) => m.user.toString() === req.user.id
    );

    if (!membership || membership.status !== "approved") {
      return res
        .status(403)
        .json({ message: "You are not an approved member of this club" });
    }

    req.club = club;
    req.membership = membership;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Must run after clubMember. Restricts route to club admins.
const clubAdmin = (req, res, next) => {
  if (!req.membership || req.membership.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { clubMember, clubAdmin };
