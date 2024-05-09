// scripts/deploy_token.js

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const SolidVoteToken = await ethers.getContractFactory("SolidVoteToken");
    const solidVoteToken = await SolidVoteToken.deploy();

    console.log("SolidVoteToken deployed to:", solidVoteToken.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
