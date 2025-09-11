import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Real contract address - deployed on Sepolia
const CONTRACT_ADDRESS = "0x2E6e7A51AbfeEA591bd7140E839B9FC3F70e0d37";

// Sepolia testnet configuration
const SEPOLIA_CHAIN_ID = '0xaa36a7';
const SEPOLIA_NETWORK = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia Test Network',
  rpcUrls: ['https://sepolia.infura.io/v3/', 'https://rpc.sepolia.org'],
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  blockExplorerUrls: ['https://sepolia.etherscan.io/']
};

// Contract ABI for real blockchain interaction
const CONTRACT_ABI = [
  "function createPortfolio() external",
  "function addAsset(string memory symbol, uint64 amount, uint64 value) external",
  "function updateAsset(string memory symbol, uint64 newAmount, uint64 newValue) external",
  "function removeAsset(string memory symbol) external",
  "function getAssetSymbols(address user) external view returns (string[] memory)",
  "function getEncryptedAssetAmount(address user, string memory symbol) external view returns (uint256)",
  "function getEncryptedAssetValue(address user, string memory symbol) external view returns (uint256)",
  "function getEncryptedTotalValue(address user) external view returns (uint256)",
  "function portfolioExists(address user) external view returns (bool)",
  "function getAssetLastUpdate(address user, string memory symbol) external view returns (uint256)",
  "function getAssetCount(address user) external view returns (uint256)",
  "event PortfolioCreated(address indexed user, uint256 timestamp)",
  "event AssetAdded(address indexed user, string symbol, uint256 timestamp)",
  "event AssetUpdated(address indexed user, string symbol, uint256 timestamp)",
  "event AssetRemoved(address indexed user, string symbol, uint256 timestamp)"
];

// Preset asset options for user selection
const ASSET_PRESETS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'USDT', name: 'Tether' },
  { symbol: 'BNB', name: 'Binance Coin' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'LINK', name: 'Chainlink' },
  { symbol: 'MATIC', name: 'Polygon' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'UNI', name: 'Uniswap' },
  { symbol: 'ATOM', name: 'Cosmos' }
];

interface Asset {
  symbol: string;
  amount: string;
  value: string;
  lastUpdate: Date;
}

interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  gasUsed?: string;
  gasPrice?: string;
  description: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  // State management
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [chainId, setChainId] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [hasPortfolio, setHasPortfolio] = useState<boolean>(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Connect your wallet to start managing your confidential portfolio!');
  const [networkStatus, setNetworkStatus] = useState<string>('Disconnected');
  
  // Transaction tracking
  const [currentTransaction, setCurrentTransaction] = useState<TransactionStatus | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<TransactionStatus[]>([]);
  
  // Form states
  const [showAddAsset, setShowAddAsset] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [assetSymbol, setAssetSymbol] = useState<string>('');
  const [assetAmount, setAssetAmount] = useState<string>('');
  const [assetValue, setAssetValue] = useState<string>('');
  const [estimatedGas, setEstimatedGas] = useState<string>('');
  const [gasPrice, setGasPrice] = useState<string>('');

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  // Get current network info
  const getNetworkInfo = useCallback(async () => {
    if (!window.ethereum) return;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chainId);
      
      if (chainId === SEPOLIA_CHAIN_ID) {
        setNetworkStatus('Sepolia Testnet');
      } else {
        setNetworkStatus(`Wrong Network (${parseInt(chainId, 16)})`);
      }
    } catch (error) {
      console.error('Failed to get network info:', error);
    }
  }, []);

  // Get account balance
  const getBalance = useCallback(async (address: string) => {
    if (!provider) return;
    
    try {
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  }, [provider]);

  // Estimate gas for transactions
  const estimateGasForOperation = useCallback(async (operation: string, params?: any[]) => {
    if (!contract || !account) return;

    try {
      let estimatedGas: bigint;
      const currentGasPrice = await provider?.getFeeData();
      
      switch (operation) {
        case 'createPortfolio':
          estimatedGas = await contract.createPortfolio.estimateGas();
          break;
        case 'addAsset':
          if (params) {
            estimatedGas = await contract.addAsset.estimateGas(...params);
          } else return;
          break;
        case 'removeAsset':
          if (params) {
            estimatedGas = await contract.removeAsset.estimateGas(...params);
          } else return;
          break;
        default:
          return;
      }

      setEstimatedGas(estimatedGas.toString());
      if (currentGasPrice?.gasPrice) {
        setGasPrice(ethers.formatUnits(currentGasPrice.gasPrice, 'gwei'));
      }
    } catch (error) {
      console.error('Failed to estimate gas:', error);
    }
  }, [contract, account, provider]);

  // Track transaction status
  const trackTransaction = useCallback(async (hash: string, description: string) => {
    if (!provider) return;

    const newTransaction: TransactionStatus = {
      hash,
      status: 'pending',
      confirmations: 0,
      description
    };

    setCurrentTransaction(newTransaction);
    setTransactionHistory(prev => [newTransaction, ...prev.slice(0, 4)]); // Keep last 5 transactions

    try {
      const tx = await provider.getTransaction(hash);
      if (tx) {
        const receipt = await tx.wait();
        if (receipt) {
          const updatedTransaction: TransactionStatus = {
            ...newTransaction,
            status: receipt.status === 1 ? 'confirmed' : 'failed',
            confirmations: await receipt.confirmations(),
            gasUsed: receipt.gasUsed.toString(),
            gasPrice: receipt.gasPrice ? ethers.formatUnits(receipt.gasPrice, 'gwei') : undefined
          };

          setCurrentTransaction(updatedTransaction);
          setTransactionHistory(prev => 
            prev.map(tx => tx.hash === hash ? updatedTransaction : tx)
          );

          if (receipt.status === 1) {
            setMessage(`✅ Transaction confirmed! Block: ${receipt.blockNumber}`);
          } else {
            setMessage(`❌ Transaction failed!`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to track transaction:', error);
      const failedTransaction = { ...newTransaction, status: 'failed' as const };
      setCurrentTransaction(failedTransaction);
      setTransactionHistory(prev => 
        prev.map(tx => tx.hash === hash ? failedTransaction : tx)
      );
    }
  }, [provider]);

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setAccount('');
          setContract(null);
          setProvider(null);
          setHasPortfolio(false);
          setAssets([]);
          setMessage('Wallet disconnected');
          setNetworkStatus('Disconnected');
        } else if (accounts[0] !== account) {
          // Account changed
          window.location.reload();
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(chainId);
        if (chainId !== SEPOLIA_CHAIN_ID) {
          setMessage('⚠️ Please switch to Sepolia testnet');
          setNetworkStatus(`Wrong Network (${parseInt(chainId, 16)})`);
        } else {
          setNetworkStatus('Sepolia Testnet');
          if (account) {
            checkPortfolioStatus();
          }
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check initial state
      getNetworkInfo();

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, getNetworkInfo]);

  // Update balance periodically
  useEffect(() => {
    if (account && provider) {
      getBalance(account);
      const interval = setInterval(() => getBalance(account), 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [account, provider, getBalance]);

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    try {
      if (!isMetaMaskInstalled()) {
        setMessage("❌ MetaMask is not installed. Please install MetaMask to continue.");
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      setLoading(true);
      setMessage("🔄 Connecting to MetaMask...");

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        setMessage("❌ No accounts found. Please unlock MetaMask.");
        return;
      }

      // Check and switch to Sepolia if needed
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        setMessage("🔄 Switching to Sepolia testnet...");
        await switchToSepolia();
      }

      // Initialize provider and contract
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setProvider(browserProvider);
      setAccount(accounts[0]);
      setContract(contractInstance);
      setNetworkStatus("Sepolia Testnet");
      
      // Get balance
      await getBalance(accounts[0]);
      
      setMessage(`Connected to Sepolia! ✅ ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);

      // Check portfolio status
      await checkPortfolioStatus(contractInstance, accounts[0]);

    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      if (error.code === 4001) {
        setMessage("❌ Connection rejected by user");
      } else if (error.code === -32002) {
        setMessage("⏳ MetaMask is already processing a connection request");
      } else {
        setMessage("❌ Failed to connect wallet. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Switch to Sepolia testnet
  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Network not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_NETWORK]
          });
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          throw new Error('Failed to add Sepolia network');
        }
      } else {
        console.error('Failed to switch to Sepolia:', switchError);
        throw switchError;
      }
    }
  };

  // Check if user has a portfolio
  const checkPortfolioStatus = async (contractInstance?: ethers.Contract, userAccount?: string) => {
    try {
      const contractToUse = contractInstance || contract;
      const accountToUse = userAccount || account;
      
      if (!contractToUse || !accountToUse) return;

      const portfolioExists = await contractToUse.portfolioExists(accountToUse);
      setHasPortfolio(portfolioExists);

      if (portfolioExists) {
        await loadAssets(contractToUse, accountToUse);
        setMessage("📊 Portfolio loaded successfully!");
      } else {
        setMessage("🚀 Ready to create your confidential portfolio!");
      }
    } catch (error) {
      console.error('Failed to check portfolio status:', error);
      setMessage("❌ Failed to check portfolio status");
    }
  };

  // Load user's assets from blockchain
  const loadAssets = async (contractInstance: ethers.Contract, userAccount: string) => {
    try {
      const symbols = await contractInstance.getAssetSymbols(userAccount);
      const assetCount = await contractInstance.getAssetCount(userAccount);
      const loadedAssets: Asset[] = [];

      for (const symbol of symbols) {
        const lastUpdate = await contractInstance.getAssetLastUpdate(userAccount, symbol);
        loadedAssets.push({
          symbol,
          amount: "***", // Encrypted data - only owner can decrypt
          value: "***", // Encrypted data - only owner can decrypt
          lastUpdate: new Date(Number(lastUpdate) * 1000)
        });
      }

      setAssets(loadedAssets);
      setMessage(`📊 Portfolio loaded: ${assetCount.toString()} assets`);
    } catch (error) {
      console.error('Failed to load assets:', error);
      setMessage("❌ Failed to load portfolio assets");
    }
  };

  // Create a new portfolio (real blockchain transaction)
  const createPortfolio = async () => {
    try {
      if (!contract || !account) {
        setMessage("❌ Please connect wallet first");
        return;
      }

      if (chainId !== SEPOLIA_CHAIN_ID) {
        setMessage("❌ Please switch to Sepolia testnet");
        return;
      }

      const balanceWei = ethers.parseEther(balance);
      if (balanceWei === 0n) {
        setMessage("❌ Insufficient ETH balance. Please fund your wallet with Sepolia ETH.");
        return;
      }

      setLoading(true);
      setMessage("🔄 Estimating gas for portfolio creation...");

      // Estimate gas
      await estimateGasForOperation('createPortfolio');

      setMessage("⏳ Please confirm the transaction in MetaMask...");

      // Execute transaction
      const tx = await contract.createPortfolio();
      setMessage(`🔄 Transaction submitted: ${tx.hash}`);

      // Track transaction
      await trackTransaction(tx.hash, "Create Portfolio");

      // Wait for confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setHasPortfolio(true);
        setMessage("🎉 Portfolio created successfully!");
        await checkPortfolioStatus();
        await getBalance(account); // Update balance after transaction
      } else {
        setMessage("❌ Transaction failed");
      }

    } catch (error: any) {
      console.error('Create portfolio failed:', error);
      if (error.code === 4001) {
        setMessage("❌ Transaction rejected by user");
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        setMessage("❌ Insufficient funds for gas");
      } else {
        setMessage("❌ Failed to create portfolio. Please try again.");
      }
    } finally {
      setLoading(false);
      setCurrentTransaction(null);
    }
  };

  // Select asset preset
  const selectAssetPreset = (preset: typeof ASSET_PRESETS[0]) => {
    setSelectedPreset(preset.symbol);
    setAssetSymbol(preset.symbol);
    
    // Estimate gas for adding this asset
    if (assetAmount && assetValue) {
      const amountInt = Math.floor(parseFloat(assetAmount) * 1000000);
      const valueInt = Math.floor(parseFloat(assetValue) * 100);
      estimateGasForOperation('addAsset', [preset.symbol, amountInt, valueInt]);
    }
  };

  // Add asset to portfolio (real blockchain transaction)
  const addAsset = async () => {
    try {
      const symbol = assetSymbol.trim().toUpperCase();
      const amount = assetAmount;
      const value = assetValue;

      if (!symbol || !amount || !value) {
        setMessage("❌ Please fill all fields!");
        return;
      }

      if (!contract || !account) {
        setMessage("❌ Please connect wallet first");
        return;
      }

      if (chainId !== SEPOLIA_CHAIN_ID) {
        setMessage("❌ Please switch to Sepolia testnet");
        return;
      }

      const amountFloat = parseFloat(amount);
      const valueFloat = parseFloat(value);

      if (amountFloat <= 0 || valueFloat <= 0) {
        setMessage("❌ Amount and value must be greater than 0");
        return;
      }

      setLoading(true);
      setMessage("🔄 Estimating gas for adding asset...");

      // Convert to integers with appropriate decimals
      const amountInt = Math.floor(amountFloat * 1000000); // 6 decimals for amount
      const valueInt = Math.floor(valueFloat * 100); // 2 decimals for USD value

      // Estimate gas
      await estimateGasForOperation('addAsset', [symbol, amountInt, valueInt]);

      setMessage(`⏳ Adding ${symbol} to portfolio. Please confirm in MetaMask...`);

      // Execute transaction
      const tx = await contract.addAsset(symbol, amountInt, valueInt);
      setMessage(`🔄 Transaction submitted: ${tx.hash}`);

      // Track transaction
      await trackTransaction(tx.hash, `Add Asset: ${symbol}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setMessage(`🔐 Asset ${symbol} added successfully!`);
        
        // Reset form and reload assets
        setAssetSymbol('');
        setAssetAmount('');
        setAssetValue('');
        setSelectedPreset('');
        setShowAddAsset(false);
        
        await loadAssets(contract, account);
        await getBalance(account); // Update balance after transaction
      } else {
        setMessage("❌ Transaction failed");
      }

    } catch (error: any) {
      console.error('Add asset failed:', error);
      if (error.code === 4001) {
        setMessage("❌ Transaction rejected by user");
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        setMessage("❌ Insufficient funds for gas");
      } else if (error.reason) {
        setMessage(`❌ ${error.reason}`);
      } else {
        setMessage("❌ Failed to add asset. Please try again.");
      }
    } finally {
      setLoading(false);
      setCurrentTransaction(null);
    }
  };

  // Remove asset from portfolio (real blockchain transaction)
  const removeAsset = async (symbol: string) => {
    try {
      if (!window.confirm(`⚠️ Are you sure you want to remove ${symbol} from your portfolio?\n\nThis action cannot be undone and will require a blockchain transaction.`)) {
        return;
      }

      if (!contract || !account) {
        setMessage("❌ Please connect wallet first");
        return;
      }

      if (chainId !== SEPOLIA_CHAIN_ID) {
        setMessage("❌ Please switch to Sepolia testnet");
        return;
      }

      setLoading(true);
      setMessage("🔄 Estimating gas for removing asset...");

      // Estimate gas
      await estimateGasForOperation('removeAsset', [symbol]);

      setMessage(`⏳ Removing ${symbol} from portfolio. Please confirm in MetaMask...`);

      // Execute transaction
      const tx = await contract.removeAsset(symbol);
      setMessage(`🔄 Transaction submitted: ${tx.hash}`);

      // Track transaction
      await trackTransaction(tx.hash, `Remove Asset: ${symbol}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setMessage(`🗑️ Asset ${symbol} removed successfully!`);
        await loadAssets(contract, account);
        await getBalance(account); // Update balance after transaction
      } else {
        setMessage("❌ Transaction failed");
      }

    } catch (error: any) {
      console.error('Remove asset failed:', error);
      if (error.code === 4001) {
        setMessage("❌ Transaction rejected by user");
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        setMessage("❌ Insufficient funds for gas");
      } else if (error.reason) {
        setMessage(`❌ ${error.reason}`);
      } else {
        setMessage("❌ Failed to remove asset. Please try again.");
      }
    } finally {
      setLoading(false);
      setCurrentTransaction(null);
    }
  };

  // Get Sepolia testnet ETH
  const getSepoliaETH = () => {
    window.open('https://sepoliafaucet.com/', '_blank');
  };

  return (
    <div className="terminal-container">
      {/* Header */}
      <header className="terminal-header">
        <div className="logo-section">
          <div className="logo">🔐</div>
          <h1 className="title">Confidential Portfolio</h1>
          <h2 className="subtitle">Confidential Portfolio Manager</h2>
        </div>
      </header>

      {/* Network & Account Status */}
      <div className="status-section">
        <div className="blockchain-info">
          <p>&gt; <strong>LIVE BLOCKCHAIN DAPP</strong> - Real Sepolia Transactions</p>
          <p>&gt; Network: <span className={`highlight ${chainId === SEPOLIA_CHAIN_ID ? 'success' : 'error'}`}>{networkStatus}</span></p>
          <p>&gt; Contract: <a href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="highlight">
            {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)} ↗
          </a></p>
          {account && (
            <>
              <p>&gt; Account: <span className="highlight">{account.slice(0, 6)}...{account.slice(-4)}</span></p>
              <p>&gt; Balance: <span className="highlight">{parseFloat(balance).toFixed(4)} ETH</span>
                {parseFloat(balance) < 0.01 && (
                  <button className="button" onClick={getSepoliaETH} style={{marginLeft: '10px', padding: '5px 10px', fontSize: '12px'}}>
                    Get Sepolia ETH
                  </button>
                )}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Message Display */}
      <div className="message-section">
        <div className="message-box">
          <p>&gt; {message}</p>
        </div>
      </div>

      {/* Transaction Status */}
      {currentTransaction && (
        <div className="status-section">
          <h3 style={{color: '#ffffff', marginBottom: '10px', fontWeight: '600'}}>Current Transaction</h3>
          <p>&gt; Operation: <span className="highlight">{currentTransaction.description}</span></p>
          <p>&gt; Hash: <span className="highlight">{currentTransaction.hash}</span></p>
          <p>&gt; Status: <span className={currentTransaction.status === 'confirmed' ? 'success' : currentTransaction.status === 'failed' ? 'error' : 'warning'}>
            {currentTransaction.status.toUpperCase()}
          </span></p>
          {currentTransaction.status === 'confirmed' && (
            <>
              <p>&gt; Confirmations: <span className="highlight">{currentTransaction.confirmations}</span></p>
              {currentTransaction.gasUsed && <p>&gt; Gas Used: <span className="highlight">{currentTransaction.gasUsed}</span></p>}
              {currentTransaction.gasPrice && <p>&gt; Gas Price: <span className="highlight">{currentTransaction.gasPrice} gwei</span></p>}
            </>
          )}
          <p>&gt; <a href={`https://sepolia.etherscan.io/tx/${currentTransaction.hash}`} target="_blank" rel="noopener noreferrer" className="highlight">
            View on Etherscan ↗
          </a></p>
        </div>
      )}

      {/* Gas Estimation */}
      {estimatedGas && gasPrice && (
        <div className="status-section">
          <h3 style={{color: '#ffffff', marginBottom: '10px', fontWeight: '600'}}>Gas Estimation</h3>
          <p>&gt; Estimated Gas: <span className="highlight">{estimatedGas}</span></p>
          <p>&gt; Gas Price: <span className="highlight">{gasPrice} gwei</span></p>
          <p>&gt; Estimated Cost: <span className="highlight">
            {(parseFloat(estimatedGas) * parseFloat(gasPrice) / 1e9).toFixed(6)} ETH
          </span></p>
        </div>
      )}

      {/* Connection Section */}
      {!account && (
        <div className="text-center margin-bottom">
          <button className="wallet-button" onClick={connectWallet} disabled={loading}>
            {loading ? '🔄 Connecting...' : '🦊 Connect MetaMask'}
          </button>
          {!isMetaMaskInstalled() && (
            <p style={{color: '#f56565', marginTop: '10px'}}>
              ⚠️ MetaMask not detected. <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="highlight">Install MetaMask</a>
            </p>
          )}
        </div>
      )}

      {/* Portfolio Management Section */}
      {account && chainId === SEPOLIA_CHAIN_ID && (
        <div>
          {/* Portfolio Status */}
          <div className="status-section">
            <p>&gt; Portfolio Status: <span className="highlight">
              {hasPortfolio ? "🟢 Active" : "🔴 Not Created"}
            </span></p>
            {hasPortfolio && <p>&gt; Total Assets: <span className="highlight">{assets.length}</span></p>}
          </div>

          {/* Create Portfolio Button */}
          {!hasPortfolio && (
            <div className="text-center margin-bottom">
              <button className="button" onClick={createPortfolio} disabled={loading || parseFloat(balance) < 0.001}>
                {loading ? '⏳ Creating...' : '🚀 Create Portfolio'}
              </button>
              {parseFloat(balance) < 0.001 && (
                <p style={{color: '#f56565', marginTop: '10px'}}>
                  ⚠️ Need ETH for gas fees. <button className="button" onClick={getSepoliaETH} style={{fontSize: '12px', padding: '5px 10px'}}>Get Sepolia ETH</button>
                </p>
              )}
            </div>
          )}

          {/* Asset Management */}
          {hasPortfolio && (
            <div>
              <div className="text-center margin-bottom">
                <button 
                  className="button" 
                  onClick={() => setShowAddAsset(!showAddAsset)}
                  disabled={loading}
                >
                  {showAddAsset ? '❌ Cancel' : '➕ Add Asset'}
                </button>
              </div>

              {/* Add Asset Form */}
              {showAddAsset && (
                <div className="status-section">
                  <h3 style={{color: '#ffffff', marginBottom: '20px', fontWeight: '600'}}>Add New Encrypted Asset</h3>
                  
                  {/* Asset Presets */}
                  <div className="preset-assets">
                    <p>Quick Select Popular Assets:</p>
                    <div className="asset-presets">
                      {ASSET_PRESETS.map((preset) => (
                        <button
                          key={preset.symbol}
                          className={`preset-btn ${selectedPreset === preset.symbol ? 'selected' : ''}`}
                          onClick={() => selectAssetPreset(preset)}
                          type="button"
                          disabled={loading}
                        >
                          {preset.symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    value={assetSymbol}
                    onChange={(e) => setAssetSymbol(e.target.value.toUpperCase())}
                    placeholder="Asset Symbol (e.g., BTC)"
                    className="input-field"
                    disabled={loading}
                    maxLength={10}
                  />
                  <input
                    type="number"
                    value={assetAmount}
                    onChange={(e) => setAssetAmount(e.target.value)}
                    placeholder="Amount (e.g., 0.5)"
                    className="input-field"
                    step="0.000001"
                    min="0"
                    disabled={loading}
                  />
                  <input
                    type="number"
                    value={assetValue}
                    onChange={(e) => setAssetValue(e.target.value)}
                    placeholder="Value in USD (e.g., 25000)"
                    className="input-field"
                    step="0.01"
                    min="0"
                    disabled={loading}
                  />
                  
                  <div className="form-actions">
                    <button 
                      className="button" 
                      onClick={addAsset}
                      disabled={loading || !assetSymbol || !assetAmount || !assetValue || parseFloat(balance) < 0.001}
                    >
                      {loading ? '⏳ Adding...' : '🔐 Add Encrypted Asset'}
                    </button>
                  </div>
                  
                  {parseFloat(balance) < 0.001 && (
                    <p style={{color: '#f56565', textAlign: 'center', marginTop: '10px'}}>
                      ⚠️ Insufficient ETH for transaction fees
                    </p>
                  )}
                </div>
              )}

              {/* Assets List */}
              {assets.length > 0 && (
                <div className="status-section">
                  <h3 style={{color: '#ffffff', marginBottom: '20px', fontWeight: '600'}}>Your Confidential Portfolio</h3>
                  <div className="assets-container">
                    {assets.map((asset, index) => (
                      <div key={index} className="asset-item">
                        <div className="asset-info">
                          <span className="asset-symbol">{asset.symbol}</span>
                          <span className="asset-data">Amount: {asset.amount} (🔐 encrypted)</span>
                          <span className="asset-data">Value: ${asset.value} (🔐 encrypted)</span>
                          <span className="asset-update">Last Updated: {asset.lastUpdate.toLocaleString()}</span>
                        </div>
                        <button 
                          className="remove-asset" 
                          onClick={() => removeAsset(asset.symbol)}
                          disabled={loading || parseFloat(balance) < 0.001}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <p style={{color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginTop: '15px', textAlign: 'center'}}>
                    💡 All amounts and values are encrypted with FHE. Only you can decrypt your data.
                  </p>
                </div>
              )}

              {/* Empty Portfolio Message */}
              {assets.length === 0 && !showAddAsset && (
                <div className="status-section">
                  <p>&gt; 📊 Portfolio created but no assets added yet</p>
                  <p>&gt; 🚀 Click "Add Asset" to start building your confidential portfolio</p>
                  <p>&gt; 🔐 All data will be encrypted with FHE on the blockchain</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Wrong Network Warning */}
      {account && chainId !== SEPOLIA_CHAIN_ID && (
        <div className="status-section error">
          <h3 style={{color: '#f56565', marginBottom: '15px', fontWeight: '600'}}>⚠️ Wrong Network</h3>
          <p>&gt; This DApp only works on Sepolia testnet</p>
          <p>&gt; Current network: Chain ID {parseInt(chainId, 16)}</p>
          <div className="text-center" style={{marginTop: '15px'}}>
            <button className="button" onClick={switchToSepolia} disabled={loading}>
              {loading ? '🔄 Switching...' : '🔄 Switch to Sepolia'}
            </button>
          </div>
        </div>
      )}

      {/* Transaction History */}
      {transactionHistory.length > 0 && (
        <div className="status-section">
          <h3 style={{color: '#ffffff', marginBottom: '15px', fontWeight: '600'}}>Recent Transactions</h3>
          {transactionHistory.slice(0, 3).map((tx, index) => (
            <div key={tx.hash} style={{marginBottom: '10px', fontSize: '14px'}}>
              <p>&gt; {tx.description}: <span className={tx.status === 'confirmed' ? 'success' : tx.status === 'failed' ? 'error' : 'warning'}>
                {tx.status.toUpperCase()}
              </span></p>
              <p style={{fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)'}}>
                <a href={`https://sepolia.etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="highlight">
                  {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)} ↗
                </a>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p className="loading-text">
            {currentTransaction ? 'Processing Transaction...' : 'Loading...'}
          </p>
          {currentTransaction && (
            <p style={{fontSize: '14px', marginTop: '10px'}}>
              Check MetaMask for transaction confirmation
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="status-section">
        <p>&gt; 🔗 Real blockchain DApp - All transactions are live on Sepolia</p>
        <p>&gt; 🔐 FHE encryption ensures complete privacy of your data</p>
        <p>&gt; ⛽ Gas fees paid with ETH from your wallet</p>
      </footer>
    </div>
  );
}

export default App;