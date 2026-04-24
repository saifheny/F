import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid, User, Filter, ChevronRight, Package, Box, ShoppingBag, X, Minus, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { useLanguage } from '../lib/LanguageContext';
import { useCart } from '../lib/CartContext';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';

const _SH_STORE = "SaifHany::StoreFront";

const categories = ['All Product', 'Recommended', 'New Product', 'Popular'];

const Store = () => {
  const { translate, lang, country, formatPrice } = useLanguage();
  const { cart, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All Product');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Checkout State
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const productsRef = ref(db, 'products');
    setLoading(true);
    const unsub = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        const filtered = list.filter(p =>
          (!p.countries || p.countries.includes('Global') || (country && p.countries.includes(country.code))) &&
          (activeCategory === 'All Product' || p.category === activeCategory)
        );
        setProducts(filtered.reverse());
      } else {
        setProducts([]);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [country, activeCategory]);

  useEffect(() => {
    // Fetch user profile for shipping address
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(db, 'users/' + user.uid);
      onValue(userRef, (snap) => {
        if (snap.val()) setUserProfile(snap.val());
      });
    }
  }, []);

  const searchResults = searchQuery.length > 0
    ? products.filter(p => p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  const handleCheckout = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!userProfile?.governorate || !userProfile?.city || !userProfile?.addressDetail) {
      alert(translate('please_complete_profile'));
      navigate('/profile');
      return;
    }

    setIsCheckingOut(true);

    try {
      const newOrderRef = push(ref(db, 'orders'));
      await set(newOrderRef, {
        userId: user.uid,
        userEmail: user.email,
        items: cart,
        total: totalPrice,
        status: 'pending',
        shippingAddress: {
          governorate: userProfile.governorate,
          city: userProfile.city,
          addressDetail: userProfile.addressDetail,
          phone: userProfile.phone || '',
          whatsapp: userProfile.whatsapp || '',
          mapCoordinates: userProfile.mapCoordinates || null
        },
        createdAt: new Date().toISOString()
      });

      clearCart();
      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutSuccess(false);
        setShowCart(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="store-page app-container" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ paddingBottom: '100px' }}>
      <header style={{
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={{ background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
            <Grid size={20} />
          </button>
          <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '900', letterSpacing: '-0.5px' }}>Aura</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowCart(true)} style={{ position: 'relative', background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: 'var(--primary)', color: 'white', borderRadius: '50%',
                width: '22px', height: '22px', fontSize: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '800', border: '2px solid var(--bg)'
              }}>{totalItems}</span>
            )}
          </button>
          <button onClick={() => setShowSearch(true)} style={{ background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
            <Search size={20} />
          </button>
          <button onClick={() => navigate('/profile')} style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}>
            <User size={20} />
          </button>
        </div>
      </header>

      <section style={{ padding: '20px 20px 0' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'linear-gradient(135deg, var(--secondary) 0%, #111827 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '35px 30px',
            position: 'relative',
            height: '220px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            color: 'white',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
            <span style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Aura Premium</span>
            <h2 style={{ fontSize: '2.2rem', margin: '8px 0', fontWeight: '900', letterSpacing: '-1px' }}>{translate('welcome')}</h2>
            <button className="btn-primary" style={{ padding: '10px 24px', fontSize: '1rem', marginTop: '10px', boxShadow: '0 10px 20px rgba(0, 130, 150, 0.4)' }}>{translate('buy')}</button>
          </div>
          <div style={{
            width: '200px', height: '200px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            position: 'absolute', right: '-30px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Box size={100} style={{ opacity: 0.1, color: 'white' }} />
          </div>
        </motion.div>
      </section>

      <section style={{ padding: '35px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{translate('products')}</h2>
          <button style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700' }}>
            <Filter size={18} /> {translate('filter')}
          </button>
        </div>
        <div className="no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '12px 24px',
                borderRadius: 'var(--radius-pill)',
                whiteSpace: 'nowrap',
                border: activeCategory === cat ? 'none' : '1px solid var(--border)',
                cursor: 'pointer',
                background: activeCategory === cat ? 'var(--secondary)' : 'var(--surface)',
                color: activeCategory === cat ? 'white' : 'var(--text-dim)',
                fontWeight: '700',
                transition: 'var(--transition)',
                boxShadow: activeCategory === cat ? 'var(--shadow-md)' : 'none'
              }}
            >
              {translate(cat.toLowerCase().replace(' ', '_')) || cat}
            </button>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 20px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
            {[0,1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><Package size={48} color="var(--primary)" /></div>
            <h3>{translate('no_products')}</h3>
            <p style={{ color: 'var(--text-dim)' }}>{translate('start_adding')}</p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1500,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              padding: '40px 20px',
              overflowY: 'auto'
            }}
          >
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <Search size={28} color="var(--primary)" />
                <input
                  autoFocus
                  placeholder={translate('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, fontSize: '1.8rem', border: 'none', background: 'none', outline: 'none', fontWeight: '800' }}
                />
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} style={{ background: 'var(--surface)', padding: '12px', borderRadius: '50%', border: '1px solid var(--border)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                {searchResults.slice(0, 12).map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {searchQuery.length > 0 && searchResults.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
                  <Search size={48} style={{ opacity: 0.3, marginBottom: '15px' }} />
                  <p>No results found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 2000,
              display: 'flex', justifyContent: 'flex-end',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div onClick={() => setShowCart(false)} style={{ flex: 1 }}></div>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                width: '100%', maxWidth: '450px',
                background: 'var(--bg)', height: '100%',
                padding: '30px 20px',
                display: 'flex', flexDirection: 'column',
                boxShadow: '-20px 0 60px rgba(0,0,0,0.15)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShoppingBag size={24} color="var(--primary)" /> {translate('cart')}
                </h2>
                <button onClick={() => setShowCart(false)} style={{ background: 'var(--surface)', padding: '10px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: '700' }}>
                  {translate('close')}
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
                {cart.length > 0 ? cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '20px', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.image && <img src={item.image} alt="" style={{ width: '90%', height: '90%', objectFit: 'contain' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: '700' }}>{item.name}</h4>
                      <p style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.1rem', margin: 0 }}>{formatPrice(item.price)}</p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', borderRadius: 'var(--radius-pill)', padding: '4px' }}>
                          <button onClick={() => updateQuantity(item.id, -1)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Minus size={14} />
                          </button>
                          <span style={{ fontWeight: '800', fontSize: '1rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={14} />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} style={{ padding: '10px', background: 'rgba(177, 39, 4, 0.1)', color: 'var(--danger)', borderRadius: '50%', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', marginTop: '100px' }}>
                    <div style={{ width: '100px', height: '100px', background: 'var(--surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <ShoppingBag size={40} color="var(--primary)" style={{ opacity: 0.5 }} />
                    </div>
                    <h3 style={{ fontWeight: '800', marginBottom: '8px' }}>{translate('empty_cart')}</h3>
                    <p style={{ color: 'var(--text-dim)' }}>Looks like you haven't added anything yet.</p>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '25px', marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-dim)' }}>
                    <span style={{ fontWeight: '600' }}>Subtotal</span>
                    <span style={{ fontWeight: '700' }}>{formatPrice(totalPrice)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: 'var(--text-dim)' }}>
                    <span style={{ fontWeight: '600' }}>Shipping</span>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Free</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                    <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>{translate('total')}</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)' }}>{formatPrice(totalPrice)}</span>
                  </div>
                  
                  {checkoutSuccess ? (
                    <div style={{ background: '#ecfdf5', color: '#059669', padding: '18px', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <CheckCircle size={20} /> Order Placed Successfully!
                    </div>
                  ) : (
                    <button 
                      onClick={handleCheckout} 
                      disabled={isCheckingOut}
                      className="btn-primary" 
                      style={{ width: '100%', padding: '18px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                    >
                      {isCheckingOut ? <Loader2 className="animate-spin" size={20} /> : <>{translate('checkout')} <ChevronRight size={20} /></>}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Store;
export const _fingerprint_store = _SH_STORE;
