var Web3 = require('web3');
const { ethers } = require('ethers');

// eth balance
async function getBalanceUSDT(req, res) {
  try {
    const { walletAddress } = req.params;
    const minABI = [
      // balanceOf
      {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function',
      },
    ];
    const endpointUrl =
      'https://neat-lively-meadow.ethereum-sepolia.quiknode.pro/d9a99abec980322333dd34b02caf53b996a114d1/';
    const httpProvider = new Web3.providers.HttpProvider(endpointUrl);
    const web3Client = new Web3(httpProvider);
    const tokenAddress = '0x10cc8B8910F149ae4Cf81859d05dCDD34b792F7b';
    const contract = new web3Client.eth.Contract(minABI, tokenAddress);
    const result = await contract.methods.balanceOf(walletAddress).call();

    const resultInEther = web3Client.utils.fromWei(result, 'ether');

    console.log(`Balance: ${resultInEther}`);
    
    res.json({
      success: true,
      message: 'Fetched USDT balance Successfully',
      body: { resultInEther },
    });
  } catch (error) {
    console.log('failed to get USDT balance ', error);
  }
}

module.exports = {
  getBalanceUSDT,
};
