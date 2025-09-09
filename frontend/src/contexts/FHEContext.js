import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { CONTRACT_CONFIG } from '../config/contract';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const FHEContext = createContext();

export const useFHE = () => {
  const context = useContext(FHEContext);
  if (!context) {
    throw new Error('useFHE must be used within an FHEProvider');
  }
  return context;
};

// Zama FHE Configuration (from the provided addresses)
const FHE_CONFIG = {
  FHEVM_EXECUTOR_CONTRACT: '0x848B0066793BcC60346Da1F49049357399B8D595',
  ACL_CONTRACT: '0x687820221192C5B662b25367F70076A37bc79b6c',
  HCU_LIMIT_CONTRACT: '0x594BB474275918AF9609814E68C61B1587c5F838',
  KMS_VERIFIER_CONTRACT: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
  INPUT_VERIFIER_CONTRACT: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
  DECRYPTION_ORACLE_CONTRACT: '0xa02Cda4Ca3a71D7C46997716F4283aa851C28812',
  DECRYPTION_ADDRESS: '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
  INPUT_VERIFICATION_ADDRESS: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
  RELAYER_URL: 'https://relayer.testnet.zama.cloud'
};

export const FHEProvider = ({ children }) => {
  const { provider, account, chainId } = useWallet();
  const [fheInstance, setFheInstance] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const initializeFHE = async () => {
    if (!provider || !account || isInitialized || isInitializing) {
      return;
    }

    setIsInitializing(true);

    try {
      // Create a mock instance for demo purposes since fhevmjs has issues
      const mockInstance = createMockFHEInstance();
      const mockContract = createMockContract();
      
      setFheInstance(mockInstance);
      setContractInstance(mockContract);
      setIsInitialized(true);
      
      console.log('FHE initialized in demo mode');
      toast.success('Demo mode: FHE simulation active');
    } catch (error) {
      console.error('Error initializing FHE:', error);
      toast.error('Failed to initialize FHE encryption');
    } finally {
      setIsInitializing(false);
    }
  };

  const createMockContract = () => {
    return {
      // New ConfidentialPortfolio contract interface
      addEncryptedAsset: async (value, quantity, assetName, riskLevel, options) => {
        console.log('Mock: Adding encrypted asset to contract');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { hash: '0x' + Math.random().toString(16).substr(2, 8) };
      },
      
      getMyAssetIds: async () => {
        // Return mock asset IDs
        return [1, 2, 3];
      },
      
      getMyAssetCount: async () => {
        return 3;
      },
      
      getAssetInfo: async (assetId) => {
        const mockAssets = {
          1: ['Tech Stocks', 1, true, Math.floor(Date.now() / 1000), account],
          2: ['Crypto Portfolio', 3, true, Math.floor(Date.now() / 1000), account],
          3: ['Government Bonds', 0, true, Math.floor(Date.now() / 1000), account]
        };
        return mockAssets[assetId] || ['Unknown Asset', 0, false, 0, account];
      },
      
      getPortfolioStats: async (userAddress) => {
        return [3, Math.floor(Date.now() / 1000), true, '0x' + Math.random().toString(16).substr(2, 32)];
      },
      
      getPortfolioRiskDistribution: async () => {
        return [1, 1, 0, 1]; // lowRisk, mediumRisk, highRisk, veryHighRisk
      },
      
      calculateEncryptedPortfolioValue: async () => {
        return '0x' + Math.random().toString(16).substr(2, 32);
      },
      
      getEncryptedAssetValues: async (assetId) => {
        return [
          '0x' + Math.random().toString(16).substr(2, 32), // encryptedValue
          '0x' + Math.random().toString(16).substr(2, 32), // encryptedQuantity  
          '0x' + Math.random().toString(16).substr(2, 32)  // valueHash
        ];
      },
      
      requestAssetDecryption: async (assetId) => {
        return Math.floor(Math.random() * 1000);
      },
      
      deactivateAsset: async (assetId) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { hash: '0x' + Math.random().toString(16).substr(2, 8) };
      },
      
      getContractBalance: async () => {
        return ethers.parseEther("0.1");
      },
      
      // Contract constants
      MANAGEMENT_FEE: async () => {
        return CONTRACT_CONFIG.MANAGEMENT_FEE;
      },
      
      address: CONTRACT_CONFIG.CONFIDENTIAL_PORTFOLIO_ADDRESS
    };
  };

  const createMockFHEInstance = () => {
    return {
      encrypt64: (value) => {
        // Mock encryption - in real implementation this would use actual FHE
        const mockCiphertext = btoa(JSON.stringify({ 
          value: value.toString(), 
          timestamp: Date.now(),
          random: Math.random().toString(36)
        }));
        
        return {
          data: new Uint8Array(Buffer.from(mockCiphertext, 'base64')),
          handles: [mockCiphertext]
        };
      },
      
      decrypt: async (ciphertext, privateKey) => {
        try {
          // Mock decryption with realistic data
          const mockData = {
            'encrypted_value_0': 50000,
            'encrypted_value_1': 75000,
            'encrypted_value_2': 100000,
            'encrypted_quantity_0': 250,
            'encrypted_quantity_1': 150,
            'encrypted_quantity_2': 300,
            'encrypted_type_0': 0,
            'encrypted_type_1': 1,
            'encrypted_type_2': 2
          };
          
          const decoded = atob(ciphertext);
          return mockData[decoded] || Math.floor(Math.random() * 100000);
        } catch (error) {
          console.error('Mock decryption error:', error);
          return Math.floor(Math.random() * 100000);
        }
      },
      
      generateKeypair: () => {
        // Mock keypair generation
        return {
          publicKey: 'mock_public_key_' + Math.random().toString(36),
          privateKey: 'mock_private_key_' + Math.random().toString(36)
        };
      },
      
      generateInputProof: async (value) => {
        // Mock input proof generation
        return new Uint8Array(32); // Mock 32-byte proof
      },
      
      isMockMode: true
    };
  };

  const encryptUint64 = async (value) => {
    if (!fheInstance) {
      throw new Error('FHE not initialized');
    }

    try {
      const encrypted = fheInstance.encrypt64(parseInt(value));
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt value');
    }
  };

  const generateInputProof = async (value) => {
    if (!fheInstance) {
      throw new Error('FHE not initialized');
    }

    try {
      const proof = await fheInstance.generateInputProof(parseInt(value));
      return proof;
    } catch (error) {
      console.error('Input proof generation error:', error);
      throw new Error('Failed to generate input proof');
    }
  };

  const decryptValue = async (ciphertext, privateKey) => {
    if (!fheInstance) {
      throw new Error('FHE not initialized');
    }

    try {
      const decrypted = await fheInstance.decrypt(ciphertext, privateKey);
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt value');
    }
  };

  const createEncryptedInput = async (value) => {
    try {
      const encrypted = await encryptUint64(value);
      const proof = await generateInputProof(value);
      
      return {
        encryptedValue: encrypted.data,
        proof: proof,
        handles: encrypted.handles || []
      };
    } catch (error) {
      console.error('Error creating encrypted input:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (provider && account && !isInitialized) {
      initializeFHE();
    }
  }, [provider, account, isInitialized]);

  const value = {
    fheInstance,
    contractInstance,
    isInitialized,
    isInitializing,
    encryptUint64,
    generateInputProof,
    decryptValue,
    createEncryptedInput,
    config: FHE_CONFIG,
    isMockMode: fheInstance?.isMockMode || false,
  };

  return (
    <FHEContext.Provider value={value}>
      {children}
    </FHEContext.Provider>
  );
};

export default FHEProvider;