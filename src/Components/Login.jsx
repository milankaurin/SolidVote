import React from "react";
import Button from '@mui/material/Button';

const Login = (props) => {

    const backgroundStyle = {
        backgroundColor: '#538DF0',
        backgroundSize: 'cover', // Pokriva celu pozadinu
        backgroundPosition: 'center', // Centrira sliku
        height: '100vh', // Visina pozadine
        width: '100vw' // Širina pozadine
    };
    return (
        <div style={backgroundStyle} className="login-container">
            <h1 className="welcome-message">Dobrodošli u decentralizovanu veb aplikaciju za glasanje!</h1>
            <Button variant="contained" onClick= {props.connectWallet}  sx={{
          height: '56px',
          width: '40%',
          fontSize: '1rem',
          fontWeight: 'bold',
          mb: 2,
          borderRadius: '12px', // Manje zaobljeni uglovi
          backgroundColor: '#ff007a',
          textTransform:'none',
          // Uniswap ljubičasta
          '&:hover': {
            backgroundColor: '#e60072' // Tamnija nijansa za hover efekat
          },
        }}>
     Login   
    </Button>
           
        </div>
    )
}

export default Login;



