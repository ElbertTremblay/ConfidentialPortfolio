const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Sepolia deployment...");

  // Verify we're on Sepolia
  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId !== 11155111n) {
    throw new Error("This script is only for Sepolia testnet (Chain ID: 11155111)");
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance < hre.ethers.parseEther("0.05")) {
    throw new Error("Insufficient ETH balance for deployment. Need at least 0.05 ETH");
  }

  // Deploy contracts
  console.log("\n📦 Deploying ConfidentialPortfolio...");
  const ConfidentialPortfolio = await hre.ethers.getContractFactory("ConfidentialPortfolio");
  const confidentialPortfolio = await ConfidentialPortfolio.deploy();
  await confidentialPortfolio.waitForDeployment();
  
  const confidentialPortfolioAddress = await confidentialPortfolio.getAddress();
  console.log("✅ ConfidentialPortfolio deployed to:", confidentialPortfolioAddress);

  // Only deploy ConfidentialPortfolio for gas efficiency

  // Wait for block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await confidentialPortfolio.deploymentTransaction().wait(5);
  console.log("✅ Block confirmations completed");

  // Print deployment summary
  console.log("\n📋 SEPOLIA DEPLOYMENT SUMMARY");
  console.log("=============================");
  console.log(`💼 ConfidentialPortfolio: ${confidentialPortfolioAddress}`);
  console.log(`🌐 Network:              Sepolia Testnet`);
  console.log(`🆔 Chain ID:             11155111`);
  console.log(`🔗 Explorer:             https://sepolia.etherscan.io/address/${confidentialPortfolioAddress}`);

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    chainId: "11155111",
    explorerUrl: "https://sepolia.etherscan.io",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ConfidentialPortfolio: {
        address: confidentialPortfolioAddress,
        explorer: `https://sepolia.etherscan.io/address/${confidentialPortfolioAddress}`
      }
    },
    fhe: {
      FHEVM_EXECUTOR_CONTRACT: "0x848B0066793BcC60346Da1F49049357399B8D595",
      ACL_CONTRACT: "0x687820221192C5B662b25367F70076A37bc79b6c",
      HCU_LIMIT_CONTRACT: "0x594BB474275918AF9609814E68C61B1587c5F838",
      KMS_VERIFIER_CONTRACT: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
      INPUT_VERIFIER_CONTRACT: "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4",
      DECRYPTION_ORACLE_CONTRACT: "0xa02Cda4Ca3a71D7C46997716F4283aa851C28812",
      DECRYPTION_ADDRESS: "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
      INPUT_VERIFICATION_ADDRESS: "0x7048C39f048125eDa9d678AEbaDfB22F7900a29F",
      RELAYER_URL: "https://relayer.testnet.zama.cloud"
    }
  };

  require('fs').writeFileSync(
    'sepolia-deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n💾 Deployment info saved to sepolia-deployment.json");

  // Contract verification
  console.log("\n🔍 Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: confidentialPortfolioAddress,
      constructorArguments: []
    });
    console.log("✅ ConfidentialPortfolio verified");
  } catch (error) {
    console.log("⚠️  ConfidentialPortfolio verification failed:", error.message);
  }

  console.log("\n🎉 Sepolia deployment completed!");
  console.log("\n📱 Frontend Configuration:");
  console.log("Update your frontend configuration with:");
  console.log(`CONFIDENTIAL_PORTFOLIO_ADDRESS = "${confidentialPortfolioAddress}"`);
  console.log(`CHAIN_ID = 11155111`);
  console.log(`RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Sepolia deployment failed:");
    console.error(error);
    process.exit(1);
  });