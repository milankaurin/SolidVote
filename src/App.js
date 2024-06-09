


import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';                                    //Biblioteka koja omogućava komunikaciju sa blockchainom
import { contractAbi, factoryAddress, factoryAbi, tokenAddress, tokenAbi } from './Constant/constant';
import Login from './Components/Login';
import Connected from './Components/Connected';
import AdminPanel from './Components/AdminPanel';
import LandingPage from './Components/LandingPage'; // Import the LandingPage component
import './App.css';
import logobeli from './logobeli.png';
import logo from './logobeli.png';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


//const provider = new ethers.providers.Web3Provider(window.ethereum);
//const signer = provider.getSigner();


function App() {

    const [signer, setSigner] = useState(null);
    const [provider, setProvider] = useState(null);
    const [account, setAccount] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [votingStatus, setVotingStatus] = useState(true);
    const [remainingTime, setRemainingTime] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [number, setNumber] = useState('');
    const [canVote, setCanVote] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [textButton, setTextButton] = useState('Connect');
    const [isAddressExpanded, setIsAddressExpanded] = useState(false);
    const [votingTitle, setVotingTitle] = useState(''); // Corrected state name
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [contractAddress, setContractAddress] = useState(null); 
    const toggleAddress = () => {
        setIsAddressExpanded(!isAddressExpanded);
    };
    const [voters, setVoters] = useState([]);
    const [kolicinaZaSlanje, setKolicinaZaSlanje] = useState("0"); // Količina ethera za slanje, u wei

    const postaviKolicinuZaSlanje = (novaKolicina) => {
        setKolicinaZaSlanje(novaKolicina);
    };

    const [redoviGlasaca, setRedoviGlasaca] = useState();
    const [adminInstanceAddress, setAdminInstanceAddress] = useState(null); // Dodato

    const checkAdminInstance = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(factoryAddress, factoryAbi, signer);
            const instanceAddress = await contract.getAdminInstanceAddress(account);
            if (instanceAddress !== ethers.constants.AddressZero) {
                setAdminInstanceAddress(instanceAddress);
                setContractAddress(instanceAddress); // Update contract address if admin instance exists
            } else {
                setAdminInstanceAddress(null);
                setContractAddress(null); // Reset to default if no admin instance
            }
        } catch (error) {
            console.error("Error checking admin instance address:", error);
        }
    };


    const updateRedoviGlasaca = (newRows) => {
        setRedoviGlasaca(newRows);
    };
    useEffect(() => {
        async function fetchInitialTime() {
            if (contractAddress) {
                const timeInSeconds = await getRemainingTimeFromContract();
                setRemainingSeconds(timeInSeconds > 0 ? timeInSeconds : 0);
            }
        }
    
        fetchInitialTime();
    
        const interval = setInterval(() => {
            setRemainingSeconds((prevSeconds) => {
                if (prevSeconds <= 0) {
                    clearInterval(interval);
                    return 0;
                } else {
                    return prevSeconds - 1;
                }
            });
        }, 1000);
    
        const syncInterval = setInterval(() => {
            if (contractAddress) {
                syncTimeWithContract();
            }
        }, 70000);
    
        return () => {
            clearInterval(interval);
            clearInterval(syncInterval);
        };
    }, [contractAddress]); // Zavisnost `contractAddress`
    


    const createUserVotingInstance = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []); // Traži korisnika da poveže svoj wallet
            const signer = provider.getSigner(); // Dobijanje signer-a koji će potpisati transakciju
    
            const contract = new ethers.Contract(factoryAddress, factoryAbi, signer);
            const transactionResponse = await contract.createUserVotingInstance();
    
            console.log('Transaction response:', transactionResponse);
            const receipt = await transactionResponse.wait(); // Čekanje da se transakcija potvrdi
    
            // Dobijanje adrese nove Voting instance
            const instanceAddress = receipt.events?.filter((x) => x.event === "VotingCreated")[0].args.votingInstance;
            console.log('New voting instance created at:', instanceAddress);
    
            // Postavljanje adminInstanceAddress na novu instancu
            setAdminInstanceAddress(instanceAddress);
    
            // Preusmeravanje na AdminPanel
            return instanceAddress; // Možete ovo koristiti dalje u vašoj aplikaciji
        } catch (error) {
            console.error('Failed to create a new voting instance:', error);
            return null;
        }
    };


    async function syncTimeWithContract() {
        const timeInSeconds = await getRemainingTimeFromContract();
        setRemainingSeconds(timeInSeconds > 0 ? timeInSeconds : 0); // Ponovo, sprečite negativne vrednosti
    }

    async function getRemainingTimeFromContract() {
        if (!contractAddress) return 0; // Return 0 if contractAddress is null
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
    // Možete dodati event listener za promene u accounts ili mreži ako je potrebno
    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            setIsConnected(false);
            setAccount(null);
        } else {
            connectToMetamask(); // Ponovo povežite ako se account promeni
        }
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);

    return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
}, []);



    useEffect(() => {
        if (account && contractAddress) {
            checkIfOwner();
            //getCandidates();
            getRemainingTime();
           // getCurrentStatus();
            //checkcanVote();
            getVotingTitle();
        }
    }, [account, contractAddress]);

    useEffect(() => {
        if (account) {
            checkAdminInstance(); // Provera admin instance kada se promeni account
        }
    }, [account]);

    const checkIfOwner = async () => {
        try {
            if (!contractAddress) return; // Skip if contract address is null
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);
            const ownerStatus = await contract.isOwner();
            setIsOwner(ownerStatus);
        } catch (error) {
            console.error("Error checking owner status:", error);
        }
    };

    async function vote(index) {
        if (!contractAddress) return; // Check if contractAddress is not null
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

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
        if (!contractAddress) return; // Check if contractAddress is not null
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

        const userAddress = await signer.getAddress();
        const sessionVoted = await contractInstance.lastVotedSession(userAddress);
        const currentSession = await contractInstance.votingSessionId();
        const hasVoted = sessionVoted.toString() >= currentSession.toString();

        setCanVote(hasVoted);
    }

   /*  async function getCandidates() {
        if (!contractAddress) return; // Check if contractAddress is not null
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const candidatesList = await contractInstance.getAllVotesOfCandidates();
        const formattedCandidates = candidatesList.map((candidate, index) => {
            return {
                index: index,
                name: candidate.name,
                voteCount: candidate.voteCount.toNumber()
            };
        });
        setCandidates(formattedCandidates);
    } */

    async function getCurrentStatus() {
        if (!contractAddress) return; // Check if contractAddress is not null
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const status = await contractInstance.getVotingStatus();
        console.log(status);
        setVotingStatus(status);
    }

    async function getVotingTitle() {
        if (!contractAddress) return; // Check if contractAddress is not null
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const title = await contractInstance.getVotingTitle();
        console.log(title);
        setVotingTitle(title);
        return title;
    }

    async function getVoters() {
        if (!contractAddress) return; // Check if contractAddress is not null
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const unformattedVoters = await contractInstance.getVoters();
        const formattedVoters = unformattedVoters.map((voter, index) => {
            return {
                index: index,
                name: voter.Adresa,
                voteCount: voter.Poeni.toNumber()
            };
        });
        setVoters(formattedVoters);
    }

    async function getRemainingTime() {
        if (!contractAddress) return; // Check if contractAddress is not null
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const timeInSeconds = await contractInstance.getRemainingTime();
        const time = parseInt(timeInSeconds);
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;

        setRemainingTime(`${hours}h ${minutes}m ${seconds}s`);
    }
    const timeString = `${hours}h ${minutes}m ${seconds}s`;

    /*  const posaljiEther = async () => {
       if (!signer || redoviGlasaca.length === 0 || kolicinaZaSlanje <= 0) {
           console.error("Signer nije dostupan, lista glasača je prazna, ili količina za slanje nije ispravna.");
           return;
       }
   
       const contract = new ethers.Contract(TransferAddress, TransferAbi, signer);
       
       const recipients = redoviGlasaca.map(glasac => glasac.tekst);
       // Ako svi primaoci treba da dobiju isti iznos, nije potrebno mapiranje za amounts
       const totalAmountWei = ethers.utils.parseUnits((kolicinaZaSlanje * redoviGlasaca.length).toString(), "wei");
   
       try {
           // Pošto svi dobijaju istu količinu, šaljemo niz istih iznosa
           const amounts = new Array(recipients.length).fill(ethers.utils.parseUnits(kolicinaZaSlanje, "wei").toString());
           
           const transaction = await contract.batchTransfer(recipients, amounts, {
               value: totalAmountWei, // Ovde šaljemo ukupan iznos
               gasLimit: ethers.utils.hexlify(1000000) // Primer gas limita, treba ga prilagoditi
           });
           await transaction.wait();
           console.log(`Uspješno poslato ${ethers.utils.formatEther(totalAmountWei)} ETH na navedene adrese.`);
       } catch (error) {
           console.error("Greška pri slanju ethera:", error);
       }
   }; */


   const posaljiEther = async () => {
    try {
        if (!contractAddress) return; // Check if contractAddress is not null
        if (!window.ethereum) throw new Error("Ethereum browser extension not available");

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(contractAddress, contractAbi, signer);

        const recipients = redoviGlasaca.map(glasac => glasac.tekst);
        const amounts = recipients.map(() => ethers.utils.parseUnits(kolicinaZaSlanje, "ether"));

        const totalAmountWei = amounts.reduce((total, amount) => total.add(amount), ethers.BigNumber.from(0));

        const transactionResponse = await contract.batchTransfer(recipients, amounts, {
            value: totalAmountWei,
        });

        console.log("Transaction response:", transactionResponse);
        console.log("Čekanje na potvrdu transakcije...");

        await transactionResponse.wait();

        console.log("Transakcija potvrđena. Hash transakcije:", transactionResponse.hash);
    } catch (error) {
        console.error("Došlo je do greške:", error);
    }
};

const connectToMetamask = async () => {
    if (window.ethereum) {
        try {
            const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
            await tempProvider.send("eth_requestAccounts", []); // Traži korisnika da poveže svoj wallet
            const tempSigner = tempProvider.getSigner();
            const address = await tempSigner.getAddress();
            setProvider(tempProvider);
            setSigner(tempSigner);
            setAccount(address);
            setIsConnected(true);
            console.log("Metamask Connected : " + address);

            // Provera admin instance nakon povezivanja MetaMask-a
            await checkAdminInstance();
        } catch (err) {
            console.error("Error connecting to MetaMask:", err);
            setIsConnected(false); // U slučaju greške, postaviti isConnected na false
        }
    } else {
        console.error("MetaMask is not detected in the browser");
    }
};

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
        } else {
            setIsConnected(false);
            setAccount(null);
        }
    };



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
    /*  return (
         <div className="App">
           <header className="App-logo">
             <img src={logobeli} style={{ height: '70px', width: 'auto' }} alt="Logo"/>
           </header>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}></div>            
           <LandingPage createInstance={createUserVotingInstance} />
         </div>
       ); */

    /*   return (
          <div className="App">
               <header className="App-logo">
              <img src={logobeli} style={{ height: '70px', width: 'auto' }} alt="Logo"/>
              
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
                         SlanjaNaAdreseGlasace= {posaljiEther}
                         setShowResults={setShowResults} 
                         postaviKolicinuZaSlanje={postaviKolicinuZaSlanje} 
                         redoviGlasaca={redoviGlasaca}
                         updateRedoviGlasaca={updateRedoviGlasaca} 
                         kolicinaZaSlanje={kolicinaZaSlanje}
                         tokenAbi={tokenAbi}
                         tokenAddress={tokenAddress}
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
      ); */

      return (
        <div className="App">
            <header className="App-logo">
                <img src={logobeli} style={{ height: '70px', width: 'auto' }} alt="Logo" />
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
                        '&:hover': { backgroundColor: '#AAA', color: 'dimgray' },
                    }}>
                        {textButton}
                    </Button>
                </div>
            </header>
            {isConnected ? (
                adminInstanceAddress ? ( // Provera da li postoji admin instance
                    <AdminPanel
                        signer={signer}
                        voters={voters}
                        initialCandidates={candidates}
                        showResults={showResults}
                        remainingTime={remainingTime}
                        Title={votingTitle}
                        SlanjaNaAdreseGlasace={posaljiEther}
                        setShowResults={setShowResults}
                        postaviKolicinuZaSlanje={postaviKolicinuZaSlanje}
                        redoviGlasaca={redoviGlasaca}
                        updateRedoviGlasaca={updateRedoviGlasaca}
                        kolicinaZaSlanje={kolicinaZaSlanje}
                        tokenAbi={tokenAbi}
                        tokenAddress={tokenAddress}
                        contractAddress={contractAddress}
                    />
                ) : (
                    <LandingPage createInstance={createUserVotingInstance} />
                )
            ) : (
                <Login connectWallet={connectToMetamask} />
            )}
        </div>
    );
}

export default App;