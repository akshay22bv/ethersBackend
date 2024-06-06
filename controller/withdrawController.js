const { getDefaultProvider, Wallet } = require("ethers");
const { parseEther } = require("ethers/lib/utils");
const { readFileSync } = require("fs");

async function withDraw(req, res) {
  try {
    const { toAddress, amount } = req.body;

    const network = "sepolia";
    const provider = getDefaultProvider(network, {
      alchemy:
        process.env.YOUR_ALCHEMY_API_KEY || "FnbPX4D_sSeepjDUfpRq52RdKc_cgaMC",
    });

    const accountRawData = readFileSync("etherKeys.json", "utf8");

    if (!accountRawData) {
      res.status(500).send({ error: "Wallet address not created" });
    }

    const accountData = JSON.parse(accountRawData);

    const signer = new Wallet(accountData.privateKey, provider);

    const transaction = await signer.sendTransaction({
      to: toAddress,
      value: parseEther(amount),
    });

    if (transaction) {
      res.send({
        success: true,
        message: "Withdrawl Successfull",
        body: transaction,
      });
    }
  } catch (error) {
    res.status(500).send({ error: error });
  }
}

module.exports = {
  withDraw,
};
