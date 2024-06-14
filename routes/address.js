const express = require("express");
const {
  createAddress,
  getAddressByMnemonic,
} = require("../controller/addressController");
const router = express.Router();

// Define the GET route

router.post("/create/:mnemonicId/:currency", createAddress);
router.get("/:mnemonicId/:currency", getAddressByMnemonic);

module.exports = router;
