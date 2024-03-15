// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
//Deklaracija pametnog ugovora pod nazivom "Voting"
contract Voting {
    struct Candidate {      //Struktura kandidata sa imenom i brojem glasova
        string name;
        uint256 voteCount;
    }
    
    Candidate[] public candidates;
    address[] public voters;                           //Dinamicki niz koji sadrži sve kandidate
    address public owner;                                  //Adresa vlasnika ugovora
    mapping(address => uint256) public lastVotedSession;   //Mapiranje koje prati poslednju sesiju glasanja u kojoj je korisnik glasao.
    uint256 public votingSessionId;                        //ID sesije, vreme pocetka i kraja glasanja
    uint256 public votingStart;
    uint256 public votingEnd;
    event CandidateAdded(string name);      //Events-događaji koji se emituju prilikom dodavanja novog kandidata i glasanja
    event Voted(address voter, uint256 candidateIndex);

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

    function addVoters(address[] memory glasaci) public onlyOwner {

     voters=glasaci;

    }


    function startVoting(uint256 _durationInMinutes,address[] memory glasaci) public onlyOwner {
        require(votingEnd <= block.timestamp, "Voting has already been started or has not been stopped.");
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
        addVoters(glasaci);
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

    function addressInArray() public view returns (bool){
        bool check = false;

        for (uint256 index = 0; index < voters.length; index++) {
            if(msg.sender == voters[index]){
                check=true;
            }

        }
        return check;

    }

//FUNKCIJA VOTE - omogućava korisnicima da glasaju, proverava se da li je glasanje aktivno, da li su već glasali u ovoj sesiji i da li je unos (index) validan

    function vote(uint256 _candidateIndex) public {
        require(block.timestamp >= votingStart && block.timestamp < votingEnd, "Voting is not active.");
        require(_candidateIndex < candidates.length, "Invalid candidate index.");
        require(lastVotedSession[msg.sender] < votingSessionId, "You have already voted in this session.");
       require(addressInArray(),"You are not eligible to vote.");

        candidates[_candidateIndex].voteCount++;
        lastVotedSession[msg.sender] = votingSessionId;
        emit Voted(msg.sender, _candidateIndex);
    }

//POMOĆNE FUNKCIJE - vraćanje liste svih kandidata sa brojem glasova, provera da li je glasanje aktivno, vraćanje preostalog vremena 

    function getAllVotesOfCandiates() public view returns (Candidate[] memory) {
        return candidates;
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
