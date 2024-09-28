import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const useWallet = () => {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [network, setNetwork] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const initializeProvider = async () => {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethProvider);

        // Set up listeners for account and network changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length) {
            setAddress(accounts[0]);
            fetchBalance(accounts[0], ethProvider);
          } else {
            disconnectWallet(); // Properly disconnect if no accounts are found
          }
        });

        window.ethereum.on('chainChanged', async () => {
          const newProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(newProvider); // Reset the provider

          const networkDetails = await newProvider.getNetwork();
          const networkName = getNetworkName(networkDetails.chainId);
          setNetwork(networkName);

          if (address) {
            fetchBalance(address, newProvider); // Fetch balance for the same account on the new network
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
      setProvider(ethProvider); // Set the provider
      fetchBalance(accounts[0], ethProvider); // Fetch balance with the provider

      const networkDetails = await ethProvider.getNetwork();
      const networkName = getNetworkName(networkDetails.chainId);
      setNetwork(networkName);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      setProvider(null); // Clear provider state
      setAddress('');  // Clear address state
      setBalance('');  // Clear balance state
      setNetwork('');  // Clear network state
      setIsConnected(false);  // Mark wallet as disconnected
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

  // Function to map chain ID to network names
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
    fetchBalance,
  };
};

export default useWallet;
