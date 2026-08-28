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
  { _id: false, timestamps: true },
);

const featuresSchema = new mongoose.Schema(
  {
    events: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
    reimbursements: { type: Boolean, default: false },
    notifications: { type: Boolean, default: false },
    integrations: { type: Boolean, default: false },
  },
  { _id: false },
);

const notificationPrefsSchema = new mongoose.Schema(
  {
    expenseApprovals: { type: Boolean, default: true },
    budgetThreshold: { type: Boolean, default: true },
    weeklySummary: { type: Boolean, default: false },
  },
  { _id: false },
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
    institutionType: {
      type: String,
      enum: ["college", "school"],
      default: "college",
    },
    institutionName: {
      type: String,
      trim: true,
      default: "",
    },
    annualBudgetCap: {
      type: Number,
      default: 0,
      min: 0,
    },
    strictBudgets: {
      type: Boolean,
      default: true,
    },
    features: {
      type: featuresSchema,
      default: () => ({}),
    },
    notificationPrefs: {
      type: notificationPrefsSchema,
      default: () => ({}),
    },
    clubId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [memberSchema],
  },
  { timestamps: true },
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
