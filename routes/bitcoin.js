const express = require("express");
const router = express.Router();
const {
  createBitcoinWallet,
  getAddressByMnemonic,
  createWithdraw,
  getBTCBalance,
} = require("../controller/bitcoinController");

// Define the GET route
router.post("/withdraw", createWithdraw);
router.post("/:mnemonicId", createBitcoinWallet);
router.get("/:menmonicId", getAddressByMnemonic);
router.get("/balance/:address", getBTCBalance);

module.exports = router;
