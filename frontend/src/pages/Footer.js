import React from 'react';


const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                
              </div>
              <span className="text-xl font-bold text-gray-800">
                Privacy Tax Calculator
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              A privacy-preserving tax calculation platform using Fully Homomorphic Encryption (FHE) 
              to ensure your financial data remains completely confidential throughout the calculation process.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
              Features
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  FHE Encryption
                </span>
              </li>
              <li>
                <span className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  Progressive Tax Rates
                </span>
              </li>
              <li>
                <span className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  Secure Records
                </span>
              </li>
              <li>
                <span className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  Blockchain Storage
                </span>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
              Technology
            </h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://docs.zama.ai/fhevm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200 flex items-center"
                >
                  FHEVM
                  
                </a>
              </li>
              <li>
                <a 
                  href="https://ethereum.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200 flex items-center"
                >
                  Ethereum
                  
                </a>
              </li>
              <li>
                <a 
                  href="https://reactjs.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200 flex items-center"
                >
                  React
                  
                </a>
              </li>
              <li>
                <a 
                  href="https://soliditylang.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200 flex items-center"
                >
                  Solidity
                  
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">
                © 2024 Privacy Tax Calculator. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Privacy Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Banner */}
      <div className="bg-blue-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 text-sm">
            
            <span>
              Your financial data is encrypted end-to-end using Fully Homomorphic Encryption
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;