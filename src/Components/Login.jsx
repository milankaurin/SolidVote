import React from "react";
import Button from '@mui/material/Button';
import { Container, Box, Grid,Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Typography } from '@mui/material';

const Login = (props) => {

    const backgroundStyle = {
        backgroundColor: '#18141c',
        backgroundSize: 'cover', // Pokriva celu pozadinu
        backgroundPosition: 'center', // Centrira sliku
        height: '100vh', // Visina pozadine
        width: '100vw' // Širina pozadine
    };
    return (
        <div style={backgroundStyle} className="login-container">
             <Typography variant="h4" sx={{
  color: 'white', // Ažurirano u Uniswap ljubičastu
  marginBottom: '20px',
  marginTop: '40px',
  textAlign: 'center',
  fontWeight: '530',
  fontFamily: "'Basel', sans-serif",
}}>
 
 <Typography
  sx={{
    fontSize: '2rem', // Large text size
    fontWeight: 'bold', // Bold text for impact
    color: '#ff007a', // Uniswap's signature dark pink color
    textShadow: '0 2px 2px rgba(0, 0, 0, 0.5)', // A subtle shadow for depth
    fontFamily: 'Helvetica, Arial, sans-serif', // A modern, sans-serif font
    textAlign: 'center', // Center-aligned for emphasis
    backgroundColor: '#1a1a1a', // A dark background for contrast
    padding: '20px', // Padding for space around the text
    borderRadius: '4px', // Slightly rounded corners for a polished look
    border: '1px solid #ff007a', // Border in Uniswap pink for definition
  }}
>
 
Introducing a secure, anonymous blockchain voting app: the pinnacle of privacy and trust in digital democracy, where every vote is a fortress of freedom.
</Typography>

</Typography>
           
            <Button variant="contained" onClick= {props.connectWallet}  sx={{
          height: '56px',
          width: '25%',
          fontSize: '2rem',
          fontFamily: "'Basel', sans-serif",
          mb: 2,
          borderRadius: '12px', // Manje zaobljeni uglovi
          fontWeight: '530',
          backgroundColor: '#311c31',
          color: '#fb72fe',
          textTransform:'none',
          // Uniswap ljubičasta
          '&:hover': {
            backgroundColor: '#e60072' // Tamnija nijansa za hover efekat
          },
        }}>
     Connect wallet   
    </Button>
           
        </div>
    )
}

export default Login;



