const networkConfig = {
  4: {
    name: 'rinkeby',
    ethUsdPriceFeed: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
  },
  137: {
    name: 'polygon',
    ethUsdPriceFeed: '0x0715A7794a1dc8e42615F059dD6e406A6594651A', // contract address of eth to usd price feed on polygon Mumbai testnet
  },
  31337: {
    name: 'hardhat',
    ethUsdPriceFeed: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
  },
  5: {
    name: 'goreli',
    ethUsdPriceFeed: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
  },
};

const developmentChains = ['hardhat', 'localhost']; // Array of chains / networks which are for development , used to check if we are deploying to development chain or testnet/mainnet
const DECIMALS = '8'; // for the contructor argument of mock aggregator contract
const INITIAL_ANSWER = 200000000000; // SINCE 8 DECIMAL PLACES , == 2000.00000000

module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER };
