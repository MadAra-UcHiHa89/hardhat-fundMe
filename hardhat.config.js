require('dotenv').config({ path: __dirname + '/.env' });

require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-waffle');
require('hardhat-gas-reporter');
require('solidity-coverage');
require('hardhat-deploy');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const RINKEBY_RPC_URL =
  process.env.RINKEBY_RPC_URL ||
  'https://rinkeby./justToNotMakeHardhatThrowAnError';
const GORELI_RPC_URL =
  process.env.GORELI_RPC_URL ||
  'https://rinkeby./justToNotMakeHardhatThrowAnError';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x0';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'key';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || 'key';
module.exports = {
  // solidity: "0.8.4",
  // To be able to compile contracts of differnet solidity versions, you need to
  solidity: {
    compilers: [{ version: '0.8.8' }, { version: '0.6.6' }],
  },
  networks: {
    // ropsten: {
    //   url: process.env.ROPSTEN_URL || "",
    //   accounts:
    //     process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    // },
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      blockConfirmations: 4, // confirmations needed to be mined before txn is considered mined,
      chainId: 4,
    },
    goreli: {
      url: GORELI_RPC_URL,
      accounts: [PRIVATE_KEY],
      blockConfirmations: 4, // confirmations needed to be mined before txn is considered mined,
      chainId: 5,
    },
    localhost: {
      url: process.env.LOCALHOST_URL || '',
      accounts: [process.env.LocalHostAccount],
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: 'gas-reporter.txt',
    noColors: true, // since when output is in a file colours mess up
    currency: 'USD', // in Which currency we want the txn amount in
    // coinmarketcap: COINMARKETCAP_API_KEY,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    // sytax:  nameOfAccount: { default: indexOfAccoutFromAccountsArray }
    deployer: {
      default: 0, // => 0th index of accounts array has the name "deployer"
      // We can change the account which has the deployer name for different networks/chains
      // i.e chainId: indexOfAccountFromAccountsArray
      // 4: 1, // => 1st index of accounts array has the name "deployer" for the Rinkeby network
    },
  },
};
