const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting ConfidentialPortfolio deployment...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy ConfidentialPortfolio contract
  console.log("\n📦 Deploying ConfidentialPortfolio...");
  const ConfidentialPortfolio = await hre.ethers.getContractFactory("ConfidentialPortfolio");
  const portfolio = await ConfidentialPortfolio.deploy();
  await portfolio.waitForDeployment();
  
  const portfolioAddress = await portfolio.getAddress();
  console.log("✅ ConfidentialPortfolio deployed to:", portfolioAddress);

  // Print deployment summary
  console.log("\n📋 DEPLOYMENT SUMMARY");
  console.log("=====================");
  console.log(`📊 ConfidentialPortfolio: ${portfolioAddress}`);
  console.log(`🌐 Network:              ${hre.network.name}`);
  console.log(`🆔 Chain ID:             ${(await hre.ethers.provider.getNetwork()).chainId}`);
  console.log(`💸 Management Fee:       1000000 wei`);
  
  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ConfidentialPortfolio: portfolioAddress
    },
    managementFee: "1000000"
  };

  // Write to file
  const fs = require('fs');
  fs.writeFileSync(
    'portfolio-deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to portfolio-deployment.json");

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 To verify contract on Etherscan, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${portfolioAddress}`);
  }

  console.log("\n✨ ConfidentialPortfolio deployment completed successfully!");
  console.log("\n📝 Contract Interface:");
  console.log("- addEncryptedAsset(uint64 _value, uint64 _quantity, string _assetName, uint32 _riskLevel)");
  console.log("- getMyAssetIds() -> uint256[]");
  console.log("- getAssetInfo(uint256 assetId) -> (string, uint32, bool, uint256, address)");
  console.log("- getPortfolioStats(address user) -> (uint256, uint256, bool, bytes32)");
  console.log("- getPortfolioRiskDistribution() -> (uint256, uint256, uint256, uint256)");
  console.log("- calculateEncryptedPortfolioValue() -> bytes32");
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });