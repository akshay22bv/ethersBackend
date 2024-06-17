var Web3 = require('web3');

// USDCERC20 balance
async function getBalanceTRON_USDC(req, res) {
  try {
    // const { walletAddress } = req.params;
    const walletAddress = '0xCA78D52aC719Ce90610AF8845A282FE50F5840aC';

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
    const endpointUrl = 'https://api.trongrid.io/jsonrpc';
    const httpProvider = new Web3.providers.HttpProvider(endpointUrl);
    const web3Client = new Web3(httpProvider);
    const tokenAddress = '0xB2eE34A36c7e4593A1DB6F581304dd04cC896446';
    const contract = new web3Client.eth.Contract(minABI, tokenAddress);
    const result = await contract.methods.balanceOf(walletAddress).call();
    const resultInEther = web3Client.utils.fromWei(result, 'ether');
    console.log('resultInEther', resultInEther);
    // res.json({
    //   success: true,
    //   message: 'Fetched USDCERC20 balance Successfully',
    //   body: { resultInEther },
    // });
  } catch (error) {
    console.log('failed to get USDCERC20 balance ', error);
  }
}
getBalanceTRON_USDC();
// module.exports = {
//   getBalanceBSC_USDC,
// };
