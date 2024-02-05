import React from "react";

const Login = (props) => {

    const backgroundStyle = {
        backgroundImage: `url('/images/adminBackground.jpg')`,
        backgroundSize: 'cover', // Pokriva celu pozadinu
        backgroundPosition: 'center', // Centrira sliku
        height: '100vh', // Visina pozadine
        width: '100vw' // Širina pozadine
    };
    return (
        <div style={backgroundStyle} className="login-container">
            <h1 className="welcome-message">Dobrodošli u decentralizovanu veb aplikaciju za glasanje!</h1>
            <button className="login-button" onClick = {props.connectWallet}>Login Metamask</button>
        </div>
    )
}

export default Login;