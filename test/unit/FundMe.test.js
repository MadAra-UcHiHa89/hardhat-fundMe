const { assert, expect } = require('chai');
const { deployments, ethers, getNamedAccounts } = require('hardhat');
describe('FundMe', function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.utils.parseEther('1'); // 1 ether , converts to wei
  beforeEach(async function () {
    // const accounts= await ethers.getSigners();// returns all accounts defined in the hardhat.config.js file for the current network
    deployer = (await getNamedAccounts()).deployer; // getting the account with name deployer from the hardhat.config.js file
    await deployments.fixture(['all']); // fixture -> runs all scrits in deploy folder which have the tags mentions as arguments to the function
    fundMe = await ethers.getContract('FundMe', deployer); // returns the most recently deployed contract which has name as argument on the current network, 2nd argument is the account with which we'll interact with that contract.
    mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer); // getting the mockV3Aggregator contract deployed on the current network, which we'll use the deployer account to interact with hence its the 2nd argument
  });

  describe('Constructor', function () {
    it('Sets the price feed address correctly', async function () {
      // test to check if the price feed address was correctly initiliased by the constructor
      const priceFeedAddress = await fundMe.getPriceFeed(); // as we know each public variable by ddefault gets a getter function name is: nameOfVariable() -> returns the value of the variable
      assert.equal(mockV3Aggregator.address, priceFeedAddress); // asserting that the price feed address is the same as the address of the mockV3Aggregator contract
    });
  });

  //   Tests for fund function
  describe('fund', function () {
    it("Should fail if enough ether isn't sent", async function () {
      await expect(fundMe.fund()).to.be.revertedWith(
        'Donated amt must be atleast 1 eth!'
      );
    });

    // Test for amount added to funders
    it('Should add the amount to the funders', async function () {
      await fundMe.fund({ value: sendValue }); // sending 1 ether to the fundMe contract
      const amount = await fundMe.getAddressToAmtDonated(deployer); // getting the amount of ether sent to the fundMe contract by the deployer account
      assert.equal(amount.toString(), sendValue.toString()); // asserting that the amount of ether sent to the fundMe contract is equal to 1 ether
    });

    // Test for checking funder added to funders array
    it('Should add the funder to the funders array', async function () {
      await fundMe.fund({ value: sendValue }); // sending 1 ether to the fundMe contract
      const funder = await fundMe.getFunder(0);
      //   console.log('funder', funder);
      //   console.log('deployer', deployer);
      assert.equal(funder, deployer); // asserting that the funder is the deployer account
    });
  });

  describe('Withdraw', function () {
    // Before testing for withdra we should fund the contract with 1 ether
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue });
    });

    it('Should withdraw the amount from the funders', async function () {
      //Arrange
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      ); // getting the balance of the deployer account which deploys the contract i.e is the owner
      //   Act
      const txnResponse = await fundMe.withdraw(); // calling the withdraw function on the fundMe contract
      const txnReceipt = await txnResponse.wait(); // waiting for the transaction to be mined

      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      ); // getting the balance of the fundMe contract after the withdraw function is called
      const endingDeployerBalance = await ethers.provider.getBalance(deployer); // getting the balance of the deployer account after the withdraw function is called

      //   Gas Cost
      const { gasUsed, effectiveGasPrice } = txnReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      // Assert
      assert.equal(endingFundMeBalance.toString(), '0'); // asserting that the balance of the fundMe contract is 0 after the withdraw function is called , since we withdrew all the ether
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      ); // asserting that the balance of the deployer account is equal to the balance of the fundMe contract plus the balance of the deployer account before the withdraw function is called
      //   we have to use the add function to add the startingFundMeBalance and startingDeployerBalance as we have to convert them to strings and then convert them to BigNumber objects
      // but since we spent gas in the txn calling the withdraw function we have to add the gas cost to the endingDeployerBalance
    });

    // Test for Widhtdrawing when multiple funders are added
    it('Should withdraw the amount from the funders when multiple funders are added', async function () {
      // Arrange
      const accounts = await ethers.getSigners(); // get all the accounts defined in the hardhat.config.js file for the current network
      for (let i = 1; i < 6; i++) {
        // Looping over 5 accounts (we get from hardhat ) 1st is the deployer account so we skipped it
        // Looping over accounts and calling the fund function for each account
        // But before that we need to connect to the cotract using these accounts since ,fundMe contract was connected to the deployer account in the beforeEach function
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        //  Now can interact with contract with this account
        await fundMeConnectedContract.fund({ value: sendValue });
      }
      //   Act
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );
      const txnResponse = await fundMe.withdraw(); // calling the withdraw function on the fundMe contract
      const txnReceipt = await txnResponse.wait(1); // waiting for the transaction to be mined
      const { gasUsed, effectiveGasPrice } = txnReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      //   Assert
      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);
      assert.equal(endingFundMeBalance.toString(), '0'); // asserting that the balance of the fundMe contract is 0 after the withdraw function is called , since we withdrew all the ether
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
      console.log('good');

      // Asserting that all funders are reset properly after the withdraw function is called
      await expect(fundMe.getFunder(0)).to.be.reverted; // since funderes aray is reset after withdraw
      console.log('good 2');
      for (let i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.getAddressToAmtDonated(accounts[i].address),
          '0'
        ); // asserting that the amount of ether sent to the fundMe contract is equal to 0 after the withdraw function is called
      }
    });

    // Test for allowing only owner to allow withdraw
    it('Should allow Only owner to call withdraw', async function () {
      const accounts = await ethers.getSigners(); // get all the accounts defined in the hardhat.config.js file for the current network
      const attacker = accounts[1]; // attacker is the 2nd account in the accounts array
      const fundMeAttackerConnectedContract = await fundMe.connect(attacker); // connect to the contract with the 1st account
      await expect(
        fundMeAttackerConnectedContract.withdraw()
      ).to.be.revertedWith('FundMe__NotOwner'); // expect the withdraw function to be reverted , since account[0], dpeloyer is the owner of the contract
    });

    it('Cheaper withdraw', async function () {
      // Arrange
      const accounts = await ethers.getSigners(); // get all the accounts defined in the hardhat.config.js file for the current network
      for (let i = 1; i < 6; i++) {
        // Looping over 5 accounts (we get from hardhat ) 1st is the deployer account so we skipped it
        // Looping over accounts and calling the fund function for each account
        // But before that we need to connect to the cotract using these accounts since ,fundMe contract was connected to the deployer account in the beforeEach function
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        //  Now can interact with contract with this account
        await fundMeConnectedContract.fund({ value: sendValue });
      }
      //   Act
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );
      const txnResponse = await fundMe.cheaperWithdraw(); // calling the withdraw function on the fundMe contract
      const txnReceipt = await txnResponse.wait(1); // waiting for the transaction to be mined
      const { gasUsed, effectiveGasPrice } = txnReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      //   Assert
      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);
      assert.equal(endingFundMeBalance.toString(), '0'); // asserting that the balance of the fundMe contract is 0 after the withdraw function is called , since we withdrew all the ether
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
      console.log('good');

      // Asserting that all funders are reset properly after the withdraw function is called
      await expect(fundMe.getFunder(0)).to.be.reverted; // since funderes aray is reset after withdraw
      console.log('good 2');
      for (let i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.getAddressToAmtDonated(accounts[i].address),
          '0'
        ); // asserting that the amount of ether sent to the fundMe contract is equal to 0 after the withdraw function is called
      }
    });
  });
});
