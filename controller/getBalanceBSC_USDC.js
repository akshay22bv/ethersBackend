var Web3 = require('web3');

// USDCERC20 balance
async function getBalanceBSC_USDC(req, res) {
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
    const endpointUrl =
      'https://cool-yolo-glade.bsc-testnet.quiknode.pro/f45ac7f0831fba65b2d79eda0c6c1150f7a7843c/';
    const httpProvider = new Web3.providers.HttpProvider(endpointUrl);
    const web3Client = new Web3(httpProvider);
    const tokenAddress = '0x10cc8b8910f149ae4cf81859d05dcdd34b792f7b';
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
getBalanceBSC_USDC();
// module.exports = {
//   getBalanceBSC_USDC,
// };
