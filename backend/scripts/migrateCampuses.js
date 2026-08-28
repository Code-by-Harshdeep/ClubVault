require("dotenv").config();

const connectDB = require("../config/db");
const Club = require("../models/Club");
const Campus = require("../models/Campus");
const User = require("../models/User");

async function migrate() {
  await connectDB();
  const clubs = await Club.find({}).populate("campus");
  let migrated = 0;

  for (const club of clubs) {
    const name = String(club.institutionName || "Independent campus").trim();
    const creator = await User.findById(club.createdBy).select(
      "universityEmail",
    );
    const officialDomain = creator?.universityEmail
      ?.split("@")[1]
      ?.toLowerCase();
    if (!officialDomain) {
      console.warn(
        `Skipping ${club.clubId}: creator has no valid email domain.`,
      );
      continue;
    }
    const existingCampus =
      club.campus?.officialDomain === officialDomain
        ? club.campus
        : await Campus.findOne({ officialDomain });
    const campus =
      existingCampus ||
      (await Campus.findOneAndUpdate(
        { name, institutionType: club.institutionType || "college" },
        {
          $set: { officialDomain },
          $setOnInsert: {
            name,
            officialDomain,
            institutionType: club.institutionType || "college",
            createdBy: club.createdBy,
            admins: [club.createdBy],
            status: "verified",
            features: club.features || {},
            notificationPrefs: club.notificationPrefs || {},
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ));

    if (club.campus?._id?.toString() !== campus._id.toString()) {
      club.campus = campus._id;
    }
    await club.save();
    migrated += 1;
  }

  console.log(`Campus migration complete: ${migrated} club(s) linked.`);
  process.exit(0);
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
