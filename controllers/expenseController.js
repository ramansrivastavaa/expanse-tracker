const Expense = require("../models/expenseModel");

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).populate(
      "categoryId"
    );
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addExpense = async (req, res) => {
  const { description, amount, categoryId } = req.body;

  try {
    const expense = new Expense({
      description,
      amount,
      categoryId,
      userId: req.user.id,
    });
    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
