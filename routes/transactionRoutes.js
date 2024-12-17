const express = require("express");
const { getTransactions, addTransaction } = require("../controllers/transactionController.js");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, getTransactions);
router.post("/", authMiddleware, addTransaction);

module.exports = router;
