exports.NETWORK = "sepolia";
exports.YOUR_ALCHEMY_API_KEY = "FnbPX4D_sSeepjDUfpRq52RdKc_cgaMC";

exports.CURRENCY = {
  BTC: "BTC",
  ETH: "ETH",

  USDC_TRC20: "USDC_TRC20",
  USDT_TRC20: "USDT_TRC20",

  USDC_ERC20: "USDC_ERC20",
  USDT_ERC20: "USDT_ERC20",

  USDC_BSC: "USDC_BSC",
  USDT_BSC: "USDT_BSC",

  USDC_POLYGON: "USDC_POLYGON",
  USDT_POLYGON: "USDT_POLYGON",
};

exports.CONTRACT_ADDRESSES = {
  USDC_ERC20: "0xB2eE34A36c7e4593A1DB6F581304dd04cC896446",
  USDT_ERC20: "0x10cc8B8910F149ae4Cf81859d05dCDD34b792F7b",
};

exports.ABI = [
  // Minimal ABI to get ERC20 Token balance
  "function balanceOf(address owner) view returns (uint256)",
];
