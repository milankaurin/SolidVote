import React, { useState } from "react";
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../Constant/constant';


const AdminPanel = ({ signer }) => {
    const [candidateName, setCandidateName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCandidateNameChange = (e) => {
        setCandidateName(e.target.value);
    };


    const startVoting = async (durationInMinutes) => {
        try {
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);
            const transaction = await contract.startVoting(durationInMinutes);
            await transaction.wait();
            alert("Voting has started.");
        } catch (error) {
            console.error("Error starting the voting:", error);
            alert("Failed to start voting.");
        }
    };
    
    // Obrada klika na dugme za početak glasanja
    const handleStartVotingClick = () => {
        const durationInMinutes = 60; // Primer, možete postaviti željenu dužinu trajanja glasanja
        startVoting(durationInMinutes);
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
            <button onClick={addCandidate} disabled={loading}>
                {loading ? "Adding..." : "Add Candidate"}
            </button>
            <button onClick={handleStartVotingClick}>Start Voting</button>
        </div>
    );
};

export default AdminPanel;


