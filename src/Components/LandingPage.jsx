import React from 'react';
import { Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleButtonClick = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        backgroundColor: '#1e1f23',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start', // Keep content aligned to the top
        alignItems: 'flex-end', // Align content to the right
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row', // Ensure the buttons are in a row
          justifyContent: 'flex-end', // Right-align the buttons
          alignItems: 'center', // Center the buttons vertically
          gap: '30px', // Increase spacing between buttons for more distinct separation
          width: '60%', // Set width of the button container to 40% of its parent
          padding: '40px 20px', // Increase padding to move buttons down and to the right
          marginRight: '2%', // Increase right margin to move all buttons further to the right
        }}
      >
        <Button
          variant="contained"
          onClick={() => handleButtonClick()}
          sx={{
            backgroundColor: '#ff007a',
            '&:hover': {
              backgroundColor: '#311c31',
            },
            fontSize: '1rem', // Keep larger font size for better readability
            padding: '12px 24px', // Slightly larger padding for bigger buttons
            boxShadow: 'none', // Optional: Remove box-shadow if not desired
            transition: 'background-color 0.3s', // Smooth transition for hover effect
          }}
        >
          Home
        </Button>
        <Button
          variant="contained"
          onClick={() => handleButtonClick()}
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
          Start Voting Session
        </Button>
        <Button
          variant="contained"
          onClick={() => handleButtonClick()}
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
          Vote
        </Button>
        <Button
          variant="contained"
          onClick={() => handleButtonClick('/road-map')}
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
          Road Map
        </Button>
      </Box>
    </Box>
  );
};

export default LandingPage;
