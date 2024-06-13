const models = require("../models/index");
const { EtherWallets, Mnemonics } = models;
const { getDefaultProvider, Wallet, utils } = require("ethers");
const { formatEther, HDNode, parseEther } = require("ethers/lib/utils");
const { readFileSync } = require("fs");
const {
  network,
  YOUR_ALCHEMY_API_KEY,
  NETWORK,
} = require("../helper/CONSTANTS");

// eth balance
async function getBalance(req, res) {
  const { assetId } = req.params;

  if (!assetId) {
    return res
      .status(400)
      .send({ error: "assetId query parameter is required" });
  }

  try {
    const provider = getDefaultProvider(NETWORK);
    const bal = await provider.getBalance(assetId);
    const balance = formatEther(bal);

    const updateBalance = await EtherWallets.update(
      { balance: parseFloat(balance) },
      { where: { address: assetId } }
    );

    if (!updateBalance) {
      res.status(500).send({ error: "Failed to update balance" });
    }

    res.send({ balance });
  } catch (error) {
    res.status(500).send({ error: error });
  }
}

// creation mnemonic and privatekey for eth
async function createEthAddress(req, res) {
  try {
    const { mnemonicId } = req.params;

    const lastWallet = await EtherWallets.findOne({
      where: { mnemonic: mnemonicId },
      order: [["path", "DESC"]],
      limit: 1,
      include: [{ model: Mnemonics }],
    });

    const foundMnemonic = await Mnemonics.findOne({
      where: { id: mnemonicId },
    });

    if (!foundMnemonic) {
      res.status(500).send({ error: "Mnemonic not found" });
    }

    // Generate HDNode from the mnemonic
    const hdNode = HDNode.fromMnemonic(foundMnemonic.mnemonic);

    let path;

    let pathCount = lastWallet ? Number(lastWallet?.path) + 1 : 0;

    if (lastWallet) {
      path = `m/44'/60'/0'/0/${pathCount}`;
    } else {
      path = `m/44'/60'/0'/0/${pathCount}`;
    }

    // Derive a node using the specified path
    const derivedNode = hdNode.derivePath(path);

    const { privateKey, publicKey, address } = derivedNode;

    // Uncomment and adjust this part according to your database model
    const wallet = await EtherWallets.create({
      privateKey,
      publicKey,
      address: address,
      mnemonic: mnemonicId,
      balance: 0,
      path: pathCount,
    });

    if (!wallet) {
      return res.status(500).send({ error: "Failed to save wallet" });
    }

    // Sending the response
    res.send({
      success: true,
      message: "Wallet Created Successfully",
      body: {
        privateKey,
        publicKey,
        address,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
}

// eth withdraw
async function ethWithdraw(req, res) {
  try {
    // const { senderAddress, toAddress, amount } = req.body;
    const { senderAddress, recipientAddress, amount } = req.body;

    const foundAddress = await EtherWallets.findOne({
      where: {
        address: senderAddress,
      },
    });

    if (!foundAddress) {
      res.status(500).send({ error: "Address not found" });
    }

    const provider = getDefaultProvider(NETWORK, {
      alchemy: YOUR_ALCHEMY_API_KEY,
    });

    const signer = new Wallet(foundAddress.privateKey, provider);

    const transaction = await signer.sendTransaction({
      to: recipientAddress,
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
    res.status(500).send({ error: error.message });
  }
}

// eth addressess
async function getETHAddressByMnemonic(req, res) {
  const { menmonicId } = req.params;
  try {
    const addresses = await EtherWallets.findAll({
      where: {
        mnemonic: menmonicId,
      },
      order: [["path", "ASC"]],
    });

    res.json({ message: "success", body: { addresses } });
  } catch (error) {
    throw new Error("Addresses fetch failed");
  }
}

module.exports = {
  getBalance,
  createEthAddress,
  ethWithdraw,
  getETHAddressByMnemonic,
};
