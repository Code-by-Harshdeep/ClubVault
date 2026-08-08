const Transaction = require("../models/Transaction");

const listTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ club: req.club._id }).sort({
      date: -1,
    });
    return res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { title, description, category, type, amount, status, date } = req.body;

    if (!title || !category || !type || amount === undefined) {
      return res
        .status(400)
        .json({ message: "Title, category, type and amount are required" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Type must be income or expense" });
    }

    const transaction = await Transaction.create({
      club: req.club._id,
      title,
      description,
      category,
      type,
      amount: Math.abs(Number(amount)),
      status: status || "Cleared",
      date: date || new Date(),
      addedBy: req.user.id,
    });

    return res.status(201).json({ message: "Transaction added", transaction });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    await Transaction.deleteOne({ _id: req.params.id, club: req.club._id });
    return res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { listTransactions, createTransaction, deleteTransaction };
