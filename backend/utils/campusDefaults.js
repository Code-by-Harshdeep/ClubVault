const BASIC_FEATURES = [
  { key: "dashboard", label: "Dashboard", alwaysOn: true },
  { key: "budgets", label: "Budgets", alwaysOn: true },
  { key: "transactions", label: "Transactions", alwaysOn: true },
  { key: "members", label: "Members", alwaysOn: true },
  { key: "settings", label: "Settings", alwaysOn: true },
];

const EXCLUSIVE_FEATURE_KEYS = [
  "events",
  "analytics",
  "reimbursements",
  "notifications",
  "integrations",
];

const EXCLUSIVE_FEATURES = {
  events: {
    label: "Events Planning",
    description:
      "Plan campus events with dedicated micro-budgets that stay inside the parent allocation.",
  },
  analytics: {
    label: "Reports & Analytics",
    description:
      "Charts, category breakdowns, and CSV exports for treasurers and faculty.",
  },
  reimbursements: {
    label: "Reimbursements",
    description:
      "Let students submit pending expense claims for treasurer review.",
  },
  notifications: {
    label: "Budget Threshold Alerts",
    description: "Surface 80% and over-budget warnings across the workspace.",
  },
  integrations: {
    label: "Integrations",
    description: "Placeholder hooks for Slack, banking, and accounting tools.",
  },
};

const DEFAULT_EXCLUSIVE_FEATURES = {
  events: false,
  analytics: false,
  reimbursements: false,
  notifications: false,
  integrations: false,
};

const BOILERPLATE_BUDGETS = [
  {
    title: "Events & Activities",
    category: "Events",
    description: "Fests, workshops, and student programs",
    weight: 0.25,
  },
  {
    title: "Operations & Supplies",
    category: "Operations",
    description: "Stationery, printing, and day-to-day running costs",
    weight: 0.25,
  },
  {
    title: "Marketing & Outreach",
    category: "Marketing",
    description: "Posters, social media, and recruitment",
    weight: 0.2,
  },
  {
    title: "Travel & Logistics",
    category: "Travel",
    description: "Transport, lodging, and field visits",
    weight: 0.15,
  },
  {
    title: "Contingency Reserve",
    category: "Contingency",
    description: "Emergency buffer — spending still cannot exceed this line",
    weight: 0.15,
  },
];

function roundMoney(n) {
  return Math.round(Number(n) * 100) / 100;
}

function splitAnnualCap(cap) {
  const total = Math.max(0, Number(cap) || 0);
  const lines = BOILERPLATE_BUDGETS.map((b) => ({
    title: b.title,
    category: b.category,
    description: b.description,
    allocated: roundMoney(total * b.weight),
    isBoilerplate: true,
  }));

  const used = roundMoney(lines.reduce((s, l) => s + l.allocated, 0));
  const drift = roundMoney(total - used);
  if (lines.length) {
    lines[lines.length - 1].allocated = roundMoney(
      lines[lines.length - 1].allocated + drift,
    );
  }
  return lines;
}

function normalizeFeatures(raw) {
  const next = { ...DEFAULT_EXCLUSIVE_FEATURES };
  if (raw && typeof raw === "object") {
    for (const key of EXCLUSIVE_FEATURE_KEYS) {
      if (typeof raw[key] === "boolean") next[key] = raw[key];
    }
  }
  return next;
}

function serializeClub(club) {
  const campus =
    club.campus && typeof club.campus === "object" ? club.campus : null;
  return {
    _id: club._id,
    name: club.name,
    clubId: club.clubId,
    description: club.description,
    campusId: campus?._id || club.campus || null,
    campusStatus: campus?.status || "pending",
    institutionType:
      campus?.institutionType || club.institutionType || "college",
    institutionName: campus?.name || club.institutionName || "",
    annualBudgetCap: club.annualBudgetCap || 0,
    strictBudgets: club.strictBudgets !== false,
    features: normalizeFeatures(campus?.features || club.features),
    notificationPrefs: campus?.notificationPrefs ||
      club.notificationPrefs || {
        expenseApprovals: true,
        budgetThreshold: true,
        weeklySummary: false,
      },
  };
}

module.exports = {
  BASIC_FEATURES,
  EXCLUSIVE_FEATURE_KEYS,
  EXCLUSIVE_FEATURES,
  DEFAULT_EXCLUSIVE_FEATURES,
  BOILERPLATE_BUDGETS,
  splitAnnualCap,
  normalizeFeatures,
  serializeClub,
  roundMoney,
};
