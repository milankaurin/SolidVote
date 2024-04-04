
import React, { useState,useEffect } from "react";
import { Radio, Table, TableBody, TableCell, TableContainer,Box, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';


const Connected = ({ account, candidates, remainingTime, voteFunction, showButton, votingStatus,Title, isAdmin,showResults,canVote }) => {
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
        backgroundColor: '#1e1f23',
        height: '100vh',
        width: '100vw'
    };

    const [showResultsLocal, setShowResultsLocal] = useState(() => {
        
        const showResultsLocalStorage = localStorage.getItem('showResults');
        return showResultsLocalStorage ? JSON.parse(showResultsLocalStorage) : showResults;
    });


    useEffect(() => {   //checkbox storing
        console.log("showResults prop in Connected:", showResultsLocal);
        
        localStorage.setItem('showResults', JSON.stringify(showResultsLocal));
    }, [showResultsLocal]);
    return (
        <div style={backgroundStyle} className="connected-container">
        
        <Typography variant="h4" sx={{ color: 'white', marginBottom: '3px', textAlign: 'center',mt:'150px' }}>
            {Title} 
        </Typography>
    
        <TableContainer 
    component={Paper} 
    sx={{  
        background: '#1e1f23',
        maxWidth: '70%', 
        margin: '20px auto', 
        overflowX: 'auto',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        borderRadius: '10px'
    }}
>
    <Table aria-label="candidates table" size="small"> 
        <TableHead sx={{backgroundColor:'#f7f7f7'}}>
            <TableRow>
                
                <TableCell align="center" sx={{ fontSize: '1.2rem', color:'black' }}>Index</TableCell>
                {showResultsLocal && showButton && (<Box sx={{ width: 10, height: 50 }}></Box> )}
                {showResultsLocal && (<Box sx={{ width: 5, height: 0 }}></Box> )}
                <TableCell align="center" sx={{ fontSize: '1.2rem' , color:'black'}}>Candidate name</TableCell>
                {showResultsLocal && <TableCell align="center" sx={{ fontSize: '1.2rem', color:'black' }}>Votes</TableCell>}
                {!isVotingFinished && !showButton && (
            <TableCell align="center" sx={{ fontSize: '1.2rem', color:'black' }}>Vote</TableCell>
        ) }
        {!showResultsLocal && showButton && (<Box sx={{ width: 84, height: 50 }}></Box> )}
        {showResultsLocal && showButton && (<Box sx={{ width: 5, height: 50 }}></Box> )}
        {showResultsLocal && (<Box sx={{ width: 0, height: 0 }}></Box> )}
            </TableRow>
        </TableHead>
        <TableBody sx={{
            '& .MuiTableRow-root': {
                '& td': {
                    padding: '6px', 
                    fontSize: '1.2rem',
                },
                '&:nth-of-type(odd)': {
                    backgroundColor: '#f3e5f5', 
                },
                '&:nth-of-type(even)': {
                    backgroundColor: '#f7f7f7', 
                },
            },
        }}>
            {candidates.map((candidate, index) => (
                <TableRow key={index}>
                    <TableCell align="center">{candidate.index}</TableCell>
                    {showResultsLocal &&  (<Box sx={{ width: 10, height: 48 }}></Box> )}
                    valko                    <TableCell align="center">{candidate.name}</TableCell>
                    {showResultsLocal && <TableCell align="center">{candidate.voteCount}</TableCell>}
                    <TableCell align="center">
    {!isVotingFinished && !showButton &&( 
        <Radio
            checked={selectedCandidate === candidate.index.toString()}
            onChange={handleRadioChange}
            value={candidate.index.toString()}
            name="radio-buttons"
            sx={{ '& .MuiSvgIcon-root': { fontSize: '1.25rem', color:'#ff007a' } }}
        />
    )}
</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
</TableContainer>

        <Typography variant="h6" sx={{fontWeight: '400', color: '#white', marginBottom: '5px', marginTop: '5px', textAlign: 'center' }}>
            Remaining Time: {remainingTime}
        </Typography>
        {!isVotingFinished && !showButton && (
          <Button variant="contained" onClick={voteClick} sx={{ 
            marginTop: '10px', 
            marginBottom: '20px', 
            display: 'block', 
            marginX: 'auto', 
            fontSize: '1.5rem',
            fontWeight: 'bold', 
            padding: '15px 30px', 
            borderRadius: '16px', 
            backgroundColor: '#ff007a', 
            '&:hover': {
                backgroundColor: '#463346', 
            },
        }}>
            Vote
        </Button>
        
        )}
    </div>
    
    );
};

export default Connected;

