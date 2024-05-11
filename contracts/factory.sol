// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "./voting.sol";

contract VotingFactory {
    address public supremeAdministrator;
    mapping(address => Voting) public adminToVotingInstance; // Svaki admin ima tačno jednu instancu
    mapping(uint256 => Voting) public idToVotingInstance; // Mapiranje jedinstvenih ID-jeva na Voting instance
    uint256 public nextUniqueID = 1; // Početna vrednost za jedinstveni ID
    ERC20Burnable public token;
    uint256 feeAmount;
    bool addressTokenFeeSet = false;
    
   constructor(ERC20Burnable _token, uint256 _feeAmount) {
        supremeAdministrator = msg.sender;
        setTokenAndFee(_token, _feeAmount);
    }

    function setTokenAndFee(ERC20Burnable _token, uint256 _feeAmount) public onlySupremeAdministrator {
        require(address(_token) != address(0), "Invalid token address.");
        require(_feeAmount > 0, "Fee amount must be greater than zero.");
        token = _token;
        feeAmount = _feeAmount;
        addressTokenFeeSet = true;
    }

    //dodaj funkciju za otkenaddress i feeamount. Koja ce da stavlja te 2 stvari na prosledjene vrednosti.
    modifier onlySupremeAdministrator() {
        require(msg.sender == supremeAdministrator, "Caller is not the supreme administrator");
        _;
    }
   
    function createVotingInstance(address admin) public onlySupremeAdministrator returns (address, uint256) {
        require(address(adminToVotingInstance[admin]) == address(0), "Admin already has a voting instance.");
        require(addressTokenFeeSet == true, "Token and fee amount not set.");
        Voting newVotingInstance = new Voting(admin, nextUniqueID, supremeAdministrator, token, feeAmount);
        
        adminToVotingInstance[admin] = newVotingInstance; // Add instance to the map
        idToVotingInstance[nextUniqueID] = newVotingInstance;

        uint256 currentID = nextUniqueID;
        nextUniqueID++; // Increment for the next unique ID

        emit VotingCreated(admin, address(newVotingInstance), currentID);
        return (address(newVotingInstance), currentID);
    }

   
    function createUserVotingInstance() public payable returns (address, uint256) {
  
    Voting newVotingInstance = new Voting(msg.sender, nextUniqueID, supremeAdministrator, token, feeAmount);
    adminToVotingInstance[msg.sender] = newVotingInstance; // Add the instance to the mapping
    idToVotingInstance[nextUniqueID] = newVotingInstance;
    uint256 currentID = nextUniqueID;
    nextUniqueID++; 
    emit VotingCreated(msg.sender, address(newVotingInstance), currentID);
    return (address(newVotingInstance), currentID);

    }

    function getVotingInstanceForVoter(uint256 uniqueID) public view returns (address) {
        Voting instance = idToVotingInstance[uniqueID];
        require(address(instance) != address(0), "Voter is not eligible");
        return address(instance);
    }
    
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

    uint256 instanceID = 0;
    for (uint256 i = 1; i < nextUniqueID; i++) {
        if (address(idToVotingInstance[i]) == instanceAddress) {
            instanceID = i;
            break;
        }
    }
    
    require(instanceID != 0, "Instance ID not found.");

    delete adminToVotingInstance[instanceAddress];
    delete idToVotingInstance[instanceID];
}

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event VotingInitialized(address indexed owner);
    event VotingCreated(address indexed admin, address votingInstance, uint256 uniqueID);
}




