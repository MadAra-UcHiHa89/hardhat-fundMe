const { getNamedAccounts, deployments, ethers } = require('hardhat');

async function main() {
  const deployer = (await getNamedAccounts()).deployer;
  const fundMe = await ethers.getContract('FundMe', deployer);
  console.log('Funding COntract....');
  const txnRes = await fundMe.fund({ value: ethers.utils.parseEther('0.1') });
  await txnRes.wait(1);
  console.log('Funding Complete');
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
