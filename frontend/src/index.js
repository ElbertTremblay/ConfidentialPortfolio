import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: '',
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#333',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);