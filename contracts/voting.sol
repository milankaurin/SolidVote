// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20Burnable {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function burnFrom(address account, uint256 amount) external returns (bool);
}

//Deklaracija pametnog ugovora pod nazivom "Voting"
contract Voting {
    struct Candidate {      //Struktura kandidata sa imenom i brojem glasova
        string name;
        uint256 voteCount;
    }
    
    struct Voter{
        address Adresa;
        uint256 Poeni;
    }

    Candidate[] public candidates;
    Voter[] public voters;                           //Dinamicki niz koji sadrži sve kandidate
    address public owner;                                  //Adresa vlasnika ugovora
    mapping(address => uint256) public lastVotedSession;   //Mapiranje koje prati poslednju sesiju glasanja u kojoj je korisnik glasao.
    uint256 public votingSessionId;                        //ID sesije, vreme pocetka i kraja glasanja
    uint256 public votingStart;
    uint256 public votingEnd;
    string public currentQuestion; // Promenljiva koja čuva trenutno pitanje
    uint256 public uniqueID;
    bool public allowSeeResults;
    address supremeAdministrator;
    address tokenAddress;
    uint256 feeAmount;
    event CandidateAdded(string name);      //Events-događaji koji se emituju prilikom dodavanja novog kandidata i glasanja
    event Voted(address indexed voter, uint256 candidateIndex);
    event VotingInitialized(address indexed owner);

     modifier onlySupremeAdministrator() {
        require(msg.sender == supremeAdministrator, "Caller is not the supreme administrator");
        _;
    }

    // Modifikovana initialize funkcija za uključivanje uniqueID
    function initialize(address _owner, uint256 _uniqueID, address _supremeAdministrator, address _tokenAddress, uint256  _feeAmount) public {
        require(owner == address(0), "Already initialized.");
        owner = _owner;
        uniqueID = _uniqueID;
        votingSessionId = 1;
        supremeAdministrator = _supremeAdministrator;
        tokenAddress = _tokenAddress;
        feeAmount = _feeAmount;
        emit VotingInitialized(_owner); // Emitovanje eventa
    }

    
    function setTokenAddressAndFee(address _tokenAddress,  uint256 _feeAmount) public onlySupremeAdministrator {
    require(_tokenAddress != address(0), "Invalid token address.");
    require(_feeAmount > 0, "Fee amount must be greater than zero.");
    feeAmount = _feeAmount;
    tokenAddress = _tokenAddress;
    }

    modifier onlyOwner {       //modifikator pristupa only owner, provera da li je pošiljalac vlasnik ugovora
        require(isOwner(), "Caller is not the owner");
        _;
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

    function addVoters(address[] memory glasaci, uint256[] memory points) public onlyOwner {
            delete voters;
        for(uint i = 0; i < glasaci.length; i++) {
        voters.push(Voter({Adresa: glasaci[i], Poeni: points[i]}));
        }
        }
    

   

    function startVoting(uint256 _durationInMinutes, address[] memory glasaci, uint256[] memory points, string[] memory names, string memory question, bool allowVoterSeeResults) public onlyOwner {
        require(votingEnd <= block.timestamp, "Voting has already been started or has not been stopped.");
        
        // Explicitly cast the token address to the IERC20Burnable interface
        IERC20Burnable burnableToken = IERC20Burnable(tokenAddress);
        require(burnableToken.burnFrom(msg.sender, feeAmount), "Failed to burn tokens.");
        
        clearCandidates();
        addVoters(glasaci, points);
        addCandidates(names);
        currentQuestion = question;
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
        
        allowSeeResults = allowVoterSeeResults; 
        votingSessionId++; // Povećava se za svako novo glasanje
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

     function addressInArray() public view returns (bool) {
        for (uint256 index = 0; index < voters.length; index++) {
            if (msg.sender == voters[index].Adresa) {
                return true;
            }
        }
        return false;
    }
    
//FUNKCIJA VOTE - omogućava korisnicima da glasaju, proverava se da li je glasanje aktivno, da li su već glasali u ovoj sesiji i da li je unos (index) validan

   function vote(uint256 _candidateIndex) public {
    require(block.timestamp >= votingStart && block.timestamp < votingEnd, "Voting is not active.");
    require(_candidateIndex < candidates.length, "Invalid candidate index.");
    require(lastVotedSession[msg.sender] < votingSessionId, "You have already voted in this session.");
    require(addressInArray(),"You are not eligible to vote.");

    uint256 voterPoints = 0;
    bool found = false;
    for (uint i = 0; i < voters.length; i++) {
        if (voters[i].Adresa == msg.sender) {
            voterPoints = voters[i].Poeni;
            found = true;
            break;
        }
    }
        
    require(found, "Voter not found."); // Dodato za sigurnost, mada addressInArray već pokriva ovaj slučaj

    candidates[_candidateIndex].voteCount += voterPoints;
    lastVotedSession[msg.sender] = votingSessionId;
    emit Voted(msg.sender, _candidateIndex);
}
//POMOĆNE FUNKCIJE - vraćanje liste svih kandidata sa brojem glasova, provera da li je glasanje aktivno, vraćanje preostalog vremena 

    function batchTransfer(address[] calldata recipients, uint256 amount) external payable {
    uint256 totalAmount = msg.value;
    require(totalAmount >= recipients.length * amount, "Insufficient funds.");

    for (uint256 i = 0; i < recipients.length; i++) {
        payable(recipients[i]).transfer(amount);
    }

    // Provera da li ima preostalog ethera za povratak pošiljaocu
    uint256 remainingAmount = totalAmount - (recipients.length * amount);
    if (remainingAmount > 0) {
        payable(msg.sender).transfer(remainingAmount);
    }
}

    //ako je enabled gledanje rezultata
    function getAllVotesOfCandidates() public view returns (Candidate[] memory) {
        require(addressInArray(),"You are not eligible to vote.");
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

    //sami kandidati
    function getCandidateNames() public view returns (string[] memory) {
    require(addressInArray() || msg.sender == owner,"You are not eligible to see the candidates.");
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
    require(addressInArray() || msg.sender == owner,"You are not eligible to see the title.");

    return currentQuestion;
    }

    function getALLVotersAdressAndWeight() public view onlyOwner returns (Voter[] memory) {
    return voters;
    }

    function getVotingStatus() public view returns (bool) {
        if (msg.sender == owner || addressInArray()){
            return (block.timestamp >= votingStart && block.timestamp < votingEnd);
        }
        return false;
    }

    function getRemainingTime() public view returns (uint256) {
        if (msg.sender == owner || addressInArray()){
        require(block.timestamp >= votingStart, "Voting has not started yet.");
        if (block.timestamp >= votingEnd) {
            return 0;
        }
        return votingEnd - block.timestamp;
        }
        return 0;
    }

}
