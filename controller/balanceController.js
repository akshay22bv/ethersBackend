const { getDefaultProvider, utils, ethers } = require("ethers");
const {
  NETWORK,
  CURRENCY,
  CONTRACT_ADDRESSES,
  ABI,
} = require("../helper/CONSTANTS");
const {
  formatEther,
  HDNode,
  parseEther,
  formatUnits,
} = require("ethers/lib/utils");
const models = require("../models/index");
const { checkBtcBalance } = require("./helper");
const { Wallet } = models;

async function getBalance(req, res) {
  const { address, currency } = req.params;

  if (!currency) {
    return res.status(400).send({ error: "currency parameter is required" });
  }

  let balance;

  let provider = getDefaultProvider(NETWORK);
  let tokenContractAddress = CONTRACT_ADDRESSES[currency];

  try {
    // ETH
    if (currency === CURRENCY.ETH) {
      const bal = await provider.getBalance(address);
      balance = formatEther(bal);

      const updateBalance = await Wallet.update(
        { balance: parseFloat(balance) },
        { where: { currency, address } }
      );

      if (!updateBalance) {
        res.status(500).send({ error: "Failed to update balance" });
      }

      res.send({ balance });
    }

    // BTC
    if (currency === CURRENCY.BTC) {
      const balanceSatoshis = await checkBtcBalance(address);
      balance = balanceSatoshis / 100000000; // Convert satoshis to BTC

      const updateBalance = await Wallet.update(
        { balance: parseFloat(balance) },
        { where: { currency, address } }
      );

      if (!updateBalance) {
        res.status(500).send({ error: "Failed to update balance" });
      }
    }

    // USDC_ERC20
    if (currency === CURRENCY.USDC_ERC20) {
      const contract = new ethers.Contract(tokenContractAddress, ABI, provider);
      const bal = await contract.balanceOf(address);

      balance = parseFloat(formatUnits(bal, 6));
      console.log("balance: ", balance);

      const updateBalance = await Wallet.update(
        { balance: balance },
        { where: { currency, address } }
      );

      if (!updateBalance) {
        res.status(500).send({ error: "Failed to update balance" });
      }
    }

    // USDT_ERC20
    if (currency === CURRENCY.USDT_ERC20) {
      const contract = new ethers.Contract(tokenContractAddress, ABI, provider);
      const bal = await contract.balanceOf(address);

      balance = parseFloat(formatUnits(bal, 6));
      console.log("balance: ", balance);

      const updateBalance = await Wallet.update(
        { balance: parseFloat(balance) },
        { where: { currency, address } }
      );

      if (!updateBalance) {
        res.status(500).send({ error: "Failed to update balance" });
      }
    }

    // USDC_BSC
    if (currency === CURRENCY.USDC_BSC) {
      const updateBalance = await Wallet.update(
        { balance: parseFloat(balance) },
        { where: { currency, address } }
      );

      if (!updateBalance) {
        res.status(500).send({ error: "Failed to update balance" });
      }
    }

    // USDT_BSC
    if (currency === CURRENCY.USDT_BSC) {
      const updateBalance = await Wallet.update(
        { balance: parseFloat(balance) },
        { where: { currency, address } }
      );

      if (!updateBalance) {
        res.status(500).send({ error: "Failed to update balance" });
      }
    }

    // USDC_POLYGON
    if (currency === CURRENCY.USDC_POLYGON) {
      const updateBalance = await Wallet.update(
        { balance: parseFloat(balance) },
        { where: { currency, address } }
      );

      if (!updateBalance) {
        res.status(500).send({ error: "Failed to update balance" });
      }
    }

    // USDT_POLYGON
    if (currency === CURRENCY.USDT_POLYGON) {
      const updateBalance = await Wallet.update(
        { balance: parseFloat(balance) },
        { where: { currency, address } }
      );

      if (!updateBalance) {
        res.status(500).send({ error: "Failed to update balance" });
      }
    }

    // USDC_TRC20
    if (currency === CURRENCY.USDC_TRC20) {
      const balance = await tronWeb.trx.getBalance(address);

      const updateBalance = await Wallet.update(
        { balance: parseFloat(balance) },
        { where: { currency, address } }
      );

      if (!updateBalance) {
        res.status(500).send({ error: "Failed to update balance" });
      }
    }

    // USDT_TRC20
    if (currency === CURRENCY.USDT_TRC20) {
      const updateBalance = await Wallet.update(
        { balance: parseFloat(balance) },
        { where: { currency, address } }
      );

      if (!updateBalance) {
        res.status(500).send({ error: "Failed to update balance" });
      }
    }
    res.json({
      success: true,
      message: `balnce for ${currency} successfully fetched`,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).send({ error: error });
  }
}

module.exports = {
  getBalance,
};
