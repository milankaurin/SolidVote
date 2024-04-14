// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract SolidVoteToken is ERC20, ERC20Burnable {
    address public owner;

    constructor() ERC20("SolidVote", "SOV") {
        owner = msg.sender;
        // Postavljanje fiksnog supply-a od 10000 tokena, s obzirom na decimalnu tačnost
        _mint(owner, 10000 * (10 ** decimals()));
    }

    // Ensure only the owner can call a function
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
    // Omogućiti uništavanje ugovora samo vlasniku
    function destroy() public onlyOwner {
        selfdestruct(payable(owner));
    }
}