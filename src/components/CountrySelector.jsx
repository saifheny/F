import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';
import { Globe, ChevronRight } from 'lucide-react';

const _SH_CS = "SaifHany::RegionGate";

// Advanced Country Data Structure
export const globalCountries = [
  { code: 'EG', nameEn: 'Egypt', nameAr: 'مصر', lang: 'ar', dialect: 'Egyptian Arabic', currency: 'EGP', exchangeRate: 48, flag: '🇪🇬' },
  { code: 'SA', nameEn: 'Saudi Arabia', nameAr: 'السعودية', lang: 'ar', dialect: 'Hejazi/Najdi', currency: 'SAR', exchangeRate: 3.75, flag: '🇸🇦' },
  { code: 'AE', nameEn: 'UAE', nameAr: 'الإمارات', lang: 'ar', dialect: 'Gulf Arabic', currency: 'AED', exchangeRate: 3.67, flag: '🇦🇪' },
  { code: 'KW', nameEn: 'Kuwait', nameAr: 'الكويت', lang: 'ar', dialect: 'Gulf Arabic', currency: 'KWD', exchangeRate: 0.31, flag: '🇰🇼' },
  { code: 'QA', nameEn: 'Qatar', nameAr: 'قطر', lang: 'ar', dialect: 'Gulf Arabic', currency: 'QAR', exchangeRate: 3.64, flag: '🇶🇦' },
  { code: 'MA', nameEn: 'Morocco', nameAr: 'المغرب', lang: 'ar', dialect: 'Darija', currency: 'MAD', exchangeRate: 10, flag: '🇲🇦' },
  { code: 'US', nameEn: 'United States', nameAr: 'أمريكا', lang: 'en', dialect: 'US English', currency: 'USD', exchangeRate: 1, flag: '🇺🇸' },
  { code: 'GB', nameEn: 'United Kingdom', nameAr: 'بريطانيا', lang: 'en', dialect: 'UK English', currency: 'GBP', exchangeRate: 0.79, flag: '🇬🇧' },
  { code: 'FR', nameEn: 'France', nameAr: 'فرنسا', lang: 'en', dialect: 'French', currency: 'EUR', exchangeRate: 0.92, flag: '🇫🇷' },
  { code: 'DE', nameEn: 'Germany', nameAr: 'ألمانيا', lang: 'en', dialect: 'German', currency: 'EUR', exchangeRate: 0.92, flag: '🇩🇪' },
];

const CountrySelector = () => {
  const { setCountry, country } = useLanguage();
  if (country) return null;

  const handleSelect = (c) => {
    setCountry(c);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 9999, display: 'flex', overflow: 'hidden' }}>
      <div className="cs-brand" style={{
        flex: 1, background: 'linear-gradient(135deg, var(--secondary) 0%, #111827 100%)',
        position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', color: 'white', padding: '60px', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '120%', background: 'rgba(255,255,255,0.02)', transform: 'skewX(-20deg)' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(120px)', opacity: 0.15 }}></div>
        <svg style={{ position: 'absolute', right: '-1px', height: '100%', width: '80px', zIndex: 5 }} viewBox="0 0 80 1000" preserveAspectRatio="none">
          <path d="M0 0 Q 80 500 0 1000 L 80 1000 L 80 0 Z" fill="var(--bg)" />
        </svg>
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Globe size={120} strokeWidth={1} style={{ marginBottom: '24px', opacity: 0.9, color: 'var(--primary)' }} />
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '10px', letterSpacing: '-1px' }}>Aura</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, fontWeight: '300' }}>The Premium Global Marketplace</p>
        </div>
      </div>

      <div style={{ flex: 1.2, padding: '50px 40px', overflowY: 'auto', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: '800', color: 'var(--text)' }}>Select Region</h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: '40px', fontSize: '1rem' }}>Choose your country to see local pricing and dialects.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {globalCountries.map((c, i) => (
              <motion.button key={c.code}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.03 }}
                onClick={() => handleSelect(c)}
                style={{
                  padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--surface)',
                  border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                  gap: '16px', textAlign: 'left', cursor: 'pointer', transition: 'var(--transition)'
                }}
                whileHover={{ scale: 1.02, boxShadow: 'var(--shadow-lg)', borderColor: 'var(--primary-glow)' }}
              >
                <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{c.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text)' }}>{c.nameEn}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <span>{c.nameAr}</span>
                    <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'var(--bg)', borderRadius: '4px', fontWeight: '700' }}>{c.currency}</span>
                  </div>
                </div>
                <ChevronRight size={20} color="var(--primary)" style={{ opacity: 0.5 }} />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){.cs-brand{display:none!important}}`}</style>
    </div>
  );
};

export default CountrySelector;
export const _fingerprint_cs = _SH_CS;
