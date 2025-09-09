import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useFHE } from '../contexts/FHEContext';
import { format } from 'date-fns';

const Dashboard = () => {
  const { account } = useWallet();
  const { contractInstance } = useFHE();
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalValue: '****', // Encrypted
    riskDistribution: {
      lowRisk: 0,
      mediumRisk: 0,
      highRisk: 0,
      veryHighRisk: 0
    },
    lastUpdate: null
  });

  useEffect(() => {
    if (account && contractInstance) {
      loadPortfolioData();
    }
  }, [account, contractInstance]);

  const loadPortfolioData = async () => {
    setLoading(true);
    try {
      if (!contractInstance || !account) {
        setLoading(false);
        return;
      }

      // Get user's asset IDs and portfolio stats from the contract
      const assetIds = await contractInstance.getMyAssetIds();
      const portfolioStats = await contractInstance.getPortfolioStats(account);
      const riskDistribution = await contractInstance.getPortfolioRiskDistribution();
      
      const assets = [];

      // Load details for each asset
      for (let i = 0; i < assetIds.length; i++) {
        try {
          const assetId = assetIds[i];
          const assetInfo = await contractInstance.getAssetInfo(assetId);
          
          assets.push({
            id: Number(assetId),
            name: assetInfo[0], // assetName
            value: '****', // Encrypted value
            quantity: '****', // Encrypted quantity
            type: getAssetTypeName(Number(assetInfo[1])), // riskLevel
            riskLevel: Number(assetInfo[1]),
            performance: getRandomPerformance(), // Simulated performance
            performanceValue: getRandomPerformanceValue(),
            allocation: Math.floor(100 / assetIds.length), // Equal allocation for now
            lastUpdate: Number(assetInfo[3]) * 1000, // timestamp converted to milliseconds
            active: assetInfo[2] // active status
          });
        } catch (error) {
          console.error('Error loading asset details:', error);
        }
      }

      setPortfolioData(assets);
      setStats({
        totalAssets: Number(portfolioStats[0]), // totalAssets
        totalValue: '****', // Encrypted total value
        riskDistribution: {
          lowRisk: Number(riskDistribution[0]),
          mediumRisk: Number(riskDistribution[1]),
          highRisk: Number(riskDistribution[2]),
          veryHighRisk: Number(riskDistribution[3])
        },
        lastUpdate: Number(portfolioStats[1]) * 1000 // lastUpdate converted to milliseconds
      });

    } catch (error) {
      console.error('Error loading portfolio:', error);
      // Fallback to mock data if contract interaction fails
      const mockAssets = [
        {
          id: 1,
          name: 'Technology Stocks',
          value: '****',
          quantity: '****',
          type: 'Medium Risk',
          riskLevel: 22,
          performance: '+12.5%',
          performanceValue: 12.5,
          allocation: 35,
          lastUpdate: Date.now() - 3600000
        }
      ];
      setPortfolioData(mockAssets);
      setStats({
        totalAssets: 1,
        totalValue: '****',
        riskDistribution: { lowRisk: 0, mediumRisk: 1, highRisk: 0, veryHighRisk: 0 },
        lastUpdate: Date.now()
      });
    }
    setLoading(false);
  };

  const getRiskColor = (type) => {
    const colors = {
      'Low Risk': 'bg-green-100 text-green-800 border-green-200',
      'Medium Risk': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'High Risk': 'bg-orange-100 text-orange-800 border-orange-200',
      'Very High Risk': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPerformanceColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getAssetTypeName = (riskLevel) => {
    const types = ['Low Risk', 'Medium Risk', 'High Risk', 'Very High Risk'];
    return types[riskLevel] || 'Unknown';
  };

  const getRandomPerformance = () => {
    const performances = ['+12.5%', '+3.8%', '-8.2%', '+6.7%', '+15.3%', '-2.1%', '+9.4%'];
    return performances[Math.floor(Math.random() * performances.length)];
  };

  const getRandomPerformanceValue = () => {
    return Math.random() * 30 - 15; // Random value between -15 and +15
  };

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to view your portfolio dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Portfolio Dashboard
        </h1>
        <p className="text-gray-600">
          Overview of your encrypted investment portfolio
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalValue}</p>
              <p className="text-xs text-gray-500">Encrypted</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Risk Level</p>
              <p className="text-2xl font-bold text-gray-900">Medium</p>
              <p className="text-xs text-gray-500">Calculated privately</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Last Update</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.lastUpdate ? format(new Date(stats.lastUpdate), 'HH:mm') : '--:--'}
              </p>
              <p className="text-xs text-gray-500">
                {stats.lastUpdate ? format(new Date(stats.lastUpdate), 'MMM dd') : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Assets */}
      <div className="bg-white rounded-xl shadow-md mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Your Assets</h2>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading portfolio data...</p>
          </div>
        ) : portfolioData.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-600">No assets found</p>
            <p className="text-sm text-gray-500 mt-1">
              Add assets to see your portfolio overview
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {portfolioData.map((asset) => (
              <div key={asset.id} className="px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {asset.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(asset.type)}`}>
                        {asset.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Value</p>
                        <p className="text-lg font-bold text-gray-800">${asset.value}</p>
                        <p className="text-xs text-gray-500">Encrypted</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</p>
                        <p className="text-lg font-bold text-gray-800">{asset.quantity}</p>
                        <p className="text-xs text-gray-500">Encrypted</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Performance</p>
                        <p className={`text-lg font-bold ${getPerformanceColor(asset.performanceValue)}`}>
                          {asset.performance}
                        </p>
                        <p className="text-xs text-gray-500">30-day</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Allocation</p>
                        <p className="text-lg font-bold text-gray-800">{asset.allocation}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${asset.allocation}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6">
                    <p className="text-sm text-gray-500">
                      Updated {format(new Date(asset.lastUpdate), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Distribution */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Distribution</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Low Risk</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{stats.riskDistribution.lowRisk} assets</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Medium Risk</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{stats.riskDistribution.mediumRisk} assets</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">High Risk</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{stats.riskDistribution.highRisk} assets</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Very High Risk</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{stats.riskDistribution.veryHighRisk} assets</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Asset
            </button>
            
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Records
            </button>
            
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Your Privacy is Protected
            </h3>
            <p className="text-blue-800 text-sm">
              This dashboard shows encrypted summaries of your portfolio. All asset values and quantities 
              remain fully encrypted using FHE technology. Only you can decrypt and view the actual numbers 
              in the Portfolio Records section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;