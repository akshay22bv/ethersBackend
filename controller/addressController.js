// controllers/walletController.js
const bip39 = require("bip39");
const BIP32Factory = require("bip32").default;
const bitcoin = require("bitcoinjs-lib");
const models = require("../models/index");
const { Mnemonics, Wallet } = models; // Assuming Wallet model is defined

const TronWeb = require("tronweb");
const Web3 = require("web3");
const { CURRENCY } = require("../helper/CONSTANTS");
const { HDNode } = require("ethers/lib/utils");

async function createAddress(req, res) {
  try {
    const { mnemonicId, currency } = req.params;

    const foundMnemonic = await Mnemonics.findOne({
      where: { id: mnemonicId },
    });

    if (!foundMnemonic) {
      throw new Error("Mnemonic not found");
    }

    const mnemonic = foundMnemonic.mnemonic;

    // Generate seed from mnemonic
    const seed = await bip39.mnemonicToSeed(mnemonic);

    const lastWallet = await Wallet.findOne({
      where: { mnemonic: mnemonicId, currency },
      order: [["path", "DESC"]],
      limit: 1,
      include: [{ model: Mnemonics }],
    });

    let pathCount = lastWallet ? Number(lastWallet?.path) + 1 : 0;

    // Derive private key using BIP32
    const testnet = bitcoin.networks.testnet;
    const bip32 = BIP32Factory(require("tiny-secp256k1"));
    const root = bip32.fromSeed(seed, testnet);
    const child = root.derivePath(`m/44'/60'/0'/0/${pathCount}`); // Ethereum derivation path
    let address, privateKey, publicKey;
    privateKey = child.privateKey.toString("hex");

    if (currency === CURRENCY.BTC) {
      const { address: btc_address } = bitcoin.payments.p2pkh({
        pubkey: child.publicKey,
        network: bitcoin.networks.testnet,
      });

      if (!btc_address) {
        res.status(500).json({
          error: `Failed to getnerate ${currency} address`,
        });
      }

      address = btc_address;
    }

    // USDC_ERC20   || USDT_ERC20  ||  ETH
    if (
      currency === CURRENCY.USDC_ERC20 ||
      currency === CURRENCY.USDT_ERC20 ||
      currency === CURRENCY.ETH
    ) {
      const hdNode = HDNode.fromMnemonic(foundMnemonic.mnemonic);

      const path = `m/44'/60'/0'/0/${pathCount}`;
      const derivedNode = hdNode.derivePath(path);

      if (!derivedNode) {
        res.status(500).json({
          error: `Failed to getnerate ${currency} address`,
        });
      }

      const {
        privateKey: pr_key,
        publicKey: pu_key,
        address: assetAddress,
      } = derivedNode;
      address = assetAddress;
      privateKey = pr_key;
      publicKey = pu_key;
    }

    // USDT_TRC20  ||  USDC_TRC20
    if (currency === CURRENCY.USDT_TRC20 || currency === CURRENCY.USDC_TRC20) {
      const tronHttpProvider = new TronWeb.providers.HttpProvider(
        "https://api.trongrid.io"
      );

      const tronWeb = new TronWeb(
        tronHttpProvider,
        tronHttpProvider,
        tronHttpProvider
      );

      address = tronWeb.address.fromPrivateKey(privateKey);

      if (!address) {
        res.status(500).json({
          error: `Failed to getnerate ${currency} address`,
        });
      }
    }

    // USDC_POLYGON || USDT_POLYGON
    if (
      currency === CURRENCY.USDC_POLYGON ||
      currency === CURRENCY.USDT_POLYGON
    ) {
      const polygonWeb3 = new Web3("https://polygon-rpc.com");
      const polygonAccount =
        polygonWeb3.eth.accounts.privateKeyToAccount(privateKey);

      if (!polygonAccount.address) {
        res.status(500).json({
          error: `Failed to getnerate ${currency} address`,
        });
      }

      address = polygonAccount.address;
    }

    // USDC_BSC   ||  USDT_BSC
    if (currency === CURRENCY.USDC_BSC || currency === CURRENCY.USDT_BSC) {
      const bscWeb3 = new Web3("https://bsc-dataseed1.binance.org:443");
      const bscAccount = bscWeb3.eth.accounts.privateKeyToAccount(privateKey);

      if (!bscAccount.address) {
        res.status(500).json({
          error: `Failed to getnerate ${currency} address`,
        });
      }

      address = bscAccount.address;
    }

    // Store addresses in database
    const createdWallet = await Wallet.create({
      currency,
      address,
      balance: 0,
      mnemonic: mnemonicId,
      path: pathCount,
      publicKey,
      privateKey,
    });

    if (!createdWallet) {
      res.status(500).json({
        error: "Failed to save address",
      });
    }

    res.json({
      success: true,
      body: {
        address,
      },
      message: `Address for ${currency} successfully created`,
    });
  } catch (error) {
    console.error("Failed to create wallets:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function getAddressByMnemonic(req, res) {
  const { mnemonicId, currency } = req.params;
  try {
    const addresses = await Wallet.findAll({
      where: {
        mnemonic: mnemonicId,
        currency,
      },
      order: [["updatedAt", "DESC"]],
    });

    res.json({ message: "success", body: { addresses } });
  } catch (error) {
    throw new Error("Addresses fetch failed");
  }
}

module.exports = {
  createAddress,
  getAddressByMnemonic,
};
