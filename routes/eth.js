const express = require("express");
const router = express.Router();
const {
  ethWithdraw,
  createEthAddress,
  getETHAddressByMnemonic,
  getBalance,
} = require("../controller/ethController");

// Define the GET route
router.post("/withdraw", ethWithdraw);
router.get("/balance/:assetId", getBalance);
router.post("/:mnemonicId", createEthAddress);
router.get("/:menmonicId", getETHAddressByMnemonic);

module.exports = router;
