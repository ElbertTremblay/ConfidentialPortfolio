import React from 'react';
import { CONTRACT_CONFIG } from '../config/contract';

const ContractInfo = () => {
  const network = CONTRACT_CONFIG.NETWORKS[CONTRACT_CONFIG.NETWORK];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Contract Information
      </h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center py-1">
          <span className="text-sm font-medium text-gray-600">Contract Address:</span>
          <div className="flex items-center">
            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
              {CONTRACT_CONFIG.CONFIDENTIAL_PORTFOLIO_ADDRESS}
            </code>
            {network?.blockExplorer && (
              <a
                href={`${network.blockExplorer}/address/${CONTRACT_CONFIG.CONFIDENTIAL_PORTFOLIO_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:text-blue-800"
                title="View on Explorer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center py-1">
          <span className="text-sm font-medium text-gray-600">Network:</span>
          <span className="text-sm text-gray-800">{network?.name}</span>
        </div>
        
        <div className="flex justify-between items-center py-1">
          <span className="text-sm font-medium text-gray-600">Chain ID:</span>
          <span className="text-sm text-gray-800">{CONTRACT_CONFIG.CHAIN_ID}</span>
        </div>
        
        <div className="flex justify-between items-center py-1">
          <span className="text-sm font-medium text-gray-600">Management Fee:</span>
          <span className="text-sm text-gray-800">{CONTRACT_CONFIG.MANAGEMENT_FEE} wei</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 flex items-center">
          <svg className="w-3 h-3 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Contract configuration loaded successfully
        </p>
      </div>
    </div>
  );
};

export default ContractInfo;