
import React, { useState,useEffect } from "react";
import { Radio, Table, TableBody, TableCell, TableContainer,Box, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';
import { contractAbi } from '../Constant/constant';
import { ethers } from 'ethers';  

const Connected = ({ account={account},
    voteFunction,
    votingStatus,
    showResults,
    voterInstanceAddress }) => {
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [remainingTime, setRemainingTime] = useState('');
    const [votingTitle, setVotingTitle] = useState(''); 
    const [candidates, setCandidates] = useState([]);
    const [showResultsLocal, setshowResultsLocal] = useState(true);
    const handleRadioChange = (event) => {
        setSelectedCandidate(event.target.value);
    };
    const [showButton, setshowButton] = useState(true);

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
        async function fetchData() {
            try {
                const title = await getVotingTitle(); // Assuming this function properly handles its asynchronous operations
                setVotingTitle(title);
    
                const time = await getRemainingTime(); // Assuming this function properly handles its asynchronous operations
                setRemainingTime(time);
    
                const candidatesList = await getCandidates(); // Modify getCandidates to directly return the formatted candidates
                setCandidates(candidatesList);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        }
    
        fetchData();
    }, [voterInstanceAddress]); // Include dependencies as necessary
    
    
    
    async function getVotingTitle() {
        if (!voterInstanceAddress) return; // Check if contractAddress is not null
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(voterInstanceAddress, contractAbi, signer);
        const title = await contractInstance.getVotingTitle();
        console.log(title);
        setVotingTitle(title);
        return title;
    }
    
    async function getRemainingTime() {
        if (!voterInstanceAddress) return; // Check if contractAddress is not null
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(voterInstanceAddress, contractAbi, signer);
        const timeInSeconds = await contractInstance.getRemainingTime();
        const time = parseInt(timeInSeconds);
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;

        return (`${hours}h ${minutes}m ${seconds}s`);
    }

    async function getCandidates() {
        if (!voterInstanceAddress) return []; // Return empty array if no address
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(voterInstanceAddress, contractAbi, signer);
        const candidatesList = await contractInstance.getAllVotesOfCandidates();
        return candidatesList.map((candidate, index) => {
            return {
                index: index,
                name: candidate.name,
                voteCount: candidate.voteCount.toNumber()
            };
        });
    }
     






    const backgroundStyle = {
        backgroundColor: '#1e1f23',
        height: '100vh',
        width: '100vw'
    };

    return (
        <div style={backgroundStyle} className="connected-container">
        
        <Typography variant="h4" sx={{ color: 'white', marginBottom: '3px', textAlign: 'center',mt:'150px' }}>
            {votingTitle} 
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
            {candidates && candidates.map((candidate, index) => (
                <TableRow key={index}>
                    <TableCell align="center">{candidate.index}</TableCell>
                    {showResultsLocal &&  (<Box sx={{ width: 10, height: 48 }}></Box> )}
                                        <TableCell align="center">{candidate.name}</TableCell>
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

