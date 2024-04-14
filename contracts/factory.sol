// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./voting.sol";

contract VotingFactory {
    address public supremeAdministrator;
    mapping(address => Voting) public adminToVotingInstance; // Svaki admin ima tačno jednu instancu
    mapping(uint256 => Voting) public idToVotingInstance; // Mapiranje jedinstvenih ID-jeva na Voting instance
    uint256 public nextUniqueID = 1; // Početna vrednost za jedinstveni ID
    address tokenAddress;
    uint256 feeAmount;
    constructor() {
        supremeAdministrator = msg.sender;
    }

    function setTokenAddressAndFee(address _tokenAddress,  uint256 _feeAmount) public onlySupremeAdministrator {
    require(_tokenAddress != address(0), "Invalid token address.");
    require(_feeAmount > 0, "Fee amount must be greater than zero.");
    feeAmount = _feeAmount;
    tokenAddress = _tokenAddress;
    }

    //dodaj funkciju za otkenaddress i feeamount. Koja ce da stavlja te 2 stvari na prosledjene vrednosti.
    modifier onlySupremeAdministrator() {
        require(msg.sender == supremeAdministrator, "Caller is not the supreme administrator");
        _;
    }
    // Kreira novu Voting instancu za admina ako već ne postoji
    function createVotingInstance(address admin) public onlySupremeAdministrator returns (address, uint256) {
    require(address(adminToVotingInstance[admin]) == address(0), "Admin already has a voting instance.");

    Voting newVotingInstance = new Voting();
    newVotingInstance.initialize(admin, nextUniqueID, supremeAdministrator, tokenAddress, feeAmount); // Sada prosljeđujemo i uniqueID
    adminToVotingInstance[admin] = newVotingInstance; // Dodavanje instance u mapu
    idToVotingInstance[nextUniqueID] = newVotingInstance;
    
    uint256 currentID = nextUniqueID;
    nextUniqueID++; // Inkrement za sledeći uniqueID
    
    return (address(newVotingInstance), currentID);

    }
    
     function createUserVotingInstance() public payable returns (address, uint256) {
        // Možete dodati logiku za naplatu ovde ako je potrebno
        // Na primer, zahtevajte određenu količinu ethera da bude poslata sa transakcijom
        // require(msg.value == feeAmount, "Fee not met"); // Gde je `feeAmount` cena stvaranja instance

        Voting newVotingInstance = new Voting();
        newVotingInstance.initialize(msg.sender, nextUniqueID, supremeAdministrator, tokenAddress, feeAmount); // Sada prosljeđujemo i uniqueID
        adminToVotingInstance[msg.sender] = newVotingInstance; // Dodavanje instance u mapu
        idToVotingInstance[nextUniqueID] = newVotingInstance;

        uint256 currentID = nextUniqueID;
        nextUniqueID++; // Inkrement za sledeći uniqueID

        // Emitujemo event da je kreirana nova instanca
        emit VotingCreated(msg.sender, address(newVotingInstance), currentID);

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

    function getVotingInstanceID(address instanceAddress) public onlySupremeAdministrator view returns (uint256) {
    require(address(adminToVotingInstance[instanceAddress]) != address(0), "Instance does not exist.");
    for (uint256 i = 1; i < nextUniqueID; i++) {
        if (address(idToVotingInstance[i]) == instanceAddress) {
            return i;
        }
    }

    revert("Instance ID not found.");
}


    function listAllVotingInstances() public onlySupremeAdministrator view returns (address[] memory, uint256[] memory) {
    address[] memory addresses = new address[](nextUniqueID - 1);
    uint256[] memory ids = new uint256[](nextUniqueID - 1);

    for (uint256 i = 1; i < nextUniqueID; i++) {
        Voting instance = idToVotingInstance[i];
        if (address(instance) != address(0)) { // Provera da li instance postoji
            addresses[i - 1] = address(instance);
            ids[i - 1] = i;
        }
    }

    return (addresses, ids);
}


    function deleteVotingInstance(address instanceAddress) public onlySupremeAdministrator {
    require(address(instanceAddress) != address(0), "Invalid address.");
    require(address(adminToVotingInstance[instanceAddress]) != address(0), "Instance does not exist.");

    // Pronalaženje ID-a koji odgovara adresi instance
    uint256 instanceID = 0;
    for (uint256 i = 1; i < nextUniqueID; i++) {
        if (address(idToVotingInstance[i]) == instanceAddress) {
            instanceID = i;
            break;
        }
    }
    
    require(instanceID != 0, "Instance ID not found.");

    // Brisanje instance iz mapiranja
    delete adminToVotingInstance[instanceAddress];
    delete idToVotingInstance[instanceID];
}


    // Emitovanje unutar `initialize` i `transferOwnership`
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event VotingInitialized(address indexed owner);
    event VotingCreated(address indexed admin, address votingInstance, uint256 uniqueID);
}




