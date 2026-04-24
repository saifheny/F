import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import Auth from './pages/Auth';
import Store from './pages/Store';
import ProductDetail from './pages/ProductDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { LanguageProvider } from './lib/LanguageContext';
import { CartProvider } from './lib/CartContext';
import CountrySelector from './components/CountrySelector';
import BottomNav from './components/BottomNav';

const _SH_APP = "SaifHany::AuraCore";

function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </LanguageProvider>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 8000);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      clearTimeout(timeout);
    });
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        gap: '20px'
      }}>
        <div className="loader"></div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Aura Premium</p>
      </div>
    );
  }

  return (
    <Router>
      <CountrySelector />
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
        <Route path="/" element={user ? <Store /> : <Navigate to="/auth" />} />
        <Route path="/product/:id" element={user ? <ProductDetail /> : <Navigate to="/auth" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
        <Route path="/admin" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
      </Routes>
      {user && <BottomNav />}
    </Router>
  );
}

export default App;
export const _fingerprint_app = _SH_APP;
