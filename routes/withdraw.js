const express = require("express");
const { withDraw } = require("../controller/withdrawController");
const router = express.Router();

// Define the GET route
router.post("/", withDraw);

module.exports = router;
