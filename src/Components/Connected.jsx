
import AdminPanel from './AdminPanel';
import React, { useState,useEffect } from "react";
import { Radio, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';


const Connected = ({ account, candidates, remainingTime, voteFunction, showButton, votingStatus,Title, isAdmin }) => {
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

    return (
        <div style={backgroundStyle} className="connected-container">
        
        <Typography variant="h4" sx={{ color: 'black', marginBottom: '10px', textAlign: 'center' }}>
            {Title} {/* Ažurirajte ovde ako Title treba biti pozvan kao funkcija ili je dinamički prop */}
        </Typography>
    
        <TableContainer component={Paper} sx={{  maxWidth: '65%', 
          margin: '20px auto', 
          overflowX: 'auto',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',}}>
            <Table aria-label="candidates table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Index</TableCell>
                        <TableCell align="center">Candidate name</TableCell>
                        <TableCell align="center">Votes</TableCell>
                        <TableCell align="center">Vote</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody sx={{
                    '& .MuiTableRow-root:nth-of-type(odd)': {
                        backgroundColor: '#f3e5f5', // lagana ljubičasta
                    },
                    '& .MuiTableRow-root:nth-of-type(even)': {
                        backgroundColor: '#f7f7f7', // lagana sivkasta
                    },
                }}>
                    {candidates.map((candidate, index) => (
                        <TableRow key={index}>
                            <TableCell align="center">{candidate.index}</TableCell>
                            <TableCell align="center">{candidate.name}</TableCell>
                            <TableCell align="center">{candidate.voteCount}</TableCell>
                            <TableCell align="center">
                                <Radio
                                    checked={selectedCandidate === candidate.index.toString()}
                                    onChange={handleRadioChange}
                                    value={candidate.index.toString()}
                                    name="radio-buttons"
                                    sx={{ color: '#ff007a', '&.Mui-checked': { color: '#ff007a' } }}
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

