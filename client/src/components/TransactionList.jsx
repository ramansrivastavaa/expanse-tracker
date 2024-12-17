// components/TransactionList.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "../utils/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalDebit: 0,
    totalCredit: 0,
    balance: 0,
  });
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    filter: "all",
    sort: "date",
  });

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await axios.get("/api/transactions", {
        params: filters,
      });
      setTransactions(response.data.transactions);
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [filters]); // Add filters as dependency

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]); // Now fetchTransactions is a dependency

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid container item spacing={3} xs={12}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "#e3f2fd" }}>
              <CardContent>
                <Typography variant="h6">Total Credits</Typography>
                <Typography variant="h4">₹{summary.totalCredit}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "#ffebee" }}>
              <CardContent>
                <Typography variant="h6">Total Debits</Typography>
                <Typography variant="h4">₹{summary.totalDebit}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "#e8f5e9" }}>
              <CardContent>
                <Typography variant="h6">Balance</Typography>
                <Typography variant="h4">₹{summary.balance}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Grid container item spacing={2} xs={12}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={filters.month}
                onChange={(e) =>
                  setFilters({ ...filters, month: e.target.value })
                }
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Year"
              type="number"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filters.filter}
                onChange={(e) =>
                  setFilters({ ...filters, filter: e.target.value })
                }
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="credit">Credit</MenuItem>
                <MenuItem value="debit">Debit</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort</InputLabel>
              <Select
                value={filters.sort}
                onChange={(e) =>
                  setFilters({ ...filters, sort: e.target.value })
                }
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="amount">Amount</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Transactions Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow
                    key={transaction._id}
                    sx={{
                      bgcolor:
                        transaction.transactionType === "credit"
                          ? "#e8f5e9"
                          : "#ffebee",
                    }}
                  >
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.bankName}</TableCell>
                    <TableCell>{transaction.transactionType}</TableCell>
                    <TableCell align="right">₹{transaction.amount}</TableCell>
                    <TableCell>{transaction.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionList;
