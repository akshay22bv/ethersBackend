const express = require("express");
const router = express.Router();
const { getBalanceUSDCERC20 } = require("../controller/getBalanceUSDCERC20");
const { getBalanceETH } = require("../controller/getBalanceEth");
const { getBalanceUSDT } = require("../controller/getBalanceUSDT");

// Define the GET route
router.get("/usdcerc20/:walletAddress", getBalanceUSDCERC20);
router.get("/eth/:walletAddress", getBalanceETH);
router.get("/usdt/:walletAddress", getBalanceUSDT);

module.exports = router;
