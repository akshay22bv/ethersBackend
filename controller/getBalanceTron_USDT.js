var Web3 = require('web3');

// USDCERC20 balance
async function getBalanceTron_USDT(req, res) {
  try {
    // const { walletAddress } = req.params;
    const walletAddress = 'TX3iiHiE7KNQfCRRNJJPKkxrur6P1h2qLD';

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
      'https://fittest-few-isle.matic-amoy.quiknode.pro/0b7d93d6ccc97c5a2f959c5fedd5ac36bec4eb91/';
    const httpProvider = new Web3.providers.HttpProvider(endpointUrl);
    const web3Client = new Web3(httpProvider);
    const tokenAddress = 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs';
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
getBalanceTron_USDT();
// module.exports = {
//   getBalanceBSC_USDC,
// };
