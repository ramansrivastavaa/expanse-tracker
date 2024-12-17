const express = require("express");
const { getExpenses, addExpense } = require("../controllers/expenseController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, getExpenses);
router.post("/", authMiddleware, addExpense);

module.exports = router;
