const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const Event = require("../models/Event");
const { roundMoney } = require("./campusDefaults");

const COUNTS_TOWARD_SPEND = [
  "Pending Bill",
  "Approved",
  "Cleared",
  "Reimbursed",
];

async function spentByBudgetIds(clubId) {
  const rows = await Transaction.aggregate([
    {
      $match: {
        club: clubId,
        type: "expense",
        budget: { $ne: null },
        status: { $in: COUNTS_TOWARD_SPEND },
      },
    },
    { $group: { _id: "$budget", total: { $sum: "$amount" } } },
  ]);

  const map = {};
  for (const row of rows) {
    map[String(row._id)] = roundMoney(row.total);
  }
  return map;
}

async function attachSpent(clubId, budgets) {
  const map = await spentByBudgetIds(clubId);
  return budgets.map((b) => {
    const obj = typeof b.toObject === "function" ? b.toObject() : { ...b };
    const spent = map[String(obj._id)] || 0;
    const allocated = roundMoney(obj.allocated || 0);
    const remaining = roundMoney(allocated - spent);
    return {
      ...obj,
      spent,
      remaining,
      utilization: allocated ? Math.min(100, (spent / allocated) * 100) : 0,
      overBudget: spent > allocated + 0.009,
    };
  });
}

async function totalAllocated(clubId, excludeBudgetId) {
  const match = { club: clubId };
  if (excludeBudgetId) match._id = { $ne: excludeBudgetId };

  const rows = await Budget.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$allocated" } } },
  ]);
  return roundMoney(rows[0]?.total || 0);
}

function assertWithinCap(club, nextAllocatedTotal) {
  const cap = roundMoney(club.annualBudgetCap || 0);
  if (cap > 0 && roundMoney(nextAllocatedTotal) > cap + 0.009) {
    const err = new Error(
      `Allocations cannot exceed the campus budget cap of ₹${cap.toLocaleString("en-IN")}.`,
    );
    err.status = 400;
    throw err;
  }
}

async function remainingOnBudget(
  clubId,
  budgetId,
  excludeTxId,
  excludeEventId,
) {
  const budget = await Budget.findOne({ _id: budgetId, club: clubId });
  if (!budget) {
    const err = new Error("Selected budget was not found for this campus.");
    err.status = 404;
    throw err;
  }

  const match = {
    club: clubId,
    type: "expense",
    budget: budget._id,
    status: { $in: COUNTS_TOWARD_SPEND },
  };
  if (excludeTxId) match._id = { $ne: excludeTxId };

  const rows = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const spent = roundMoney(rows[0]?.total || 0);

  const eventMatch = {
    club: clubId,
    budgetRef: budget._id,
    budget: { $gt: 0 },
  };
  if (excludeEventId) eventMatch._id = { $ne: excludeEventId };
  const eventRows = await Event.aggregate([
    { $match: eventMatch },
    { $group: { _id: null, total: { $sum: "$budget" } } },
  ]);
  const committed = roundMoney(eventRows[0]?.total || 0);

  return {
    budget,
    spent,
    committed,
    remaining: roundMoney((budget.allocated || 0) - spent - committed),
  };
}

async function assertExpenseFits(club, budgetId, amount, excludeTxId) {
  if (club.strictBudgets === false) return;

  if (!budgetId) {
    const err = new Error(
      "Every expense must be charged against a budget line.",
    );
    err.status = 400;
    throw err;
  }

  const { budget, remaining } = await remainingOnBudget(
    club._id,
    budgetId,
    excludeTxId,
  );
  const spend = roundMoney(amount);
  if (spend > remaining + 0.009) {
    const err = new Error(
      `This expense of ₹${spend.toLocaleString("en-IN")} exceeds remaining funds on "${budget.title}" (₹${remaining.toLocaleString("en-IN")} left).`,
    );
    err.status = 400;
    throw err;
  }
}

module.exports = {
  COUNTS_TOWARD_SPEND,
  spentByBudgetIds,
  attachSpent,
  totalAllocated,
  assertWithinCap,
  remainingOnBudget,
  assertExpenseFits,
};
