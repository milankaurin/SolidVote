
import React, { useState,useEffect } from "react";
import { Radio, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';


const Connected = ({ account, candidates, remainingTime, voteFunction, showButton, votingStatus,Title, isAdmin,showResults }) => {
    const [selectedCandidate, setSelectedCandidate] = useState('');

    const handleRadioChange = (event) => {
        setSelectedCandidate(event.target.value);
    };

    const isVotingFinished = !votingStatus;
    console.log("Voting Status:", votingStatus);

    const voteClick = () => {
        if (!selectedCandidate) {
            console.error("No candidate selected.");
            return;
        }
        voteFunction(selectedCandidate);
    };

    
useEffect(() => {
    console.log(selectedCandidate);
}, [selectedCandidate]);

    const backgroundStyle = {
        backgroundColor: '#f0f4f8',
        height: '100vh',
        width: '100vw'
    };


    useEffect(() => {
        console.log("showResults prop in Connected:", showResults);
      }, [showResults]);

    return (
        <div style={backgroundStyle} className="connected-container">
        
        <Typography variant="h4" sx={{ color: 'black', marginBottom: '10px', textAlign: 'center',mt:'80px' }}>
            {Title} {/* Ažurirajte ovde ako Title treba biti pozvan kao funkcija ili je dinamički prop */}
        </Typography>
    
        <TableContainer 
    component={Paper} 
    sx={{  
        maxWidth: '70%', // Povećan maxWidth za šire zauzimanje prostora
        margin: '20px auto', 
        overflowX: 'auto',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    }}
>
    <Table aria-label="candidates table" size="small"> {/* Dodato size="small" za manje redove */}
        <TableHead>
            <TableRow>
                <TableCell align="center" sx={{ fontSize: '0.875rem' }}>Index</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.875rem' }}>Candidate name</TableCell>
                {showResults && <TableCell align="center" sx={{ fontSize: '0.875rem' }}>Votes</TableCell>}
                <TableCell align="center" sx={{ fontSize: '0.875rem' }}>Vote</TableCell>
            </TableRow>
        </TableHead>
        <TableBody sx={{
            '& .MuiTableRow-root': {
                '& td': {
                    padding: '6px', // Smanjeni padding za ćelije
                    fontSize: '0.75rem', // Smanjena veličina fonta za tekst unutar ćelija
                },
                '&:nth-of-type(odd)': {
                    backgroundColor: '#f3e5f5', // lagana ljubičasta
                },
                '&:nth-of-type(even)': {
                    backgroundColor: '#f7f7f7', // lagana sivkasta
                },
            },
        }}>
            {candidates.map((candidate, index) => (
                <TableRow key={index}>
                    <TableCell align="center">{candidate.index}</TableCell>
                    <TableCell align="center">{candidate.name}</TableCell>
                    {showResults && <TableCell align="center">{candidate.voteCount}</TableCell>}
                    <TableCell align="center">
                        <Radio
                            checked={selectedCandidate === candidate.index.toString()}
                            onChange={handleRadioChange}
                            value={candidate.index.toString()}
                            name="radio-buttons"
                            sx={{ '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }} // Prilagodite veličinu ikone Radio button-a ako je potrebno
                        />
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
</TableContainer>

        <Typography variant="h6" sx={{ color: '#6e6e6e', marginBottom: '10px', marginTop: '20px', textAlign: 'center' }}>
            Remaining Time: {remainingTime}
        </Typography>
        {!isVotingFinished && !showButton && (
          <Button variant="contained" onClick={voteClick} sx={{ 
            marginTop: '20px', 
            marginBottom: '50px', 
            display: 'block', 
            marginX: 'auto', // Centriranje dugmeta
            fontSize: '1.5rem', // Veća veličina fonta
            fontWeight: 'bold', // Podebljani tekst
            padding: '15px 30px', // Povećan prostor oko teksta (visina x širina)
            borderRadius: '16px', // Blago zaobljeni uglovi
            backgroundColor: '#ff007a', // Specifična ljubičasta boja
            '&:hover': {
                backgroundColor: '#e60072', // Tamnija nijansa za hover efekat
            },
        }}>
            Vote
        </Button>
        
        )}
    </div>
    
    );
};

export default Connected;

