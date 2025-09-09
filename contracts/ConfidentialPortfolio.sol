// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ConfidentialPortfolio
 * @dev Confidential Portfolio Management with FHE-style encryption
 * Privacy-focused asset management using cryptographic techniques
 */
contract ConfidentialPortfolio {
    
    address public owner;
    uint256 public constant MANAGEMENT_FEE = 1000000 wei; // Minimum fee for operations
    uint256 private assetIdCounter;
    
    struct AssetRecord {
        bytes32 encryptedValue;       // Encrypted asset value (simulated FHE)
        bytes32 encryptedQuantity;    // Encrypted quantity/shares (simulated FHE)
        uint32 riskLevel;             // Risk category (0=Low, 1=Medium, 2=High, 3=VeryHigh)
        address owner;
        bool active;
        uint256 timestamp;
        string assetName;             // Public asset name for identification
        bytes32 valueHash;            // Hash for integrity verification
    }
    
    struct PortfolioStats {
        uint256 totalAssets;
        uint256 lastUpdate;
        bool hasAssets;
        bytes32 totalValueHash;       // Encrypted total value
    }
    
    struct DecryptionRequest {
        uint256 assetId;
        address requester;
        uint256 timestamp;
        bool processed;
    }
    
    // User portfolios: user address => asset ID => asset record
    mapping(address => mapping(uint256 => AssetRecord)) public userAssets;
    mapping(address => uint256[]) public userAssetIds;
    mapping(address => PortfolioStats) public portfolioStats;
    mapping(address => bool) public authorizedManagers;
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    
    uint256 private requestCounter;
    
    // Events
    event AssetAdded(address indexed investor, uint256 indexed assetId, string assetName);
    event PortfolioUpdated(address indexed investor, uint256 timestamp);
    event AuthorizedManagerAdded(address indexed manager);
    event DecryptionRequested(uint256 indexed requestId, uint256 indexed assetId);
    event ValueRevealed(uint256 indexed assetId, bytes32 encryptedValue);
    event PortfolioValueCalculated(address indexed user, bytes32 encryptedTotal);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedManagers[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier requireFee() {
        require(msg.value >= MANAGEMENT_FEE, "Insufficient management fee");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedManagers[msg.sender] = true;
        assetIdCounter = 1;
        requestCounter = 1;
    }
    
    /**
     * @dev Add encrypted asset to portfolio
     * @param _value Original asset value (will be encrypted)
     * @param _quantity Original quantity (will be encrypted)
     * @param _assetName Public asset name for identification
     * @param _riskLevel Risk level (0=Low, 1=Medium, 2=High, 3=VeryHigh)
     */
    function addEncryptedAsset(
        uint64 _value,
        uint64 _quantity,
        string calldata _assetName,
        uint32 _riskLevel
    ) external payable requireFee returns (uint256 assetId) {
        require(_riskLevel <= 3, "Invalid risk level");
        require(bytes(_assetName).length > 0, "Asset name required");
        require(_value > 0 && _quantity > 0, "Invalid values");
        
        assetId = assetIdCounter++;
        
        // Simulate FHE encryption using cryptographic hashing
        bytes32 encryptedValue = _encryptValue(_value, msg.sender, assetId);
        bytes32 encryptedQuantity = _encryptValue(_quantity, msg.sender, assetId + 1);
        bytes32 valueHash = keccak256(abi.encodePacked(_value, _quantity, msg.sender, block.timestamp));
        
        // Store asset record
        userAssets[msg.sender][assetId] = AssetRecord({
            encryptedValue: encryptedValue,
            encryptedQuantity: encryptedQuantity,
            riskLevel: _riskLevel,
            owner: msg.sender,
            active: true,
            timestamp: block.timestamp,
            assetName: _assetName,
            valueHash: valueHash
        });
        
        // Update user's asset list
        userAssetIds[msg.sender].push(assetId);
        
        // Update portfolio stats
        portfolioStats[msg.sender].totalAssets++;
        portfolioStats[msg.sender].lastUpdate = block.timestamp;
        portfolioStats[msg.sender].hasAssets = true;
        
        emit AssetAdded(msg.sender, assetId, _assetName);
        emit PortfolioUpdated(msg.sender, block.timestamp);
        
        return assetId;
    }
    
    /**
     * @dev Internal function to encrypt values (simulated FHE)
     */
    function _encryptValue(uint64 value, address user, uint256 salt) private view returns (bytes32) {
        return keccak256(abi.encodePacked(value, user, salt, block.timestamp, address(this)));
    }
    
    /**
     * @dev Get user's total asset count
     */
    function getMyAssetCount() external view returns (uint256) {
        return userAssetIds[msg.sender].length;
    }
    
    /**
     * @dev Get user's asset IDs
     */
    function getMyAssetIds() external view returns (uint256[] memory) {
        return userAssetIds[msg.sender];
    }
    
    /**
     * @dev Get asset basic info (public data)
     */
    function getAssetInfo(uint256 assetId) external view returns (
        string memory assetName,
        uint32 riskLevel,
        bool active,
        uint256 timestamp,
        address assetOwner
    ) {
        AssetRecord storage asset = userAssets[msg.sender][assetId];
        require(asset.owner == msg.sender, "Asset not found or not owned");
        
        return (
            asset.assetName,
            asset.riskLevel,
            asset.active,
            asset.timestamp,
            asset.owner
        );
    }
    
    /**
     * @dev Get encrypted asset values (FHE-style)
     */
    function getEncryptedAssetValues(uint256 assetId) external view returns (
        bytes32 encryptedValue,
        bytes32 encryptedQuantity,
        bytes32 valueHash
    ) {
        AssetRecord storage asset = userAssets[msg.sender][assetId];
        require(asset.owner == msg.sender, "Asset not found or not owned");
        
        return (
            asset.encryptedValue,
            asset.encryptedQuantity,
            asset.valueHash
        );
    }
    
    /**
     * @dev Request decryption of asset value (simulated FHE decryption)
     */
    function requestAssetDecryption(uint256 assetId) external returns (uint256 requestId) {
        AssetRecord storage asset = userAssets[msg.sender][assetId];
        require(asset.owner == msg.sender, "Asset not found or not owned");
        require(asset.active, "Asset is not active");
        
        requestId = requestCounter++;
        
        decryptionRequests[requestId] = DecryptionRequest({
            assetId: assetId,
            requester: msg.sender,
            timestamp: block.timestamp,
            processed: false
        });
        
        emit DecryptionRequested(requestId, assetId);
        emit ValueRevealed(assetId, asset.encryptedValue);
        
        return requestId;
    }
    
    /**
     * @dev Calculate encrypted portfolio total value (simulated FHE computation)
     */
    function calculateEncryptedPortfolioValue() external returns (bytes32 encryptedTotal) {
        uint256[] memory assetIds = userAssetIds[msg.sender];
        require(assetIds.length > 0, "No assets in portfolio");
        
        // Simulate FHE homomorphic addition
        bytes32 totalHash = keccak256(abi.encodePacked("portfolio_total", msg.sender, block.timestamp));
        
        // Update portfolio stats
        portfolioStats[msg.sender].totalValueHash = totalHash;
        portfolioStats[msg.sender].lastUpdate = block.timestamp;
        
        emit PortfolioValueCalculated(msg.sender, totalHash);
        
        return totalHash;
    }
    
    /**
     * @dev Compare two assets by encrypted value (simulated FHE comparison)
     */
    function compareEncryptedAssetValues(uint256 assetId1, uint256 assetId2) external view returns (bool) {
        AssetRecord storage asset1 = userAssets[msg.sender][assetId1];
        AssetRecord storage asset2 = userAssets[msg.sender][assetId2];
        
        require(asset1.owner == msg.sender && asset2.owner == msg.sender, "Assets not owned");
        
        // Simulated FHE comparison (in real FHE this would be encrypted comparison)
        return uint256(asset1.encryptedValue) > uint256(asset2.encryptedValue);
    }
    
    /**
     * @dev Get portfolio risk distribution
     */
    function getPortfolioRiskDistribution() external view returns (
        uint256 lowRisk,
        uint256 mediumRisk,
        uint256 highRisk,
        uint256 veryHighRisk
    ) {
        uint256[] memory assetIds = userAssetIds[msg.sender];
        
        for (uint i = 0; i < assetIds.length; i++) {
            AssetRecord storage asset = userAssets[msg.sender][assetIds[i]];
            if (asset.active) {
                if (asset.riskLevel == 0) lowRisk++;
                else if (asset.riskLevel == 1) mediumRisk++;
                else if (asset.riskLevel == 2) highRisk++;
                else if (asset.riskLevel == 3) veryHighRisk++;
            }
        }
        
        return (lowRisk, mediumRisk, highRisk, veryHighRisk);
    }
    
    /**
     * @dev Update asset status
     */
    function deactivateAsset(uint256 assetId) external {
        AssetRecord storage asset = userAssets[msg.sender][assetId];
        require(asset.owner == msg.sender, "Asset not found or not owned");
        require(asset.active, "Asset already inactive");
        
        asset.active = false;
        
        // Update portfolio stats
        portfolioStats[msg.sender].totalAssets--;
        portfolioStats[msg.sender].lastUpdate = block.timestamp;
        
        emit PortfolioUpdated(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Add authorized manager
     */
    function addAuthorizedManager(address manager) external onlyOwner {
        authorizedManagers[manager] = true;
        emit AuthorizedManagerAdded(manager);
    }
    
    /**
     * @dev Remove authorized manager
     */
    function removeAuthorizedManager(address manager) external onlyOwner {
        authorizedManagers[manager] = false;
    }
    
    /**
     * @dev Get portfolio statistics
     */
    function getPortfolioStats(address user) external view returns (
        uint256 totalAssets,
        uint256 lastUpdate,
        bool hasAssets,
        bytes32 totalValueHash
    ) {
        PortfolioStats storage stats = portfolioStats[user];
        return (stats.totalAssets, stats.lastUpdate, stats.hasAssets, stats.totalValueHash);
    }
    
    /**
     * @dev Generate random encrypted value for demo (simulated FHE random)
     */
    function generateRandomEncryptedValue() external view returns (bytes32) {
        return keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, address(this)));
    }
    
    /**
     * @dev Emergency function to withdraw accumulated fees
     */
    function withdrawFees() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get decryption request info
     */
    function getDecryptionRequest(uint256 requestId) external view returns (
        uint256 assetId,
        address requester,
        uint256 timestamp,
        bool processed
    ) {
        DecryptionRequest storage request = decryptionRequests[requestId];
        return (request.assetId, request.requester, request.timestamp, request.processed);
    }
    
    receive() external payable {}
}