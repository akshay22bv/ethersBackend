const { getDefaultProvider, Wallet } = require('ethers');
const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const { ethers } = require('ethers');
const BIP32Factory = require('bip32').default;
const ECPairFactory = require('ecpair').default;
const ecc = require('tiny-secp256k1');
const ECPair = ECPairFactory(ecc);
const axios = require('axios');
const { parseEther } = require('ethers/lib/utils');
const models = require('../models/index');
const { WalletAddress, Transactions, Mnemonic } = models;
const { YOUR_ALCHEMY_API_KEY, NETWORK } = require('../helper/constants');
const { v4: uuidv4 } = require('uuid');
const Web3 = require('web3');

async function Withdraw(req, res) {
  try {
    const { assetId } = req.params;
    console.log('assetId: ', assetId);

    const { senderAddress, receiverAddress, amount } = req.body;

    const foundAddress = await WalletAddress.findOne({
      where: {
        address: senderAddress,
        assetId,
      },
      include: [{ model: Mnemonic }],
    });

    if (!foundAddress) {
      res.status(500).send({ error: 'Address not found' });
    }

    let trxHash;

    if (assetId === 'ETH') {
      trxHash = await createETHWithdraw(req, res, foundAddress.privateKey);
    }

    if (assetId === 'BTC') {
      trxHash = await createBTCWithdraw(req, res, foundAddress);
      console.log('trxHash: ', trxHash);
    }

    if (assetId === 'USDC') {
      trxHash = await createUSDCERC20Withdraw(req, res, foundAddress);

      console.log('trxHash: ', trxHash);
    }

    if (assetId === 'USDT_ERC20') {
      trxHash = await createUSDTERC20Withdraw(req, res, foundAddress);
      console.log('trxHash: ', trxHash);
    }

    if (assetId === 'USDC_BSC') {
      trxHash = await createUSDCBSCWithdraw(req, res, foundAddress);
      console.log('trxHash: ', trxHash);
    }

    if (assetId === 'USDT_BSC') {
      trxHash = await createUSDTBSCWithdraw(req, res, foundAddress);
      console.log('trxHash: ', trxHash);
    }

    if (assetId === 'USDC_POLYGON') {
      trxHash = await createUSDCPOLYGONWithdraw(req, res, foundAddress);
      console.log('trxHash: ', trxHash);
    }

    if (assetId === 'USDT_POLYGON') {
      trxHash = await createUSDTPOLYGONWithdraw(req, res, foundAddress);
      console.log('trxHash: ', trxHash);
    }

    if (assetId === 'USDC_TRON') {
      trxHash = await createUSDCTRONWithdraw(req, res, foundAddress);
      console.log('trxHash: ', trxHash);
    }

    if (assetId === 'USDT_TRON') {
      trxHash = await createUSDTTRONWithdraw(req, res, foundAddress);
      console.log('trxHash: ', trxHash);
    }

    if (trxHash) {
      const cerateTransaction = await Transactions.create({
        assetId,
        transactionId: uuidv4(),
        transactionHash: trxHash,
        fromAddress: senderAddress,
        toAddress: receiverAddress,
        amount,
        status: 'SUCCESS',
      });

      if (!cerateTransaction) {
        res.status(500).send({ error: 'Failed to save Transaction' });
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

    const provider = new ethers.providers.JsonRpcProvider(
      'https://empty-muddy-replica.ethereum-sepolia.quiknode.pro/e283e52f6ddd6eb45e91e745c31c5e2913975de0/'
    );
    const signer = new ethers.Wallet(privateKey, provider);

    const trx = await signer.sendTransaction({
      to: receiverAddress,
      value: ethers.utils.parseUnits(amount, 'ether'),
    });

    return trx?.hash;
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

// USDCERC20 WITHDRAW

async function createUSDCERC20Withdraw(req, res, privateKey) {
  const destructPrivateKey = privateKey.dataValues.privateKey;
  try {
    const { senderAddress, receiverAddress, amount } = req.body;

    const tokenContractAddress = '0xB2eE34A36c7e4593A1DB6F581304dd04cC896446';
    const tokenDecimals = 18; // The number of decimals used by the token
    // Initialize Web3 instance
    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        'https://empty-muddy-replica.ethereum-sepolia.quiknode.pro/e283e52f6ddd6eb45e91e745c31c5e2913975de0/'
      )
    );
    // ERC-20 token ABI
    const tokenAbi = [
      {
        constant: false,
        inputs: [
          {
            name: '_to',
            type: 'address',
          },
          {
            name: '_value',
            type: 'uint256',
          },
        ],
        name: 'transfer',
        outputs: [
          {
            name: '',
            type: 'bool',
          },
        ],
        type: 'function',
      },
    ];
    // Create contract instance
    const tokenContract = new web3.eth.Contract(tokenAbi, tokenContractAddress);

    const amountToSend = await web3.utils
      .toBN(web3.utils.toWei(amount, 'ether'))
      .div(web3.utils.toBN(10).pow(web3.utils.toBN(18 - tokenDecimals)));
    const tx = {
      from: senderAddress,
      to: tokenContractAddress,
      data: tokenContract.methods
        .transfer(receiverAddress, amountToSend)
        .encodeABI(),
      gas: 200000,
    };
    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      destructPrivateKey
    );

    const trx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('trx', trx);
    return trx?.transactionHash;
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.log('error', error);
  }
}

// USDTERC20 WITHDRAW

async function createUSDTERC20Withdraw(req, res, privateKey) {
  const destructPrivateKey = privateKey.dataValues.privateKey;
  try {
    const { senderAddress, receiverAddress, amount } = req.body;

    const tokenContractAddress = '0x10cc8B8910F149ae4Cf81859d05dCDD34b792F7b';
    const tokenDecimals = 18; // The number of decimals used by the token
    // Initialize Web3 instance
    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        'https://empty-muddy-replica.ethereum-sepolia.quiknode.pro/e283e52f6ddd6eb45e91e745c31c5e2913975de0/'
      )
    );
    // ERC-20 token ABI
    const tokenAbi = [
      {
        constant: false,
        inputs: [
          {
            name: '_to',
            type: 'address',
          },
          {
            name: '_value',
            type: 'uint256',
          },
        ],
        name: 'transfer',
        outputs: [
          {
            name: '',
            type: 'bool',
          },
        ],
        type: 'function',
      },
    ];
    // Create contract instance
    const tokenContract = new web3.eth.Contract(tokenAbi, tokenContractAddress);

    const amountToSend = await web3.utils
      .toBN(web3.utils.toWei(amount, 'ether'))
      .div(web3.utils.toBN(10).pow(web3.utils.toBN(18 - tokenDecimals)));
    const tx = {
      from: senderAddress,
      to: tokenContractAddress,
      data: tokenContract.methods
        .transfer(receiverAddress, amountToSend)
        .encodeABI(),
      gas: 200000,
    };
    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      destructPrivateKey
    );

    const trx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('trx', trx);
    return trx?.transactionHash;
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.log('error', error);
  }
}

// USDC BSC WITHDRAW
async function createUSDCBSCWithdraw(req, res, privateKey) {
  const destructPrivateKey = privateKey.dataValues.privateKey;
  try {
    const { senderAddress, receiverAddress, amount } = req.body;

    const tokenContractAddress = '0x10cc8b8910f149ae4cf81859d05dcdd34b792f7b';
    const tokenDecimals = 18; // The number of decimals used by the token
    // Initialize Web3 instance
    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        'https://snowy-flashy-log.bsc-testnet.quiknode.pro/bf2dacbef1edf1ce2e4982dd520ff7aa4df16c1a/'
      )
    );
    // ERC-20 token ABI
    const tokenAbi = [
      {
        constant: false,
        inputs: [
          {
            name: '_to',
            type: 'address',
          },
          {
            name: '_value',
            type: 'uint256',
          },
        ],
        name: 'transfer',
        outputs: [
          {
            name: '',
            type: 'bool',
          },
        ],
        type: 'function',
      },
    ];
    // Create contract instance
    const tokenContract = new web3.eth.Contract(tokenAbi, tokenContractAddress);

    const amountToSend = await web3.utils
      .toBN(web3.utils.toWei(amount, 'ether'))
      .div(web3.utils.toBN(10).pow(web3.utils.toBN(18 - tokenDecimals)));
    const tx = {
      from: senderAddress,
      to: tokenContractAddress,
      data: tokenContract.methods
        .transfer(receiverAddress, amountToSend)
        .encodeABI(),
      gas: 200000,
    };
    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      destructPrivateKey
    );

    const trx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('trx', trx);
    return trx?.transactionHash;
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.log('error', error);
  }
}

// USDT BSC WITHDRAW
async function createUSDTBSCWithdraw(req, res, privateKey) {
  const destructPrivateKey = privateKey.dataValues.privateKey;
  try {
    const { senderAddress, receiverAddress, amount } = req.body;

    const tokenContractAddress = '0x3fa2529b98ca9c414d66f85e62f450ebf3b7dd80';
    const tokenDecimals = 18; // The number of decimals used by the token
    // Initialize Web3 instance
    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        'https://snowy-flashy-log.bsc-testnet.quiknode.pro/bf2dacbef1edf1ce2e4982dd520ff7aa4df16c1a/'
      )
    );
    // ERC-20 token ABI
    const tokenAbi = [
      {
        constant: false,
        inputs: [
          {
            name: '_to',
            type: 'address',
          },
          {
            name: '_value',
            type: 'uint256',
          },
        ],
        name: 'transfer',
        outputs: [
          {
            name: '',
            type: 'bool',
          },
        ],
        type: 'function',
      },
    ];
    // Create contract instance
    const tokenContract = new web3.eth.Contract(tokenAbi, tokenContractAddress);

    const amountToSend = await web3.utils
      .toBN(web3.utils.toWei(amount, 'ether'))
      .div(web3.utils.toBN(10).pow(web3.utils.toBN(18 - tokenDecimals)));
    const tx = {
      from: senderAddress,
      to: tokenContractAddress,
      data: tokenContract.methods
        .transfer(receiverAddress, amountToSend)
        .encodeABI(),
      gas: 200000,
    };
    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      destructPrivateKey
    );

    const trx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('trx', trx);
    return trx?.transactionHash;
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.log('error', error);
  }
}

// USDC POLYGON WITHDRAW
async function createUSDCPOLYGONWithdraw(req, res, privateKey) {
  const destructPrivateKey = privateKey.dataValues.privateKey;
  try {
    const { senderAddress, receiverAddress, amount } = req.body;

    const tokenContractAddress = '0xB2eE34A36c7e4593A1DB6F581304dd04cC896446';
    const tokenDecimals = 18; // The number of decimals used by the token
    // Initialize Web3 instance
    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        'https://soft-capable-tab.matic-amoy.quiknode.pro/3b3c38c1c99fc87be05f8600e58488002f3a5c67/'
      )
    );
    // ERC-20 token ABI
    const tokenAbi = [
      {
        constant: false,
        inputs: [
          {
            name: '_to',
            type: 'address',
          },
          {
            name: '_value',
            type: 'uint256',
          },
        ],
        name: 'transfer',
        outputs: [
          {
            name: '',
            type: 'bool',
          },
        ],
        type: 'function',
      },
    ];
    // Create contract instance
    const tokenContract = new web3.eth.Contract(tokenAbi, tokenContractAddress);

    const amountToSend = await web3.utils
      .toBN(web3.utils.toWei(amount, 'ether'))
      .div(web3.utils.toBN(10).pow(web3.utils.toBN(18 - tokenDecimals)));
    const tx = {
      from: senderAddress,
      to: tokenContractAddress,
      data: tokenContract.methods
        .transfer(receiverAddress, amountToSend)
        .encodeABI(),
      gas: 200000,
    };
    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      destructPrivateKey
    );

    const trx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('trx', trx);
    return trx?.transactionHash;
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.log('error', error);
  }
}

// USDT POLYGON WITHDRAW
async function createUSDTPOLYGONWithdraw(req, res, privateKey) {
  const destructPrivateKey = privateKey.dataValues.privateKey;
  try {
    const { senderAddress, receiverAddress, amount } = req.body;

    const tokenContractAddress = '0xB25E4a0e4805d363E71EE0621449fd8B3135b928';
    const tokenDecimals = 18; // The number of decimals used by the token
    // Initialize Web3 instance
    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        'https://soft-capable-tab.matic-amoy.quiknode.pro/3b3c38c1c99fc87be05f8600e58488002f3a5c67/'
      )
    );
    // ERC-20 token ABI
    const tokenAbi = [
      {
        constant: false,
        inputs: [
          {
            name: '_to',
            type: 'address',
          },
          {
            name: '_value',
            type: 'uint256',
          },
        ],
        name: 'transfer',
        outputs: [
          {
            name: '',
            type: 'bool',
          },
        ],
        type: 'function',
      },
    ];
    // Create contract instance
    const tokenContract = new web3.eth.Contract(tokenAbi, tokenContractAddress);

    const amountToSend = await web3.utils
      .toBN(web3.utils.toWei(amount, 'ether'))
      .div(web3.utils.toBN(10).pow(web3.utils.toBN(18 - tokenDecimals)));
    const tx = {
      from: senderAddress,
      to: tokenContractAddress,
      data: tokenContract.methods
        .transfer(receiverAddress, amountToSend)
        .encodeABI(),
      gas: 200000,
    };
    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      destructPrivateKey
    );

    const trx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('trx', trx);
    return trx?.transactionHash;
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.log('error', error);
  }
}

// BTC WITHDRAW
async function createBTCWithdraw(req, res, foundAddress) {
  try {
    const { senderAddress, receiverAddress, amount } = req.body;
    const mne = foundAddress?.Mnemonic?.mnemonic;
    const testnet = bitcoin.networks.testnet;
    const seed = await bip39.mnemonicToSeed(foundAddress?.Mnemonic?.mnemonic);
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(seed, testnet);
    const path = `m/44'/0'/0'/0/0`;
    const child = root.derivePath(path);
    const privateKeyBuffer = child.privateKey;
    // const privateKeyHex = privateKeyBuffer.toString("hex");
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
    if (!result?.result) {
      res.status(500).send({ error: result?.error?.message });
    }
    return result.result;
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}
async function broadcastTransaction(transactionHex) {
  const response = await fetch(
    'https://maximum-icy-surf.btc-testnet.quiknode.pro/f724ad3b2e0cbb6368dbb00bb1f9750dd7139c06/',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'sendrawtransaction',
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
  const base_url = 'https://api.blockcypher.com/v1/btc/test3';
  const keyPair = ECPair.fromWIF(privateKeyWIF, network);
  const psbt = new bitcoin.Psbt({ network: network });
  const utxosResponse = await axios.get(
    `${base_url}/addrs/${senderAddress}?unspentOnly=true`
  );
  const utxos = utxosResponse.data.txrefs;
  if (!Array.isArray(utxos) || utxos.length === 0) {
    throw new Error('No unspent transaction outputs (UTXOs) available');
  }
  let totalAmountAvailable = 0;
  let inputCount = 0;
  for (const utxo of utxos) {
    totalAmountAvailable += utxo.value;
    inputCount += 1;
    if (totalAmountAvailable >= satoshiToSend) break;
  }
  if (totalAmountAvailable < satoshiToSend) {
    throw new Error('Balance is too low for this transaction');
  }
  const fee = calculateFee(inputCount, 2); // 1 input, 2 outputs
  if (totalAmountAvailable < satoshiToSend + fee) {
    throw new Error(
      'Balance is too low for this transaction with the fee included'
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
      nonWitnessUtxo: Buffer.from(utxo.hex, 'hex'),
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
