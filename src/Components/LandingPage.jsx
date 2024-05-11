import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Link } from '@mui/material';
import { ethers } from 'ethers';
import { factoryAbi, factoryAddress } from '../Constant/constant';

const LandingPage = ({ createInstance }) => {
  const [sessionID, setSessionID] = useState('');
  const [provider, setProvider] = useState(null);
  const [votingFactoryContract, setVotingFactoryContract] = useState(null);

  useEffect(() => {
    const initEthers = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Request account access
      const signer = provider.getSigner();
      const contract = new ethers.Contract(factoryAddress, factoryAbi, signer);
      setProvider(provider);
      setVotingFactoryContract(contract);
    };

    initEthers();
  }, []);

  const handleGoToSession = async () => {
    try {
      const instanceAddress = await votingFactoryContract.getVotingInstanceForVoter(sessionID);
      console.log('Voting instance address:', instanceAddress);
    } catch (error) {
      console.error('Error retrieving voting instance:', error);
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setSessionID(value);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#1e1f23',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: '#ffffff',
          marginBottom: '20px',
          fontSize: '2rem',
          fontFamily: 'Arial',
        }}
      >
        Enter your session ID
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: 'auto',
          marginBottom: '40px',
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Session ID"
          value={sessionID}
          onChange={handleChange}
          sx={{
            width: '300px',
            marginRight: '20px',
            input: {
              color: '#ffffff'
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#ffffff',
              },
              '&:hover fieldset': {
                borderColor: '#ffffff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ffffff',
              }
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleGoToSession}
          sx={{
            backgroundColor: '#ff007a',
            '&:hover': {
              backgroundColor: '#311c31',
            },
            fontSize: '1rem',
            fontWeight: 'bold',
            padding: '12px 24px',
            boxShadow: 'none',
            transition: 'background-color 0.3s',
            borderRadius: '8px',
            textTransform: 'none'
          }}
        >
          Go to Session
        </Button>
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: '#ffffff',
          marginBottom: '20px',
          fontSize: '1.3rem',
          fontFamily: 'Arial',
        }}
      >
        Want to become an Administrator and start your own voting session?{' '}
        <Link
          component="button"
          variant="body2"
          onClick={createInstance}
          sx={{
            color: '#FF4A95',
            fontWeight: 'bold',
            textDecoration: 'none',
            fontSize: '1.3rem',
            '&:hover': {
              color: '#ffffff',
              textDecoration: 'underline',
              fontSize: '1.3rem'
            }
          }}
        >
          Click here
        </Link>
      </Typography>
    </Box>
  );
};

export default LandingPage;
