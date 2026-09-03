const Club = require("../models/Club");
const Budget = require("../models/Budget");
const Campus = require("../models/Campus");
const User = require("../models/User");
const {
  splitAnnualCap,
  normalizeFeatures,
  serializeClub,
  EXCLUSIVE_FEATURE_KEYS,
} = require("../utils/campusDefaults");

const createClub = async (req, res) => {
  try {
    const {
      name,
      description,
      institutionType,
      institutionName,
      annualBudgetCap,
      features,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Club name is required" });
    }

    const cap = Number(annualBudgetCap);
    if (!Number.isFinite(cap) || cap <= 0) {
      return res.status(400).json({
        message:
          "A positive annual budget cap is required. Every campus must stay within it.",
      });
    }

    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const type = institutionType === "school" ? "school" : "college";
    const enabledFeatures = normalizeFeatures(features);
    
    // Find creator user
    let creator = await User.findById(userId).select(
      "universityEmail emailVerified fullName",
    );
    
    let officialDomain = "campus.edu";
    if (creator && creator.universityEmail && creator.universityEmail.includes("@")) {
      officialDomain = creator.universityEmail.split("@")[1].toLowerCase();
    }

    const campusName =
      String(institutionName || "").trim() || String(name).trim();

    // Safely find or create a campus
    let campus = null;
    try {
      campus = await Campus.findOne({
        $or: [
          { officialDomain },
          { name: campusName },
        ],
      });

      if (!campus) {
        campus = await Campus.create({
          name: campusName,
          officialDomain,
          institutionType: type,
          createdBy: userId,
          admins: [userId],
          features: enabledFeatures,
        });
      }
    } catch (campusErr) {
      console.warn("Campus lookup/creation note:", campusErr.message);
      try {
        campus = (await Campus.findOne({ name: campusName })) ||
                 (await Campus.findOne({ officialDomain })) ||
                 (await Campus.findOne());
      } catch (err) {}
    }

    // Generate unique club ID
    let clubId;
    try {
      clubId = await Club.generateUniqueClubId();
    } catch (codeErr) {
      clubId = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const club = await Club.create({
      name: String(name).trim(),
      description: String(description || "").trim(),
      institutionType: type,
      institutionName: campusName,
      campus: campus?._id,
      annualBudgetCap: cap,
      strictBudgets: true,
      features: enabledFeatures,
      clubId,
      createdBy: userId,
      members: [
        {
          user: userId,
          role: "admin",
          status: "approved",
          permissions: "Full Access",
          joinedAt: new Date(),
        },
      ],
    });

    return res.status(201).json({
      message: "Club workspace created successfully",
      club: serializeClub(club),
    });
  } catch (error) {
    console.error("createClub critical error:", error);
    return res.status(500).json({
      message: error.message || "Failed to create club workspace",
      error: error.message,
    });
  }
};

const joinClub = async (req, res) => {
  try {
    const { clubId } = req.body;

    if (!clubId) {
      return res.status(400).json({ message: "Club ID is required" });
    }

    const club = await Club.findOne({ clubId: clubId.trim().toUpperCase() });

    if (!club) {
      return res
        .status(404)
        .json({ message: "No club found with that Club ID" });
    }

    const existingMembership = club.members.find(
      (m) => m.user.toString() === req.user.id,
    );

    if (existingMembership) {
      if (existingMembership.status === "approved") {
        return res
          .status(409)
          .json({ message: "You are already a member of this club" });
      }
      if (existingMembership.status === "pending") {
        return res
          .status(409)
          .json({ message: "Your request to join is already pending" });
      }
      existingMembership.status = "pending";
    } else {
      club.members.push({
        user: req.user.id,
        role: "member",
        status: "pending",
        permissions: "View Only",
      });
    }

    await club.save();

    return res.status(200).json({
      message: `Request sent to join ${club.name}. Waiting for admin approval.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const myClub = async (req, res) => {
  try {
    const userId = (req.user?.id || req.user?._id || "").toString();

    const club = await Club.findOne({
      members: {
        $elemMatch: {
          user: userId,
          status: { $in: ["approved", "pending", "rejected"] },
        },
      },
    })
      .populate("campus")
      .sort({ updatedAt: -1 });

    if (!club) {
      return res.status(200).json({ status: "none" });
    }

    const membership = club.members.find(
      (m) => (m.user?._id || m.user || "").toString() === userId,
    ) || { status: "approved", role: "admin" };

    return res.status(200).json({
      status: membership.status,
      role: membership.role,
      club: serializeClub(club),
    });
  } catch (error) {
    console.error("myClub error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

const listRequests = async (req, res) => {
  try {
    const club = await req.club.populate(
      "members.user",
      "fullName universityEmail",
    );

    const requests = club.members
      .filter((m) => m.status === "pending")
      .map((m) => ({
        userId: m.user._id,
        fullName: m.user.fullName,
        email: m.user.universityEmail,
        role: m.role,
      }));

    return res.status(200).json({ requests });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const approveRequest = async (req, res) => {
  try {
    const club = req.club;
    const member = club.members.find(
      (m) => m.user.toString() === req.params.userId,
    );

    if (!member) {
      return res.status(404).json({ message: "Request not found" });
    }

    member.status = "approved";
    member.joinedAt = new Date();
    await club.save();

    return res.status(200).json({ message: "Member approved" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const club = req.club;
    const member = club.members.find(
      (m) => m.user.toString() === req.params.userId,
    );

    if (!member) {
      return res.status(404).json({ message: "Request not found" });
    }

    member.status = "rejected";
    await club.save();

    return res.status(200).json({ message: "Request rejected" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const listMembers = async (req, res) => {
  try {
    const club = await req.club.populate(
      "members.user",
      "fullName universityEmail",
    );

    const members = club.members
      .filter((m) => m.status === "approved")
      .map((m) => ({
        userId: m.user._id,
        fullName: m.user.fullName,
        email: m.user.universityEmail,
        role: m.role,
        permissions: m.permissions,
        joinedAt: m.joinedAt,
      }));

    return res.status(200).json({
      clubId: club.clubId,
      name: club.name,
      members,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const removeMember = async (req, res) => {
  try {
    const club = req.club;

    if (req.params.userId === req.user.id) {
      return res
        .status(400)
        .json({ message: "Admins can't remove themselves" });
    }

    const member = club.members.find(
      (m) => m.user.toString() === req.params.userId && m.status === "approved",
    );
    if (!member)
      return res.status(404).json({ message: "Approved member not found" });
    if (
      member.role === "admin" &&
      club.members.filter((m) => m.status === "approved" && m.role === "admin")
        .length === 1
    ) {
      return res
        .status(400)
        .json({ message: "The club must keep at least one admin" });
    }

    club.members = club.members.filter(
      (m) => m.user.toString() !== req.params.userId,
    );
    await club.save();

    return res.status(200).json({ message: "Member removed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateClub = async (req, res) => {
  try {
    const {
      name,
      description,
      institutionType,
      institutionName,
      annualBudgetCap,
      features,
      notificationPrefs,
    } = req.body;
    const club = req.club;
    const campus = club.campus;

    if (name !== undefined) club.name = name;
    if (description !== undefined) club.description = description;
    if (institutionName !== undefined) {
      club.institutionName = institutionName;
      if (campus?.save) campus.name = String(institutionName).trim();
    }
    if (institutionType === "college" || institutionType === "school") {
      club.institutionType = institutionType;
      if (campus?.save) campus.institutionType = institutionType;
    }

    if (annualBudgetCap !== undefined) {
      const cap = Number(annualBudgetCap);
      if (!Number.isFinite(cap) || cap <= 0) {
        return res
          .status(400)
          .json({ message: "Annual budget cap must be a positive number" });
      }

      const Budget = require("../models/Budget");
      const {
        totalAllocated,
        assertWithinCap,
      } = require("../utils/budgetGuard");
      const allocated = await totalAllocated(club._id);
      try {
        assertWithinCap({ annualBudgetCap: cap }, allocated);
      } catch (err) {
        return res.status(err.status || 400).json({ message: err.message });
      }
      club.annualBudgetCap = cap;
    }

    if (features && typeof features === "object") {
      const next = normalizeFeatures(club.features);
      for (const key of EXCLUSIVE_FEATURE_KEYS) {
        if (typeof features[key] === "boolean") next[key] = features[key];
      }
      club.features = next;
      if (campus?.save) campus.features = next;
    }

    if (notificationPrefs && typeof notificationPrefs === "object") {
      const nextPrefs = {
        expenseApprovals:
          notificationPrefs.expenseApprovals ??
          club.notificationPrefs?.expenseApprovals ??
          true,
        budgetThreshold:
          notificationPrefs.budgetThreshold ??
          club.notificationPrefs?.budgetThreshold ??
          true,
        weeklySummary:
          notificationPrefs.weeklySummary ??
          club.notificationPrefs?.weeklySummary ??
          false,
      };
      club.notificationPrefs = nextPrefs;
      if (campus?.save) campus.notificationPrefs = nextPrefs;
    }

    await club.save();
    if (campus?.save) await campus.save();

    return res.status(200).json({
      message: "Club updated",
      club: serializeClub(club),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const club = req.club;
    const member = club.members.find(
      (m) => m.user.toString() === req.params.userId && m.status === "approved",
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (
      member.role === "admin" &&
      role === "member" &&
      club.members.filter((m) => m.status === "approved" && m.role === "admin")
        .length === 1
    ) {
      return res
        .status(400)
        .json({ message: "The club must keep at least one admin" });
    }

    member.role = role;
    member.permissions = role === "admin" ? "Full Access" : "View Only";
    await club.save();

    return res.status(200).json({ message: "Role updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const listMyClubs = async (req, res) => {
  try {
    const userId = (req.user?.id || req.user?._id || "").toString();

    const clubs = await Club.find({
      members: {
        $elemMatch: {
          user: userId,
          status: { $in: ["approved", "pending", "rejected"] },
        },
      },
    })
      .populate("campus")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      clubs: clubs.map((club) => {
        const membership = club.members.find(
          (member) => (member.user?._id || member.user || "").toString() === userId,
        ) || { status: "approved", role: "member" };

        return {
          ...serializeClub(club),
          status: membership.status,
          role: membership.role,
          campusAdmin: Boolean(
            club.campus &&
            (club.campus.createdBy?.toString() === userId ||
              club.campus.admins?.some(
                (admin) => admin.toString() === userId,
              )),
          ),
        };
      }),
    });
  } catch (error) {
    console.error("listMyClubs error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

const listActivities = async (req, res) => {
  try {
    const Activity = require("../models/Activity");
    const activities = await Activity.find({ club: req.club._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json({ activities });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createClub,
  joinClub,
  myClub,
  listRequests,
  approveRequest,
  rejectRequest,
  listMembers,
  removeMember,
  updateMemberRole,
  updateClub,
  listMyClubs,
  listActivities,
};

