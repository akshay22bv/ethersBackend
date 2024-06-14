const express = require('express');
const {
  createhdwallet,
  getAllMnemonics,
  getWallet,
} = require('../controller/createWallet');
const router = express.Router();

// Define the GET route
router.post('/create', createhdwallet);
router.get('/', getAllMnemonics);
router.get('/:walletId', getWallet);

module.exports = router;
