import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        
        <h1 className="text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Confidential Portfolio Manager
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
          manage your investment portfolio with complete privacy using Fully Homomorphic Encryption (FHE) technology.
          Your asset values and holdings remain encrypted throughout the entire process, only you can view the real data.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/assets" 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Assets</span>
          </Link>
          <Link 
            to="/dashboard" 
            className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>View Dashboard</span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Core Features</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Next-generation privacy asset management platform based on blockchain and fully homomorphic encryption technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Private Asset Management
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Privately manage your investment portfolio using advanced FHE technology. Your asset values are always under your complete control and never exposed to any third parties.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Complete Privacy Protection
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your investment information remains encrypted at all times. No one can see your actual asset values or holdings, including our system administrators.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Secure Portfolio
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Store encrypted records of your asset holdings on the blockchain, enjoying blockchain-level security and immutability guarantees.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Smart Risk Assessment
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Automatically assess risk levels based on asset value ranges, providing intelligent investment advice and analysis while maintaining complete privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Technical Advantages</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Built on cutting-edge cryptographic technology, providing military-grade protection for your investment privacy
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Fully Homomorphic Encryption (FHE)</h3>
            <p className="text-gray-600 text-sm">
              Using Zama's FHEVM technology, complex computations can be performed without decrypting data, ensuring your asset information remains confidential at all times
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Blockchain Storage</h3>
            <p className="text-gray-600 text-sm">
              All data is stored on the blockchain in encrypted form, with immutability and decentralized security guarantees
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Zero-Knowledge Proofs</h3>
            <p className="text-gray-600 text-sm">
              Verify the legitimacy of transactions through zero-knowledge proof technology without exposing any sensitive asset information
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-6">Start Protecting Your Investment Privacy</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Experience next-generation privacy portfolio management immediately, giving your financial information the highest level of protection
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/assets" 
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started Now
            </Link>
            <Link 
              to="/records" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold transition-all duration-200"
            >
              View Examples
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;