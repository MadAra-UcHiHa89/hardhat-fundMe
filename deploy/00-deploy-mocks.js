const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");
module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config;
  console.log(chainId);

  //   Only deploy the contract if the current network is local hardhat development network or local hardhat node
  if (developmentChains.includes(network.name)) {
    // Then we'll deploy the contract
    console.log("Local Dveleopment detected, deploying contract....");
    const deplyedContract = await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      args: [DECIMALS, INITIAL_ANSWER], // constructor arguments FOR aggregator contract
      log: true,
    });
    console.log("Deployed contract at address: ", deplyedContract.address);
    console.log("----------------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"]; // tags are used to group tests together in the test runner
// npx hardhat deploy --tags nameOfTag -> Will only deploy those contracts which have the tag nameOfTag , exported in their deploy scripts
