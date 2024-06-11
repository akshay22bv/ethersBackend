const models = require("../models/index");
const { checkBtcBalance } = require("./helper");

const { BitcoinWallets } = models;

async function getBTCBalance(req, res) {
  const { address } = req.params;

  if (!address) {
    return res
      .status(400)
      .send({ error: "address query parameter is required" });
  }

  try {
    const balanceSatoshis = await checkBtcBalance(address);
    const balanceBTC = balanceSatoshis / 100000000; // Convert satoshis to BTC

    const updateBalance = await BitcoinWallets.update(
      { balance: parseFloat(balanceBTC) },
      { where: { address: address } }
    );

    if (!updateBalance) {
      res.status(500).send({ error: "Failed to update balance" });
    }

    res.send({ balanceBTC });
  } catch (error) {
    res.status(500).send({ error: error });
  }
}

module.exports = {
  getBTCBalance,
};
