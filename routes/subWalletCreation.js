const express = require('express');
const {
  createSubHDwallet,
  getAllWalleName,
  getSubWalletAddress,
} = require('../controller/createSubWallet');
const router = express.Router();

// Define the GET route
router.post('/:walletId', createSubHDwallet);
router.get('/getSubWalletNames/:walletId', getAllWalleName);
router.get('/wallet/:walletId/subwallet/:subWalletId', getSubWalletAddress);

module.exports = router;
