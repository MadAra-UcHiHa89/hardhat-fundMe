const {
  networkConfig,
  developmentChains,
} = require('../helper-hardhat-config');
const { network, run } = require('hardhat');
const { verify } = require('../utils/verify');
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts(); // getNamedAccounts returns the accounts with the names you defined in the hardhat.config.js file, since instead of remembering accounts with private keys, ew can assign names to account and whenever we cant to use that account we can refer to it with the name assigned
  const chainId = network.config.chainId;
  // console.log(chainId);
  // console.log(network.config);

  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    // i.e if the network is local hardhat development network or local hardhat node, then the price feed aggregator contract has been deployed locally and is a mock contract, so to get its address
    // we'll use the deployments.get("ContractName") method to get the address of the contract deployed locally
    MockV3AggregatorContract = await deployments.get('MockV3Aggregator'); // returns the  the contract deployed locally
    ethUsdPriceFeedAddress = MockV3AggregatorContract.address;
  } else {
    // => We are deploying to a testnet or mainnet, so the price feed aggregator contract is deployed on the network and is not a mock contract,
    // so its address is already available in the networkConfig object, we'll use the networkConfig object to get the address of the price feed aggregator contract
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }
  // with hardhat-deploy we do not need contract Factories for deployment , instead we have the, deploy function which takes the contract name and an object containing overrides/ parameters like the constructor parameters , from ,etc
  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy('FundMe', {
    from: deployer, // the account which is deploying the contract
    args:
      /* address of price feed contract*/
      args,

    log: true, // Will log onto the console the address of the deployed contract , txn hash and the block number
    waitConfirmations: network.config.blockConfirmations || 1, // Number of block confirmations to wait for the txn to be mined
  });
  console.log('Deployed contract at address: ', fundMe.address);
  console.log('----------------------------------------------------');
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // Only verify if the network is not a development network and if the ETHERSCAN_API_KEY is set in the environment variables
    await verify(fundMe.address, args);
  }
};

module.exports.tags = ['all', 'fundMe']; // tags are used to group tests together in the test runner ,here for groupong deployments
