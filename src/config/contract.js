// Contract configuration
export const CONTRACT_CONFIG = {
  // Main contract address
  CONFIDENTIAL_PORTFOLIO_ADDRESS: process.env.REACT_APP_CONTRACT_ADDRESS || "0x4709792Ea052431C28f0359225E3e6F441691b3d",
  
  // Network configuration
  NETWORK: process.env.REACT_APP_NETWORK || "sepolia",
  CHAIN_ID: parseInt(process.env.REACT_APP_CHAIN_ID || "11155111"),
  
  // Contract ABI - Essential functions only for production
  PORTFOLIO_ABI: [
    "function addEncryptedAsset(uint64 _value, uint64 _quantity, string _assetName, uint32 _riskLevel) external payable returns (uint256)",
    "function getMyAssetIds() external view returns (uint256[])",
    "function getAssetInfo(uint256 assetId) external view returns (string, uint32, bool, uint256, address)",
    "function getMyAssetCount() external view returns (uint256)",
    "function getPortfolioStats(address user) external view returns (uint256, uint256, bool, bytes32)",
    "function getPortfolioRiskDistribution() external view returns (uint256, uint256, uint256, uint256)",
    "function calculateEncryptedPortfolioValue() external returns (bytes32)",
    "function getEncryptedAssetValues(uint256 assetId) external view returns (bytes32, bytes32, bytes32)",
    "function requestAssetDecryption(uint256 assetId) external returns (uint256)",
    "function deactivateAsset(uint256 assetId) external",
    "function getContractBalance() external view returns (uint256)",
    "function owner() external view returns (address)",
    "function MANAGEMENT_FEE() external view returns (uint256)"
  ],
  
  // Fee configuration
  MANAGEMENT_FEE: "1000000", // 1000000 wei
  
  // Network details
  NETWORKS: {
    sepolia: {
      chainId: 11155111,
      name: "Sepolia Testnet",
      rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
      blockExplorer: "https://sepolia.etherscan.io"
    },
    localhost: {
      chainId: 31337,
      name: "Local Network",
      rpcUrl: "http://127.0.0.1:8545",
      blockExplorer: null
    }
  }
};

export default CONTRACT_CONFIG;