// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ConfidentialPortfolio - Privacy-First Asset Management
/// @notice Manages encrypted portfolios using Zama's FHE technology
/// @dev All asset amounts and values are encrypted on-chain
contract ConfidentialPortfolio is SepoliaConfig {
    
    address public owner;
    
    struct Asset {
        string symbol;
        euint64 encryptedAmount;
        euint64 encryptedValue;
        bool exists;
        uint256 lastUpdate;
    }
    
    struct Portfolio {
        mapping(string => Asset) assets;
        string[] assetSymbols;
        euint64 totalValue;
        bool exists;
        uint256 createdAt;
    }
    
    mapping(address => Portfolio) private portfolios;
    mapping(address => bool) public authorizedManagers;
    
    event PortfolioCreated(address indexed user, uint256 timestamp);
    event AssetAdded(address indexed user, string symbol, uint256 timestamp);
    event AssetUpdated(address indexed user, string symbol, uint256 timestamp);
    event AssetRemoved(address indexed user, string symbol, uint256 timestamp);
    event ManagerAuthorized(address indexed manager);
    event ManagerRevoked(address indexed manager);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier onlyPortfolioOwner() {
        require(portfolios[msg.sender].exists, "Portfolio does not exist");
        _;
    }
    
    modifier onlyAuthorizedManager() {
        require(authorizedManagers[msg.sender] || msg.sender == owner, "Not authorized manager");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedManagers[msg.sender] = true;
    }
    
    /// @notice Creates a new confidential portfolio for the caller
    /// @dev Initializes portfolio with encrypted zero total value
    function createPortfolio() external {
        require(!portfolios[msg.sender].exists, "Portfolio already exists");
        
        portfolios[msg.sender].exists = true;
        portfolios[msg.sender].totalValue = FHE.asEuint64(0);
        portfolios[msg.sender].createdAt = block.timestamp;
        
        FHE.allowThis(portfolios[msg.sender].totalValue);
        FHE.allow(portfolios[msg.sender].totalValue, msg.sender);
        
        emit PortfolioCreated(msg.sender, block.timestamp);
    }
    
    /// @notice Adds an encrypted asset to the caller's portfolio
    /// @param symbol Asset symbol (e.g., "BTC", "ETH")
    /// @param amount Encrypted amount of the asset
    /// @param value Encrypted value of the asset in USD
    function addAsset(
        string memory symbol,
        uint64 amount,
        uint64 value
    ) external onlyPortfolioOwner {
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(bytes(symbol).length <= 10, "Symbol too long");
        require(!portfolios[msg.sender].assets[symbol].exists, "Asset already exists");
        
        euint64 encryptedAmount = FHE.asEuint64(amount);
        euint64 encryptedValue = FHE.asEuint64(value);
        
        portfolios[msg.sender].assets[symbol] = Asset({
            symbol: symbol,
            encryptedAmount: encryptedAmount,
            encryptedValue: encryptedValue,
            exists: true,
            lastUpdate: block.timestamp
        });
        
        portfolios[msg.sender].assetSymbols.push(symbol);
        
        // Update total portfolio value
        portfolios[msg.sender].totalValue = FHE.add(
            portfolios[msg.sender].totalValue, 
            encryptedValue
        );
        
        // Set FHE permissions
        FHE.allowThis(encryptedAmount);
        FHE.allowThis(encryptedValue);
        FHE.allowThis(portfolios[msg.sender].totalValue);
        FHE.allow(encryptedAmount, msg.sender);
        FHE.allow(encryptedValue, msg.sender);
        FHE.allow(portfolios[msg.sender].totalValue, msg.sender);
        
        emit AssetAdded(msg.sender, symbol, block.timestamp);
    }
    
    /// @notice Updates an existing asset with new encrypted values
    /// @param symbol Asset symbol to update
    /// @param newAmount New encrypted amount
    /// @param newValue New encrypted value in USD
    function updateAsset(
        string memory symbol,
        uint64 newAmount,
        uint64 newValue
    ) external onlyPortfolioOwner {
        require(portfolios[msg.sender].assets[symbol].exists, "Asset does not exist");
        
        // Remove old value from total
        portfolios[msg.sender].totalValue = FHE.sub(
            portfolios[msg.sender].totalValue,
            portfolios[msg.sender].assets[symbol].encryptedValue
        );
        
        // Update asset with new encrypted values
        euint64 encryptedAmount = FHE.asEuint64(newAmount);
        euint64 encryptedValue = FHE.asEuint64(newValue);
        
        portfolios[msg.sender].assets[symbol].encryptedAmount = encryptedAmount;
        portfolios[msg.sender].assets[symbol].encryptedValue = encryptedValue;
        portfolios[msg.sender].assets[symbol].lastUpdate = block.timestamp;
        
        // Add new value to total
        portfolios[msg.sender].totalValue = FHE.add(
            portfolios[msg.sender].totalValue,
            encryptedValue
        );
        
        // Set FHE permissions
        FHE.allowThis(encryptedAmount);
        FHE.allowThis(encryptedValue);
        FHE.allowThis(portfolios[msg.sender].totalValue);
        FHE.allow(encryptedAmount, msg.sender);
        FHE.allow(encryptedValue, msg.sender);
        FHE.allow(portfolios[msg.sender].totalValue, msg.sender);
        
        emit AssetUpdated(msg.sender, symbol, block.timestamp);
    }
    
    /// @notice Removes an asset from the caller's portfolio
    /// @param symbol Asset symbol to remove
    function removeAsset(string memory symbol) external onlyPortfolioOwner {
        require(portfolios[msg.sender].assets[symbol].exists, "Asset does not exist");
        
        // Remove value from total
        portfolios[msg.sender].totalValue = FHE.sub(
            portfolios[msg.sender].totalValue,
            portfolios[msg.sender].assets[symbol].encryptedValue
        );
        
        // Remove from assets mapping
        delete portfolios[msg.sender].assets[symbol];
        
        // Remove from symbols array
        string[] storage symbols = portfolios[msg.sender].assetSymbols;
        for (uint i = 0; i < symbols.length; i++) {
            if (keccak256(bytes(symbols[i])) == keccak256(bytes(symbol))) {
                symbols[i] = symbols[symbols.length - 1];
                symbols.pop();
                break;
            }
        }
        
        FHE.allowThis(portfolios[msg.sender].totalValue);
        FHE.allow(portfolios[msg.sender].totalValue, msg.sender);
        
        emit AssetRemoved(msg.sender, symbol, block.timestamp);
    }
    
    /// @notice Gets all asset symbols in a user's portfolio
    /// @param user Portfolio owner address
    /// @return Array of asset symbols
    function getAssetSymbols(address user) external view returns (string[] memory) {
        return portfolios[user].assetSymbols;
    }
    
    /// @notice Gets encrypted amount for a specific asset
    /// @param user Portfolio owner address
    /// @param symbol Asset symbol
    /// @return Encrypted amount (only decryptable by owner)
    function getEncryptedAssetAmount(address user, string memory symbol) external view returns (euint64) {
        require(portfolios[user].assets[symbol].exists, "Asset does not exist");
        return portfolios[user].assets[symbol].encryptedAmount;
    }
    
    /// @notice Gets encrypted value for a specific asset
    /// @param user Portfolio owner address
    /// @param symbol Asset symbol
    /// @return Encrypted value (only decryptable by owner)
    function getEncryptedAssetValue(address user, string memory symbol) external view returns (euint64) {
        require(portfolios[user].assets[symbol].exists, "Asset does not exist");
        return portfolios[user].assets[symbol].encryptedValue;
    }
    
    /// @notice Gets encrypted total portfolio value
    /// @param user Portfolio owner address
    /// @return Encrypted total value (only decryptable by owner)
    function getEncryptedTotalValue(address user) external view returns (euint64) {
        require(portfolios[user].exists, "Portfolio does not exist");
        return portfolios[user].totalValue;
    }
    
    /// @notice Checks if a user has a portfolio
    /// @param user Address to check
    /// @return True if portfolio exists
    function portfolioExists(address user) external view returns (bool) {
        return portfolios[user].exists;
    }
    
    /// @notice Gets portfolio creation timestamp
    /// @param user Portfolio owner address
    /// @return Creation timestamp
    function getPortfolioCreatedAt(address user) external view returns (uint256) {
        require(portfolios[user].exists, "Portfolio does not exist");
        return portfolios[user].createdAt;
    }
    
    /// @notice Gets last update timestamp for an asset
    /// @param user Portfolio owner address
    /// @param symbol Asset symbol
    /// @return Last update timestamp
    function getAssetLastUpdate(address user, string memory symbol) external view returns (uint256) {
        require(portfolios[user].assets[symbol].exists, "Asset does not exist");
        return portfolios[user].assets[symbol].lastUpdate;
    }
    
    /// @notice Authorizes a new portfolio manager (owner only)
    /// @param manager Address to authorize
    function authorizeManager(address manager) external onlyOwner {
        require(manager != address(0), "Invalid manager address");
        authorizedManagers[manager] = true;
        emit ManagerAuthorized(manager);
    }
    
    /// @notice Revokes manager authorization (owner only)
    /// @param manager Address to revoke
    function revokeManager(address manager) external onlyOwner {
        require(manager != owner, "Cannot revoke owner");
        authorizedManagers[manager] = false;
        emit ManagerRevoked(manager);
    }
    
    /// @notice Gets the total number of assets in a portfolio
    /// @param user Portfolio owner address
    /// @return Number of assets
    function getAssetCount(address user) external view returns (uint256) {
        return portfolios[user].assetSymbols.length;
    }
}