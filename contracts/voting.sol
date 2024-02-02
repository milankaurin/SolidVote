// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    Candidate[] public candidates;
    address owner;
   
    uint256 public votingSessionId;

    uint256 public votingStart;
    uint256 public votingEnd;
    event CandidateAdded(string name);
    event Voted(address voter, uint256 candidateIndex);

    mapping(address => uint256) public voters;

  function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }

constructor() {
    owner = msg.sender;
}

function startVoting(uint256 _durationInMinutes) public onlyOwner {
    require(votingEnd <= block.timestamp, "Voting has already been started.");
    votingStart = block.timestamp;
    votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
    votingSessionId++; // Inkrementira ID sesije, omogućavajući svima da glasaju ponovo
}


function stopVoting() public onlyOwner {
    require(block.timestamp < votingEnd, "Voting has not ended yet or has been already stopped.");
    votingEnd = block.timestamp; // Postavlja kraj glasanja na trenutni timestamp, efektivno zaustavljajući glasanje
}

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function addCandidate(string memory _name) public onlyOwner {
        candidates.push(Candidate({
                name: _name,
                voteCount: 0
        }));
         emit CandidateAdded(_name); // Emituje event
    }

    function clearCandidates() public onlyOwner {
    require(block.timestamp < votingStart || block.timestamp > votingEnd, "Cannot clear candidates during voting period.");
    delete candidates; // Ovo briše ceo niz kandidata
}



    function addCandidates(string[] memory _names) public onlyOwner {
    for (uint256 i = 0; i < _names.length; i++) {
        candidates.push(Candidate({
            name: _names[i],
            voteCount: 0
        }));
        emit CandidateAdded(_names[i]); // Emituje event za svaki dodatog kandidata
    }
}


   function vote(uint256 _candidateIndex) public {
    require(voters[msg.sender] < votingSessionId, "You have already voted in this session.");
    require(_candidateIndex < candidates.length, "Invalid candidate index.");

    candidates[_candidateIndex].voteCount++;
    voters[msg.sender] = votingSessionId; // Postavlja sesiju glasanja za ovog glasača na trenutnu sesiju
    emit Voted(msg.sender, _candidateIndex);
}


    function getAllVotesOfCandiates() public view returns (Candidate[] memory){
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
