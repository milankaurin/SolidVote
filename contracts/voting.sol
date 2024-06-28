// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
//Deklaracija pametnog ugovora pod nazivom "Voting"
contract Voting {
    struct Candidate {      //Struktura kandidata sa imenom i brojem glasova
        string name;
        uint256 voteCount;
    }
    
    

    Candidate[] public candidates;
    address public owner;
    mapping(address => uint256) public lastVotedSession;
    uint256 public votingSessionId;
    uint256 public votingStart;
    uint256 public votingEnd;
    string public currentQuestion;
    uint256 public uniqueID;
    bool public allowSeeResults;
    address public supremeAdministrator;
    ERC20Burnable public token;
    uint256 public feeAmount;
    mapping(address => uint256) public voterPoints;
    event CandidateAdded(string name);
    event Voted(address indexed voter, uint256 candidateIndex);
    event VotingInitialized(address indexed owner);

       struct Voter {
        address Adress;
        uint256 Points;
    }


    modifier onlySupremeAdministrator() {
        require(msg.sender == supremeAdministrator, "Caller is not the supreme administrator");
        _;
    }

    // Modifikovana initialize funkcija za uključivanje uniqueID
   function initialize(
    address _owner, 
    uint256 _uniqueID, 
    address _supremeAdministrator, 
    ERC20Burnable _token, 
    uint256 _feeAmount
) public {
    require(owner == address(0), "Already initialized.");
    owner = _owner;
    uniqueID = _uniqueID;
    votingSessionId = 1;
    supremeAdministrator = _supremeAdministrator;
    token = _token;
    feeAmount = _feeAmount;
    emit VotingInitialized(_owner); // Emitovanje eventa
}


       constructor(
        address _owner, 
        uint256 _uniqueID, 
        address _supremeAdministrator, 
        ERC20Burnable _token, 
        uint256 _feeAmount
    ) {
        require(owner == address(0), "Already initialized.");
        owner = _owner;
        uniqueID = _uniqueID;
        votingSessionId = 1;
        supremeAdministrator = _supremeAdministrator;
        token = _token;
        feeAmount = _feeAmount;
        emit VotingInitialized(_owner);
    }


  function setTokenAddressAndFee(ERC20Burnable _token, uint256 _feeAmount) public onlySupremeAdministrator {
    require(address(_token) != address(0), "Invalid token address.");
    require(_feeAmount > 0, "Fee amount must be greater than zero.");
    token = _token;
    feeAmount = _feeAmount;
}

modifier onlyOwner {       //modifikator pristupa only owner, provera da li je pošiljalac vlasnik ugovora
     require(isOwner(), "Caller is not the owner");
      _;
}

// Function to retrieve the unique ID of the contract
function getUniqueID() public view onlyOwner returns (uint256) {
    return uniqueID;
}


event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0), "New owner is the zero address.");
    emit OwnershipTransferred(owner, newOwner); // Emitovanje eventa pre promene vlasništva
    owner = newOwner;
}

function isOwner() public view returns (bool) {
      return msg.sender == owner;
}

//FUNKCIJE ZA KONTROLU GLASANJA - započinjanje, prekidanje glasanja, dodavanje novog kandidata, brisanje svih kandidata, dodavanje liste kandidata
    address[] private currentVoters; 

    function resetVoters() public onlyOwner {
        for (uint256 i = 0; i < currentVoters.length; i++) {
            delete voterPoints[currentVoters[i]];
            }
        delete currentVoters;  // Očisti niz trenutnih glasača
    }

     function addVoters(address[] memory addresses, uint256[] memory points) public onlyOwner {
        resetVoters(); 
        for (uint256 i = 0; i < addresses.length; i++) {
            currentVoters.push(addresses[i]); 
            voterPoints[addresses[i]] = points[i];
        }
    }
    

   

    function startVoting(uint256 _durationInMinutes, address[] memory glasaci, uint256[] memory points, string[] memory names, string memory question, bool allowVoterSeeResults, address[] calldata recipients, uint256 amount, uint256 _totalamount) public payable onlyOwner {
    require(votingEnd <= block.timestamp, "Voting has already been started or has not been stopped.");
    require(msg.value >= _totalamount, "Not enough ETH sent for the voting process.");

    // Cast token address to the IERC20Burnable interface and burn tokens
    

    // Check token allowance and burn tokens
    uint256 allowed = token.allowance(msg.sender, address(this));
    require(allowed >= feeAmount, "Not enough tokens approved for burning");
    token.burnFrom(msg.sender, feeAmount);


    // Call the internal batchTransfer function with the correct parameters
    batchTransfer(recipients, amount, _totalamount);
    clearCandidates();
    addVoters(glasaci, points);
    addCandidates(names);
    currentQuestion = question;
    votingStart = block.timestamp;
    votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
    
    allowSeeResults = allowVoterSeeResults; 
    votingSessionId++; // Increment the session ID for each new voting session
}


    function stopVoting() public onlyOwner {
        require(block.timestamp <= votingEnd, "Voting has not been started or already stopped.");
        votingEnd = block.timestamp;

    }

    function addCandidate(string memory _name) public onlyOwner {
        candidates.push(Candidate({name: _name, voteCount: 0}));
        emit CandidateAdded(_name);
    }

    function clearCandidates() public onlyOwner {
        require(block.timestamp < votingStart || block.timestamp > votingEnd, "Cannot clear candidates during voting period.");
        delete candidates; // Briše sve kandidate, pripremajući za novo glasanje
    }

    function addCandidates(string[] memory _names) public onlyOwner {
        for (uint i = 0; i < _names.length; i++) {
            addCandidate(_names[i]);
        }
    }

     
    

function hasUserVoted() public view returns (bool) {
    return lastVotedSession[msg.sender] < votingSessionId;
}
//FUNKCIJA VOTE - omogućava korisnicima da glasaju, proverava se da li je glasanje aktivno, da li su već glasali u ovoj sesiji i da li je unos (index) validan

function vote(uint256 _candidateIndex) public {
    require(block.timestamp >= votingStart && block.timestamp < votingEnd, "Voting is not active.");
    require(_candidateIndex < candidates.length, "Invalid candidate index.");
    require(lastVotedSession[msg.sender] < votingSessionId, "You have already voted in this session.");
    require(voterPoints[msg.sender] > 0, "Not eligible to vote.");  
    uint256 points = voterPoints[msg.sender];

    candidates[_candidateIndex].voteCount += points;
    lastVotedSession[msg.sender] = votingSessionId;
    emit Voted(msg.sender, _candidateIndex);
}
//POMOĆNE FUNKCIJE - vraćanje liste svih kandidata sa brojem glasova, provera da li je glasanje aktivno, vraćanje preostalog vremena 

    function batchTransfer(address[] calldata recipients, uint256 amount, uint256 _totalamount) internal {
    require(msg.value >= _totalamount, "Not enough ETH sent.");

    for (uint256 i = 0; i < recipients.length; i++) {
        payable(recipients[i]).transfer(amount);
    }

    // Check for any remaining ETH to return to the sender
    uint256 remainingAmount = _totalamount - (recipients.length * amount);
    if (remainingAmount > 0) {
        payable(msg.sender).transfer(remainingAmount);
    }
}
    //ako je enabled gledanje rezultata
    function getAllVotesOfCandidates() public view returns (Candidate[] memory) {
       require(voterPoints[msg.sender] > 0, "Not eligible to view.");
    if (allowSeeResults) {
        return candidates; // Ako je dozvoljeno videti rezultate, vrati originalne kandidate sa brojem glasova
    } else {
        Candidate[] memory candidatesWithoutVotes = new Candidate[](candidates.length);
        for (uint i = 0; i < candidates.length; i++) {
            // Kopira samo imena kandidata u novi niz, bez broja glasova
            candidatesWithoutVotes[i].name = candidates[i].name;
            // Opciono: Postavi voteCount na 0 ako želite eksplicitno da naglasite da broj glasova nije dostupan
             candidatesWithoutVotes[i].voteCount = 0;
        }
        return candidatesWithoutVotes; // Vrati kandidate bez broja glasova
    }    
}

      function getAllVotesOfCandidatesAdmin() public onlyOwner view returns (Candidate[] memory) {
        return candidates; // Ako je dozvoljeno videti rezultate, vrati originalne kandidate sa brojem glasova
   
    }    



    //sami kandidati
    function getCandidateNames() public view returns (string[] memory) {
    require(voterPoints[msg.sender] > 0 || msg.sender == owner,"You are not eligible to see the candidates.");
    string[] memory candidateNames = new string[](candidates.length);
    for (uint i = 0; i < candidates.length; i++) {
        candidateNames[i] = candidates[i].name;
    }
    return candidateNames;
}

    function canSeeResults() public view returns (bool) {
        return allowSeeResults;
    }

    function getVotingTitle() public view returns (string memory) {
    require(voterPoints[msg.sender] > 0 || msg.sender == owner,"You are not eligible to see the title.");

    return currentQuestion;
    }

    function getALLVotersAdressAndWeight() public view onlyOwner returns (Voter[] memory) {
        Voter[] memory voters = new Voter[](currentVoters.length);
        for (uint i = 0; i < currentVoters.length; i++) {
            voters[i] = Voter({
                Adress: currentVoters[i],
                Points : voterPoints[currentVoters[i]]
            });
        }
        return voters;
    }

    function getVotingStatus() public view returns (bool) {
        if (msg.sender == owner || voterPoints[msg.sender] > 0){
            return (block.timestamp >= votingStart && block.timestamp < votingEnd);
        }
        return false;
    }

    function getRemainingTime() public view returns (uint256) {
        if (msg.sender == owner || voterPoints[msg.sender] > 0){
        require(block.timestamp >= votingStart, "Voting has not started yet.");
        if (block.timestamp >= votingEnd) {
            return 0;
        }
        return votingEnd - block.timestamp;
        }
        return 0;
    }

}
