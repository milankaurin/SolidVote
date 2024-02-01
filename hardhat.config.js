require("@nomiclabs/hardhat-waffle");

// Učitajte .env biblioteku na početku fajla
require('dotenv').config();

// Pretpostavimo da imate definisane ove varijable u .env fajlu
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.9",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL, // Ovo treba da bude URL vašeg Sepolia node-a ili Infura/Alchemy endpoint-a
      accounts: [`0x${PRIVATE_KEY}`] // Ovo treba da bude vaš privatni ključ
    }
  }
};
