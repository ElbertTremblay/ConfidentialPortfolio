import { ethers } from 'ethers';

// FHE Configuration for Zama Testnet
export const FHE_CONFIG = {
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

/**
 * FHE Utility class for handling encrypted computations
 */
export class FHEUtils {
  constructor(provider, signer) {
    this.provider = provider;
    this.signer = signer;
    this.initialized = false;
  }

  /**
   * Initialize FHE utilities
   */
  async initialize() {
    try {
      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (network.chainId !== 11155111n) { // Sepolia
        throw new Error('Please connect to Sepolia testnet');
      }
      
      this.initialized = true;
      console.log('FHE Utils initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize FHE Utils:', error);
      throw error;
    }
  }

  /**
   * Encrypt a value for FHE operations
   * @param {number|string} value - Value to encrypt
   * @param {string} dataType - Type of data (euint64, euint32, etc.)
   * @returns {Promise<{encryptedValue: string, proof: string}>}
   */
  async encryptValue(value, dataType = 'euint64') {
    if (!this.initialized) {
      throw new Error('FHE Utils not initialized');
    }

    try {
      // In a real implementation, this would use the Zama FHE library
      // For demo purposes, we simulate the encryption process
      
      const numericValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numericValue) || numericValue < 0) {
        throw new Error('Invalid value for encryption');
      }

      // Convert to Wei if it's an ETH amount
      const weiValue = ethers.parseEther(numericValue.toString());
      
      // Simulate encryption (in real implementation, use Zama FHE library)
      const encryptedValue = {
        data: ethers.keccak256(ethers.toUtf8Bytes(`encrypted_${weiValue.toString()}`)),
        type: dataType
      };

      // Simulate proof generation
      const proof = ethers.keccak256(
        ethers.concat([
          ethers.toUtf8Bytes('proof'),
          encryptedValue.data,
          await this.signer.getAddress()
        ])
      );

      return {
        encryptedValue: encryptedValue.data,
        proof: proof
      };
    } catch (error) {
      console.error('Error encrypting value:', error);
      throw error;
    }
  }

  /**
   * Generate input proof for encrypted values
   * @param {string} encryptedValue - Encrypted value
   * @param {string} userAddress - User's address
   * @returns {Promise<string>}
   */
  async generateInputProof(encryptedValue, userAddress) {
    try {
      // Simulate proof generation for input verification
      const proof = ethers.keccak256(
        ethers.concat([
          ethers.toUtf8Bytes('input_proof'),
          encryptedValue,
          userAddress
        ])
      );

      return proof;
    } catch (error) {
      console.error('Error generating input proof:', error);
      throw error;
    }
  }

  /**
   * Verify if a value can be encrypted
   * @param {number|string} value - Value to check
   * @returns {boolean}
   */
  canEncrypt(value) {
    try {
      const numericValue = typeof value === 'string' ? parseFloat(value) : value;
      return !isNaN(numericValue) && numericValue >= 0 && numericValue <= Number.MAX_SAFE_INTEGER;
    } catch {
      return false;
    }
  }

  /**
   * Get FHE contract interface for encrypted operations
   * @param {string} contractAddress - Contract address
   * @returns {Promise<ethers.Contract>}
   */
  async getFHEContract(contractAddress, abi) {
    if (!this.initialized) {
      throw new Error('FHE Utils not initialized');
    }

    try {
      const contract = new ethers.Contract(contractAddress, abi, this.signer);
      return contract;
    } catch (error) {
      console.error('Error creating FHE contract:', error);
      throw error;
    }
  }

  /**
   * Request decryption of encrypted result
   * @param {string} contractAddress - Contract address
   * @param {string} encryptedResult - Encrypted result to decrypt
   * @returns {Promise<string>}
   */
  async requestDecryption(contractAddress, encryptedResult) {
    try {
      // In real implementation, this would interact with the decryption oracle
      // For demo purposes, we simulate the request
      
      const requestId = ethers.keccak256(
        ethers.concat([
          ethers.toUtf8Bytes('decrypt_request'),
          contractAddress,
          encryptedResult,
          await this.signer.getAddress()
        ])
      );

      console.log('Decryption requested with ID:', requestId);
      return requestId;
    } catch (error) {
      console.error('Error requesting decryption:', error);
      throw error;
    }
  }

  /**
   * Check decryption status
   * @param {string} requestId - Decryption request ID
   * @returns {Promise<{status: string, result?: any}>}
   */
  async getDecryptionStatus(requestId) {
    try {
      // Simulate checking decryption status
      // In real implementation, this would query the decryption oracle
      
      return {
        status: 'completed',
        result: Math.floor(Math.random() * 1000000) // Simulated decrypted value
      };
    } catch (error) {
      console.error('Error checking decryption status:', error);
      throw error;
    }
  }

  /**
   * Format encrypted value for display
   * @param {string} encryptedValue - Encrypted value
   * @returns {string}
   */
  formatEncryptedValue(encryptedValue) {
    if (!encryptedValue) return 'N/A';
    return `${encryptedValue.substring(0, 8)}...${encryptedValue.substring(encryptedValue.length - 6)}`;
  }

  /**
   * Validate FHE operation parameters
   * @param {Object} params - Operation parameters
   * @returns {boolean}
   */
  validateFHEParams(params) {
    try {
      const { value, contractAddress, userAddress } = params;
      
      if (!value || !contractAddress || !userAddress) {
        return false;
      }

      if (!ethers.isAddress(contractAddress) || !ethers.isAddress(userAddress)) {
        return false;
      }

      return this.canEncrypt(value);
    } catch {
      return false;
    }
  }

  /**
   * Get gas estimate for FHE operations
   * @param {string} operation - Type of operation
   * @returns {number}
   */
  getFHEGasEstimate(operation) {
    const gasEstimates = {
      encrypt: 100000,
      decrypt: 150000,
      add: 80000,
      subtract: 80000,
      multiply: 120000,
      compare: 90000
    };

    return gasEstimates[operation] || 100000;
  }

  /**
   * Check if FHE operations are supported
   * @returns {Promise<boolean>}
   */
  async isFHESupported() {
    try {
      const network = await this.provider.getNetwork();
      return network.chainId === 11155111n; // Sepolia testnet
    } catch {
      return false;
    }
  }
}

/**
 * Create FHE Utils instance
 * @param {ethers.Provider} provider - Ethereum provider
 * @param {ethers.Signer} signer - Ethereum signer
 * @returns {FHEUtils}
 */
export const createFHEUtils = (provider, signer) => {
  return new FHEUtils(provider, signer);
};

/**
 * Helper function to convert ETH to encrypted Wei
 * @param {string|number} ethAmount - Amount in ETH
 * @param {FHEUtils} fheUtils - FHE utils instance
 * @returns {Promise<{encryptedValue: string, proof: string}>}
 */
export const encryptETHAmount = async (ethAmount, fheUtils) => {
  try {
    const weiAmount = ethers.parseEther(ethAmount.toString());
    return await fheUtils.encryptValue(weiAmount.toString(), 'euint64');
  } catch (error) {
    console.error('Error encrypting ETH amount:', error);
    throw error;
  }
};

/**
 * Format FHE error messages
 * @param {Error} error - Error object
 * @returns {string}
 */
export const formatFHEError = (error) => {
  if (error.message.includes('network')) {
    return 'Please connect to Sepolia testnet to use FHE features';
  }
  
  if (error.message.includes('encrypt')) {
    return 'Failed to encrypt value. Please check your input.';
  }
  
  if (error.message.includes('proof')) {
    return 'Failed to generate cryptographic proof. Please try again.';
  }
  
  return error.message || 'An error occurred with FHE operations';
};

export default FHEUtils;