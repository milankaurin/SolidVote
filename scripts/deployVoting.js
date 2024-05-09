async function main() {
    const [deployer] = await ethers.getSigners();
  
    const Voting = await ethers.getContractFactory("Voting");
  
    // Dodaj argumente koji odgovaraju konstruktoru ugovora
    const ownerAddress = deployer.address; // ili neka specifična adresa koja treba da bude vlasnik
    const uniqueID = 1; // Primer jedinstvenog ID-a
    const supremeAdministrator = deployer.address; // Može biti ista ili druga adresa
    const tokenAddress = "0x8F45b6892F648E7dC01AFEBEEBaA2DA63462343F"; // Adresa tokena koji se koristi u ugovoru
    const feeAmount = 1000000000000000000000; // Primer naknade u Etheru
  
    const Voting_ = await Voting.deploy(
      ownerAddress, 
      uniqueID, 
      supremeAdministrator, 
      tokenAddress, 
      feeAmount
    );
  
    console.log("Contract deployed to address:", Voting_.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
  