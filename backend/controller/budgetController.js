const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const {
  attachSpent,
  totalAllocated,
  assertWithinCap,
  remainingOnBudget,
} = require("../utils/budgetGuard");
const { roundMoney } = require("../utils/campusDefaults");
const { logActivity } = require("../utils/activityLogger");

const listBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ club: req.club._id }).sort({
      createdAt: 1,
    });
    const withSpent = await attachSpent(req.club._id, budgets);
    const allocated = withSpent.reduce((s, b) => s + (b.allocated || 0), 0);
    const spent = withSpent.reduce((s, b) => s + (b.spent || 0), 0);
    const cap = roundMoney(req.club.annualBudgetCap || 0);

    return res.status(200).json({
      budgets: withSpent,
      summary: {
        annualBudgetCap: cap,
        totalAllocated: roundMoney(allocated),
        totalSpent: roundMoney(spent),
        unallocated: cap ? roundMoney(cap - allocated) : 0,
        remaining: roundMoney(allocated - spent),
        strictBudgets: req.club.strictBudgets !== false,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createBudget = async (req, res) => {
  try {
    const { title, category, description, allocated } = req.body;

    if (!title || !category || allocated === undefined) {
      return res
        .status(400)
        .json({ message: "Title, category and allocated amount are required" });
    }

    const amount = roundMoney(Number(allocated));
    if (!Number.isFinite(amount) || amount < 0) {
      return res
        .status(400)
        .json({ message: "Allocated amount cannot be negative" });
    }

    const current = await totalAllocated(req.club._id);
    try {
      assertWithinCap(req.club, current + amount);
    } catch (err) {
      return res.status(err.status || 400).json({ message: err.message });
    }

    const userId = req.user?.id || req.user?._id;

    const budget = await Budget.create({
      club: req.club._id,
      title,
      category,
      description,
      allocated: amount,
      createdBy: userId,
    });

    logActivity({
      clubId: req.club._id,
      actorId: userId,
      action: "BUDGET_CREATED",
      title: `Created Budget: ${title}`,
      details: `Allocated ₹${amount.toLocaleString("en-IN")} (${category})`,
      category: "Budget",
    });

    return res.status(201).json({ message: "Budget created", budget });
  } catch (error) {
    console.error("createBudget error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      club: req.club._id,
    });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    if (req.body.title !== undefined) budget.title = req.body.title;
    if (req.body.category !== undefined) budget.category = req.body.category;
    if (req.body.description !== undefined)
      budget.description = req.body.description;

    if (req.body.allocated !== undefined) {
      const amount = roundMoney(Number(req.body.allocated));
      if (!Number.isFinite(amount) || amount < 0) {
        return res
          .status(400)
          .json({ message: "Allocated amount cannot be negative" });
      }

      const { spent } = await remainingOnBudget(req.club._id, budget._id);
      if (amount + 0.009 < spent) {
        return res.status(400).json({
          message: `Cannot set allocation below already spent ₹${spent.toLocaleString("en-IN")}.`,
        });
      }

      const others = await totalAllocated(req.club._id, budget._id);
      try {
        assertWithinCap(req.club, others + amount);
      } catch (err) {
        return res.status(err.status || 400).json({ message: err.message });
      }
      budget.allocated = amount;
    }

    await budget.save();
    const [withSpent] = await attachSpent(req.club._id, [budget]);

    const userId = req.user?.id || req.user?._id;
    logActivity({
      clubId: req.club._id,
      actorId: userId,
      action: "BUDGET_UPDATED",
      title: `Updated Budget: ${budget.title}`,
      details: `New allocation ₹${Number(budget.allocated).toLocaleString("en-IN")}`,
      category: "Budget",
    });

    return res
      .status(200)
      .json({ message: "Budget updated", budget: withSpent });
  } catch (error) {
    console.error("updateBudget error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const linked = await Transaction.exists({
      club: req.club._id,
      budget: req.params.id,
    });
    if (linked) {
      return res.status(409).json({
        message:
          "This budget has transactions charged against it and cannot be deleted.",
      });
    }

    const budget = await Budget.findOne({ _id: req.params.id, club: req.club._id });
    const result = await Budget.deleteOne({
      _id: req.params.id,
      club: req.club._id,
    });
    if (!result.deletedCount)
      return res.status(404).json({ message: "Budget not found" });

    const userId = req.user?.id || req.user?._id;
    logActivity({
      clubId: req.club._id,
      actorId: userId,
      action: "BUDGET_DELETED",
      title: `Deleted Budget: ${budget?.title || "Category"}`,
      details: "Removed unused budget line",
      category: "Budget",
    });

    return res.status(200).json({ message: "Budget deleted" });
  } catch (error) {
    console.error("deleteBudget error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

module.exports = { listBudgets, createBudget, updateBudget, deleteBudget };

