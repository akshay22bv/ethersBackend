const express = require("express");
const router = express.Router();
const {
  createBitcoinWallet,
  createWithdraw,
  getBTCBalance,
} = require("../controller/bitcoinController");

// Define the GET route
router.post("/withdraw", createWithdraw);
router.post("/:mnemonicId", createBitcoinWallet);
router.get("/balance/:address", getBTCBalance);

module.exports = router;
