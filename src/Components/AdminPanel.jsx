import React, { useState } from "react";
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../Constant/constant';

const AdminPanel = ({ signer }) => {
    const [candidateName, setCandidateName] = useState("");
    const [loading, setLoading] = useState(false);
    const [votingDuration, setVotingDuration] = useState(""); // Dodato stanje za unos trajanja glasanja

    const handleCandidateNameChange = (e) => {
        setCandidateName(e.target.value);
    };

    const handleVotingDurationChange = (e) => {
        setVotingDuration(e.target.value);
    };

    const startVoting = async () => {
        try {
            const durationInMinutes = parseInt(votingDuration); // Pretvorite unos u broj
            if (isNaN(durationInMinutes) || durationInMinutes <= 0) {
                alert("Please enter a valid positive number for voting duration.");
                return;
            }
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);
            const transaction = await contract.startVoting(durationInMinutes);
            await transaction.wait();
            alert("Voting has started.");
        } catch (error) {
            console.error("Error starting the voting:", error);
            alert("Failed to start voting.");
        }
    };

    const addCandidate = async () => {
        if (!candidateName.trim()) {
            alert("Please enter a candidate name.");
            return;
        }

        setLoading(true);
        try {
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);
            const transaction = await contract.addCandidate(candidateName);
            await transaction.wait();

            alert(`Candidate "${candidateName}" added successfully.`);
            setCandidateName(""); // Resetovanje polja nakon dodavanja
        } catch (error) {
            console.error("Error adding candidate:", error);
            alert("Failed to add candidate.");
        }
        setLoading(false);
    };

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>
            <input
                type="text"
                value={candidateName}
                onChange={handleCandidateNameChange}
                placeholder="Candidate Name"
                disabled={loading}
            />
            <input
                type="text"
                value={votingDuration}
                onChange={handleVotingDurationChange}
                placeholder="Voting Duration (minutes)" // Dodato polje za unos trajanja glasanja
                disabled={loading}
            />
            <button onClick={addCandidate} disabled={loading}>
                {loading ? "Adding..." : "Add Candidate"}
            </button>
            <button onClick={startVoting} disabled={loading}>
                Start Voting
            </button>
        </div>
    );
};

export default AdminPanel;
