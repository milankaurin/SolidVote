import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const LandingPage = ({ createInstance }) => {


  const handleLaunch = () => {
    console.log('Launching application...');
    createInstance();  // Poziv funkcije za kreiranje instance
  };

  return (
    <Box
      sx={{
        backgroundColor: '#1e1f23',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Centriranje sadržaja po vertikali
        alignItems: 'center', // Centriranje sadržaja po horizontali
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: '#ffffff',
          marginBottom: '20px', // Dodaje prostor između teksta i dugmeta
        }}
      >
        You will be charged a transaction fee for making your voting instance.
      </Typography>
      <Button
        variant="contained"
        onClick={handleLaunch}
        sx={{
          backgroundColor: '#ff007a',
          '&:hover': {
            backgroundColor: '#311c31',
          },
          fontSize: '1rem',
          padding: '12px 24px',
          boxShadow: 'none',
          transition: 'background-color 0.3s',
        }}
      >
        Launch Application
      </Button>
    </Box>
  );
};

export default LandingPage;
