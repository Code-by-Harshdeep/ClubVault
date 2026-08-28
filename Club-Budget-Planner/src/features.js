export const BASIC_FEATURES = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
  { key: "budgets", label: "Budgets", href: "/budgets" },
  { key: "transactions", label: "Transactions", href: "/transactions" },
  { key: "members", label: "Members", href: "/members" },
];

export const EXCLUSIVE_FEATURES = [
  {
    key: "events",
    label: "Events Planning",
    href: "/events",
    description:
      "Plan fests and workshops with micro-budgets that stay inside a parent allocation.",
  },
  {
    key: "analytics",
    label: "Reports & Analytics",
    href: "/analytics",
    description: "Charts, category breakdowns, and CSV exports for treasurers.",
  },
  {
    key: "reimbursements",
    label: "Reimbursements",
    href: "/reimbursements",
    description:
      "Let students submit pending expense claims for treasurer review.",
  },
  {
    key: "notifications",
    label: "Budget Threshold Alerts",
    href: null,
    description: "Warn the campus when a line hits 80% or goes over budget.",
  },
  {
    key: "integrations",
    label: "Integrations",
    href: null,
    description:
      "Connect Slack, banking, and accounting tools when you need them.",
  },
];

export function hasFeature(club, key) {
  return Boolean(club?.features?.[key]);
}
