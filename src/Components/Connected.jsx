import React from "react";
import AdminPanel from './AdminPanel';

const Connected = ({ account, candidates, remainingTime, number, handleNumberChange, voteFunction, showButton, votingStatus, isAdmin }) => {
    const backgroundStyle = {
        backgroundColor: '#f0f4f8',
        backgroundSize: 'cover', // Pokriva celu pozadinu
        backgroundPosition: 'center', // Centrira sliku
        height: '100vh', // Visina pozadine
        width: '100vw' // Širina pozadine
    };
     // <p className="connected-account">Metamask Account: {account}</p>

    // Provera da li je glasanje završeno
    const isVotingFinished = !votingStatus; 
    console.log("Voting Status:", votingStatus);
    return (
        <div  style={backgroundStyle} className="connected-container">
            <h1 className="connected-header">You are Connected to Metamask</h1>
         
            {isAdmin ? (
                <AdminPanel />
            ) : isVotingFinished ? (
                <h1 className="connected-account">Voting is Finished</h1>

            ) : (
                <>
                    <p className="connected-account">Remaining Time: {remainingTime}</p>
                    {showButton ? (
                        <p className="connected-account">You have already voted</p>
                    ) : (
                        <div>
                            <input type="number" placeholder="Enter Candidate Index" value={number} onChange={handleNumberChange}></input>
                            <br />
                            <button className="login-button" onClick={voteFunction}>Vote</button>
                        </div>
                    )} 
                    <table id="myTable" className="candidates-table"> 
                        <thead> 
                            <tr>
                                <th>Index</th>
                                <th>Candidate name</th>
                                <th>Candidate votes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map((candidate, index) => (
                                <tr key={index}>
                                    <td>{candidate.index}</td>
                                    <td>{candidate.name}</td>
                                    <td>{candidate.voteCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default Connected;
