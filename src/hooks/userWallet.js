import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const useWallet = () => {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [userBalance, setUserBalance] = useState('');
  const [network, setNetwork] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const initializeProvider = async () => {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethProvider);

        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length) {
            setAddress(accounts[0]);
            fetchBalance(accounts[0], ethProvider);
          } else {
            disconnectWallet(); 
          }
        });

        window.ethereum.on('chainChanged', async () => {
          const newProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(newProvider); 

          const networkDetails = await newProvider.getNetwork();
          const networkName = getNetworkName(networkDetails.chainId);
          setNetwork(networkName);

          if (address) {
            fetchBalance(address, newProvider); 
          }
        });
      };

      initializeProvider();
    }
  }, [address]);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed');
        return;
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      setIsConnected(true);

      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider); 
      fetchBalance(accounts[0], ethProvider); 

      const networkDetails = await ethProvider.getNetwork();
      const networkName = getNetworkName(networkDetails.chainId);
      setNetwork(networkName);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      setProvider(null); 
      setAddress(''); 
      setBalance(''); 
      setNetwork('');  
      setIsConnected(false);  
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const fetchBalance = async (address, providerInstance) => {
   
    if (!providerInstance) return;
    try {
      const balance = await providerInstance.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchUserBalance = async (address, providerInstance) => {
    if (!providerInstance) return;
    try {
      const balance = await providerInstance.getBalance(address);
      setUserBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const getNetworkName = (chainId) => {
    const networkNames = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Test Network',
      84531: 'Base Goerli',
      4202: 'Lisk Sepolia',
      1135: 'Lisk Mainnet',
      8453: 'Base Mainnet',
      84532: 'Base Sepolia Testnet',
      1291: 'Swisstronik Testnet',
    };

    return networkNames[chainId] || 'Unknown Network';
  };

  return {
    connectWallet,
    disconnectWallet,
    address,
    balance,
    network,
    isConnected,
    fetchUserBalance,
    userBalance,
    provider
  };
};

export default useWallet;
