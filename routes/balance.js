const express = require("express");
const router = express.Router();
const { getBalance } = require("../controller/balanceController");

// Define the GET route
router.get("/:assetId", getBalance);

module.exports = router;
