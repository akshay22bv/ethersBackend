const TronWeb = require('tronweb');
const models = require('../models/index');
const { WalletAddress, SubWalletAddress } = models;

async function getUsdcTRONBalance(req, res) {
  try {
    const contractAddress = 'TU2T8vpHZhCNY8fXGVaHyeZrKm8s6HEXWe';
    const { walletAddress } = req.params;
    // const walletAddress = 'TKEn1aRVHS43niR7fFsFP7PmiPntFw1SvD';
    const assetId = 'USDC_TRON';
    let getAddress = [];
    const foundAddress = await WalletAddress.findOne({
      where: {
        address: walletAddress,
        assetId,
      },
    });

    if (foundAddress) {
      getAddress.push(foundAddress.dataValues);
    } else {
      const subWalletAddress = await SubWalletAddress.findOne({
        where: {
          address: walletAddress,
          assetId,
        },
      });

      if (subWalletAddress) {
        getAddress.push(subWalletAddress.dataValues);
      }
    }
    let orgPrivateKey = '';
    for (const getFinalAdd of getAddress) {
      orgPrivateKey = getFinalAdd.privateKey;
    }
    const rawPrivateKey = orgPrivateKey;
    let slicedKey = '';
    if (rawPrivateKey.startsWith('0x')) {
      slicedKey = rawPrivateKey.slice(2);
    }

    const tronWeb = new TronWeb({
      fullHost: 'https://nile.trongrid.io/',
      privateKey: slicedKey,
    });
    const contract = await tronWeb.contract().at(contractAddress);
    const balance = await contract.methods.balanceOf(walletAddress).call();
    const finalBalance = balance / 1e6;

    console.log(`USDC(TRON) Balance ${finalBalance}`);

    res.json({
      success: true,
      message: 'Fetched USDC(TRON) balance Successfully',
      body: { finalBalance },
    });
  } catch (error) {
    console.error('Error getting USDC(TRON) balance:', error);
  }
}

// getUsdcTRONBalance();

module.exports = {
  getUsdcTRONBalance,
};
