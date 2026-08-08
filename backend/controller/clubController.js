const Club = require("../models/Club");

// POST /api/clubs  — create a new club, creator becomes an approved admin
const createClub = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Club name is required" });
    }

    const alreadyInClub = await Club.findOne({
      members: { $elemMatch: { user: req.user.id, status: "approved" } },
    });

    if (alreadyInClub) {
      return res.status(409).json({
        message: "You already belong to a club. Leave it before creating a new one.",
      });
    }

    const clubId = await Club.generateUniqueClubId();

    const club = await Club.create({
      name,
      description,
      clubId,
      createdBy: req.user.id,
      members: [
        {
          user: req.user.id,
          role: "admin",
          status: "approved",
          permissions: "Full Access",
          joinedAt: new Date(),
        },
      ],
    });

    return res.status(201).json({
      message: "Club created successfully",
      club: {
        _id: club._id,
        name: club.name,
        clubId: club.clubId,
        description: club.description,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/clubs/join  { clubId }  — request to join, goes into "pending"
const joinClub = async (req, res) => {
  try {
    const { clubId } = req.body;

    if (!clubId) {
      return res.status(400).json({ message: "Club ID is required" });
    }

    const club = await Club.findOne({ clubId: clubId.trim().toUpperCase() });

    if (!club) {
      return res.status(404).json({ message: "No club found with that Club ID" });
    }

    const existingMembership = club.members.find(
      (m) => m.user.toString() === req.user.id
    );

    if (existingMembership) {
      if (existingMembership.status === "approved") {
        return res.status(409).json({ message: "You are already a member of this club" });
      }
      if (existingMembership.status === "pending") {
        return res.status(409).json({ message: "Your request to join is already pending" });
      }
      // was rejected before — allow re-request
      existingMembership.status = "pending";
    } else {
      const alreadyInClub = await Club.findOne({
        members: { $elemMatch: { user: req.user.id, status: "approved" } },
      });

      if (alreadyInClub) {
        return res.status(409).json({ message: "You already belong to a club" });
      }

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

// GET /api/clubs/me — current user's club membership status
const myClub = async (req, res) => {
  try {
    const club = await Club.findOne({ "members.user": req.user.id });

    if (!club) {
      return res.status(200).json({ status: "none" });
    }

    const membership = club.members.find(
      (m) => m.user.toString() === req.user.id
    );

    return res.status(200).json({
      status: membership.status,
      role: membership.role,
      club: {
        _id: club._id,
        name: club.name,
        clubId: club.clubId,
        description: club.description,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/clubs/:clubId/requests — admin only, pending join requests
const listRequests = async (req, res) => {
  try {
    const club = await req.club.populate("members.user", "fullName universityEmail");

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
      (m) => m.user.toString() === req.params.userId
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
      (m) => m.user.toString() === req.params.userId
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

// GET /api/clubs/:clubId/members — approved members list
const listMembers = async (req, res) => {
  try {
    const club = await req.club.populate("members.user", "fullName universityEmail");

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
      return res.status(400).json({ message: "Admins can't remove themselves" });
    }

    club.members = club.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await club.save();

    return res.status(200).json({ message: "Member removed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/clubs/:clubId — admin only, update name/description
const updateClub = async (req, res) => {
  try {
    const { name, description } = req.body;
    const club = req.club;

    if (name !== undefined) club.name = name;
    if (description !== undefined) club.description = description;

    await club.save();

    return res.status(200).json({
      message: "Club updated",
      club: {
        _id: club._id,
        name: club.name,
        clubId: club.clubId,
        description: club.description,
      },
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
      (m) => m.user.toString() === req.params.userId
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
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
};
