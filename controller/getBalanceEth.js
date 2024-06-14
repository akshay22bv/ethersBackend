var Web3 = require("web3");
const { ethers } = require("ethers");

// eth balance
async function getBalanceETH(req, res) {
  try {
    const { walletAddress } = req.params;
    console.log("walletAddress: ", walletAddress);
    // const walletAddress = '0xCA78D52aC719Ce90610AF8845A282FE50F5840aC';
    const testnet =
      "https://neat-lively-meadow.ethereum-sepolia.quiknode.pro/d9a99abec980322333dd34b02caf53b996a114d1/";
    const web3 = new Web3(new Web3.providers.HttpProvider(testnet));
    const balance = web3.eth.getBalance(walletAddress);
    const etherAmount = ethers.utils.formatEther(await balance);
    res.json({
      success: true,
      message: "Fetched ETH balance Successfully",
      body: { etherAmount },
    });
  } catch (error) {
    console.log("failed to get ETH balance ", error);
  }
}

module.exports = {
  getBalanceETH,
};
