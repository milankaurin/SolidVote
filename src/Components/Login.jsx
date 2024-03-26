import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';

const Login = (props) => {
    const [currentText, setCurrentText] = useState('');
    const [opacity, setOpacity] = useState(1);

    const texts = [
        "Dobrodošli na decentralizovanu, sigurnu i anonimnu aplikaciju za glasanje", 
        "Welcome to a decentralized, secure, and anonymous voting application", 
        "Bienvenido a una aplicación de votación descentralizada, segura y anónima", 
        "Bienvenue dans une application de vote décentralisée, sécurisée et anonyme", 
        "Willkommen bei einer dezentralen, sicheren und anonymen Wahl-App", 
        "欢迎使用我们的去中心化、安全和匿名投票应用程序，让您参与并表达您的声音！ "  ,
        "Добро пожаловать в децентрализованное, безопасное приложение для голосования", 
        "Benvenuti in un'applicazione di voto decentralizzata, sicura e anonima", 
        "ようこそ、分散型で安全、匿名の投票アプリへ。あなたの声を聞かせてください！"  , 
    ]
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
        backgroundColor: '#1e1f23',
        height: '100vh',
        width: '100vw',
    };

    return (
        <div style={{
            ...backgroundStyle, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '400px', 
        }} className="login-container">
            <Typography
                sx={{
                    fontSize: '3rem',
                    fontWeight: '450', 
                    color: 'white',
                    textAlign: 'center',
                    opacity: opacity,
                    transition: 'opacity 1s ease-in-out',
                    padding: '20px 60px', 
                    maxWidth: '90%',
                    margin: '0', 
                    marginBottom: '10px', 
                    fontFamily: 'Roboto, sans-serif'
                }}
            >
                {currentText}
            </Typography>
            
            <Button variant="contained" onClick={props.connectWallet} sx={{
                minHeight: '70px', 
                minWidth: '250px', 
                fontSize: '1.5rem',
                fontFamily: "'Robot', sans-serif",
                borderRadius: '12px',
                fontWeight: '530',
                backgroundColor: '#ff007a',
                color: 'white',
                textTransform: 'none',
                mb: 2, 
                '&:hover': {
                    backgroundColor: '#311c31', 
                },
            }}>
                Connect MetaMask wallet
            </Button>
        </div>
        
        
    );
};

export default Login;
