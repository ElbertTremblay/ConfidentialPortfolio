import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { toast } from 'react-toastify';

const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState('0');

  // Check if wallet is already connected
  const checkConnection = useCallback(async () => {
    try {
      const ethereum = await detectEthereumProvider();
      if (ethereum) {
        const web3Provider = new ethers.BrowserProvider(ethereum);
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        const network = await web3Provider.getNetwork();
        
        if (accounts.length > 0) {
          const web3Signer = await web3Provider.getSigner();
          setAccount(accounts[0]);
          setProvider(web3Provider);
          setSigner(web3Signer);
          setChainId(Number(network.chainId));
          
          // Get balance
          const balance = await web3Provider.getBalance(accounts[0]);
          setBalance(ethers.formatEther(balance));
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      const ethereum = await detectEthereumProvider();
      
      if (!ethereum) {
        toast.error('MetaMask not detected. Please install MetaMask!');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      // Request account access
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        toast.error('No accounts found. Please connect your MetaMask wallet.');
        return;
      }

      const web3Provider = new ethers.BrowserProvider(ethereum);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();
      const balance = await web3Provider.getBalance(accounts[0]);

      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setChainId(Number(network.chainId));
      setBalance(ethers.formatEther(balance));

      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('Wallet connection rejected by user');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance('0');
    toast.info('Wallet disconnected');
  };

  // Switch to Sepolia network
  const switchToSepolia = async () => {
    try {
      const ethereum = await detectEthereumProvider();
      if (!ethereum) return;

      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
      });
    } catch (error) {
      if (error.code === 4902) {
        // Network not added, add it
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia test network',
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          });
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
          toast.error('Failed to add Sepolia network');
        }
      } else {
        console.error('Error switching to Sepolia:', error);
        toast.error('Failed to switch to Sepolia network');
      }
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Update balance
  const updateBalance = useCallback(async () => {
    if (provider && account) {
      try {
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  }, [provider, account]);

  // Setup event listeners
  useEffect(() => {
    let ethereum;
    
    const setupEventListeners = async () => {
      ethereum = await detectEthereumProvider();
      if (ethereum) {
        // Account changed
        ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            disconnectWallet();
          } else {
            setAccount(accounts[0]);
            updateBalance();
          }
        });

        // Chain changed
        ethereum.on('chainChanged', (chainId) => {
          setChainId(parseInt(chainId, 16));
          window.location.reload();
        });

        // Connect event
        ethereum.on('connect', (connectInfo) => {
          setChainId(parseInt(connectInfo.chainId, 16));
        });

        // Disconnect event
        ethereum.on('disconnect', () => {
          disconnectWallet();
        });
      }
    };

    setupEventListeners();
    checkConnection();

    return () => {
      if (ethereum && ethereum.removeListener) {
        ethereum.removeListener('accountsChanged');
        ethereum.removeListener('chainChanged');
        ethereum.removeListener('connect');
        ethereum.removeListener('disconnect');
      }
    };
  }, [checkConnection, updateBalance]);

  // Check if on correct network (Sepolia)
  const isCorrectNetwork = chainId === 11155111;

  return {
    account,
    provider,
    signer,
    chainId,
    balance,
    isConnecting,
    isConnected: !!account,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    formatAddress,
    updateBalance
  };
};

export default useWallet;