import React, { useState,useEffect } from "react";
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from '../Constant/constant';
import { Container, Box, Grid,Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InputSlider from './Slider'; // Pretpostavljajući da se InputSlider nalazi u istom direktorijumu
import Button from '@mui/material/Button';

const AdminPanel = ({ signer }) => {
    const tableRef = React.useRef(null);
    const [votingtitle, setVotingTitle] = useState(""); 
    const [unosKorisnika, setUnosKorisnika] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [redoviOpcijaZaGlasanje, setRedoviOpcijaZaGlasanje] = useState([{ tekst: '' }]);
    const [redoviGlasaca, setRedoviGlasaca] = useState([
        { tekst: '', broj: '' }
    ]);
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

    const handleVotingTitleChange = (e) => {
        setVotingTitle(e.target.value);
        console.log(votingtitle);
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
                setVotingTitle(event.target.value);
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
    console.log(redoviGlasaca);
}, [redoviGlasaca]);
        
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
          

          
          const handleTextChangeGlasaci = (index, event) => {
            setRedoviGlasaca(currentRows => {
                let newRows = [...currentRows];
                newRows[index].tekst = event.target.value;
    
                // Dodaj novi red ako se kuca u poslednjem i nije prazan
                if (index === currentRows.length - 1 && event.target.value.trim()) {
                    newRows.push({ tekst: '', broj: '' });
                }
    
                // Ukloni prethodni prazan red ako se trenutni prazni
                if (index === currentRows.length - 2 && !event.target.value.trim() && !newRows[currentRows.length - 1].tekst.trim()) {
                    newRows.pop();
                }
    
                return newRows;
            });
        };
    
        const handleNumberChangeGlasaci = (index, event) => {
            setRedoviGlasaca(currentRows => {
                const newRows = [...currentRows];
                newRows[index].broj = event.target.value;
                return newRows;
            });
        };
    
        const handleRemoveRowGlasaci = (index) => {
            setRedoviGlasaca(currentRows => {
                const newRows = currentRows.filter((_, i) => i !== index);
                if (newRows.length === 0) {
                    newRows.push({ tekst: '', broj: '' });
                }
                return newRows;
            });
        };
    
    
        
          
          
        
          return (
            <Box sx={{
                backgroundColor: '#f0f4f8', // Crna pozadina
                minHeight: '100vh', // Osigurava da pozadina pokriva celu visinu viewporta
                padding: '20px',
                overflowY: 'auto', // Omogućava skrolanje unutar Box-a ako je sadržaj duži od visine viewporta
                display: 'flex', // Omogućava flex raspored
                flexDirection: 'column', // Elementi se ređaju vertikalno
                alignItems: 'center', // Centriranje sadržaja po horizontali
              
                
            }}>
                 <Box sx={{
                  width: '100%', // Koristi celu dostupnu širinu
                  maxWidth: '70%', // Ali ne prelazi 70% širine roditelja
                  background: '#f0f4f8', // Ispravka: Dodajte # za HEX kod
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '20px',
                  overflowX: 'auto', // Omogućava horizontalno skrolovanje ako je potrebno
                  transform: 'scale(0.9)', // Smanjuje veličinu Box-a na 90%
                  transformOrigin: 'top center', // Postavlja origin transformacije na gornji centar
              
                
            }}>
               <Typography variant="h4" sx={{
  color: '#7B1FA2', // Tamna ljubičasta boja
  marginBottom: '40px',
  textAlign: 'center',
  fontWeight: 'bold', // Podebljan tekst
  letterSpacing: '0.1em', // Povećani razmak slova
  //textShadow: '2px 2px 4px rgba(0,0,0,0.5)', // Senka teksta za dodatnu dubinu
  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif", // Specifičan font
}}>
  ADMIN PANEL
</Typography>

                <Container maxWidth="lg" sx={{ marginBottom: '35px', background: 'white', borderRadius: '8px', boxShadow: 6, padding: '20px' }}>
                <TextField
                        label="Enter voting topic here"
                        variant="outlined"
                        value={votingtitle}
                        onChange={handleVotingTitleChange}
                        disabled={loading}
                        sx={{ minWidth: '250px' }}
                    />
                    <Typography variant="h6" sx={{ marginBottom: '10px' }}>
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
                          {index !== redoviOpcijaZaGlasanje.length - 1 ? (
            <IconButton onClick={() => handleRemoveRow(index)} color="error">
                <DeleteIcon />
            </IconButton>
        ) : (
            // Dodajte prazan prostor umesto ikone za brisanje u poslednjem redu
            <Box sx={{ width: 48, height: 48 }}></Box> // Prilagodite veličinu prema veličini DeleteIcon-a
        )}
                        </Box>
                    ))}
                </Container>
                <Container maxWidth="lg" sx={{ marginBottom: '35px', background: 'white', borderRadius: '8px', boxShadow: 6, padding: '20px' }}>
                <Typography variant="h4" sx={{ color: 'black', marginBottom: '20px', textAlign: 'center' }}>
                Enter addresses of eligible voters here
                </Typography>
    {redoviGlasaca.map((opcija, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <TextField
                fullWidth
                variant="outlined"
                label={`Voter ${index + 1}`}
                value={opcija.tekst}
                onChange={(event) => handleTextChangeGlasaci(index, event)}
                sx={{ marginRight: '10px', flex: 3 }} // Povećano sa flex: 2 na flex: 3
            />
            <TextField
                variant="outlined"
                label={`Number ${index + 1}`}
                type="text"
                value={opcija.broj}
                onChange={(event) => handleNumberChangeGlasaci(index, event)}
                InputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                }}
                sx={{ marginRight: '10px', flex: 0.5 }} // Zadržano flex: 1
            />
            {index !== redoviGlasaca.length - 1 ? (
                <IconButton onClick={() => handleRemoveRowGlasaci(index)} color="error">
                    <DeleteIcon />
                </IconButton>
            ) : (
                <Box sx={{ width: 42, height: 48 }}></Box>
            )}
        </Box>
    ))}
    </Container>

    
    <Container maxWidth="lg" sx={{
  marginBottom: '35px',
  background: 'f0f4f8',
  borderRadius: '8px',
 // boxShadow: 6,
  padding: '20px', // Postojeći padding sa strane
  pt: '40px', // Povećan padding na vrhu
  pb: '40px', // Povećan padding na dnu
}}>
  <Grid container spacing={2} alignItems="center">
    <Grid item xs={12} md={6}>
      <Typography variant="h5" sx={{ color: 'black', mb: 3 }}>Voting Duration</Typography>
      <Box sx={{ width: '100%', pr: 2 }}>
        <InputSlider />
      </Box>
    </Grid>
    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1.25 }}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', pl: 2 }}>
        <Button variant="contained" onClick={startVoting} disabled={loading} sx={{
          height: '56px',
          width: '80%',
          fontSize: '1rem',
          fontWeight: 'bold',
          mb: 2,
          borderRadius: '25px'
        }}>
          Start Voting
        </Button>
        <Button variant="contained" color="error" onClick={stopVoting} disabled={loading} sx={{
          height: '56px',
          width: '80%',
          fontSize: '1rem',
          fontWeight: 'bold',
          borderRadius: '25px'
        }}>
          Stop Voting
        </Button>
      </Box>
    </Grid>
  </Grid>
</Container>
            
                {/* Prva tabela u svom Container-u */}
                <Container maxWidth="lg" sx={{ marginBottom: '35px', background: 'white', borderRadius: '8px', boxShadow: 6, padding: '20px' }}>
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
                </Container>
                </Box>
            </Box>
            
        );
};
export default AdminPanel;




