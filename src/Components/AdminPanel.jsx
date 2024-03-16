import React, { useState,useEffect } from "react";
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../Constant/constant';

const AdminPanel = ({ signer }) => {
    const tableRef = React.useRef(null);

    const [unosKorisnika, setUnosKorisnika] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [naslovGlasanja, setNaslovGlasanja] = useState('Početni Naslov');
    const [redoviOpcijaZaGlasanje, setRedoviOpcijaZaGlasanje] = useState([{ tekst: '' }]);

    const [inputCandidates, setInputCandidates] = useState("");
    const [loading, setLoading] = useState(false);
    const [votingDuration, setVotingDuration] = useState(""); // Dodato stanje za unos trajanja glasanja
    const [candidates, setCandidates] = useState([]); 
   
    const backgroundStyle = {
        backgroundImage: `url('/images/adminBackground.jpg')`,
        backgroundSize: 'cover', // Pokriva celu pozadinu
        backgroundPosition: 'center', // Centrira sliku
        height: '100vh', // Visina pozadine
        width: '100vw' // Širina pozadine
    };
    const [action, setAction] = useState("");
    const handleInputCandidatesChange = (e) => {
        setInputCandidates(e.target.value);
    };

    const handleVotingDurationChange = (e) => {
        setVotingDuration(e.target.value);
    };
    
    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);
            const candidatesArray = await contract.getAllVotesOfCandiates();
            setCandidates(candidatesArray.map((candidate, index) => ({
                index,
                name: candidate.name,
                voteCount: candidate.voteCount.toNumber(), // Pretpostavlja se da je voteCount BigNumber
            })));
        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
        setLoading(false);
    };

    const handleNaslovChange = (event) => {
        setNaslovGlasanja(event.target.value);
    };

   

    const addCandidates = async () => {
        setAction("adding");
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
        setAction("starting");
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
        } };
    const stopVoting = async () => {
        setAction("stoping");
        setLoading(true);
        try {
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);
            const transaction = await contract.stopVoting();
            await transaction.wait();
            alert("Voting has been stopped.");
        } catch (error) {
            console.error("Error stopping the voting:", error);
            alert("Failed to stop voting.");
        }
        setLoading(false);
    };
    const clearCandidates = async () => {
        setAction("clearing");
        setLoading(true);
        try {
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);
            const transaction = await contract.clearCandidates();
            await transaction.wait();
            alert("Candidates cleared successfully.");
        } catch (error) {
            console.error("Error clearing candidates:", error);
            alert("Failed to clear candidates.");
        }
        setLoading(false);};

        const handleFinishEditing = (event) => {
            if (event.type === 'blur' || (event.key === 'Enter')) {
                setIsEditing(false);
                setNaslovGlasanja(event.target.value);
            }
        };
    
        const handleTextChange = (index, event) => {
            setRedoviOpcijaZaGlasanje(currentRows => {
                const newRows = [...currentRows];
                newRows[index].tekst = event.target.value;
        
                // Ako se unosi tekst u poslednji red, dodaj novi prazan red
                if (index === currentRows.length - 1 && event.target.value.trim()) {
                    newRows.push({ tekst: '' });
                }
                
                return newRows;
            });
        };
        
        const handleRemoveRow = (indexToRemove) => {
            setRedoviOpcijaZaGlasanje(currentRows => {
                const newRows = currentRows.filter((_, index) => index !== indexToRemove);
        
                // Ako su svi redovi obrisani, osiguravamo da postoji barem jedan prazan red
                if (newRows.length === 0) {
                    newRows.push({ tekst: '' });
                }
               
                return newRows;
                
            });
        };
    
        useEffect(() => {
            console.log(redoviOpcijaZaGlasanje);
        }, [redoviOpcijaZaGlasanje]);
        
    useEffect(() => {
        fetchCandidates();  }, []);

        const updateRowsFromTable = () => {
            const rows = [];
            const tableRows = tableRef.current.querySelectorAll("tr");
            tableRows.forEach((tr, index) => {
              // Preskoči zaglavlje tabele
              if (index > 0) {
                const input = tr.querySelector("input");
                if (input) {
                  const value = input.value;
                  if (value.trim() || index === tableRows.length - 1) {
                    // Dodaj samo ako polje nije prazno ili je poslednje polje
                    rows.push({ id: index, tekst: value });
                  }
                }
              }
            });
          
            setRedoviOpcijaZaGlasanje(rows);
          };
          

          
        
        
          
          
        
    return (
        <div style={backgroundStyle} className="admin-panel">
        <h2 style={{ color: 'white' }}>Administrator Panel</h2>
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
            placeholder="Voting Duration (minutes)"
            disabled={loading}
        />
        <button onClick={addCandidates} disabled={loading}>
            {loading ? "Adding..." : "Add Candidates"}
        </button>
        <button onClick={startVoting} disabled={loading}>
            Start Voting
        </button>
        <button onClick={stopVoting} disabled={loading}>
            Stop Voting
        </button>
        <button onClick={clearCandidates} disabled={loading}>
            Clear Candidates
        </button>

        <table className="candidates-table">
            <thead>
                <tr>
                    <th>Index</th>
                    <th>Candidate Name</th>
                    <th>Vote Count</th>
                </tr>
            </thead>
            <tbody>
                {candidates.map((candidate, index) => (
                    <tr key={index}>
                        <td>{index}</td>
                        <td>{candidate.name}</td>
                        <td>{candidate.voteCount}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        
               
        <div>
            <h2 onDoubleClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>
                {isEditing ? (
                    <input
                        type="text"
                        defaultValue={naslovGlasanja}
                        onBlur={handleFinishEditing}
                        onKeyPress={(event) => handleFinishEditing(event)}
                        autoFocus
                    />
                ) : (
                    naslovGlasanja
                )}
            </h2>
            <table>
                <thead>
                    <tr>
                        <th>Naslov</th>
                        <th>Akcije</th>
                    </tr>
                </thead>
                <tbody>
                    {redoviOpcijaZaGlasanje.map((red, index) => (
                        <tr key={index}>
                            <td>
                                <input
                                    type="text"
                                    value={red.tekst}
                                    onChange={(event) => handleTextChange(index, event)}
                                />
                            </td>
                            <td>
                                <button onClick={() => handleRemoveRow(index)} style={{ cursor: 'pointer' }}>
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
};
export default AdminPanel;




