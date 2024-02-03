// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    Candidate[] public candidates;
    address public owner;
    mapping(address => uint256) public lastVotedSession;
    uint256 public votingSessionId;
    uint256 public votingStart;
    uint256 public votingEnd;
    event CandidateAdded(string name);
    event Voted(address voter, uint256 candidateIndex);

    constructor() {
        owner = msg.sender;
        votingSessionId = 1; // Počinjemo od sesije 1 da izbegnemo konfuziju sa default vrednošću 0 u mappingu
    }

    modifier onlyOwner {
        require(isOwner(), "Caller is not the owner");
        _;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }

    function startVoting(uint256 _durationInMinutes) public onlyOwner {
        require(votingEnd <= block.timestamp, "Voting has already been started or has not been stopped.");
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
        votingSessionId++; // Povećava se za svako novo glasanje
    }

    function stopVoting() public onlyOwner {
        require(block.timestamp <= votingEnd, "Voting has not been started or already stopped.");
        votingEnd = block.timestamp; // Opciono, ovo može da se ukloni ako želite da votingEnd ostane kao planirano vreme završetka
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

    function vote(uint256 _candidateIndex) public {
        require(block.timestamp >= votingStart && block.timestamp < votingEnd, "Voting is not active.");
        require(_candidateIndex < candidates.length, "Invalid candidate index.");
        require(lastVotedSession[msg.sender] < votingSessionId, "You have already voted in this session.");

        candidates[_candidateIndex].voteCount++;
        lastVotedSession[msg.sender] = votingSessionId;
        emit Voted(msg.sender, _candidateIndex);
    }

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
