const express = require("express");
const router = express.Router();
const { createWallet } = require("../controller/walletController");

// Define the GET route
router.post("/", createWallet);

module.exports = router;
