const BankTransaction = require("../models/Transaction");

// Get transactions
const getTransactions = async (req, res) => {
    try {
      const { month, year, filter, sort } = req.query;
      let query = { user: req.user.id }; // Add user filter for authentication

      if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        query.date = { $gte: startDate, $lte: endDate };
      }

      if (filter === "credit") {
        query.transactionType = "credit";
      } else if (filter === "debit") {
        query.transactionType = "debit";
      }

      let transactions;

      if (sort === "amount") {
        transactions = await BankTransaction.find(query).sort({ amount: -1 });
      } else {
        transactions = await BankTransaction.find(query);
      }
      // Calculate totals
      const totalDebit = await BankTransaction.aggregate([
        {
          $match: {
            user: req.user.id,
            transactionType: "debit",
            ...(month && year
              ? {
                  date: {
                    $gte: new Date(year, month - 1, 1),
                    $lte: new Date(year, month, 0),
                  },
                }
              : {}),
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      const totalCredit = await BankTransaction.aggregate([
        {
          $match: {
            user: req.user.id,
            transactionType: "credit",
            ...(month && year
              ? {
                  date: {
                    $gte: new Date(year, month - 1, 1),
                    $lte: new Date(year, month, 0),
                  },
                }
              : {}),
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      res.json({
        transactions,
        summary: {
          totalDebit: totalDebit[0]?.total || 0,
          totalCredit: totalCredit[0]?.total || 0,
          balance: (totalCredit[0]?.total || 0) - (totalDebit[0]?.total || 0),
        },
      });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

// Add transaction
const addTransaction = async (req, res) => {
    try {
        const { message } = req.body;

        // Extract bank details and amount
        const { bankName, amount, transactionType } = await extractTransactionDetails(message);

        // Create a new transaction document
        const transaction = new BankTransaction({
            bankName,
            amount,
            transactionType,
            message,
            date: new Date(),
            user: req.user.id // Add user reference for authentication
        });

        await transaction.save();

        res.status(201).json({ message: 'Transaction saved successfully', transaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save transaction' });
    }
};

// Helper function to extract transaction details
const extractTransactionDetails = async (message) => {
  // Enhanced transaction type detection
  const creditKeywords = [
    "credited",
    "deposit",
    "received",
    "credit",
    "CR.",
    "CR",
    "added",
    "refund",
    "cashback",
  ];

  const debitKeywords = [
    "debited",
    "debit",
    "withdrawal",
    "transferred",
    "paid",
    "spent",
    "purchase",
    "DR.",
    "DR",
    "withdrawn",
    "DCARDFEE", // Debit card fee
    "ATM",
    "POS",
    "UPI",
    "NEFT",
    "IMPS",
    "RTGS",
  ];
  const keywords = {
    // Private Banks
    HDFC: "HDFC Bank",
    ICICI: "ICICI Bank",
    AXIS: "Axis Bank",
    YES: "Yes Bank",
    KOTAK: "Kotak Mahindra Bank",
    IDFC: "IDFC First Bank",
    RBL: "RBL Bank",
    INDUSIND: "IndusInd Bank",
    FEDERAL: "Federal Bank",

    // Public Sector Banks
    SBI: "State Bank of India",
    PNB: "Punjab National Bank",
    BOB: "Bank of Baroda",
    CANARA: "Canara Bank",
    BOI: "Bank of India",
    UNION: "Union Bank of India",
    IOB: "Indian Overseas Bank",
    UCO: "UCO Bank",
    INDIAN: "Indian Bank",
    CENTRAL: "Central Bank of India",

    // Foreign Banks
    CITI: "Citibank",
    HSBC: "HSBC Bank",
    SCB: "Standard Chartered Bank",
    DBS: "DBS Bank",
    DEUTSCHE: "Deutsche Bank",

    // Small Finance Banks
    UJJIVAN: "Ujjivan Small Finance Bank",
    EQUITAS: "Equitas Small Finance Bank",
    AU: "AU Small Finance Bank",
    JANA: "Jana Small Finance Bank",

    // Payment Banks
    PAYTM: "Paytm Payments Bank",
    AIRTEL: "Airtel Payments Bank",
    FINO: "Fino Payments Bank",

    // Regional Rural Banks
    BARODA: "Bank of Baroda",
    KARNATAKA: "Karnataka Gramin Bank",

    // Cooperative Banks
    SARASWAT: "Saraswat Co-operative Bank",
    COSMOS: "Cosmos Co-operative Bank",
    NKGSB: "NKGSB Co-operative Bank",
  };

  let bankName = "";
  let amount = 0;
  let transactionType = "";

  for (const keyword in keywords) {
    if (message.toUpperCase().includes(keyword.toUpperCase())) {
      bankName = keywords[keyword];
      break;
    }
  }

  const amountRegex = /\b(?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2})?\b/;
  const amountMatch = message.match(amountRegex);

  if (amountMatch) {
    let amountString = amountMatch[0];

    // Remove currency symbols (adjust as needed)
    amountString = amountString.replace(/[₹$€]/g, "");

    amount = parseFloat(amountString.replace(",", ""));
  }

  // Convert message to lowercase for case-insensitive matching
  const messageLower = message.toLowerCase();

  // Check for debit keywords first (since they're more specific in your case)
  if (
    debitKeywords.some((keyword) =>
      messageLower.includes(keyword.toLowerCase())
    )
  ) {
    transactionType = "debit";
  }
  // Then check for credit keywords
  else if (
    creditKeywords.some((keyword) =>
      messageLower.includes(keyword.toLowerCase())
    )
  ) {
    transactionType = "credit";
  }
  // If balance ends with CR, it's likely a credit transaction
  else if (message.match(/Bal.*CR/i)) {
    transactionType = "credit";
  }
  // If none of the above, check for specific transaction patterns
  else {
    // Look for patterns like "transferred from" vs "transferred to"
    if (
      messageLower.includes("transferred to") ||
      messageLower.includes("transfer to")
    ) {
      transactionType = "debit";
    } else if (
      messageLower.includes("transferred from") ||
      messageLower.includes("transfer from")
    ) {
      transactionType = "credit";
    }
  }

  return { bankName, amount, transactionType };
};

module.exports = {
    getTransactions,
    addTransaction
}; 
