async function main() {
  //const Voting = await ethers.getContractFactory("Voting");

  const Transfer = await ethers.getContractFactory("Voting");
  
  // Start deployment, returning a promise that resolves to a contract object
  //const Voting_ = await Voting.deploy();
  //console.log("Contract address:", Voting_.address);

  const Transfer_= await Transfer.deploy()
  console.log("Contract address:", Transfer_.address);

}
//0xA50123d25c5A999a8cB1032d8d5af34195087891
main()
 .then(() => process.exit(0))
 .catch(error => {
   console.error(error);
   process.exit(1);
 });