import React, { useState,useEffect,useMemo } from "react";
import { ethers } from 'ethers';
import { contractAbi } from '../Constant/constant';
import { Container, Box, Grid,Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InputSlider from './Slider'; 
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import QRCode from 'qrcode.react';  // If QRCode is the default export
// OR
 // If you want to use QRCodeSVG, adjust as per your requirement

const AdminPanel = ({ signer, voters, postaviKolicinuZaSlanje,  updateRedoviGlasaca ,kolicinaZaSlanje, tokenAbi,tokenAddress,contractAddress}) => {
  
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const tableRef = React.useRef(null);
    const [votingtitle, setVotingTitle] = useState("");  
    const [unosKorisnika, setUnosKorisnika] = useState(''); 
    const [isEditing, setIsEditing] = useState(false);
    const [redoviOpcijaZaGlasanje, setRedoviOpcijaZaGlasanje] = useState([{ tekst: '' }]); 
    const [redoviGlasaca, setRedoviGlasaca] = useState([ 
        { tekst: '', broj: '' }
    ]);
    const [isVotingFinished, setisVotingFinished] = useState();
    const [inputCandidates, setInputCandidates] = useState("");
    const [loading, setLoading] = useState(false);
    const [votingDuration, setVotingDuration] = useState("30"); 
    const [candidates, setCandidates] = useState([]); 
    const handleSliderChange = (newValue) => {
      setVotingDuration(newValue); // Pretpostavljam da želite da ažurirate votingDuration
    };
    const [uniqueID, setUniqueID] = useState('');
    const [remainingTime, setRemainingTime] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [gasAmountForVote, setGasAmountForVote] = useState(0);
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
    const formattedTime = useMemo(() => {
      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;
      return `${hours}h ${minutes}m ${seconds}s`;
  }, [remainingSeconds]);
  
  const downloadQR = () => {
    const canvas = document.getElementById("qrCodeEl");
    const pngUrl = canvas.toDataURL("image/png");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "QRCode.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};


    async function getVotingTitle() {
      if (!contractAddress) return; // Check if contractAddress is not null
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      const title = await contractInstance.getVotingTitle();
      console.log(title);
      setVotingTitle(title);
      return title;
  }
  
  async function getRemainingTimeFromContract() {
    if (!contractAddress) return 0; // Return 0 if contractAddress is null
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
    const timeInSeconds = await contractInstance.getRemainingTime();
    console.log("Time from contract:", timeInSeconds); // Log fetched time
    return parseInt(timeInSeconds, 10);
}

async function syncTimeWithContract() {
  const timeInSeconds = await getRemainingTimeFromContract();
  console.log("Fetched time from contract:", timeInSeconds);
  if (Math.abs(timeInSeconds - remainingSeconds) > 120) {
    console.log("Significant time difference detected. Syncing time...");
    setRemainingSeconds(timeInSeconds);
  }
}



  async function getCurrentStatus() {
    if (!contractAddress) return; // Check if contractAddress is not null
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
    const status = await contractInstance.getVotingStatus();
    console.log("HHHHHHHHHHHHHHH"+status);
    setisVotingFinished(status);
}

  async function getCandidates() {
    if (!contractAddress) return []; // Return empty array if no address
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
    const candidatesList = await contractInstance.getAllVotesOfCandidatesAdmin();
    return candidatesList.map((candidate, index) => {
        return {
            index: index,
            name: candidate.name,
            voteCount: candidate.voteCount.toNumber()
        };
    });
}

    
    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);
            const candidatesArray = await contract.getAllVotesOfCandidatesAdmin();
            console.log(candidatesArray);
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




const fetchUniqueID = async () => {
    try {
        const contract = new ethers.Contract(contractAddress, contractAbi, signer);
        const fetchedID = await contract.getUniqueID();
        setUniqueID(fetchedID.toString());  // Convert BigNumber to string if needed
    } catch (error) {
        console.error('Failed to fetch the unique ID:', error);
    }
};

useEffect(() => {
  // Postavljanje providera
  let activeProvider;
  if (window.ethereum) {
      activeProvider = new ethers.providers.Web3Provider(window.ethereum);
     
  }
  // Dohvatanje trenutne cene gasa i postavljanje količine za slanje
  const fetchGasPrice = async () => {
    if (activeProvider) {
        const gasPrice = await activeProvider.getGasPrice();
        const gasPriceInWei = gasPrice.mul(79441); // Množenje cene gasa sa vašim brojem
        const gasPriceWithBuffer = gasPriceInWei.mul(120).div(100); // Dodavanje 20% buffer-a
        const gasPriceInEth = ethers.utils.formatEther(gasPriceWithBuffer); // Pretvaranje iz wei u ether
        postaviKolicinuZaSlanje(gasPriceInEth); // Prosleđivanje iznosa u etherima
    }
};

if (activeProvider) {
    fetchGasPrice();
}

}, []);


useEffect(() => {
  if (kolicinaZaSlanje !== "0") { // Provera da li je količina različita od "0" (inicijalna vrednost)
      console.log("Ažurirana količina za slanje:", kolicinaZaSlanje);
      // Ovde možete dalje manipulisati sa kolicinaZaSlanje
  }
}, [kolicinaZaSlanje]);

useEffect(() => {
  const countdown = setInterval(() => {
    setRemainingSeconds(prevSeconds => prevSeconds > 0 ? prevSeconds - 1 : 0);
  }, 1000);

  return () => clearInterval(countdown);
}, []);



useEffect(() => {
  const interval = setInterval(syncTimeWithContract, 60000); // Sinhronizacija na svakih 90 sekundi
  return () => clearInterval(interval);
}, [remainingSeconds, contractAddress]); // Dependencies da osiguramo pravilno ažuriranje

    
    
    useEffect(() => {
      async function fetchData() {
          try {
              const title = await getVotingTitle(); // Assuming this function properly handles its asynchronous operations
              setVotingTitle(title);
  
              const time = await getRemainingTimeFromContract();
              console.log(time); // Assuming this function properly handles its asynchronous operations
              setRemainingSeconds(time);
  
              const candidatesList = await getCandidates(); // Modify getCandidates to directly return the formatted candidates
              setCandidates(candidatesList);

             const votingStatus = await getCurrentStatus();
             setisVotingFinished(votingStatus);
             console.log("GGGGGGGGGGGG"+isVotingFinished);

              fetchUniqueID();
              getCurrentStatus();
          } catch (error) {
              console.error("Failed to fetch data:", error);
          }
      }
  
      fetchData();
  }, [contractAddress]); // Include dependencies as necessary
  

    
    const startVoting = async () => {
      setAction("starting");
      try {
          const durationInMinutes = parseInt(votingDuration); 
          if (isNaN(durationInMinutes) || durationInMinutes <= 0) {
              alert("Please enter a valid positive number for voting duration.");
              return;
          }
  
          const candidateNames = redoviOpcijaZaGlasanje.filter(row => row.tekst.trim()).map(row => row.tekst);
          const voterAddresses = redoviGlasaca.filter(row => row.tekst.trim()).map(row => row.tekst);
          const voterPoints = redoviGlasaca.filter(row => row.broj.trim()).map(row => row.broj);
  
          if (candidateNames.length === 0 || voterAddresses.length === 0) {
              alert("Please ensure there are candidates and voters before starting the vote.");
              return;
          }
  
          const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
          const feeAmountEther = "10"; // Adjust according to your token's decimals
  
          // Approving tokens for burning
          const approveTx = await tokenContract.approve(contractAddress, ethers.utils.parseEther(feeAmountEther));
          await approveTx.wait(); // Ensure approval is confirmed
  
          const totalAmountForBatch = voterAddresses.length * kolicinaZaSlanje;
          const contract = new ethers.Contract(contractAddress, contractAbi, signer);
          const transaction = await contract.startVoting(
              durationInMinutes,
              voterAddresses,
              voterPoints,
              candidateNames,
              votingtitle,
              showResults,
              voterAddresses,
              ethers.utils.parseEther(kolicinaZaSlanje.toString()), 
              ethers.utils.parseEther(totalAmountForBatch.toString()), 
              { value: ethers.utils.parseEther(totalAmountForBatch.toString()) }
          );
  
          await transaction.wait();
          alert("Voting has started.");
      } catch (error) {
          console.error("Error starting the voting:", error);
          alert("Failed to start voting. Make sure you have enough tokens and have approved them for burning.");
      }
  };
        
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
  console.log(votingDuration);
}, [votingDuration]);


useEffect(() => {
    console.log(redoviGlasaca);
}, [redoviGlasaca]);
        
   /*  useEffect(() => {
        fetchCandidates();  }, []);

        const updateRowsFromTable = () => {
            const rows = [];
            const tableRows = tableRef.current.querySelectorAll("tr");
            tableRows.forEach((tr, index) => {
             
              if (index > 0) {
                const input = tr.querySelector("input");
                if (input) {
                  const value = input.value;
                  if (value.trim() || index === tableRows.length - 1) {
                   
                    rows.push({ id: index, tekst: value });
                  }
                }
              }
            });
          
            setRedoviOpcijaZaGlasanje(rows);
          }; */
          

          
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
                let updatedRedoviGlasaca = [...redoviGlasaca];
                updatedRedoviGlasaca[index].tekst = event.target.value;
                
                // Koristi prosleđenu funkciju za ažuriranje redoviGlasaca u App komponenti
                updateRedoviGlasaca(updatedRedoviGlasaca);
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
    
    
        const handleSeeResultsChange = (e) => {
          const checked = e.target.checked;
          setShowResults(checked);
          
      };
     
    
  

        
          return (
            <Box sx={{
                backgroundColor: '#1c1c1c', 
                minHeight: '100vh',
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <Box sx={{
                  width: '100%', 
                  maxWidth: '70%', 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: '#1c1c1c',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '00px',
                  overflowX: 'auto', 
                  transform: 'scale(0.75)', 
                  transformOrigin: 'top center',
                }}>
               <Typography variant="h4" sx={{
  color:'white', 
  marginBottom: '40px',
  marginTop: '40px',
  textAlign: 'center',
  fontWeight: 'bold',
  letterSpacing: '0.1em',
  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
}}>
  ADMIN PANEL
</Typography>

<Container maxWidth="lg" sx={{ marginBottom: '50px', background: '#222329', borderRadius: '11px', boxShadow: 6, padding: '20px' }}>
<TextField
  label="Enter voting topic here"
  variant="outlined"
  value={votingtitle}
  onChange={handleVotingTitleChange}
  disabled={loading}
  sx={{
    '& .MuiInputLabel-root': { color: 'white' },
    '& .MuiOutlinedInput-input': { color: 'white' }, 
    minWidth: '250px',
    marginBottom: '30px',
    marginTop: '20px',
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#BDBDBD' }, 
      '&:hover fieldset': { borderColor: '#9E9E9E' }, 
      '&.Mui-focused fieldset': { borderColor: '#ff007a' }, 
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#ff007a' }, 
  }}
/>

       
        {/* Logika za prikaz i uređivanje opcija glasanja */}
        {redoviOpcijaZaGlasanje.map((opcija, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <TextField
              fullWidth
              variant="outlined"
              label={`Option ${index + 1}`}
              value={opcija.tekst}
              onChange={(event) => handleTextChange(index, event)}
              sx={{ '& .MuiInputLabel-root': { color: 'white' }, 
              '& .MuiOutlinedInput-input': { color: 'white' }, 
                marginRight: '10px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#BDBDBD' }, 
                  '&:hover fieldset': { borderColor: '#9E9E9E' }, 
                  '&.Mui-focused fieldset': { borderColor: '#ff007a' }, 
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#ff007a' },
                '& input': {
                  fontSize: '1.5rem'}
              }}
            />
            {index !== redoviOpcijaZaGlasanje.length - 1 ? (
              <IconButton onClick={() => handleRemoveRow(index)} sx={{ color: '#f3e5f5' }}>
                  <DeleteIcon />
              </IconButton>
            ) : (
              <Box sx={{ width: 44, height: 48 }}></Box> 
            )}
          </Box>
        ))}
      </Container>
      <Container maxWidth="lg" sx={{ marginBottom: '35px', background: '#222329', borderRadius: '11px', boxShadow: 6, padding: '20px' }}>
        <Typography variant="h5" sx={{ color: 'white', marginBottom: '20px', textAlign: 'center', fontWeight: '500', fontFamily: "'Robot', sans-serif", fontSize: '2rem' }}>
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
              sx={{  
                '& .MuiInputLabel-root': { color: 'white' }, 
                  '& .MuiOutlinedInput-input': { color: 'white' }, 
                marginRight: '10px', flex: 3,
                '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#BDBDBD' }, 
                    '&:hover fieldset': { borderColor: '#9E9E9E' }, 
                    '&.Mui-focused fieldset': { borderColor: '#ff007a' }, 
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#ff007a' }, 
                  '& input': {
                    fontSize: '1.5rem'}
              }}
            />
            <TextField
              variant="outlined"
              label={`Number ${index + 1}`}
              type="text"
              value={opcija.broj}
              onChange={(event) => handleNumberChangeGlasaci(index, event)}
              InputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
              }}
              sx={{
                '& .MuiInputLabel-root': { color: 'white' }, 
                '& .MuiOutlinedInput-input': { color: 'white' }, 

                marginRight: '10px', flex: 0.5,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#BDBDBD' }, 
                  '&:hover fieldset': { borderColor: '#9E9E9E' }, 
                  '&.Mui-focused fieldset': { borderColor: '#ff007a' }, 
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#ff007a' }, 
                '& input': {
                  fontSize: '1.5rem'}
              
              }}
            />
            {index !== redoviGlasaca.length - 1 ? (
              <IconButton onClick={() => handleRemoveRowGlasaci(index)} sx={{ color: '#f3e5f5' }}>
                  <DeleteIcon />
              </IconButton>
            ) : (
              <Box sx={{ width: 42, height: 48 }}></Box>
            )}
          </Box>
        ))}
      </Container>
    
    <Container maxWidth="lg" sx={{
  marginBottom: '15px',
  background: '#1c1c1c', 
  borderRadius: '11px',
  padding: '20px',
  pt: '40px',
  pb: '40px',
  boxShadow: 0
}}>
  <Grid container spacing={2} alignItems="center">
    <Grid item xs={12} md={6}>
      <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>Voting duration (in minutes)</Typography>
      <Box sx={{ width: '100%', pr: 2 }}>
        <InputSlider onSliderChange={handleSliderChange}/>
       
        <Box
  sx={{
    '&:hover': {
      '& .MuiCheckbox-root': {
        color: '#ff007a', 
      },
      '& .label-text': {
        color: '#ff007a', 
      },
    },
  }}
>
  <FormControlLabel
    control={
      <Checkbox
        sx={{
          mt: '30px',
          color: 'white', 
          '&.Mui-checked': {
            color: '#e60072', 
          },
          '& svg': {
            fontSize: '2rem',
          }
        }}
        checked={showResults}
        onChange={handleSeeResultsChange}
        name="showResults"
      />
    }
    label={
      <Typography
        className="label-text"
        sx={{
          fontSize: '1.4rem',
          color: 'white',
          mt: '30px',
        }}
      >
        Allow voters to see current results
      </Typography>
    }
    sx={{
      mb: 2,
      width: '100%',
      justifyContent: 'center',
    }}
  />
      </Box>   {/*checkbox*/}
      </Box>
    </Grid>
    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1.25 }}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', pl: 2 }}>
        {/* Start Voting Button */}
        <Button variant="contained" onClick={startVoting} disabled={loading} sx={{
          height: '65px',
          width: '85%',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          mb: 2,
          borderRadius: '12px', 
          backgroundColor: '#ff007a', 
          '&:hover': {
            backgroundColor: '#463346', 
          },
        }}>
          Start Voting
        </Button>
        {/* Stop Voting Button */}
        <Button variant="contained" color="error" onClick={stopVoting} disabled={loading} sx={{
          height: '65px',
          width: '85%',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          borderRadius: '12px',
          backgroundColor: '#CCC', 
          color: 'black', 
          '&:hover': {
            backgroundColor: '#AAA',
          },
        }}>
          Stop Voting
        </Button>
      </Box>
    </Grid>
   </Grid>
</Container>

<Box sx={{ width: '100%', maxWidth: '90%', display: 'flex', justifyContent: 'center', color: 'white', fontSize: '2rem' , mb:'20px', fontFamily: 'Roboto, sans-serif' }}>
   {votingtitle}
</Box>



                {/*table in container */}
                <Box sx={{ width: '100%', maxWidth: '95%', display: 'flex', justifyContent: 'center', color: '#f7f7f7',boxShadow: 6 }}>
    <TableContainer component={Paper} sx={{ background: '#f7f7f7', borderRadius: '8px', boxShadow: 6, padding: '20px', width: '100%',borderRadius: '10px'}}>
        <Table sx={{ minWidth: 650, fontSize: '2rem',borderRadius: '10px'}}> 
            <TableHead>
                <TableRow>
                    <TableCell align='center' sx={{ fontSize: '1.5rem',color:'black' }}>Index</TableCell>
                    <Box sx={{ width: 5, height: 48 }}></Box>
                    <TableCell align='center' sx={{ fontSize: '1.5rem',color:'black' }}>Candidate Name</TableCell>
                    <TableCell align='center' sx={{ fontSize: '1.5rem',color:'black' }}>Vote Count</TableCell>
                </TableRow>
            </TableHead>
            <TableBody sx={{
                '& .MuiTableRow-root:nth-of-type(odd)': {
                    backgroundColor: '#e4c4f2', 
                },
                '& .MuiTableRow-root:nth-of-type(even)': {
                    backgroundColor: '#f7f7f7', 
                },fontSize: '5rem',borderRadius: '10px'
            }}>
                {candidates.map((candidate, index) => (
                    <TableRow key={index}>
                        <TableCell align='center' sx={{ fontSize: '1.5rem' }}>{index}</TableCell>
                        <Box sx={{ width: 60, height: 48 }}></Box>
                        <TableCell align='center' sx={{ fontSize: '1.5rem' }}>{candidate.name}</TableCell>
                        <TableCell align='center' sx={{ fontSize: '1.5rem' }}>{candidate.voteCount}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
</Box>
<Box sx={{ width: '100%', maxWidth: '90%', display: 'flex', justifyContent: 'center', color: 'white', fontSize: '2rem', mb: '30px', mt: '20px' }}> {/* Reduced bottom margin and reduced top margin */}
    Remaining time: {formattedTime}
</Box>
                <Box sx={{
  marginTop: '0px', // No top margin to make it closer
  marginBottom: '20px', // Reduced bottom margin before the button
  display: 'flex', 
  flexDirection: 'column', // Stack elements vertically
  alignItems: 'center',
  width: '100%'
}}>
  <QRCode
    id="qrCodeEl"
    value={uniqueID}
    size={200}
    level={"H"}
    includeMargin={true}
    style={{
      border: '5px solid #ff007a', // Pink border matching the theme
      borderRadius: '8px',
      padding: '5px'
    }}
  />
  <Button onClick={downloadQR} variant="contained" sx={{
    mt: 3, // Margin top for spacing after the QR Code
    padding: '12px 30px', // Increased padding for a larger button appearance
    fontSize: '1.2rem', // Larger font size for better visibility
    backgroundColor: '#ff007a', // Theme color
    '&:hover': {
      backgroundColor: '#e6006d' // Darker on hover
    },
    color: 'white',
    fontWeight: 'bold'
  }}>
    Download QR Code
</Button>

</Box>
                </Box>
                
      
<TextField
    label="Unique ID"
    variant="outlined"
    value={uniqueID}
    InputProps={{
        readOnly: true,
    }}
    fullWidth
    margin="normal"
    sx={{
        '& label.Mui-focused': {
            color: '#ff007a',
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: '#ff007a',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#BDBDBD',
            },
            '&:hover fieldset': {
                borderColor: '#ff007a',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#ff007a',
            },
            '& input': {
                color: 'white',
            },
            backgroundColor: '#1c1c1c',
        },
        '& .MuiInputLabel-root': { // Label color
            color: 'white',
        },
    }}
/>


            </Box>
            
        );
};
export default AdminPanel;




