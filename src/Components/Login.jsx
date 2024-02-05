import React from "react";

const Login = (props) => {

    const backgroundStyle = {   //dodavanje pozadine
        backgroundImage: `url('/images/adminBackground.jpg')`,
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        height: '100vh',
        width: '100vw' 
    };
    return (
        <div style={backgroundStyle} className="login-container">
            <h1 className="welcome-message">Dobrodošli u decentralizovanu veb aplikaciju za glasanje!</h1>
            <button className="login-button" onClick = {props.connectWallet}>Login Metamask</button>
        </div>
    )
}

export default Login;



