import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Helper functions
const getRiskLevel = (assetType) => {
  const riskLevels = [10, 22, 35, 50];
  return riskLevels[assetType] || 0;
};

const getAssetTypeName = (assetType) => {
  const types = ['Low Risk', 'Medium Risk', 'High Risk', 'Very High Risk'];
  return types[assetType] || 'Unknown';
};

const PortfolioRecords = () => {
  const [wallet, setWallet] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [decryptingRecord, setDecryptingRecord] = useState(null);

  useEffect(() => {
    // Mock wallet connection for demo
    setWallet({ connected: true });
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const recordList = [
        {
          id: 0,
          timestamp: Date.now() - (0 * 24 * 60 * 60 * 1000),
          status: 'Encrypted',
          decrypted: false,
          assetValue: null,
          assetQuantity: null,
          assetType: null,
          riskLevel: null
        },
        {
          id: 1,
          timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000),
          status: 'Encrypted',
          decrypted: false,
          assetValue: null,
          assetQuantity: null,
          assetType: null,
          riskLevel: null
        },
        {
          id: 2,
          timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000),
          status: 'Encrypted',
          decrypted: false,
          assetValue: null,
          assetQuantity: null,
          assetType: null,
          riskLevel: null
        }
      ];

      setRecords(recordList.reverse());
    } catch (error) {
      console.error('Error loading records:', error);
      toast.error('Failed to load portfolio records');
    }
    setLoading(false);
  };

  const decryptRecord = async (recordIndex) => {
    setDecryptingRecord(recordIndex);
    
    try {
      // Simulate decryption with mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData = {
        assetValue: Math.floor(Math.random() * 100000) + 10000,
        assetQuantity: Math.floor(Math.random() * 1000) + 100,
        assetTypeIndex: Math.floor(Math.random() * 4)
      };
      
      const riskLevel = getRiskLevel(mockData.assetTypeIndex);
      const assetType = getAssetTypeName(mockData.assetTypeIndex);

      setRecords(prev => prev.map(record => 
        record.id === recordIndex 
          ? {
              ...record,
              decrypted: true,
              assetValue: mockData.assetValue,
              assetQuantity: mockData.assetQuantity,
              assetType,
              riskLevel,
              status: 'Decrypted'
            }
          : record
      ));

      toast.success('Record decrypted successfully');
      
    } catch (error) {
      console.error('Decryption error:', error);
      toast.error('Failed to decrypt record');
    }
    
    setDecryptingRecord(null);
  };

  const exportRecord = (record) => {
    if (!record.decrypted) {
      toast.error('Please decrypt the record first');
      return;
    }

    const exportData = {
      recordId: record.id + 1,
      date: format(new Date(record.timestamp), 'yyyy-MM-dd'),
      assetValue: record.assetValue,
      assetQuantity: record.assetQuantity,
      assetType: record.assetType,
      riskLevel: record.riskLevel,
      exportDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-record-${record.id + 1}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Record exported successfully');
  };

  if (!wallet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to view your portfolio records.
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
          Portfolio Records
        </h1>
        <p className="text-gray-600">
          View and manage your encrypted asset portfolio records
        </p>
      </div>

      {/* Records List */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Your Portfolio Records
          </h2>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading portfolio records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600">No portfolio records found</p>
            <p className="text-sm text-gray-500 mt-1">
              Add assets to create your first record
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {records.map((record) => (
              <div key={record.id} className="px-6 py-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-800">
                        Asset Record #{record.id + 1}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.decrypted 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4">
                      Created: {format(new Date(record.timestamp), 'MMM dd, yyyy \'at\' h:mm a')}
                    </p>

                    {record.decrypted ? (
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Asset Value
                          </p>
                          <p className="text-lg font-semibold text-gray-800">
                            ${record.assetValue?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Quantity
                          </p>
                          <p className="text-lg font-semibold text-gray-800">
                            {record.assetQuantity?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Asset Type
                          </p>
                          <p className="text-lg font-semibold text-gray-800">
                            {record.assetType}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Risk Level
                          </p>
                          <p className="text-lg font-semibold text-gray-800">
                            {record.riskLevel}%
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center text-gray-500">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm">
                            This record is encrypted. Click "Decrypt" to view the details.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    {!record.decrypted ? (
                      <button
                        onClick={() => decryptRecord(record.id)}
                        disabled={decryptingRecord === record.id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                      >
                        {decryptingRecord === record.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Decrypting...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            <span>Decrypt</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => exportRecord(record)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Export</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Privacy & Security
            </h3>
            <p className="text-blue-800 text-sm">
              Your portfolio records are stored encrypted on the blockchain using FHE technology. 
              Only you can decrypt them using your wallet's private key. When you export a record, 
              the data is decrypted locally in your browser and saved to your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioRecords;