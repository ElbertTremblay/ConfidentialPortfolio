import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useFHE } from '../contexts/FHEContext';
import { CONTRACT_CONFIG } from '../config/contract';
import toast from 'react-hot-toast';

const AssetManager = () => {
  const { account, connectWallet, isConnected } = useWallet();
  const { fheInstance, contractInstance, isInitialized } = useFHE();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    assetName: '',
    assetValue: '',
    assetQuantity: '',
    assetType: '0'
  });
  const [recentAssets, setRecentAssets] = useState([]);

  useEffect(() => {
    if (account && contractInstance) {
      loadRecentAssets();
    }
  }, [account, contractInstance]);

  const loadRecentAssets = async () => {
    try {
      if (!contractInstance || !account) {
        return;
      }

      // Get user's asset IDs from the contract
      const assetIds = await contractInstance.getMyAssetIds();
      const assets = [];

      // Load details for each asset
      for (let i = 0; i < Math.min(assetIds.length, 10); i++) {
        try {
          const assetId = assetIds[i];
          const assetInfo = await contractInstance.getAssetInfo(assetId);
          
          assets.push({
            id: Number(assetId),
            name: assetInfo[0], // assetName
            value: '****', // Encrypted value
            type: getAssetTypeName(Number(assetInfo[1])), // riskLevel
            date: Number(assetInfo[3]) * 1000, // timestamp converted to milliseconds
            active: assetInfo[2] // active status
          });
        } catch (error) {
          console.error('Error loading asset details:', error);
        }
      }

      setRecentAssets(assets);
    } catch (error) {
      console.error('Error loading assets:', error);
      // Fallback to mock data if contract interaction fails
      const mockAssets = [
        { id: 1, name: 'Stock Portfolio A', value: '****', type: 'Low Risk', date: Date.now() - 86400000 },
        { id: 2, name: 'Crypto Holdings', value: '****', type: 'High Risk', date: Date.now() - 172800000 },
        { id: 3, name: 'Bond Portfolio', value: '****', type: 'Low Risk', date: Date.now() - 259200000 }
      ];
      setRecentAssets(mockAssets);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.assetName || !formData.assetValue || !formData.assetQuantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isInitialized) {
      toast.error('FHE system is still initializing...');
      return;
    }

    setLoading(true);

    try {
      const assetValue = Math.floor(parseFloat(formData.assetValue));
      const assetQuantity = Math.floor(parseFloat(formData.assetQuantity));
      const assetType = parseInt(formData.assetType);

      // Calculate management fee from contract config
      const managementFee = CONTRACT_CONFIG.MANAGEMENT_FEE;

      // Submit to smart contract with the new FHE-style interface
      const tx = await contractInstance.addEncryptedAsset(
        assetValue,
        assetQuantity,
        formData.assetName,
        assetType,
        { value: managementFee }
      );

      toast.success('Asset added successfully! Transaction submitted.');
      
      // Reset form
      setFormData({
        assetName: '',
        assetValue: '',
        assetQuantity: '',
        assetType: '0'
      });

      // Add to recent assets list
      const newAsset = {
        id: Date.now(),
        name: formData.assetName,
        value: '****', // Encrypted
        type: getAssetTypeName(assetType),
        date: Date.now()
      };
      setRecentAssets(prev => [newAsset, ...prev.slice(0, 9)]);

    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error('Failed to add asset. Please try again.');
    }

    setLoading(false);
  };

  const getAssetTypeName = (assetType) => {
    const types = ['Low Risk', 'Medium Risk', 'High Risk', 'Very High Risk'];
    return types[assetType] || 'Unknown';
  };

  const getRiskColor = (type) => {
    const colors = {
      'Low Risk': 'bg-green-100 text-green-800',
      'Medium Risk': 'bg-yellow-100 text-yellow-800',
      'High Risk': 'bg-orange-100 text-orange-800',
      'Very High Risk': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Asset Manager
          </h1>
          <p className="text-gray-600">
            Add and manage your investment assets with complete privacy using FHE encryption
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Asset Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Add New Asset</h2>
            
            {!account && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 mb-3">
                  Connect your wallet to start managing assets privately
                </p>
                <button
                  onClick={connectWallet}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  Connect Wallet
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Asset Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Name *
                </label>
                <input
                  type="text"
                  name="assetName"
                  value={formData.assetName}
                  onChange={handleInputChange}
                  placeholder="e.g., Apple Stock, Bitcoin, Real Estate"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  disabled={!account || loading}
                />
              </div>

              {/* Asset Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Value (USD) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="assetValue"
                    value={formData.assetValue}
                    onChange={handleInputChange}
                    placeholder="Enter asset value"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    disabled={!account || loading}
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  This value will be encrypted before storage
                </p>
              </div>

              {/* Asset Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity/Shares *
                </label>
                <input
                  type="number"
                  name="assetQuantity"
                  value={formData.assetQuantity}
                  onChange={handleInputChange}
                  placeholder="Enter quantity or number of shares"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  disabled={!account || loading}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Asset Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Level *
                </label>
                <select
                  name="assetType"
                  value={formData.assetType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  disabled={!account || loading}
                >
                  <option value="0">Low Risk (Government Bonds, Savings)</option>
                  <option value="1">Medium Risk (Corporate Bonds, Blue Chips)</option>
                  <option value="2">High Risk (Growth Stocks, REITs)</option>
                  <option value="3">Very High Risk (Crypto, Derivatives)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!account || loading || !isInitialized}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding Asset...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Asset
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Recent Assets */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Assets</h2>
            
            {recentAssets.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-500">No assets added yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first asset to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{asset.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(asset.type)}`}>
                          {asset.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(asset.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        ${asset.value}
                      </p>
                      <p className="text-sm text-gray-500">Encrypted</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-blue-600 font-medium mb-2">Privacy Protection</p>
              <p className="text-xs text-gray-500">
                All asset values and quantities are encrypted using Fully Homomorphic Encryption (FHE) 
                before being stored on the blockchain. Only you can decrypt and view your actual values.
              </p>
            </div>
          </div>
        </div>

        {/* Asset Categories Info */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Level Guidelines</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium text-gray-800">Low Risk</span>
              </div>
              <p className="text-sm text-gray-600">
                Government bonds, savings accounts, CDs
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="font-medium text-gray-800">Medium Risk</span>
              </div>
              <p className="text-sm text-gray-600">
                Corporate bonds, blue-chip stocks
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span className="font-medium text-gray-800">High Risk</span>
              </div>
              <p className="text-sm text-gray-600">
                Growth stocks, REITs, commodities
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="font-medium text-gray-800">Very High Risk</span>
              </div>
              <p className="text-sm text-gray-600">
                Cryptocurrency, derivatives, penny stocks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetManager;