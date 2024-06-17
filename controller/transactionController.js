const models = require("../models/index");
const { Transactions } = models;

async function getAllTransactions(req, res) {
  const { status, direction, asset } = req.query;

  // Build the where clause based on the filters
  const whereClause = {};
  if (status) whereClause.status = status;
  if (direction) whereClause.transactiontype = direction; // Assuming direction maps to transactiontype
  if (asset) whereClause.assetId = asset;

  try {
    const allTransactions = await Transactions.findAll({
      where: whereClause,
      exclude: ["createdAt", "updatedAt", "deletedAt"],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ allTransactions });
  } catch (error) {
    console.error("Failed to get all Transaction:", error);
    return res.status(500).json({ error: "Failed to get all Transaction" });
  }
}

module.exports = {
  getAllTransactions,
};
