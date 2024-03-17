
//IMPORTOVANJE neophodnih modula i komponenata 

import React, { useState, useEffect } from 'react';                 //React hooks - koriste se za upravljanje stanjem i životnim ciklusom komponente
import { ethers } from 'ethers';                                    //Biblioteka koja omogućava komunikaciju sa blockchainom
import { contractAbi, contractAddress } from './Constant/constant'; //Konstante importovane, adresa ugovora i ABI (Application Binary Interface)
import Login from './Components/Login';                             //Komponente koje služe za upravljanje različitim delovima interfejsa
import Connected from './Components/Connected';
import AdminPanel from './Components/AdminPanel';
import './App.css';
import logo from './logo.png';

//Provider - omogućava čitanje podataka sa blockchaina. Signer - omogućava slanje transakcija    

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

//useState - hook koji definiše pojedinačno stanje i funkciju koja se koristi za ažuriranje tog stanja (SET)

function App() {    
    const [provider, setProvider] = useState(null);  
    const [account, setAccount] = useState(null);           //čuva adresu povezanog korisnika i ažurira je kada se promeni nalog
    const [isConnected, setIsConnected] = useState(false);  //vrednost (bool) koji govori da li je korisnik povezan preko MetaMask novčanika
    const [votingStatus, setVotingStatus] = useState(true); //označava da li je trenutno aktivno glasanje i ažurira stanje
    const [remainingTime, setRemainingTime] = useState(''); //čuva informaciju o preostalom vremenu i ažurira je
    const [candidates, setCandidates] = useState([]);       //sadrži informacije o listi kandidata i ažurira ih
    const [number, setNumber] = useState('');               //čuvanje indexa odabranog kandidata
    const [canVote, setCanVote] = useState(true);           //označava da li trenutni korisnik ima pravo da glasa i menja tu dozvolu
    const [isOwner, setIsOwner] = useState(false);          //označava da li je trenutni korisnik vlasnik (owner ugovora)
    

    // PRVI useEffect hook - 

    useEffect(() => {   //zadužen za promenu trenutnog naloga u MetaMask-u
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            connectToMetamask();
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    // DRUGI useEffect hook

    useEffect(() => {   // reaguje na promene u account stanju
        if (account) {
            checkIfOwner();
            getCandidates();
            getRemainingTime();
            getCurrentStatus();
            checkcanVote();
        }
    }, [account]);

   // Proverava da li je trenutno povezani korisnik vlasnik pametnog ugovora. 
    const checkIfOwner = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            const ownerStatus = await contract.isOwner();
            setIsOwner(ownerStatus);
            console.log(isOwner)
        } catch (error) {
            console.error("Error checking owner status:", error);
        }
    };

    //Omogućava trenutnom korisniku da glasa za odabranog kandidata.
    async function vote() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );

      const tx = await contractInstance.vote(number);
      await tx.wait();
      checkcanVote();
  }

  // Proverava da li trenutni korisnik može da glasa u trenutnoj sesiji glasanja.
  async function checkcanVote() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
        contractAddress, 
        contractAbi, 
        signer
    );

    // Dohvata adresu trenutnog korisnika
    const userAddress = await signer.getAddress();

    // Dohvata ID sesije u kojoj je korisnik poslednji put glasao
    const sessionVoted = await contractInstance.lastVotedSession(userAddress);

    // Dohvata trenutni ID sesije glasanja
    const currentSession = await contractInstance.votingSessionId();

    // Proverava da li je korisnik već glasao u trenutnoj sesiji
    const hasVoted = sessionVoted.toString() >= currentSession.toString();

    // Postavlja stanje u React komponenti na osnovu toga da li korisnik može da glasa
    setCanVote(hasVoted);
}

  //Preuzimanje liste kandidata iz pametnog ugovora
  async function getCandidates() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );
      const candidatesList = await contractInstance.getAllVotesOfCandiates();
      const formattedCandidates = candidatesList.map((candidate, index) => {
        return {
          index: index,
          name: candidate.name,
          voteCount: candidate.voteCount.toNumber()
        }
      });
      setCandidates(formattedCandidates);
  }

  //Proverava da li je glasanje trenutno aktivno
  async function getCurrentStatus() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );
      const status = await contractInstance.getVotingStatus();
      console.log(status);
      setVotingStatus(status);
  }

  //Uzima informaciju o preostalom vremenu iz ugovora i parsira ga

  async function getRemainingTime() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
    const timeInSeconds = await contractInstance.getRemainingTime();
    //prevođenje vremena u sate, minute i sekunde
    const time = parseInt(timeInSeconds); 
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    setRemainingTime(`${hours}h ${minutes}m ${seconds}s`); }

  //Povezivanje aplikacije sa MetaMask novčanikom korisnika, traži od njega dozvolu za pristup

  const connectToMetamask = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(provider);
                await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setAccount(address);
                console.log("Metamask Connected : " + address);
                setIsConnected(true);
            } catch (err) {
                console.error(err);
            }
        } else {
            console.error("Metamask is not detected in the browser");
        } };

    //Reagovanje na promenu naloga u MetaMask novčaniku

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
        } else {
            setIsConnected(false);
            setAccount(null);
        }  };
    const handleNumberChange = (e) => {
        setNumber(e.target.value); };

    return (
        <div className="App">
            <header className="App-header"></header>
            {isConnected ? (   //Ako je korisnik povezan idi dalje u logiku, ako nije prikaži Login Panel
                <>
                    {isOwner ? (            //ako je owner povezan, prikaži AdminPanel, u suprotnom Connected panel
                        <AdminPanel signer={signer} />
                    ) : (
                        <Connected      //postavi stanja
                            account={account}
                            candidates={candidates}
                            remainingTime={remainingTime}
                            number={number}
                            handleNumberChange={handleNumberChange}
                            voteFunction={vote}
                            showButton={canVote}
                            votingStatus={votingStatus}
                        />
                    )}
                </>
            ) : (
                <Login connectWallet={connectToMetamask} />
            )}
           
        </div>
    );
}

export default App;