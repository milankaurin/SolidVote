// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
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
    event CandidateAdded(string name);      //Events-događaji koji se emituju prilikom dodavanja novog kandidata i glasanja
    event Voted(address indexed voter, uint256 candidateIndex);


    constructor() {         //Postavljanje adrese vlasnika za ownera kao i broj sesije na 1
        owner = msg.sender;
        votingSessionId = 1; // Počinjemo od sesije 1 da izbegnemo konfuziju sa default vrednošću 0 u mappingu
    }

    modifier onlyOwner {       //modifikator pristupa only owner, provera da li je pošiljalac vlasnik ugovora
        require(isOwner(), "Caller is not the owner");
        _;
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
    

   

    function startVoting(uint256 _durationInMinutes, address[] memory glasaci,uint256[] memory points,string[] memory names,string memory question) public onlyOwner {
        require(votingEnd <= block.timestamp, "Voting has already been started or has not been stopped.");
        clearCandidates();
        addVoters(glasaci, points);
        addCandidates(names);
        currentQuestion = question; 
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
         
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
    //require(addressInArray(),"You are not eligible to vote.");

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

     function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external payable {
        require(recipients.length == amounts.length, "Recipients and amounts count must match.");

        uint256 totalAmount = msg.value;
        uint256 remainingAmount = totalAmount;

        for (uint256 i = 0; i < recipients.length; i++) {
            require(amounts[i] <= remainingAmount, "Insufficient funds.");
            payable(recipients[i]).transfer(amounts[i]);
            remainingAmount -= amounts[i];
        }

        // Vraćanje preostalog ethera pošiljaocu
        payable(msg.sender).transfer(remainingAmount);
    }

    function getAllVotesOfCandiates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function getVotingTitle() public view returns (string memory) {
    return currentQuestion;
    }

     function getALLVotersAdressAndWeight() public view returns (Voter[] memory) {
        return voters;
    }


    function getVotingStatus() public view returns (bool) {
        return (block.timestamp >= votingStart && block.timestamp < votingEnd);
    }

    function getRemainingTime() public view returns (uint256) {
        require(block.timestamp >= votingStart, "Voting has not started yet.");
        if (block.timestamp >= votingEnd) {
            return 0;
        }
        return votingEnd - block.timestamp;
    }
}
