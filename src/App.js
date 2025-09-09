import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { FHEProvider } from './contexts/FHEContext';
import Navbar from './pages/Navbar';
import Footer from './pages/Footer';
import Home from './pages/Home';
import AssetManager from './pages/AssetManager';
import Dashboard from './pages/Dashboard';
import PortfolioRecords from './pages/PortfolioRecords';

function App() {
  return (
    <WalletProvider>
      <FHEProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/assets" element={<AssetManager />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/records" element={<PortfolioRecords />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </FHEProvider>
    </WalletProvider>
  );
}

export default App;
