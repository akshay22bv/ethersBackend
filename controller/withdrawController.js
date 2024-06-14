const { getDefaultProvider, Wallet } = require("ethers");
const bitcoin = require("bitcoinjs-lib");
const BIP32Factory = require("bip32").default;
const ECPairFactory = require("ecpair").default;
const ecc = require("tiny-secp256k1");
const ECPair = ECPairFactory(ecc);
const axios = require("axios");
const { parseEther } = require("ethers/lib/utils");
const models = require("../models/index");
const { WalletAddress, Transactions } = models;
const { YOUR_ALCHEMY_API_KEY, NETWORK } = require("../helper/constants");
const { v4: uuidv4 } = require("uuid");
async function Withdraw(req, res) {
  try {
    const { assetId } = req.params;

    const { senderAddress, receiverAddress, amount } = req.body;

    const foundAddress = await WalletAddress.findOne({
      where: {
        address: senderAddress,
        assetId,
      },
    });

    if (!foundAddress) {
      res.status(500).send({ error: "Address not found" });
    }

    let trxHash;

    if (assetId === "ETH") {
      trxHash = await createETHWithdraw(req, res, foundAddress.privateKey);
    }

    if (assetId === "BTC") {
      trxHash = await createBTCWithdraw(req, res, foundAddress.privateKey);
    }

    if (trxHash) {
      const cerateTransaction = await Transactions.create({
        assetId,
        transactionId: uuidv4(),
        transactionHash: trxHash,
        fromAddress: senderAddress,
        toAddress: receiverAddress,
        amount,
        status: "SUCCESS",
      });

      if (!cerateTransaction) {
        res.status(500).send({ error: "Failed to save Transaction" });
      }
    }

    if (trxHash) {
      res.send({
        success: true,
        message: `Withdrawl Successfull for ${assetId}`,
        body: trxHash,
      });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}
module.exports = {
  Withdraw,
};

// ETH WITHDRAW

async function createETHWithdraw(req, res, privateKey) {
  try {
    const { senderAddress, receiverAddress, amount } = req.body;
    const provider = getDefaultProvider(NETWORK, {
      alchemy: YOUR_ALCHEMY_API_KEY,
    });

    const signer = new Wallet(privateKey, provider);

    const trx = await signer.sendTransaction({
      to: receiverAddress,
      value: parseEther(amount),
    });

    return trx?.hash;
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

// BTC WITHDRAW
async function createBTCWithdraw(req, res, privateKey) {
  try {
    const { senderAddress, receiverAddress, amount } = req.body;

    const testnet = bitcoin.networks.testnet;

    const privateKeyBuffer = privateKey;
    const privateKeyHex = privateKeyBuffer.toString("hex");
    const keyPair = ECPair.fromPrivateKey(privateKeyBuffer, {
      network: testnet,
    });

    const privateKeyWIF = keyPair.toWIF();

    const transactionHex = await createTransaction(
      senderAddress,
      privateKeyWIF,
      receiverAddress,
      amount
    );

    const result = await broadcastTransaction(transactionHex);

    return result;
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
