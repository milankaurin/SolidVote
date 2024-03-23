import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';

const Login = (props) => {
    const [currentText, setCurrentText] = useState('');
    const [opacity, setOpacity] = useState(1);

    const texts = [
        "Dobrodošli na SolidVote, decentralizovanu, sigurnu i anonimnu aplikaciju za glasanje!",
        "Welcome to SolidVote, a decentralized, secure, and anonymous voting application!",
        "¡Bienvenido a SolidVote, una aplicación de votación descentralizada, segura y anónima!",
        "Bienvenue sur SolidVote, une application de vote décentralisée, sécurisée et anonyme!",
        "Willkommen bei SolidVote, einer dezentralen, sicheren und anonymen Wahl-App!",
        "欢迎使用SolidVote, 我们的去中心化、安全和匿名投票应用程序,让您参与并表达您的声音!",
        "Добро пожаловать в SolidVote, децентрализованное, безопасное и анонимное приложение для голосования!",
        "Benvenuti su SolidVote, un'applicazione di voto decentralizzata, sicura e anonima!",
        "ようこそ、SolidVoteへ。分散型で安全、匿名の投票アプリです。あなたの声を聞かせてください！"
    ];

    useEffect(() => {
      let currentTextIndex = 0;
      setCurrentText(texts[currentTextIndex]);
  
      const changeText = () => {
          setOpacity(0);
          setTimeout(() => {
              currentTextIndex = (currentTextIndex + 1) % texts.length;
              setCurrentText(texts[currentTextIndex]);
              setOpacity(1);
          }, 1000);
      };
  
      const intervalId = setInterval(changeText, 2500);
  
      return () => clearInterval(intervalId);
    }, []);


    const backgroundStyle = {
        backgroundColor: '#f0f4f8',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        <div style={backgroundStyle} className="login-container">
            <div style={{
                minHeight: '200px', // Fiksna ili minimalna visina za tekst
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '20px 60px',
                boxSizing: 'border-box',
            }}>
                <Typography
                    sx={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        color: 'black',
                        textAlign: 'center',
                        opacity: opacity,
                        transition: 'opacity 1s ease-in-out',
                        maxWidth: '90%',
                        margin: '0 auto', // Centriranje teksta unutar kontejnera
                    }}
                >
                    {currentText}
                </Typography>
            </div>
            
            <Button variant="contained" onClick={props.connectWallet} sx={{
                minHeight: '70px',
                minWidth: '250px',
                fontSize: '1.5rem',
                fontFamily: "'Basel', sans-serif",
                borderRadius: '12px',
                fontWeight: 'bold',
                backgroundColor: '#ff007a',
                color: 'white',
                textTransform: 'none',
                mt: 2, // Razmak između teksta i dugmeta
                '&:hover': {
                    backgroundColor: '#e60072',
                },
            }}>
                Connect Metamask Wallet
            </Button>
        </div>
    );
};

export default Login;
