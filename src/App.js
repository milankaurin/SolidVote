import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from './Constant/constant';
import Login from './Components/Login';
import Finished from './Components/Finished';
import Connected from './Components/Connected';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [votingStatus, setVotingStatus] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState('');
  const [canVote, setCanVote] = useState(true);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [votingDuration, setVotingDuration] = useState(0);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
      checkIfOwner(accounts[0]);
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  };

  const connectToMetamask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setIsConnected(true);
        checkIfOwner(accounts[0]);
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error('Metamask is not detected in the browser');
    }
  };

  const checkIfOwner = async (userAddress) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractAbi, provider);
    const ownerAddress = await contract.owner();
    setIsOwner(ownerAddress.toLowerCase() === userAddress.toLowerCase());
    loadVotingDetails();
  };

  const loadVotingDetails = async () => {
    getCandidates();
    getRemainingTime();
    getCurrentStatus();
    checkCanVote();
  };

  const getCandidates = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractAbi, provider);
    const candidatesList = await contract.getAllVotesOfCandiates();
    const formattedCandidates = candidatesList.map((candidate, index) => {
      return {
        index: index,
        name: candidate.name,
        voteCount: candidate.voteCount.toNumber()
      }
    });
    setCandidates(formattedCandidates);
  };

  const getCurrentStatus = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractAbi, provider);
    const status = await contract.getVotingStatus();
    setVotingStatus(status);
  };

  const getRemainingTime = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractAbi, provider);
    const time = await contract.getRemainingTime();
    setRemainingTime(time);
  };

  const checkCanVote = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractAbi, provider);
    const voteStatus = await contract.voters(account);
    setCanVote(!voteStatus);
  };

  const vote = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractAbi, provider.getSigner());
    const tx = await contract.vote(number);
    await tx.wait();
    checkCanVote();
  };

  const addCandidate = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractAbi, provider.getSigner());
    await contract.addCandidate(newCandidateName);
    setNewCandidateName('');
    getCandidates();
  };

  const startVoting = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractAbi, provider.getSigner());
    await contract.startVoting(votingDuration);
    getCurrentStatus();
  };

  return (
    <div className="App">
      {!isConnected ? (
        <Login connectWallet={connectToMetamask} />
      ) : isOwner ? (
        <div>
          <input
            type="text"
            value={newCandidateName}
            onChange={(e) => setNewCandidateName(e.target.value)}
            placeholder="Ime kandidata"
          />
          <button onClick={addCandidate}>Dodaj Kandidata</button>
          <input
            type="number"
            value={votingDuration}
            onChange={(e) => setVotingDuration(e.target.value)}
            placeholder="Trajanje glasanja (minuti)"
          />
          <button onClick={startVoting}>Pokreni Glasanje</button>
        </div>
      ) : votingStatus ? (
        <Connected
          account={account}
          candidates={candidates}
          remainingTime={remainingTime}
          number={number}
          handleNumberChange={(e) => setNumber(e.target.value)}
          voteFunction={vote}
          showButton={canVote}
        />
      ) : (
        <Finished />
      )}
    </div>
  );
}

export default App;
