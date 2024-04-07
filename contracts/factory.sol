// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./voting.sol";

contract VotingFactory {
    address public supremeAdministrator;
    mapping(address => Voting) public adminToVotingInstance; // Svaki admin ima tačno jednu instancu
    mapping(uint256 => Voting) public idToVotingInstance; // Mapiranje jedinstvenih ID-jeva na Voting instance
    uint256 public nextUniqueID = 1; // Početna vrednost za jedinstveni ID

    constructor() {
        supremeAdministrator = msg.sender;
    }

    modifier onlySupremeAdministrator() {
        require(msg.sender == supremeAdministrator, "Caller is not the supreme administrator");
        _;
    }
    // Kreira novu Voting instancu za admina ako već ne postoji
    function createVotingInstance(address admin) public onlySupremeAdministrator returns (address, uint256) {
    require(address(adminToVotingInstance[admin]) == address(0), "Admin already has a voting instance.");

    Voting newVotingInstance = new Voting();
    newVotingInstance.initialize(admin, nextUniqueID); // Sada prosljeđujemo i uniqueID
    adminToVotingInstance[admin] = newVotingInstance; // Dodavanje instance u mapu
    idToVotingInstance[nextUniqueID] = newVotingInstance;
    
    uint256 currentID = nextUniqueID;
    nextUniqueID++; // Inkrement za sledeći uniqueID
    
    return (address(newVotingInstance), currentID);
}

    // Nova funkcija za dohvatanje Voting instance na osnovu jedinstvenog ID-a
    function getVotingInstanceForVoter(uint256 uniqueID) public view returns (address) {
        Voting instance = idToVotingInstance[uniqueID];
        require(address(instance) != address(0), "Voter is not eligible");
        return address(instance);
    }
    // Vraća adresu Voting instance za datog admina
    function getAdminInstanceAddress(address admin) public view returns (address) {
        return address(adminToVotingInstance[admin]);
    }
    // Emitovanje unutar `initialize` i `transferOwnership`
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
event VotingInitialized(address indexed owner);
}




