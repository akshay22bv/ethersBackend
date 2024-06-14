//BSC
// const web3_bsc = new Web3("https://bsc-dataseed1.binance.org:443");
// var bscWallet = web3_bsc.eth.accounts.privateKeyToAccount(privateKey);
// console.log("BSC Address ", bscWallet);
//Polygon
// const web3_polygon = new Web3("https://polygon-rpc.com");
// var polygonWallet =
//   web3_polygon.eth.accounts.privateKeyToAccount(privateKey);
// console.log("Polygon Address ", polygonWallet);
//End
// const walletAddresses = [
//   { walletId, privateKey, publicKey, address: address, assetId: "BTC" },
//   { walletId, privateKey, publicKey, address: ethAddress, assetId: "ETH" },
//   { walletId, privateKey, publicKey, address: ethAddress, assetId: "USDC" },
//   {
//     walletId,
//     privateKey: trxWallet.privateKey,
//     publicKey: trxWallet.publicKey,
//     address: trxWallet.address.base58,
//     assetId: "USDC_TRON",
//   },
//   {
//     walletId,
//     privateKey,
//     publicKey,
//     address: ethAddress,
//     assetId: "USDT_ERC20",
//   },
//   {
//     walletId,
//     privateKey: bscWallet.privateKey,
//     publicKey,
//     address: bscWallet.address,
//     assetId: "USDC_BSC",
//   },
//   {
//     walletId,
//     privateKey: polygonWallet.privateKey,
//     publicKey,
//     address: polygonWallet.address,
//     assetId: "USDC_POLYGON",
//   },
//   {
//     walletId,
//     privateKey: trxWallet.privateKey,
//     publicKey: trxWallet.publicKey,
//     address: trxWallet.address.base58,
//     assetId: "USDC_TRON",
//   },
//   {
//     walletId,
//     privateKey: bscWallet.privateKey,
//     publicKey,
//     address: bscWallet.address,
//     assetId: "USDT_BSC",
//   },
//   {
//     walletId,
//     privateKey: polygonWallet.privateKey,
//     publicKey,
//     address: polygonWallet.address,
//     assetId: "USDT_POLYGON",
//   },
// ];
// const existingAddresses = await WalletAddress.findAll({
//   where: {
//     address: walletAddresses.map((addr) => addr.address),
//   },
// });
// Filter addresses that do not exist
// const newAddresses = walletAddresses.filter(
//   (addr) =>
//     !existingAddresses.some((existing) => existing.address === addr.address)
// );
// const createMnemonic = await Mnemonic.create({
//   walletId: walletId,
//   mnemonic: mnemonicGen,
//   privateKey: privateKey,
//   publicKey: publicKey,
//   walletName: "defi_stack_" + walletId,
// });
// if (!createMnemonic) {
//   throw new Error("Failed to create mnemonic record");
// }
// const createWalletAddresses = await WalletAddress.bulkCreate(newAddresses);
// console.log("Mnemonic and Wallet Addresses Created Successfully");
// res.json({
//   success: true,
//   message: "Mnemonic and Wallet Addresses Created Successfully",
//   body: { createMnemonic, createWalletAddresses },
// });
