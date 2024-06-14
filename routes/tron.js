const express = require("express");
const { createTronWallet } = require("../controller/tronController");
const router = express.Router();

// Define the GET route

router.post("/:mnemonicId", createTronWallet);

module.exports = router;
