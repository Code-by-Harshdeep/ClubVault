const mongoose = require("mongoose");

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    permissions: {
      type: String,
      default: "View Only",
    },
    joinedAt: {
      type: Date,
    },
  },
  { _id: false, timestamps: true }
);

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    clubId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [memberSchema],
  },
  { timestamps: true }
);

// Generates a short unique club join code (retries on collision)
clubSchema.statics.generateUniqueClubId = async function () {
  let code;
  let exists = true;
  while (exists) {
    code = randomCode();
    exists = await this.exists({ clubId: code });
  }
  return code;
};

module.exports = mongoose.model("Club", clubSchema);
