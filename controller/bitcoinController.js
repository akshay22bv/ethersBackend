const bip39 = require("bip39");
const bitcoin = require("bitcoinjs-lib");
const BIP32Factory = require("bip32").default;
const ECPairFactory = require("ecpair").default;
const ecc = require("tiny-secp256k1");

const ECPair = ECPairFactory(ecc);

const models = require("../models/index");

const { BitcoinWallets, Mnemonics } = models;
const { checkBtcBalance } = require("./helper");
const axios = require("axios");

// btc balance
async function getBTCBalance(req, res) {
  const { address } = req.params;
  console.log("address: ", address);

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

async function createBitcoinWallet(req, res) {
  try {
    const { mnemonicId } = req.params;

    const wallet = await BitcoinWallets.findOne({
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

    // Convert the mnemonic to a seed
    const seed = await bip39.mnemonicToSeed(foundMnemonic.mnemonic);
    // Initialize BIP32 using the tiny-secp256k1 library
    const bip32 = BIP32Factory(ecc);

    // Derive the root node from the seed
    const root = bip32.fromSeed(seed);

    // Derive the first external chain address (m/44'/1'/0'/0/0) for testnet

    let path;

    let pathCount = wallet ? Number(wallet?.path) + 1 : 0;

    if (wallet) {
      path = `m/44'/0'/0'/0/${pathCount}`;
    } else {
      path = `m/44'/0'/0'/0/${pathCount}`;
    }
    const child = root.derivePath(path);

    // Generate a Bitcoin address
    const { address } = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: bitcoin.networks.testnet,
    });

    if (!address) {
      res.status(500).send({ error: "Address creation failed" });
    }

    const balanceSatoshis = await checkBtcBalance(address);
    const balanceBTC = (balanceSatoshis || 0) / 100000000; // Convert satoshis to BTC

    let createdBtcWallet = await BitcoinWallets.create({
      address: address,
      mnemonic: mnemonicId,
      balance: balanceBTC || 0,
      path: pathCount,
    });

    if (!createdBtcWallet) {
      res.send({
        success: true,
        message: "success",
        body: { createdBtcWallet },
      });
    }

    res.send({ success: true, message: "success", body: { createdBtcWallet } });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

const getLatestTransaction = async (address) => {
  try {
    const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/full`;
    const response = await axios.get(url);
    const transactions = response.data.txs;
    if (transactions.length > 0) {
      const latestTransaction = transactions[0];
      const previousTxid = latestTransaction.inputs[0].prev_hash;
      //
      // const previousHex = latestTransaction.hex;
      //

      return previousTxid;
    } else {
      throw new Error("No transactions found for the address.");
    }
  } catch (error) {
    throw new Error(`Error getting latest transaction: ${error.message}`);
  }
};

async function createWithdraw(req, res) {
  try {
    const { senderAddress, recipientAddress, amount } = req.body;
    const wallet = await BitcoinWallets.findOne({
      where: {
        address: senderAddress,
      },
      include: [{ model: Mnemonics }],
    });
    if (!wallet) {
      res.status(500).send({ error: "Address not found" });
    }
    const testnet = bitcoin.networks.testnet;
    const seed = bip39.mnemonicToSeedSync(wallet?.Mnemonic?.mnemonic);
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(seed, testnet);
    const path = `m/44'/0'/0'/0/${wallet.path}`;
    const child = root.derivePath(path);
    const privateKeyBuffer = child.privateKey;
    const privateKeyHex = privateKeyBuffer.toString("hex");
    const keyPair = ECPair.fromPrivateKey(privateKeyBuffer, {
      network: testnet,
    });
    const privateKeyWIF = keyPair.toWIF();
    const receiverAddress = recipientAddress;
    const previousTxid = await getLatestTransaction(senderAddress);
    const previousHex = await fetchTransactionDetails(previousTxid);
    const transactionHex = await createTransaction(
      senderAddress,
      privateKeyWIF,
      receiverAddress,
      amount
    );

    const result = await broadcastTransaction(transactionHex);

    res.status(200).send({ result });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

async function broadcastTransaction(transactionHex) {
  const response = await fetch(
    "https://methodical-withered-seed.btc-testnet.quiknode.pro/0a3f41a86207988f65fe039213fedc5776af1bef/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "sendrawtransaction",
        params: [transactionHex],
      }),
    }
  );

  const result = await response.json();
  return result;
}

async function fetchTransactionDetails(transactionId) {
  const response = await axios.get(
    `https://blockstream.info/testnet/api/tx/${transactionId}/hex`
  );
  return response.data;
}

function calculateFee(inputs, outputs) {
  const feeRate = 20; // Increase fee rate to 20 satoshis per byte
  const txSize = inputs * 148 + outputs * 34 + 10; // approximate transaction size in bytes
  return txSize * feeRate;
}

async function createTransaction(
  senderAddress,
  privateKeyWIF,
  receiverAddress,
  amount
) {
  const satoshiToSend = Math.round(amount * 100000000);

  const network = bitcoin.networks.testnet;
  const base_url = "https://api.blockcypher.com/v1/btc/test3";
  const keyPair = ECPair.fromWIF(privateKeyWIF, network);
  const psbt = new bitcoin.Psbt({ network: network });

  const utxosResponse = await axios.get(
    `${base_url}/addrs/${senderAddress}?unspentOnly=true`
  );
  const utxos = utxosResponse.data.txrefs;

  let totalAmountAvailable = 0;
  let inputCount = 0;
  for (const utxo of utxos) {
    totalAmountAvailable += utxo.value;
    inputCount += 1;
    if (totalAmountAvailable >= satoshiToSend) break;
  }

  if (totalAmountAvailable < satoshiToSend) {
    throw new Error("Balance is too low for this transaction");
  }

  const fee = calculateFee(inputCount, 2); // 1 input, 2 outputs
  if (totalAmountAvailable < satoshiToSend + fee) {
    throw new Error(
      "Balance is too low for this transaction with the fee included"
    );
  }

  const changeAmount = totalAmountAvailable - (satoshiToSend + fee);

  for (const utxo of utxos) {
    const txData = await axios.get(
      `${base_url}/txs/${utxo.tx_hash}?includeHex=true`
    );
    utxo.hex = txData.data.hex;

    psbt.addInput({
      hash: utxo.tx_hash,
      index: utxo.tx_output_n,
      nonWitnessUtxo: Buffer.from(utxo.hex, "hex"),
    });

    if (totalAmountAvailable >= satoshiToSend) break;
  }

  psbt.addOutput({ address: receiverAddress, value: satoshiToSend });

  if (changeAmount > 546) {
    // Include change only if it's above dust threshold
    psbt.addOutput({ address: senderAddress, value: changeAmount });
  }

  psbt.signAllInputs(keyPair);
  psbt.finalizeAllInputs();

  const txRaw = psbt.extractTransaction();
  return txRaw.toHex();
}

module.exports = {
  createBitcoinWallet,
  createWithdraw,
  getBTCBalance,
};
