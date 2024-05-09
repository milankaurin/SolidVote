const { ethers } = require("hardhat");

    async function main() {
        // Fetch the account to deploy the contract
        const [deployer] = await ethers.getSigners();
        
        // Deploy the Voting contract
        const feeAmount = ethers.utils.parseUnits("10", "ether");

        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(
            deployer.address,        // owner address
            1,                       // uniqueID
            deployer.address,        // supremeAdministrator address
            "0x8F45b6892F648E7dC01AFEBEEBaA2DA63462343F",    // tokenAddress
            feeAmount                     // feeAmount
        );
    
        await voting.deployed();
    
        console.log("Voting deployed to:", voting.address);
    }
    
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
    