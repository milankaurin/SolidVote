import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';

const Login = (props) => {
    const [currentText, setCurrentText] = useState('');
    const [opacity, setOpacity] = useState(1);

    const texts = [
        "Dobrodošli na decentralizovanu, sigurnu i anonimnu aplikaciju za glasanje", // Srpski
        "Welcome to a decentralized, secure, and anonymous voting application", // Engleski
        "Bienvenido a una aplicación de votación descentralizada, segura y anónima", // Španski
        "Bienvenue dans une application de vote décentralisée, sécurisée et anonyme", // Francuski
        "Willkommen bei einer dezentralen, sicheren und anonymen Wahl-App", // Nemački
        "欢迎使用我们的去中心化、安全和匿名投票应用程序，让您参与并表达您的声音！ "  , // Kineski
        "Добро пожаловать в децентрализованное, безопасное приложение для голосования", // Ruski
        "Benvenuti in un'applicazione di voto decentralizzata, sicura e anonima", // Italijanski
        "ようこそ、分散型で安全、匿名の投票アプリへ。あなたの声を聞かせてください！"  , // Japanski
    ];

    useEffect(() => {
      let currentTextIndex = 0;
      setCurrentText(texts[currentTextIndex]);
  
      const changeText = () => {
          setOpacity(0); // Počinje efekat nestajanja
          setTimeout(() => {
              currentTextIndex = (currentTextIndex + 1) % texts.length;
              setCurrentText(texts[currentTextIndex]);
              setOpacity(1); // Počinje efekat pojavljivanja
          }, 1000); // 1 sekunda pauze pre nego što se tekst promeni (duži prelaz)
      };
  
      const intervalId = setInterval(changeText, 2500); // Menja tekst svakih 5 sekundi (uključujući 1 sekundu animacije)
  
      return () => clearInterval(intervalId); // Čišćenje intervala
        }, []);


    const backgroundStyle = {
        backgroundColor: '#171515',
        height: '100vh',
        width: '100vw',
    };

    return (
        <div style={{
            ...backgroundStyle, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', // Ovo centriranje ce raditi za celu visinu
            minHeight: '400px', 
        }} className="login-container">
            <Typography
                sx={{
                    fontSize: '3rem',
                    fontWeight: '450', //bilo je bold
                    color: 'white',
                    textAlign: 'center',
                    opacity: opacity,
                    transition: 'opacity 1s ease-in-out',
                    padding: '20px 60px', 
                    maxWidth: '90%',
                    margin: '0', 
                    marginBottom: '10px', // Dodajemo manji razmak između teksta i dugmeta
                    fontFamily: 'Roboto, sans-serif' // ovo nije bilo
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
                mb: 2, // Osiguravamo prostor ispod dugmeta ako je potrebno dodatno centriranje
                '&:hover': {
                    backgroundColor: '#311c31', //311c31  //e60072
                },
            }}>
                Connect MetaMask wallet
            </Button>
        </div>
        
        
    );
};

export default Login;
