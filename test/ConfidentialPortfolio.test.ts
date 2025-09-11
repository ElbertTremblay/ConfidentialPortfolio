import { expect } from "chai";
import { ethers } from "hardhat";
import { ConfidentialPortfolio } from "../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ConfidentialPortfolio", function () {
  let portfolio: ConfidentialPortfolio;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let manager: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1, user2, manager] = await ethers.getSigners();
    
    const ConfidentialPortfolioFactory = await ethers.getContractFactory("ConfidentialPortfolio");
    portfolio = await ConfidentialPortfolioFactory.deploy() as ConfidentialPortfolio;
    await portfolio.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await portfolio.owner()).to.equal(owner.address);
    });

    it("Should authorize owner as manager", async function () {
      expect(await portfolio.authorizedManagers(owner.address)).to.equal(true);
    });

    it("Should have correct contract address", async function () {
      const address = await portfolio.getAddress();
      expect(address).to.be.properAddress;
    });
  });

  describe("Portfolio Management", function () {
    it("Should create a portfolio successfully", async function () {
      await expect(portfolio.connect(user1).createPortfolio())
        .to.emit(portfolio, "PortfolioCreated")
        .withArgs(user1.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await portfolio.portfolioExists(user1.address)).to.equal(true);
    });

    it("Should not allow creating duplicate portfolios", async function () {
      await portfolio.connect(user1).createPortfolio();
      
      await expect(
        portfolio.connect(user1).createPortfolio()
      ).to.be.revertedWith("Portfolio already exists");
    });

    it("Should track portfolio creation time", async function () {
      const tx = await portfolio.connect(user1).createPortfolio();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      
      const createdAt = await portfolio.getPortfolioCreatedAt(user1.address);
      expect(createdAt).to.equal(block!.timestamp);
    });

    it("Should return false for non-existent portfolios", async function () {
      expect(await portfolio.portfolioExists(user2.address)).to.equal(false);
    });
  });

  describe("Asset Management", function () {
    beforeEach(async function () {
      await portfolio.connect(user1).createPortfolio();
    });

    it("Should add an asset to portfolio", async function () {
      await expect(portfolio.connect(user1).addAsset("BTC", 100000000, 5000000))
        .to.emit(portfolio, "AssetAdded")
        .withArgs(user1.address, "BTC", await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
      
      const symbols = await portfolio.getAssetSymbols(user1.address);
      expect(symbols).to.include("BTC");
      expect(symbols.length).to.equal(1);
    });

    it("Should not allow adding assets without portfolio", async function () {
      await expect(
        portfolio.connect(user2).addAsset("BTC", 100000000, 5000000)
      ).to.be.revertedWith("Portfolio does not exist");
    });

    it("Should not allow duplicate assets", async function () {
      await portfolio.connect(user1).addAsset("BTC", 100000000, 5000000);
      
      await expect(
        portfolio.connect(user1).addAsset("BTC", 200000000, 10000000)
      ).to.be.revertedWith("Asset already exists");
    });

    it("Should validate asset symbol constraints", async function () {
      // Empty symbol
      await expect(
        portfolio.connect(user1).addAsset("", 100000000, 5000000)
      ).to.be.revertedWith("Symbol cannot be empty");

      // Symbol too long
      await expect(
        portfolio.connect(user1).addAsset("VERYLONGSYMBOL", 100000000, 5000000)
      ).to.be.revertedWith("Symbol too long");
    });

    it("Should update an existing asset", async function () {
      await portfolio.connect(user1).addAsset("BTC", 100000000, 5000000);
      
      await expect(portfolio.connect(user1).updateAsset("BTC", 150000000, 7500000))
        .to.emit(portfolio, "AssetUpdated")
        .withArgs(user1.address, "BTC", await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
      
      // Asset should still exist
      const symbols = await portfolio.getAssetSymbols(user1.address);
      expect(symbols).to.include("BTC");
    });

    it("Should not update non-existent assets", async function () {
      await expect(
        portfolio.connect(user1).updateAsset("ETH", 1000000, 400000)
      ).to.be.revertedWith("Asset does not exist");
    });

    it("Should remove an asset", async function () {
      await portfolio.connect(user1).addAsset("BTC", 100000000, 5000000);
      
      await expect(portfolio.connect(user1).removeAsset("BTC"))
        .to.emit(portfolio, "AssetRemoved")
        .withArgs(user1.address, "BTC", await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
      
      const symbols = await portfolio.getAssetSymbols(user1.address);
      expect(symbols).to.not.include("BTC");
      expect(symbols.length).to.equal(0);
    });

    it("Should not remove non-existent assets", async function () {
      await expect(
        portfolio.connect(user1).removeAsset("ETH")
      ).to.be.revertedWith("Asset does not exist");
    });

    it("Should track asset count correctly", async function () {
      expect(await portfolio.getAssetCount(user1.address)).to.equal(0);
      
      await portfolio.connect(user1).addAsset("BTC", 100000000, 5000000);
      expect(await portfolio.getAssetCount(user1.address)).to.equal(1);
      
      await portfolio.connect(user1).addAsset("ETH", 1000000, 400000);
      expect(await portfolio.getAssetCount(user1.address)).to.equal(2);
      
      await portfolio.connect(user1).removeAsset("BTC");
      expect(await portfolio.getAssetCount(user1.address)).to.equal(1);
    });

    it("Should handle multiple assets correctly", async function () {
      const assets = [
        { symbol: "BTC", amount: 100000000, value: 5000000 },
        { symbol: "ETH", amount: 1000000, value: 400000 },
        { symbol: "USDT", amount: 10000000, value: 10000000 }
      ];

      for (const asset of assets) {
        await portfolio.connect(user1).addAsset(asset.symbol, asset.amount, asset.value);
      }

      const symbols = await portfolio.getAssetSymbols(user1.address);
      expect(symbols.length).to.equal(3);
      
      for (const asset of assets) {
        expect(symbols).to.include(asset.symbol);
      }
    });
  });

  describe("Access Control", function () {
    it("Should authorize a new manager", async function () {
      await expect(portfolio.connect(owner).authorizeManager(manager.address))
        .to.emit(portfolio, "ManagerAuthorized")
        .withArgs(manager.address);
      
      expect(await portfolio.authorizedManagers(manager.address)).to.equal(true);
    });

    it("Should revoke manager authorization", async function () {
      await portfolio.connect(owner).authorizeManager(manager.address);
      
      await expect(portfolio.connect(owner).revokeManager(manager.address))
        .to.emit(portfolio, "ManagerRevoked")
        .withArgs(manager.address);
      
      expect(await portfolio.authorizedManagers(manager.address)).to.equal(false);
    });

    it("Should not allow non-owner to authorize managers", async function () {
      await expect(
        portfolio.connect(user1).authorizeManager(manager.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should not allow revoking owner", async function () {
      await expect(
        portfolio.connect(owner).revokeManager(owner.address)
      ).to.be.revertedWith("Cannot revoke owner");
    });

    it("Should not authorize zero address as manager", async function () {
      await expect(
        portfolio.connect(owner).authorizeManager(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid manager address");
    });
  });

  describe("Data Queries", function () {
    beforeEach(async function () {
      await portfolio.connect(user1).createPortfolio();
      await portfolio.connect(user1).addAsset("BTC", 100000000, 5000000);
    });

    it("Should get asset symbols", async function () {
      const symbols = await portfolio.getAssetSymbols(user1.address);
      expect(symbols).to.be.an("array");
      expect(symbols.length).to.equal(1);
      expect(symbols[0]).to.equal("BTC");
    });

    it("Should return encrypted asset data", async function () {
      // These should return encrypted values (not the actual values)
      const encryptedAmount = await portfolio.getEncryptedAssetAmount(user1.address, "BTC");
      const encryptedValue = await portfolio.getEncryptedAssetValue(user1.address, "BTC");
      const encryptedTotal = await portfolio.getEncryptedTotalValue(user1.address);
      
      // Values should exist (not be zero address equivalent)
      expect(encryptedAmount).to.not.equal(0);
      expect(encryptedValue).to.not.equal(0);
      expect(encryptedTotal).to.not.equal(0);
    });

    it("Should track last update times", async function () {
      const lastUpdate = await portfolio.getAssetLastUpdate(user1.address, "BTC");
      expect(lastUpdate).to.be.greaterThan(0);
      
      // Update asset and check time changed
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      await portfolio.connect(user1).updateAsset("BTC", 150000000, 7500000);
      
      const newLastUpdate = await portfolio.getAssetLastUpdate(user1.address, "BTC");
      expect(newLastUpdate).to.be.greaterThan(lastUpdate);
    });

    it("Should revert queries for non-existent data", async function () {
      await expect(
        portfolio.getEncryptedAssetAmount(user1.address, "ETH")
      ).to.be.revertedWith("Asset does not exist");

      await expect(
        portfolio.getEncryptedTotalValue(user2.address)
      ).to.be.revertedWith("Portfolio does not exist");

      await expect(
        portfolio.getAssetLastUpdate(user1.address, "NONEXISTENT")
      ).to.be.revertedWith("Asset does not exist");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle portfolio operations with zero values", async function () {
      await portfolio.connect(user1).createPortfolio();
      
      // Add asset with zero values
      await portfolio.connect(user1).addAsset("TEST", 0, 0);
      
      const symbols = await portfolio.getAssetSymbols(user1.address);
      expect(symbols).to.include("TEST");
    });

    it("Should maintain correct state after multiple operations", async function () {
      await portfolio.connect(user1).createPortfolio();
      
      // Add multiple assets
      await portfolio.connect(user1).addAsset("BTC", 100000000, 5000000);
      await portfolio.connect(user1).addAsset("ETH", 1000000, 400000);
      
      // Update one
      await portfolio.connect(user1).updateAsset("BTC", 200000000, 10000000);
      
      // Remove one
      await portfolio.connect(user1).removeAsset("ETH");
      
      // Add another
      await portfolio.connect(user1).addAsset("USDT", 10000000, 10000000);
      
      const symbols = await portfolio.getAssetSymbols(user1.address);
      expect(symbols.length).to.equal(2);
      expect(symbols).to.include("BTC");
      expect(symbols).to.include("USDT");
      expect(symbols).to.not.include("ETH");
    });
  });
});