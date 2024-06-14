const models = require('../models/index');
const { Transactions } = models;

async function getAllTransactions(req, res) {
  try {
    const allTransactions = await Transactions.findAll({
      exclude: ['createdAt', 'updatedAt', 'deletedAt'],
    });

    return res.status(200).json({ allTransactions });
  } catch (error) {
    console.error('Failed to get all Transaction:', error);
    return res.status(500).json({ error: 'Failed to get all Transaction' });
  }
}

module.exports = {
  getAllTransactions,
};
