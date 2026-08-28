const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const { attachSpent } = require("../utils/budgetGuard");
const { roundMoney, serializeClub } = require("../utils/campusDefaults");

const getDashboard = async (req, res) => {
  try {
    const clubId = req.club._id;

    const transactions = await Transaction.find({ club: clubId })
      .populate("budget", "title category")
      .sort({ date: -1 });
    const budgets = await Budget.find({ club: clubId });
    const withSpent = await attachSpent(clubId, budgets);

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const settledExpenses = transactions
      .filter((t) => t.type === "expense" && t.status !== "Pending Bill")
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingExpenses = transactions
      .filter((t) => t.type === "expense" && t.status === "Pending Bill")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = settledExpenses + pendingExpenses;

    const pendingReimbursements = transactions.filter(
      (t) => t.status === "Pending Bill"
    ).length;

    const totalAllocated = withSpent.reduce((s, b) => s + (b.allocated || 0), 0);
    const totalBudgetSpent = withSpent.reduce((s, b) => s + (b.spent || 0), 0);
    const cap = roundMoney(req.club.annualBudgetCap || 0);

    const remainingBudget = roundMoney(totalAllocated - totalBudgetSpent);
    // If club has allocated budget lines, available funds = remaining budget; otherwise fallback to net cash inflow
    const availableFunds = totalAllocated > 0 ? remainingBudget : roundMoney(totalIncome - settledExpenses);

    const alerts = [];
    for (const b of withSpent) {
      if (b.overBudget) {
        alerts.push({
          level: "critical",
          budgetId: b._id,
          title: b.title,
          message: `"${b.title}" is over budget.`,
        });
      } else if (b.utilization >= 80) {
        alerts.push({
          level: "warning",
          budgetId: b._id,
          title: b.title,
          message: `"${b.title}" has used ${b.utilization.toFixed(0)}% of its allocation.`,
        });
      }
    }

    return res.status(200).json({
      availableFunds,
      totalBalance: roundMoney(totalIncome - settledExpenses),
      totalIncome: roundMoney(totalIncome),
      totalExpenses: roundMoney(totalExpenses),
      settledExpenses: roundMoney(settledExpenses),
      pendingExpenses: roundMoney(pendingExpenses),
      activeBudgets: budgets.length,
      budgets: withSpent,
      pendingReimbursements,
      recentTransactions: transactions.slice(0, 10),
      memberCount: req.club.members.filter((m) => m.status === "approved").length,
      annualBudgetCap: cap,
      totalAllocated: roundMoney(totalAllocated),
      totalBudgetSpent: roundMoney(totalBudgetSpent),
      remainingBudget,
      unallocated: cap ? roundMoney(cap - totalAllocated) : 0,
      budgetAlerts: req.club.features?.notifications ? alerts : alerts.filter((a) => a.level === "critical"),
      strictBudgets: req.club.strictBudgets !== false,
      club: serializeClub(req.club),
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getDashboard };
