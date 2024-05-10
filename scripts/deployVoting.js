const { ethers } = require("hardhat");

async function main() {
    // Fetch the account to deploy the contract
    const [deployer] = await ethers.getSigners();

    // Pretpostavlja se da je token već deployan i da imate njegovu adresu
    const tokenAddress = "0x8F45b6892F648E7dC01AFEBEEBaA2DA63462343F"; // Adresa vašeg ERC20Burnable tokena

    // Učitavanje instance tokena
    const Token = await ethers.getContractAt("ERC20Burnable", tokenAddress, deployer);

    // Deploy the Voting contract
    const feeAmount = ethers.utils.parseUnits("10", "ether"); // Iznos takse za sagorevanje tokena

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(
        deployer.address,        // owner address
        1,                       // uniqueID
        deployer.address,        // supremeAdministrator address
        Token.address,           // token address (ERC20Burnable token)
        feeAmount                // feeAmount
    );

    await voting.deployed();

    console.log("Voting deployed to:", voting.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});