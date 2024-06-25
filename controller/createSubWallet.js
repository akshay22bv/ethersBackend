const bip39 = require('bip39');
const { HDNode } = require('ethers/lib/utils');
const bitcoin = require('bitcoinjs-lib');
const BIP32Factory = require('bip32').default;
const ecc = require('tiny-secp256k1');
const TronWeb = require('tronweb');
var Web3 = require('web3');
const { ethers } = require('ethers');
require('dotenv').config();
const models = require('../models/index');
const { SubWalletName, SubWalletAddress } = models;
// const mnemonicGen = `${process.env.MASTER_MNEMONIC}`;
const mnemonicGen =
  'wish device moment funny session emerge scare pyramid have impact guitar wonder';
const masterNode = ethers.utils.HDNode.fromMnemonic(mnemonicGen);

// const COIN_TYPES = {
//   ETH: 60,
//   USDC_ERC20: 60,
//   USDT_ERC20: 60,
//   USDC_BSC: 60,
//   USDT_BSC: 60,
//   USDC_TRC20: 195,
//   USDT_TRC20: 195,
//   BTC: 0,
//   USDT_POLYGON: 60,
//   USDC_POLYGON: 60,
// };
// Create Multi Currency Wallet

async function createSubHDwallet(req, res) {
  try {
    const { walletId } = req.params;
    console.log('walletId', walletId);

    const countSubWallets = await SubWalletName.count({
      where: { walletId },
    });

    // Determine the next subWalletId
    const subWalletId = countSubWallets + 1;

    //ETHEREUM
    const pathETH = `m/44'/60'/${walletId}'/0/${subWalletId}`;
    const wallet = masterNode.derivePath(pathETH);
    const ethAddress = wallet.address;
    const ethPublicKey = wallet.publicKey;
    const ethPrivateKey = wallet.privateKey;

    //BITCOIN
    const testnet = bitcoin.networks.testnet;
    const seed = await bip39.mnemonicToSeed(mnemonicGen);
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(seed, testnet);
    let pathBTC;
    pathCount = 0;
    pathBTC = `m/44'/0'/${walletId}'/0/${subWalletId}`;
    const child = root.derivePath(pathBTC);
    const { address } = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: bitcoin.networks.testnet,
    });
    const btcprivateKey = child.privateKey.toString('hex');
    const btcpublicKey = child.publicKey.toString('hex');

    //TRON
    const HttpProvider = TronWeb.providers.HttpProvider;
    const fullNode = new HttpProvider('https://api.trongrid.io');
    const solidityNode = new HttpProvider('https://api.trongrid.io');
    const eventServer = new HttpProvider('https://api.trongrid.io');
    const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
    const trxResult = tronWeb.fromMnemonic(
      mnemonicGen,
      `m/44'/195'/${walletId}'/0/${subWalletId}`
    );
    const trxpublicKey = trxResult.publicKey;
    const trxAddress = trxResult.address;
    const trxprivateKey = trxResult.privateKey;

    //BSC
    const web3_bsc = new Web3('https://bsc-dataseed1.binance.org:443');
    var bscWallet = web3_bsc.eth.accounts.privateKeyToAccount(
      wallet.privateKey
    );
    const bscprivateKey = bscWallet.privateKey;
    const bscAddress = bscWallet.address;

    //Polygon
    const web3_polygon = new Web3('https://polygon-rpc.com');
    var polygonWallet = web3_polygon.eth.accounts.privateKeyToAccount(
      wallet.privateKey
    );
    const polygonprivateKey = polygonWallet.privateKey;
    const polygonAddress = polygonWallet.address;
    //End

    const subWalletAddresses = [
      {
        walletId,
        subWalletId,
        privateKey: ethPrivateKey,
        publicKey: ethPublicKey,
        address: ethAddress,
        assetId: 'ETH',
      },
      {
        walletId,
        subWalletId,
        privateKey: btcprivateKey,
        publicKey: btcpublicKey,
        address: address,
        assetId: 'BTC',
      },
      {
        walletId,
        subWalletId,
        privateKey: ethPrivateKey,
        publicKey: ethPublicKey,
        address: ethAddress,
        assetId: 'USDC',
      },
      {
        walletId,
        subWalletId,
        privateKey: ethPrivateKey,
        publicKey: ethPublicKey,
        address: ethAddress,
        assetId: 'USDT_ERC20',
      },
      {
        walletId,
        subWalletId,
        privateKey: trxprivateKey,
        publicKey: trxpublicKey,
        address: trxAddress,
        assetId: 'USDT_TRON',
      },
      {
        walletId,
        subWalletId,
        privateKey: trxprivateKey,
        publicKey: trxpublicKey,
        address: trxAddress,
        assetId: 'USDC_TRON',
      },
      {
        walletId,
        subWalletId,
        privateKey: bscprivateKey,
        publicKey: ethPublicKey,
        address: bscAddress,
        assetId: 'USDC_BSC',
      },
      {
        walletId,
        subWalletId,
        privateKey: bscprivateKey,
        publicKey: ethPublicKey,
        address: bscAddress,
        assetId: 'USDT_BSC',
      },
      {
        walletId,
        subWalletId,
        privateKey: polygonprivateKey,
        publicKey: ethPublicKey,
        address: polygonAddress,
        assetId: 'USDC_POLYGON',
      },
      {
        walletId,
        subWalletId,
        privateKey: polygonprivateKey,
        publicKey: ethPublicKey,
        address: polygonAddress,
        assetId: 'USDT_POLYGON',
      },
    ];

    const existingAddresses = await SubWalletAddress.findAll({
      where: {
        address: subWalletAddresses.map((addr) => addr.address),
      },
    });

    // Filter addresses that do not exist
    const newAddresses = subWalletAddresses.filter(
      (addr) =>
        !existingAddresses.some((existing) => existing.address === addr.address)
    );

    const createWalletName = await SubWalletName.create({
      walletId,
      subWalletId,
    });

    const createSubWalletAddresses = await SubWalletAddress.bulkCreate(
      newAddresses
    );

    res.json({
      success: true,
      message: 'Wallet Name and Wallet Addresses Created Successfully',
      body: { createWalletName, createSubWalletAddresses },
    });
  } catch (error) {
    console.log('failed to create wallet', error);
  }
}

async function getAllWalleName(req, res) {
  try {
    const { walletId } = req.params;

    const subWalletName = await SubWalletName.findAll({
      where: { walletId },
      exclude: ['createdAt', 'updatedAt', 'deletedAt'],
    });

    return res.status(200).json({ subWalletName });
  } catch (error) {
    console.error('Failed to get all Wallet Name:', error);
    return res.status(500).json({ error: 'Failed to get all Wallet Name' });
  }
}

async function getSubWalletAddress(req, res) {
  try {
    const { walletId, subWalletId } = req.params;

    const walletName = await SubWalletAddress.findAll({
      where: { walletId, subWalletId },
    });

    return res.status(200).json({ walletName });
  } catch (error) {
    console.error('Failed to get Wallet Name:', error);
    return res.status(500).json({ error: 'Failed to get Wallet Name' });
  }
}

module.exports = {
  createSubHDwallet,
  getAllWalleName,
  getSubWalletAddress,
};
