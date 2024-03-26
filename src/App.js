


import React, { useState, useEffect } from 'react';                
import { ethers } from 'ethers';                                    //Biblioteka koja omogućava komunikaciju sa blockchainom
import { contractAbi, contractAddress } from './Constant/constant'; 
import Login from './Components/Login';                             
import Connected from './Components/Connected';
import AdminPanel from './Components/AdminPanel';
import './App.css';
import logobeli from './logobeli.png';
import logo from './logobeli.png';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';



const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();


function App() {    
    const [provider, setProvider] = useState(null);  
    const [account, setAccount] = useState(null);           
    const [isConnected, setIsConnected] = useState(false); 
    const [votingStatus, setVotingStatus] = useState(true); 
    const [remainingTime, setRemainingTime] = useState('');
    const [candidates, setCandidates] = useState([]);       
    const [number, setNumber] = useState('');               
    const [canVote, setCanVote] = useState(true);           
    const [isOwner, setIsOwner] = useState(false);          
    const[textButton,setTextButton]=useState('Connect');
    const [isAddressExpanded, setIsAddressExpanded] = useState(false);
    const [votingTitle, setvotingTitle] = useState('');
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const toggleAddress = () => {
        setIsAddressExpanded(!isAddressExpanded);
    };
    const [voters, setVoters] = useState([]);


    useEffect(() => {
        // Asinhrono dohvatite početno vreme iz ugovora prilikom montiranja komponente
        async function fetchInitialTime() {
            const timeInSeconds = await getRemainingTimeFromContract();
            setRemainingSeconds(timeInSeconds > 0 ? timeInSeconds : 0); // Ako je vreme manje od 0, postavite na 0
        }
    
        fetchInitialTime();
    
        // Pokrenite tajmer
        const interval = setInterval(() => {
            setRemainingSeconds((prevSeconds) => {
                if (prevSeconds <= 0) {
                    clearInterval(interval); // Zaustavite interval kada dođete do 0
                    return 0; // Sprečite da vreme ide ispod 0
                } else {
                    return prevSeconds - 1;
                }
            });
        }, 1000);
    
        // Periodično sinhronizujte sa ugovorom
        const syncInterval = setInterval(() => {
            syncTimeWithContract();
        }, 70000); // Svake minute za primer
    
        return () => {
            clearInterval(interval);
            clearInterval(syncInterval);
        };
    }, []);
    
    async function syncTimeWithContract() {
        const timeInSeconds = await getRemainingTimeFromContract();
        setRemainingSeconds(timeInSeconds > 0 ? timeInSeconds : 0); // Ponovo, sprečite negativne vrednosti
    }

    async function getRemainingTimeFromContract() {
        // Slično vašoj implementaciji
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const timeInSeconds = await contractInstance.getRemainingTime();
        return parseInt(timeInSeconds);
    }
    
    async function syncTimeWithContract() {
        const timeInSeconds = await getRemainingTimeFromContract();
        // Ako je odstupanje veće od 120 sekundi (2 minuta), ažurirajte vreme
        if (Math.abs(timeInSeconds - remainingSeconds) > 150) {
            setRemainingSeconds(timeInSeconds);
        }
    }
    
    
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
   

    useEffect(() => {  
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
           // connectToMetamask();
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    

    useEffect(() => {   
        if (account) {
            checkIfOwner();
            getCandidates();
            getRemainingTime();
            getCurrentStatus();
            checkcanVote();
            getVotingTitle();
            getVoters();
        }
    }, [account]);

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

    async function vote(index) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );

      const tx = await contractInstance.vote(index);
      await tx.wait();
      checkcanVote();
  }



  
  useEffect(() => {
    if (isConnected) { 
      setTextButton("Disconnect");
    } else {
      setTextButton("Connect");
    }
  }, [isConnected]);

  async function checkcanVote() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
        contractAddress, 
        contractAbi, 
        signer
    );

    const userAddress = await signer.getAddress();

    const sessionVoted = await contractInstance.lastVotedSession(userAddress);

    const currentSession = await contractInstance.votingSessionId();

    const hasVoted = sessionVoted.toString() >= currentSession.toString();

    setCanVote(hasVoted);
}

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

  async function getVotingTitle() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract (
      contractAddress, contractAbi, signer
    );
    const title = await contractInstance.getVotingTitle();
    console.log(title);
    setvotingTitle(title);
    return title;
}

async function getVoters() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract (
      contractAddress, contractAbi, signer
    );
    const unformattedvoters = await contractInstance.getVoters();
    const formatttedVoters = unformattedvoters.map((voter, index) => {
      return {
        index: index,
        name: voter.Adresa,
        voteCount: voter.Poeni.toNumber()
      }
    });
    setVoters(formatttedVoters);
}



  async function getRemainingTime() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
    const timeInSeconds = await contractInstance.getRemainingTime();
    const time = parseInt(timeInSeconds); 
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

      setRemainingTime(`${hours}h ${minutes}m ${seconds}s`); }
      const timeString = `${hours}h ${minutes}m ${seconds}s`;


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


    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
        } else {
            setIsConnected(false);
            setAccount(null);
        }  };
  


        const disconnectMetamask = () => {
            setIsConnected(false);
            setAccount(null);
        
            console.log("Metamask is disconnected from the app. Please also disconnect in MetaMask if needed.");
        };


        const handleButton = () => {
            if (isConnected) {
                disconnectMetamask();
              
            } else {
                connectToMetamask();
              
            }
          };


      function formatAddress(account) {
            return `${account.substring(0, 4)}...${account.substring(account.length - 4)}`;
          }

        const [showResults, setShowResults] = useState(false);

       
        

    return (
        <div className="App">
             <header className="App-logo">
            <img src={logobeli} style={{ height: '70px', width: 'auto' }} alt="Logo"/>
            
            {/* Kontejner za dugme i Chip, koji ne utiče na položaj ostalih komponenata */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
    {isConnected && (
      <Chip
      label={isAddressExpanded ? account : formatAddress(account)}
      color="primary"
      onClick={toggleAddress} 
      sx={{
          height: '46px',
          marginRight: '10px',
          backgroundColor: '#ff007a', 
          color: 'white',
          borderRadius: '12px',
          fontSize: '0.875rem',
          cursor: 'pointer', 
          '&:hover': {
              backgroundColor: '#463346', 
          },
      }}
  />
  
   
    )}
    
    <Button variant="contained" onClick={handleButton} sx={{
        height: '56px',
        minWidth: '120px',
        maxWidth: '200px',
        fontSize: '1rem',
        fontWeight: 'bold',
        borderRadius: '12px',
        backgroundColor: '#323538', 
        color: 'f2f2f2',
        '&:hover': { backgroundColor: '#AAA', color:'dimgray' }, 
    }}>
        {textButton}
    </Button>
</div>

        </header>
            {isConnected ? (   
                <>
                
                   
                    
                    {isOwner ? (            
                       <AdminPanel
                       signer={signer}
                       voters={voters}
                       initialCandidates={candidates}
                       showResults={showResults}
                       remainingTime={timeString}
                       Title={votingTitle}
                       setShowResults={setShowResults} 
                     />
                     
                    ) : (
                        <Connected      
                            account={account}
                            candidates={candidates}
                            remainingTime={timeString}
                            number={number}
                            voteFunction={vote}
                            showButton={canVote}
                            votingStatus={votingStatus}
                            Title={votingTitle}
                            showResults={showResults}
                
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