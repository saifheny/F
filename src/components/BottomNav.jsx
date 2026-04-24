import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, User, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

const _SH_NAV = "SaifHany::BottomNav";

const BottomNav = () => {
  const { pathname } = useLocation();
  const { translate } = useLanguage();

  if (pathname === '/auth') return null;

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
        <Home size={22} />
        <span>{translate('home')}</span>
      </Link>
      
      <Link to="/admin" className={`bottom-nav-item ${pathname === '/admin' ? 'active' : ''}`}>
        <LayoutDashboard size={22} />
        <span>{translate('admin')}</span>
      </Link>

      <Link to="/profile" className={`bottom-nav-item ${pathname === '/profile' ? 'active' : ''}`}>
        <User size={22} />
        <span>{translate('profile')}</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
export const _fingerprint_nav = _SH_NAV;
