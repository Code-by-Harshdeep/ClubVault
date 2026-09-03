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

    const club = await Club.findById(clubId).populate("campus");

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const userId = (req.user?.id || req.user?._id || "").toString();

    let membership = club.members.find(
      (m) => (m.user?._id || m.user || "").toString() === userId,
    );

    // If membership is missing but user is the club creator, grant admin access
    if (!membership && club.createdBy?.toString() === userId) {
      membership = {
        user: userId,
        role: "admin",
        status: "approved",
        permissions: "Full Access",
      };
    }

    if (!membership || membership.status !== "approved") {
      return res
        .status(403)
        .json({ message: "You are not an approved member of this club" });
    }

    req.club = club;
    if (club.campus?.features) club.features = club.campus.features;
    req.membership = membership;
    next();
  } catch (error) {
    console.error("clubMember middleware error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Must run after clubMember. Restricts route to club admins.
const clubAdmin = (req, res, next) => {
  const userId = (req.user?.id || req.user?._id || "").toString();
  const isCreator = req.club?.createdBy?.toString() === userId;
  if (!isCreator && (!req.membership || req.membership.role !== "admin")) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Must run after clubMember. Blocks exclusive features that this campus has not enabled.
const requireFeature = (featureKey) => (req, res, next) => {
  const features = req.club.campus?.features || req.club.features || {};
  if (!features[featureKey]) {
    return res.status(403).json({
      message: `This campus has not enabled the ${featureKey} feature. An admin can turn it on in Settings.`,
    });
  }
  next();
};

module.exports = { clubMember, clubAdmin, requireFeature };
