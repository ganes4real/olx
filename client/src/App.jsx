import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { SellModal } from './components/SellModal';

import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { SellerProfilePage } from './pages/SellerProfilePage';
import { ConversationPage } from './pages/ConversationPage';
import { InboxPage } from './pages/InboxPage';

export function App() {
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalLocation, setGlobalLocation] = useState('');

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          {/* Top Navbar */}
          <Navbar
            onSearchChange={(q) => setGlobalSearch(q)}
            onLocationChange={(loc) => setGlobalLocation(loc)}
            selectedLocation={globalLocation}
          />

          {/* Page Routing */}
          <Routes>
            {/* 1. Home Page */}
            <Route
              path="/"
              element={
                <HomePage
                  searchParam={globalSearch}
                  locationParam={globalLocation}
                />
              }
            />

            {/* 2. Product Page */}
            <Route path="/products/:productId" element={<ProductPage />} />

            {/* 3. Seller Information Page */}
            <Route path="/seller/:sellerId" element={<SellerProfilePage />} />

            {/* 4. Seller Conversation Page */}
            <Route path="/products/:productId/chat" element={<ConversationPage />} />
            <Route path="/chat/:productId" element={<ConversationPage />} />

            {/* User Inbox / Chats Page */}
            <Route path="/chats" element={<InboxPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Modals */}
          <AuthModal />
          <SellModal />

          {/* Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
