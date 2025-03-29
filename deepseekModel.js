const axios = require('axios');

async function analyzeTransaction(transaction) {
    const response = await axios.post('http://localhost:11434/api/generate', {
        model: "deepseek-r1:1.5b",
        prompt: `Extract structured details from the following transaction description and return JSON only. Do not add any extra text. If a field is missing, return null.

Transaction: "${transaction}"

Return JSON in the following format:
{
  "amount": <amount>,
  "currency": "<currency>",
  "bank_name": "<bank_name>",
  "card_type": "<credit_or_debit>",
  "spent_at": "<merchant_or_place>",
  "transaction_type": "<expense_or_income>",
  "payer_name": "<payer_name_if_available>"
}

Now, process this transaction: "${transaction}" Ensure the response contains only the JSON object, nothing else.`,
        stream: false
    });

   // Extracting only the JSON part
   const jsonMatch = response.data.response.match(/\{[\s\S]*\}/);
   if (jsonMatch) {
       return jsonMatch[0];
   } else {
       throw new Error("Invalid JSON response");
   }
}

// Example Usage
// analyzeTransaction("Paid ₹500 at Dominos using HDFC Credit Card.")
//     .then(console.log)
//     .catch(console.error);


    module.exports = {
        analyzeTransaction
    }
