const { ethers } = require("ethers");

async function main() {
  const CONTRACT_ADDRESS = "0x2E6e7A51AbfeEA591bd7140E839B9FC3F70e0d37";
  
  console.log("🔍 Verifying contract deployment...");
  console.log("Contract Address:", CONTRACT_ADDRESS);
  
  try {
    // Connect to Sepolia using Alchemy public endpoint
    const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/demo");
    
    // Check if contract exists
    const code = await provider.getCode(CONTRACT_ADDRESS);
    
    if (code === "0x") {
      console.log("❌ No contract found at this address");
      return;
    }
    
    console.log("✅ Contract found!");
    console.log("Contract code length:", code.length, "characters");
    
    // Try to interact with the contract
    const CONTRACT_ABI = [
      "function owner() external view returns (address)",
      "function portfolioExists(address user) external view returns (bool)"
    ];
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    try {
      const owner = await contract.owner();
      console.log("✅ Contract owner:", owner);
      
      // Test a simple read function
      const testAddress = "0x0000000000000000000000000000000000000001";
      const hasPortfolio = await contract.portfolioExists(testAddress);
      console.log("✅ Contract is responsive - test call successful");
      
    } catch (error) {
      console.log("⚠️  Contract exists but may not be the expected ConfidentialPortfolio contract");
    }
    
    // Etherscan link
    console.log("\n🌐 View on Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`);
    
    console.log("\n✅ Contract verification complete!");
    
  } catch (error) {
    console.error("❌ Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });