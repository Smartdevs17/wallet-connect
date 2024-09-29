import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const useWallet = () => {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [userBalance, setUserBalance] = useState('');
  const [network, setNetwork] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const fetchBalance = useCallback(async (address, providerInstance) => {
    if (!providerInstance) return;
    try {
      const balance = await providerInstance.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, []);

  const fetchUserBalance = useCallback(async (address, providerInstance) => {
    if (!providerInstance) return;
    try {
      const balance = await providerInstance.getBalance(address);
      setUserBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
  }, []);

  const connectWallet = useCallback(async () => {
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
  }, [fetchBalance]);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setAddress('');
    setBalance('');
    setNetwork('');
    setIsConnected(false);
  }, []);

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

  useEffect(() => {
    if (window.ethereum) {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);

      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          fetchBalance(accounts[0], ethProvider);
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = async () => {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);

        const networkDetails = await newProvider.getNetwork();
        const networkName = getNetworkName(networkDetails.chainId);
        setNetwork(networkName);

        if (address) {
          fetchBalance(address, newProvider);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address, fetchBalance, disconnectWallet]);

  return {
    connectWallet,
    disconnectWallet,
    address,
    balance,
    userBalance,
    network,
    isConnected,
    fetchUserBalance,
    provider,
  };
};

export default useWallet;
