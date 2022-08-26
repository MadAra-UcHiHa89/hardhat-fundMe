// Staging tests are run for contracts deployed on a testnet
const { assert } = require('chai');
const { getNamedAccounts, ethers, network } = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config');

// Only run staging tests on testnet
!developmentChains.includes(network.name)
  ? describe('FundMe', function () {
      let fundMe;
      let deployer;
      const sendValue = ethers.utils.parseEther('1');
      beforeEach(async function () {
        // getting the deployer and contract instance
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract('FundMe', deployer); // gets the conract instance on the current testnet and this contract instance is connected with the deployer account
        // Not executing deployments.fixture(), since assuming conrtracts are already deployed on testnet
      });

      it('ALLOWS PEOPLE TO FUND THE Contract', async function () {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await ethers.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(), '0');
      });
    })
  : describe.skip;
