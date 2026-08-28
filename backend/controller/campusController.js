const Club = require("../models/Club");
const Campus = require("../models/Campus");

const campusAdmin = async (req, res, next) => {
  try {
    const campus = await Campus.findById(req.params.campusId);
    if (!campus) return res.status(404).json({ message: "Campus not found" });

    const isAdmin =
      campus.admins.some((admin) => admin.toString() === req.user.id) ||
      campus.createdBy.toString() === req.user.id;
    if (!isAdmin)
      return res.status(403).json({ message: "Campus admin access required" });

    req.campus = campus;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getCampusOverview = async (req, res) => {
  try {
    const clubs = await Club.find({ campus: req.campus._id })
      .select("name clubId description createdAt members status")
      .sort({ name: 1 });

    const overview = clubs.map((club) => ({
      _id: club._id,
      name: club.name,
      clubId: club.clubId,
      description: club.description,
      createdAt: club.createdAt,
      memberCount: club.members.filter((member) => member.status === "approved")
        .length,
    }));

    return res.status(200).json({
      campus: {
        _id: req.campus._id,
        name: req.campus.name,
        institutionType: req.campus.institutionType,
        status: req.campus.status,
        officialDomain: req.campus.officialDomain,
      },
      summary: {
        clubCount: overview.length,
        memberCount: overview.reduce(
          (total, club) => total + club.memberCount,
          0,
        ),
      },
      clubs: overview,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { campusAdmin, getCampusOverview };
