// components/AddTransaction.jsx
import React, { useState } from "react";
// Update imports in all components to use this axios instance
import axios from '../utils/axios';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
} from "@mui/material";

const AddTransaction = ({ onTransactionAdded }) => {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/transactions", { message });
      setMessage("");
      setStatus({
        type: "success",
        message: "Transaction added successfully",
      });
      if (onTransactionAdded) onTransactionAdded();
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to add transaction",
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Transaction
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Transaction Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Add Transaction
          </Button>
        </form>
        {status.message && (
          <Alert severity={status.type} sx={{ mt: 2 }}>
            {status.message}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default AddTransaction;
