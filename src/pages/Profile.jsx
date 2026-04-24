import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Camera, Globe, LogOut, ChevronRight, Package, Settings, ArrowLeft, MapPin, Phone } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { useLanguage } from '../lib/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { countryRegions, countryGovernoratesAr } from '../lib/globalData';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const _SH_PROFILE = "SaifHany::ProfileView";

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return position ? <Marker position={position} /> : null;
};

const Profile = () => {
  const { lang, translate, setLang, country, setCountry, formatPrice } = useLanguage();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  
  const [nameInput, setNameInput] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [customGovernorate, setCustomGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [mapCenter, setMapCenter] = useState([30.0444, 31.2357]);
  
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = ref(db, 'users/' + user.uid);
    
    const unsubUser = onValue(userRef, (snap) => {
      const data = snap.val();
      if (data) {
        setUserData(data);
        setNameInput(data.name || user.displayName || '');
        setContactNumber(data.contactNumber || data.phone || '');
        setGovernorate(data.governorate || '');
        setCity(data.city || '');
        setAddressDetail(data.addressDetail || '');
        setMapCoordinates(data.mapCoordinates || null);
        if (data.mapCoordinates) setMapCenter([data.mapCoordinates.lat, data.mapCoordinates.lng]);
        setProfileImage(data.image || user.photoURL || null);
      } else {
        setNameInput(user.displayName || user.email.split('@')[0]);
        setProfileImage(user.photoURL || null);
        setUserData({ name: user.displayName || '', email: user.email });
      }
    });

    const ordersRef = ref(db, 'orders');
    const unsubOrders = onValue(ordersRef, (snap) => {
      const data = snap.val();
      if (data) {
        const myOrders = Object.keys(data)
          .map(k => ({ id: k, ...data[k] }))
          .filter(o => o.userId === user.uid)
          .reverse();
        setOrders(myOrders);
      } else {
        setOrders([]);
      }
    });

    return () => { unsubUser(); unsubOrders(); };
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      const finalGov = governorate === 'Other' ? customGovernorate : governorate;
      const finalCity = city === 'Other' || governorate === 'Other' ? customCity : city;
      
      await update(ref(db, 'users/' + user.uid), { 
        name: nameInput, 
        image: profileImage,
        contactNumber,
        governorate: finalGov,
        city: finalCity,
        addressDetail,
        mapCoordinates
      });
    }
    setLoading(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/auth');
  };

  const handleOpenMap = () => {
    if (!mapCoordinates && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setMapCoordinates(loc);
          setMapCenter([loc.lat, loc.lng]);
          setShowMap(true);
        },
        () => setShowMap(true)
      );
    } else {
      setShowMap(true);
    }
  };

  const countryCode = country?.code;
  const isSupportedRegion = countryCode && countryRegions[countryCode];
  const availableGovs = isSupportedRegion ? Object.keys(countryRegions[countryCode]) : [];
  
  let availableCities = [];
  if (isSupportedRegion && governorate && governorate !== 'Other' && countryRegions[countryCode][governorate]) {
    availableCities = lang === 'ar' ? countryRegions[countryCode][governorate].ar : countryRegions[countryCode][governorate].en;
  }

  return (
    <div className="profile-page app-container" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ padding: '20px', paddingBottom: '100px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <button className="desktop-nav-icons" onClick={() => navigate('/')} style={{ background: 'var(--surface)', padding: '12px', borderRadius: '50%', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{translate('account_settings') || 'Account Profile'}</h1>
      </div>

      <div className="premium-card" style={{ padding: '30px', textAlign: 'center', marginBottom: '25px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', opacity: 0.1 }}></div>
        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px', zIndex: 2 }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg)', overflow: 'hidden', border: '4px solid var(--surface)', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profileImage ? <img src={profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={50} style={{ opacity: 0.2 }} />}
          </div>
          <label style={{ position: 'absolute', bottom: 5, right: 5, background: 'var(--primary)', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer', boxShadow: 'var(--shadow)', display: 'flex', transition: 'var(--transition)' }}>
            <Camera size={18} />
            <input type="file" onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
          </label>
        </div>
        <h2 style={{ fontWeight: '800', fontSize: '1.5rem', marginBottom: '4px', position: 'relative', zIndex: 2 }}>{nameInput}</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', position: 'relative', zIndex: 2 }}>{auth.currentUser?.email}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Personal & Contact Info */}
        <section className="premium-card" style={{ padding: '25px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="var(--primary)" /> {translate('personal_info') || 'Personal Information'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>{translate('full_name') || 'Full Name'}</label>
              <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14}/> {translate('contact_number') || 'Contact Number (Phone/WhatsApp)'}</label>
              <input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} type="tel" placeholder="+201..." style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border)' }} />
            </div>
          </div>
        </section>

        {/* Address & Location */}
        <section className="premium-card" style={{ padding: '25px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="var(--primary)" /> {translate('delivery_address') || 'Delivery Address'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '15px' }}>
            {/* Governorate Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>{translate('governorate') || 'Governorate'}</label>
              {isSupportedRegion ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <select value={governorate} onChange={(e) => { setGovernorate(e.target.value); setCity(''); }} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                    <option value="">{lang === 'ar' ? 'اختر المحافظة...' : 'Select Governorate...'}</option>
                    {availableGovs.map(g => (
                      <option key={g} value={g}>{lang === 'ar' ? (countryGovernoratesAr[countryCode]?.[g] || g) : g}</option>
                    ))}
                    <option value="Other">{lang === 'ar' ? 'أخرى' : 'Other'}</option>
                  </select>
                  {governorate === 'Other' && (
                    <input value={customGovernorate} onChange={(e) => setCustomGovernorate(e.target.value)} placeholder={lang === 'ar' ? 'اكتب اسم المحافظة...' : 'Type your governorate...'} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border)' }} />
                  )}
                </div>
              ) : (
                <input value={customGovernorate} onChange={(e) => { setGovernorate('Other'); setCustomGovernorate(e.target.value); }} placeholder="State/Gov" style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border)' }} />
              )}
            </div>

            {/* City Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>{translate('city') || 'City/Village'}</label>
              {isSupportedRegion && governorate && governorate !== 'Other' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <select value={city} onChange={(e) => setCity(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                    <option value="">{lang === 'ar' ? 'اختر المدينة...' : 'Select City...'}</option>
                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Other">{lang === 'ar' ? 'أخرى' : 'Other'}</option>
                  </select>
                  {city === 'Other' && (
                    <input value={customCity} onChange={(e) => setCustomCity(e.target.value)} placeholder={lang === 'ar' ? 'اكتب اسم قريتك أو مدينتك...' : 'Type your city or village...'} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border)' }} />
                  )}
                </div>
              ) : (
                <input value={customCity} onChange={(e) => { setCity('Other'); setCustomCity(e.target.value); }} placeholder="City/Region" style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border)' }} />
              )}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>{translate('address_details') || 'Detailed Address'}</label>
            <textarea value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} rows={2} placeholder="Street name, building number, apartment..." style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border)', resize: 'vertical' }} />
          </div>

          <div style={{ background: 'var(--secondary)', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center' }}>
            <MapPin size={32} color="var(--primary)" style={{ marginBottom: '10px' }} />
            <h4 style={{ marginBottom: '5px', fontWeight: '700' }}>{translate('exact_location') || 'Pin Exact Location'}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '15px' }}>
              {mapCoordinates ? `Location pinned successfully ✅` : 'Help us find you faster by pinning your location on the map.'}
            </p>
            <button type="button" onClick={handleOpenMap} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
              {mapCoordinates ? 'Edit Location on Map' : 'Open Interactive Map'}
            </button>
          </div>
        </section>

        <button onClick={handleUpdate} disabled={loading} className="btn-primary" style={{ padding: '16px', width: '100%', fontSize: '1.1rem', boxShadow: '0 10px 25px rgba(255, 138, 0, 0.3)' }}>
          {loading ? 'Saving...' : (translate('save') || 'Save Changes')}
        </button>

        {/* Region Settings */}
        <section className="premium-card" style={{ padding: '25px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', fontWeight: '800' }}>{translate('region') || 'Region Settings'}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Globe size={20} color="var(--text-dim)" /><span style={{ fontWeight: '600' }}>{translate('language') || 'Language'}</span></div>
            <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ background: 'var(--bg)', border: 'none', fontWeight: '700', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          <div onClick={() => setCountry(null)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Settings size={20} color="var(--text-dim)" /><span style={{ fontWeight: '600' }}>{translate('country_change') || 'Change Country'}</span></div>
            <span style={{ fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>{country ? `${country.flag} ${country.code}` : '—'} <ChevronRight size={16} /></span>
          </div>
        </section>

        {/* Order History */}
        <section className="premium-card" style={{ padding: '25px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} color="var(--primary)" /> {translate('orders') || 'My Orders'}
          </h3>
          
          {orders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {orders.map(order => (
                <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '15px', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '10px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>Order ID</span>
                      <strong style={{ fontSize: '0.9rem' }}>#{order.id.slice(-6).toUpperCase()}</strong>
                    </div>
                    <div style={{ textAlign: lang === 'ar' ? 'left' : 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span style={{ padding: '4px 8px', background: 'var(--secondary)', color: 'var(--primary)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>{order.status || 'pending'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }} className="no-scrollbar">
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'var(--surface)', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} className={item.bgRemoved ? "bg-removed" : ""} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontWeight: '800' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--primary)' }}>{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 20px', background: 'none', border: 'none', boxShadow: 'none' }}>
              <Package size={48} style={{ opacity: 0.2, margin: '0 auto 15px' }} />
              <p style={{ fontWeight: '600' }}>{translate('no_orders') || 'No orders yet'}</p>
            </div>
          )}
        </section>

        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '16px', borderRadius: 'var(--radius-pill)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontWeight: '800', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
          <LogOut size={20} /> {translate('logout') || 'Logout'}
        </button>
      </div>

      {/* Free Interactive OpenStreetMap Modal */}
      <AnimatePresence>
        {showMap && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ width: '100%', maxWidth: '800px', background: 'var(--bg)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-float)', display: 'flex', flexDirection: 'column', height: '80vh' }}>
              <div style={{ padding: '20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={20} color="var(--primary)" /> Pin Your Location</h3>
                <button onClick={() => setShowMap(false)} style={{ background: 'none', border: 'none', fontWeight: '700', color: 'var(--text-dim)', cursor: 'pointer' }}>Close</button>
              </div>
              
              <div style={{ flex: 1, position: 'relative' }}>
                <MapContainer 
                  center={mapCenter} 
                  zoom={mapCoordinates ? 16 : 14} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker position={mapCoordinates} setPosition={setMapCoordinates} />
                </MapContainer>
                
                <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', padding: '10px 20px', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow)', zIndex: 1000, fontWeight: '700', color: 'var(--primary)', textAlign: 'center' }}>
                  Tap anywhere on the map to drop a pin
                </div>
              </div>

              <div style={{ padding: '20px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => setShowMap(false)} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
                  Confirm Coordinates
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
export const _fingerprint_profile = _SH_PROFILE;
