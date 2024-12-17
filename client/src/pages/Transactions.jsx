// pages/Transactions.jsx
import { Box, Container, Tab, Tabs } from "@mui/material";
import React from "react";
import AddTransaction from "../components/AddTransaction";
import TransactionList from "../components/TransactionList";

const Transactions = () => {
  const [tab, setTab] = React.useState(0);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleTransactionAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
    setTab(0); // Switch to list view after adding
  };

  return (
    <Container>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label="Transaction List" />
          <Tab label="Add Transaction" />
        </Tabs>
      </Box>

      {tab === 0 && <TransactionList key={refreshTrigger} />}
      {tab === 1 && (
        <AddTransaction onTransactionAdded={handleTransactionAdded} />
      )}
    </Container>
  );
};

export default Transactions;
