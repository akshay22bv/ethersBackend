const express = require("express");
const { getBalance } = require("../controller/balanceController");

const router = express.Router();

// Define the GET route

router.get("/:address/:currency", getBalance);

module.exports = router;
