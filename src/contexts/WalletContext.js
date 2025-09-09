import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState('0');

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          const balance = await provider.getBalance(accounts[0].address);
          
          setProvider(provider);
          setSigner(signer);
          setAccount(accounts[0].address);
          setChainId(Number(network.chainId));
          setBalance(ethers.formatEther(balance));
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      setBalance(ethers.formatEther(balance));
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('Please connect to MetaMask.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance('0');
    toast.success('Wallet disconnected');
  };

  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error) {
      if (error.code === 4902) {
        // Network doesn't exist, add it
        const networkConfigs = {
          31337: {
            chainId: '0x7a69',
            chainName: 'Hardhat Local',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['http://127.0.0.1:8545'],
            blockExplorerUrls: null,
          },
          11155111: {
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          },
        };

        if (networkConfigs[targetChainId]) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkConfigs[targetChainId]],
            });
          } catch (addError) {
            console.error('Error adding network:', addError);
            toast.error('Failed to add network');
          }
        }
      } else {
        console.error('Error switching network:', error);
        toast.error('Failed to switch network');
      }
    }
  };

  const getNetworkName = (chainId) => {
    const networks = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Testnet',
      31337: 'Hardhat Local',
      8009: 'Zama Devnet',
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  const updateBalance = async () => {
    if (provider && account) {
      try {
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  };

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          updateBalance();
        }
      };

      const handleChainChanged = (chainId) => {
        setChainId(Number(chainId));
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkConnection]);

  const value = {
    account,
    provider,
    signer,
    chainId,
    balance,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getNetworkName,
    updateBalance,
    isConnected: !!account,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};