const express = require("express");
const router = express.Router();
const { createUser, getAllUsers, getUserDetail } = require("../handler/v1/user");
const { createAccount, getAllAccounts, getAccountDetail } = require("../handler/v1/account");
const { createTransaction, getAllTransactions, getTransactionDetail } = require("../handler/v1/transaction");

router.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    message: "welcome to learn prisma api",
    data: null,
  });
});

// Users Data
router.post("/users", createUser);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetail);

// Account Data
router.post("/accounts", createAccount);
router.get("/accounts", getAllAccounts);
router.get("/accounts/:id", getAccountDetail);

// Transaction Data
router.post("/transactions", createTransaction);
router.get("/transactions", getAllTransactions);
router.get("/transactions/:id", getTransactionDetail);

module.exports = router;
