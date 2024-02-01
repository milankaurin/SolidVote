import React, { useState } from "react";
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../Constant/constant';

const AdminPanel = ({ signer }) => {
    const [inputCandidates, setInputCandidates] = useState("");
    const [loading, setLoading] = useState(false);
    const [votingDuration, setVotingDuration] = useState(""); // Dodato stanje za unos trajanja glasanja

    const handleInputCandidatesChange = (e) => {
        setInputCandidates(e.target.value);
    };

    const handleVotingDurationChange = (e) => {
        setVotingDuration(e.target.value);
    };

    const addCandidates = async () => {
        if (!inputCandidates.trim()) {
            alert("Please enter candidate names.");
            return;
        }

        setLoading(true);
        try {
            const candidatesArray = inputCandidates.split(",");
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            // Pozovite funkciju addCandidates iz pametnog ugovora i prosledite niz kandidata
            const transaction = await contract.addCandidates(candidatesArray);
            await transaction.wait();

            alert(`Candidates added successfully.`);
            setInputCandidates(""); // Resetovanje polja nakon dodavanja
        } catch (error) {
            console.error("Error adding candidates:", error);
            alert("Failed to add candidates.");
        }
        setLoading(false);
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

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>
            <input
                type="text"
                value={inputCandidates}
                onChange={handleInputCandidatesChange}
                placeholder="Candidate Names (comma separated)"
                disabled={loading}
            />
            <input
                type="text"
                value={votingDuration}
                onChange={handleVotingDurationChange}
                placeholder="Voting Duration (minutes)" // Dodato polje za unos trajanja glasanja
                disabled={loading}
            />
            <button onClick={addCandidates} disabled={loading}>
                {loading ? "Adding..." : "Add Candidates"}
            </button>
            <button onClick={startVoting} disabled={loading}>
                Start Voting
            </button>
        </div>
    );
};

export default AdminPanel;
