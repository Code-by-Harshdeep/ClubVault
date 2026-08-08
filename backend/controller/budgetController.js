const Budget = require("../models/Budget");

const listBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ club: req.club._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ budgets });
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

    const budget = await Budget.create({
      club: req.club._id,
      title,
      category,
      description,
      allocated: Number(allocated),
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Budget created", budget });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateBudgetSpent = async (req, res) => {
  try {
    const { spent } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, club: req.club._id },
      { spent: Number(spent) },
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    return res.status(200).json({ message: "Budget updated", budget });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteBudget = async (req, res) => {
  try {
    await Budget.deleteOne({ _id: req.params.id, club: req.club._id });
    return res.status(200).json({ message: "Budget deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { listBudgets, createBudget, updateBudgetSpent, deleteBudget };
