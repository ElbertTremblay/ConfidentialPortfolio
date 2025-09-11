import { ethers } from "hardhat";
import { ConfidentialPortfolio } from "../types";

async function main() {
  console.log("🚀 Deploying ConfidentialPortfolio contract...");
  console.log("================================");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  
  // Check account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    throw new Error("❌ Deployer account has no balance. Please fund the account with ETH.");
  }

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");

  // Deploy the contract
  console.log("\n📦 Deploying ConfidentialPortfolio...");
  const ConfidentialPortfolioFactory = await ethers.getContractFactory("ConfidentialPortfolio");
  
  const portfolio = await ConfidentialPortfolioFactory.deploy() as ConfidentialPortfolio;
  const deploymentTx = portfolio.deploymentTransaction();
  
  if (!deploymentTx) {
    throw new Error("❌ Deployment transaction failed");
  }

  console.log("⏳ Transaction hash:", deploymentTx.hash);
  console.log("⏳ Waiting for deployment confirmation...");

  // Wait for deployment
  await portfolio.waitForDeployment();
  const contractAddress = await portfolio.getAddress();

  console.log("\n✅ Contract deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔍 Transaction hash:", deploymentTx.hash);
  
  // Get deployment receipt for gas usage
  const receipt = await deploymentTx.wait();
  if (receipt) {
    console.log("⛽ Gas used:", receipt.gasUsed.toString());
    console.log("💰 Gas price:", ethers.formatUnits(receipt.gasPrice || 0n, "gwei"), "gwei");
  }

  // Verify contract owner
  const owner = await portfolio.owner();
  console.log("👑 Contract owner:", owner);
  console.log("✅ Owner verification:", owner === deployer.address ? "CORRECT" : "INCORRECT");

  // Network-specific instructions
  if (network.chainId === 11155111n) { // Sepolia
    console.log("\n🔗 Sepolia Testnet Deployment Complete");
    console.log("🌐 View on Etherscan:");
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("\n📋 Next Steps:");
    console.log("1. ✅ CONTRACT_ADDRESS updated in src/App.tsx");
    console.log("2. Verify contract on Etherscan (optional):");
    console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);
    console.log("3. Test the frontend application");
  } else if (network.chainId === 31337n) { // Local
    console.log("\n🏠 Local Network Deployment Complete");
    console.log("📋 Next Steps:");
    console.log("1. ✅ CONTRACT_ADDRESS updated in src/App.tsx");
    console.log("2. Configure MetaMask to connect to localhost:8545");
    console.log("3. Test the frontend application");
  }

  // Frontend contract address update
  console.log("\n✅ Contract address for frontend:");
  console.log(`   File: src/App.tsx`);
  console.log(`   const CONTRACT_ADDRESS = "${contractAddress}";`);

  console.log("\n🎉 Deployment process completed successfully!");
}

// Handle deployment errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });