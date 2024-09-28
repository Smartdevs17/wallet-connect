import React, { useState } from 'react';
import useWallet from '../hooks/userWallet'; 
import './Home.css'; 

const Home = () => {
  const {
    connectWallet,
    disconnectWallet,
    address,
    balance,
    network,
    isConnected,
    fetchUserBalance,
    userBalance,
    provider,  
  } = useWallet();

  const [inputAddress, setInputAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetBalance = async () => {
    console.log("Input address: ", inputAddress);
    if (inputAddress) {
      setLoading(true);
      await fetchUserBalance(inputAddress, provider); // Pass the provider instance
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <h1 className="title">Ethereum Wallet Connection</h1>
      <div className="wallet-actions">
        {!isConnected ? (
          <button className="button connect" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <button className="button disconnect" onClick={disconnectWallet}>
            Disconnect Wallet
          </button>
        )}
      </div>

      {isConnected && (
        <div className="wallet-info">
          <p>Connected Address: {address}</p>
          <p>Network: {network}</p>
          <p>Balance: {balance} ETH</p>
        </div>
      )}

      <div className="balance-check">
        <input
          type="text"
          placeholder="Enter address to get balance"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          className="input"
        />
        <button className="button get-balance" onClick={handleGetBalance} disabled={loading}>
          {loading ? 'Loading...' : 'Get Balance'}
        </button>

      </div>
      {userBalance && (
          <div className="fetched-balance">
            <p>Fetched Balance: {userBalance} ETH</p>
          </div>
        )}
    </div>
  );
};

export default Home;
