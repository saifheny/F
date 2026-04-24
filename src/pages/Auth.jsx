import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Globe } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { useLanguage } from '../lib/LanguageContext';

const _SH_AUTH = "SaifHany::AuthGate";

const Auth = () => {
  const { translate } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const saveUserToDB = async (uid, userData) => {
    const userRef = ref(db, 'users/' + uid);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
      await set(userRef, {
        ...userData,
        role: 'customer',
        createdAt: new Date().toISOString(),
        _sh: _SH_AUTH
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserToDB(cred.user.uid, { name, email });
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await saveUserToDB(result.user.uid, {
        name: result.user.displayName || 'User',
        email: result.user.email,
        image: result.user.photoURL || null
      });
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '15px 15px 15px 45px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s'
  };

  const iconStyle = {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-dim)'
  };

  return (
    <div className="auth-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '420px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <motion.h1
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: '2.5rem', marginBottom: '10px' }}
          >
            {isLogin ? translate('welcome_back') : translate('create_account')}
          </motion.h1>
          <p style={{ color: 'var(--text-dim)' }}>
            {isLogin ? translate('enter_details') : translate('join_community')}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User size={18} style={iconStyle} />
              <input
                type="text"
                placeholder={translate('full_name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={iconStyle} />
            <input
              type="email"
              placeholder={translate('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={iconStyle} />
            <input
              type="password"
              placeholder={translate('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {error && (
            <p style={{ color: '#ff4444', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '10px'
            }}
          >
            {loading ? translate('processing') : (isLogin ? translate('sign_in') : translate('sign_up'))}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ margin: '30px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{translate('or')}</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          <Globe size={18} />
          <span>{translate('google')}</span>
        </button>

        <p style={{ textAlign: 'center', marginTop: '30px', color: 'var(--text-dim)' }}>
          {isLogin ? translate('no_account') : translate('have_account')}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'none', color: 'var(--primary)', fontWeight: '600', marginLeft: '5px' }}
          >
            {isLogin ? translate('sign_up') : translate('sign_in')}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
export const _fingerprint_auth = _SH_AUTH;
