const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Event = require("../models/Event");
const { assertExpenseFits } = require("../utils/budgetGuard");
const { roundMoney } = require("../utils/campusDefaults");
const { logActivity } = require("../utils/activityLogger");

const listTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ club: req.club._id })
      .populate("budget", "title category allocated")
      .sort({ date: -1 });
    return res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createTransaction = async (req, res) => {
  try {
    const {
      title,
      description,
      receiptUrl,
      merchant,
      category,
      type,
      amount,
      status,
      date,
      budgetId,
      eventId,
    } = req.body;

    if (!String(title || "").trim() || !type || amount === undefined) {
      return res
        .status(400)
        .json({ message: "Title, type and amount are required" });
    }

    if (!["income", "expense"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Type must be income or expense" });
    }

    const spend = roundMoney(Math.abs(Number(amount)));
    if (!Number.isFinite(spend) || spend <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be greater than zero" });
    }

    const validStatuses = ["Pending Bill", "Approved", "Cleared", "Reimbursed"];
    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid transaction status" });
    }
    if (date !== undefined && Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: "Invalid transaction date" });
    }

    let budgetDoc = null;
    if (type === "expense") {
      if (!budgetId) {
        return res.status(400).json({
          message:
            "Pick a budget line. Expenses cannot be logged outside an allocation.",
        });
      }

      if (status === "Pending Bill" && !req.club.features?.reimbursements) {
        return res.status(403).json({
          message:
            "Reimbursements are an exclusive feature. An admin can enable them in Settings.",
        });
      }

      try {
        await assertExpenseFits(req.club, budgetId, spend);
      } catch (err) {
        return res.status(err.status || 400).json({ message: err.message });
      }

      budgetDoc = await Budget.findOne({ _id: budgetId, club: req.club._id });
    }

    if (eventId) {
      const event = await Event.findOne({ _id: eventId, club: req.club._id });
      if (!event)
        return res
          .status(400)
          .json({ message: "Selected event was not found for this campus" });
    }

    const transaction = await Transaction.create({
      club: req.club._id,
      title: String(title).trim(),
      description,
      receiptUrl: receiptUrl ? String(receiptUrl).trim() : "",
      merchant: merchant ? String(merchant).trim() : "",
      category: category || budgetDoc?.category || "General",
      type,
      amount: spend,
      status: status || "Cleared",
      date: date || new Date(),
      budget: type === "expense" ? budgetId : undefined,
      event: eventId || undefined,
      addedBy: req.user?.id || req.user?._id,
    });

    const userId = req.user?.id || req.user?._id;
    logActivity({
      clubId: req.club._id,
      actorId: userId,
      action: type === "expense" ? (status === "Pending Bill" ? "CLAIM_SUBMITTED" : "EXPENSE_LOGGED") : "INCOME_LOGGED",
      title: type === "expense" ? (status === "Pending Bill" ? `Reimbursement Claim: ₹${spend.toLocaleString("en-IN")}` : `Logged Expense: ₹${spend.toLocaleString("en-IN")}`) : `Logged Inflow: ₹${spend.toLocaleString("en-IN")}`,
      details: `${title} (${category || budgetDoc?.category || "General"})`,
      category: "Finance",
    });

    return res.status(201).json({ message: "Transaction added", transaction });
  } catch (error) {
    console.error("createTransaction error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const result = await Transaction.deleteOne({
      _id: req.params.id,
      club: req.club._id,
    });
    if (!result.deletedCount)
      return res.status(404).json({ message: "Transaction not found" });

    const userId = req.user?.id || req.user?._id;
    logActivity({
      clubId: req.club._id,
      actorId: userId,
      action: "TRANSACTION_DELETED",
      title: "Transaction Voided",
      details: `Transaction ID: ${req.params.id}`,
      category: "Finance",
    });

    return res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("deleteTransaction error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending Bill", "Approved", "Cleared", "Reimbursed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid transaction status" });
    }

    if (status === "Pending Bill" && !req.club.features?.reimbursements) {
      return res
        .status(403)
        .json({ message: "Reimbursements are not enabled for this campus" });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, club: req.club._id, type: "expense" },
      { status },
      { new: true, runValidators: true },
    );
    if (!transaction)
      return res.status(404).json({ message: "Expense not found" });

    const userId = req.user?.id || req.user?._id;
    logActivity({
      clubId: req.club._id,
      actorId: userId,
      action: status === "Approved" ? "CLAIM_APPROVED" : (status === "Reimbursed" ? "CLAIM_PAID" : "STATUS_UPDATED"),
      title: `Claim ${status}: ₹${transaction.amount.toLocaleString("en-IN")}`,
      details: transaction.title,
      category: "Finance",
    });

    return res
      .status(200)
      .json({ message: "Expense status updated", transaction });
  } catch (error) {
    console.error("updateTransactionStatus error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

module.exports = {
  listTransactions,
  createTransaction,
  updateTransactionStatus,
  deleteTransaction,
};
