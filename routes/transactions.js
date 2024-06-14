const express = require('express');
const { getAllTransactions } = require('../controller/transactionController');

const router = express.Router();

// Define the GET route
router.get('/', getAllTransactions);

module.exports = router;
