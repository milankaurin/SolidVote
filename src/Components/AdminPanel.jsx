import React, { useState } from "react";

const AdminPanel = (props) => {
    const [candidateName, setCandidateName] = useState("");

    const handleCandidateNameChange = (e) => {
        setCandidateName(e.target.value);
    };

    const addCandidate = async () => {
        console.log("Dodajem kandidata: ", candidateName);
    
        try {
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);
            const transaction = await contract.addCandidate(candidateName);
            await transaction.wait();
    
            // Nakon dodavanja kandidata, možda ćete želeti da osvežite listu kandidata
            props.refreshCandidates(); // Ovo je funkcija koju morate implementirati
        } catch (error) {
            console.error("Greška pri dodavanju kandidata: ", error);
        }
    };

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>
            <input type="text" value={candidateName} onChange={handleCandidateNameChange} placeholder="Candidate Name" />
            <button onClick={addCandidate}>Add Candidate</button>
            {/* Dodatni interfejs ako je potreban */}
        </div>
    );
};

export default AdminPanel;
