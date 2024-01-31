import React, { useState } from "react";

const AdminPanel = (props) => {
    const [candidateName, setCandidateName] = useState("");

    const handleCandidateNameChange = (e) => {
        setCandidateName(e.target.value);
    };

    const addCandidate = () => {
        // Logika za dodavanje kandidata putem smart contracta
        // Ovo zavisi od specifičnosti vašeg Ethereum smart contracta
        console.log("Dodajem kandidata: ", candidateName);
        // Ovde dodajte poziv smart contracta
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
