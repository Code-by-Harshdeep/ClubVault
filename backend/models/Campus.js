const mongoose = require("mongoose");

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

const campusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    officialDomain: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
    },
    institutionType: {
      type: String,
      enum: ["college", "school"],
      default: "college",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    features: { type: featuresSchema, default: () => ({}) },
    notificationPrefs: { type: notificationPrefsSchema, default: () => ({}) },
  },
  { timestamps: true },
);

campusSchema.index({ name: 1, institutionType: 1 }, { unique: true });

module.exports = mongoose.model("Campus", campusSchema);
