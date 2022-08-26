const { getNamedAccounts, deployments, ethers } = require('hardhat');

async function main() {
  const deployer = (await getNamedAccounts()).deployer;
  const fundMe = await ethers.getContract('FundMe', deployer);
  console.log('Withdrawing COntract....');
  const txnRes = await fundMe.withdraw();
  await txnRes.wait(1);
  console.log('Withdraw Complete');
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
