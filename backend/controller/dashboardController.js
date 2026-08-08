const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

const getDashboard = async (req, res) => {
  try {
    const clubId = req.club._id;

    const transactions = await Transaction.find({ club: clubId }).sort({ date: -1 });
    const budgets = await Budget.find({ club: clubId });

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingReimbursements = transactions.filter(
      (t) => t.status === "Pending Bill"
    ).length;

    return res.status(200).json({
      totalBalance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      activeBudgets: budgets.length,
      pendingReimbursements,
      recentTransactions: transactions.slice(0, 10),
      memberCount: req.club.members.filter((m) => m.status === "approved").length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getDashboard };
