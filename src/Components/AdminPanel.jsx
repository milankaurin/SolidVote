import React, { useState,useEffect } from "react";
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../Constant/constant';
import { Container, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminPanel = ({ signer }) => {
    const tableRef = React.useRef(null);

    const [unosKorisnika, setUnosKorisnika] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [naslovGlasanja, setNaslovGlasanja] = useState('Your Question');
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
                let newRows = [...currentRows];
                newRows[index].tekst = event.target.value;
        
                // Ako se unosi tekst u poslednji red, i taj tekst nije prazan, dodaj novi prazan red
                if (index === currentRows.length - 1 && event.target.value.trim()) {
                    newRows.push({ tekst: '' });
                } else if (index === currentRows.length - 2 && !event.target.value.trim() && !newRows[currentRows.length - 1].tekst.trim()) {
                    // Ako je prethodni red prazan, a unosi se prazan tekst u trenutni poslednji red, ukloni taj poslednji red
                    newRows.pop();
                }
        
                return newRows.filter(row => row.tekst.trim() || newRows.indexOf(row) === newRows.length - 1); // Uvek zadrži barem jedan red
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
            <Box sx={{
                backgroundColor: '#E0F7FA', // Svetlo plava pozadina
                minHeight: '100vh', // Osigurava da pozadina pokriva celu visinu viewporta
                padding: '20px',
                overflowY: 'auto' // Omogućava skrolanje unutar Box-a ako je sadržaj duži od visine viewporta
            }}>
                <Container maxWidth="lg" sx={{ marginBottom: '20px', background: 'white', borderRadius: '8px', boxShadow: 3, padding: '20px' }}>
                    <Typography variant="h4" sx={{ color: '#333', marginBottom: '20px', textAlign: 'center' }}>
                        Administrator Panel
                    </Typography>
                    <TextField
                        label="Candidate Names (comma separated)"
                        variant="outlined"
                        value={inputCandidates}
                        onChange={handleInputCandidatesChange}
                        disabled={loading}
                        sx={{ minWidth: '250px', marginRight: '20px' }}
                    />
                    <TextField
                        label="Voting Duration (minutes)"
                        variant="outlined"
                        value={votingDuration}
                        onChange={handleVotingDurationChange}
                        disabled={loading}
                        sx={{ minWidth: '250px' }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
                        <button className="admin-panel-button" onClick={addCandidates} disabled={loading} sx={{ marginBottom: '10px' }}>
                            {loading ? "Adding..." : "Add Candidates"}
                        </button>
                        <button className="admin-panel-button" onClick={startVoting} disabled={loading} sx={{ marginBottom: '10px' }}>
                            Start Voting
                        </button>
                        <button className="admin-panel-button" onClick={stopVoting} disabled={loading} sx={{ marginBottom: '10px' }}>
                            Stop Voting
                        </button>
                        <button className="admin-panel-button" onClick={clearCandidates} disabled={loading}>
                            Clear Candidates
                        </button>
                    </Box>
                </Container>
        
                <Paper elevation={3} sx={{ overflow: 'auto', padding: '20px', margin: '20px auto', maxWidth: 'lg', background: 'white', borderRadius: '8px', boxShadow: 3 }}>
                    <Typography variant="h6" sx={{ marginBottom: '10px' }}>
                        Candidates
                    </Typography>
                    <TableContainer component={Paper} sx={{ marginBottom: '20px' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Index</TableCell>
                                    <TableCell>Candidate Name</TableCell>
                                    <TableCell>Vote Count</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {candidates.map((candidate, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index}</TableCell>
                                        <TableCell>{candidate.name}</TableCell>
                                        <TableCell>{candidate.voteCount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Typography variant="h6" sx={{ marginTop: '20px', marginBottom: '10px' }}>
                        Voting Options
                    </Typography>
                    {/* Logika za prikaz i uređivanje opcija glasanja */}
                    {redoviOpcijaZaGlasanje.map((opcija, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label={`Option ${index + 1}`}
                                value={opcija.tekst}
                                onChange={(event) => handleTextChange(index, event)}
                                sx={{ marginRight: '10px' }}
                            />
                            <IconButton onClick={() => handleRemoveRow(index)} color="error">
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                </Paper>
            </Box>
        );
};
export default AdminPanel;




