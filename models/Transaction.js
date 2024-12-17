const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  bankName: String,
  amount: Number,
  transactionType: String,
  message: String,
  date: Date,
  user:String
});

module.exports = mongoose.model("Transaction", transactionSchema);
