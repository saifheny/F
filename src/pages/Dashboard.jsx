import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Image as ImageIcon, Sparkles, Trash2, Edit3, Loader2, Layout, Box, BarChart3, Users, DollarSign, Package, TrendingUp, MapPin, Percent, MessageSquare } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, push, onValue, remove, set, update } from 'firebase/database';
import { useLanguage } from '../lib/LanguageContext';
import { globalCountries } from '../components/CountrySelector';

const _SH_DASH = "SaifHany::AdminPanel";

const Dashboard = () => {
  const { translate, lang, formatPrice } = useLanguage();
  const [activeTab, setActiveTab] = useState('analytics');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingAI, setProcessingAI] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductReviews, setSelectedProductReviews] = useState(null);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [category, setCategory] = useState('All Product');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState(['Global']);
  const [useAI_BG, setUseAI_BG] = useState(false);
  const [useAI_Enhance, setUseAI_Enhance] = useState(false);

  useEffect(() => {
    const prodRef = ref(db, 'products');
    const usrRef = ref(db, 'users');
    const ordRef = ref(db, 'orders');
    
    setLoading(true);
    const u1 = onValue(prodRef, (snap) => {
      const d = snap.val();
      setProducts(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })).reverse() : []);
      setLoading(false);
    });
    const u2 = onValue(usrRef, (snap) => {
      const d = snap.val();
      setUsers(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []);
    });
    const u3 = onValue(ordRef, (snap) => {
      const d = snap.val();
      setOrders(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })).reverse() : []);
    });
    return () => { u1(); u2(); u3(); };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const processAI = async (imgData) => {
    setProcessingAI(true);
    await new Promise(r => setTimeout(r, 2500));
    setProcessingAI(false);
    return imgData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    try {
      let finalImage = image;
      if (useAI_BG || useAI_Enhance) finalImage = await processAI(image);
      await set(push(ref(db, 'products')), {
        name, 
        price: Number(price), 
        discount: Number(discount) || 0,
        category, 
        description,
        image: finalImage, 
        bgRemoved: useAI_BG,
        countries: selectedCountries,
        createdAt: new Date().toISOString(), 
        _sh: _SH_DASH
      });
      setShowAddModal(false);
      resetForm();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setName(''); setPrice(''); setDiscount(''); setCategory('All Product');
    setDescription(''); setImage(null);
    setSelectedCountries(['Global']);
    setUseAI_BG(false); setUseAI_Enhance(false);
  };

  const handleDelete = async (id) => { await remove(ref(db, 'products/' + id)); };
  const handleDeleteUser = async (id) => { await remove(ref(db, 'users/' + id)); };
  
  const handleOrderStatusUpdate = async (id, status) => {
    await update(ref(db, 'orders/' + id), { status });
  };

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  const tabs = [
    { id: 'analytics', label: translate('analytics'), icon: BarChart3 },
    { id: 'orders', label: translate('orders'), icon: Package },
    { id: 'products', label: translate('products'), icon: Box },
    { id: 'users', label: translate('users'), icon: Users }
  ];

  return (
    <div className="dashboard-page app-container" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ padding: '30px 20px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px' }}>{translate('admin')}</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>{translate('dashboard')}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => window.location.href = '/'} style={{ background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}><Layout size={20} /></button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '12px 24px' }}>
            <Plus size={18} /> {translate('add_product')}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }} className="no-scrollbar">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '12px 24px', fontWeight: '700', border: 'none', cursor: 'pointer',
            borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', gap: '8px',
            background: activeTab === t.id ? 'var(--secondary)' : 'var(--surface)',
            color: activeTab === t.id ? 'var(--primary)' : 'var(--text-dim)',
            whiteSpace: 'nowrap', transition: 'var(--transition)',
            boxShadow: activeTab === t.id ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
            border: activeTab === t.id ? 'none' : '1px solid var(--border)'
          }}>
            <t.icon size={18} /> {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder={translate('search') || 'Search...'} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '1rem', fontWeight: '600' }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {activeTab === 'analytics' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {[
                  { label: translate('total_products'), value: products.length, icon: Box, color: '#008296' },
                  { label: translate('total_users'), value: users.length, icon: Users, color: '#FF9900' },
                  { label: translate('orders'), value: orders.length, icon: Package, color: '#B12704' },
                  { label: translate('total_revenue'), value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#067D62' }
                ].map((stat, i) => (
                  <div key={i} className="premium-card" style={{ padding: '24px', borderLeft: `4px solid ${stat.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <stat.icon size={24} color={stat.color} />
                      </div>
                      <TrendingUp size={20} color="#067D62" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text)' }}>{stat.value}</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '4px', fontWeight: '600' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="premium-card" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '20px', fontWeight: '800', fontSize: '1.2rem' }}>{translate('recent_activity')}</h3>
                {orders.slice(0, 5).map((o, i) => (
                  <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Package size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '1rem' }}>Order #{o.id.slice(-6).toUpperCase()}</div>
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{o.items?.length || 0} items • {o.shippingAddress?.city || 'Unknown'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', color: 'var(--primary)' }}>${o.total?.toFixed(2)}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>No activity yet</p>}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="premium-card" style={{ padding: '20px', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '16px', textAlign: lang === 'ar' ? 'right' : 'left', fontWeight: '700', color: 'var(--text-dim)' }}>ID</th>
                    <th style={{ padding: '16px', textAlign: lang === 'ar' ? 'right' : 'left', fontWeight: '700', color: 'var(--text-dim)' }}>Customer</th>
                    <th style={{ padding: '16px', textAlign: lang === 'ar' ? 'right' : 'left', fontWeight: '700', color: 'var(--text-dim)' }}>Location & Contacts</th>
                    <th style={{ padding: '16px', textAlign: lang === 'ar' ? 'right' : 'left', fontWeight: '700', color: 'var(--text-dim)' }}>Amount</th>
                    <th style={{ padding: '16px', textAlign: lang === 'ar' ? 'right' : 'left', fontWeight: '700', color: 'var(--text-dim)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontWeight: '800', fontSize: '0.9rem' }}>#{o.id.slice(-6).toUpperCase()}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '700' }}>{o.userEmail?.split('@')[0] || 'Guest'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{o.items?.length || 0} items</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{o.shippingAddress?.governorate}, {o.shippingAddress?.city}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{o.shippingAddress?.addressDetail}</div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          {o.shippingAddress?.phone && <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px' }}>📞 {o.shippingAddress.phone}</span>}
                          {o.shippingAddress?.mapCoordinates && <span style={{ fontSize: '0.75rem', background: '#fef08a', color: '#854d0e', padding: '2px 6px', borderRadius: '4px' }}>📍 Map Pinned</span>}
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontWeight: '800', color: 'var(--primary)' }}>${o.total?.toFixed(2)}</td>
                      <td style={{ padding: '16px' }}>
                        <select 
                          value={o.status || 'pending'} 
                          onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                          style={{ padding: '6px 12px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)', background: 'var(--bg)', fontWeight: '600', cursor: 'pointer' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <div className="empty-state"><Package size={48} color="var(--text-dim)" style={{opacity: 0.3}}/><h3>No Orders</h3></div>}
            </div>
          )}

          {activeTab === 'products' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => (
                <div key={product.id} className="premium-card" style={{ padding: '20px' }}>
                  <div style={{ position: 'relative', height: '180px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {product.image && <img src={product.image} alt="" style={{ height: '90%', objectFit: 'contain' }} />}
                    {product.discount > 0 && (
                      <span style={{ position: 'absolute', top: 10, right: 10, background: 'var(--danger)', color: 'white', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontWeight: '800', fontSize: '0.8rem' }}>
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  <h3 style={{ marginBottom: '5px', fontSize: '1.1rem', fontWeight: '800' }}>{product.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{product.category}</span>
                    <span style={{ fontWeight: '900', color: 'var(--text)' }}>${product.price}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { setSelectedProductReviews(product); setShowReviewsModal(true); }} style={{ flex: 1, padding: '10px', background: 'rgba(0, 130, 150, 0.1)', color: '#008296', border: '1px solid rgba(0, 130, 150, 0.2)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={18} /></button>
                    <button style={{ flex: 1, padding: '10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(product.id)} style={{ padding: '10px', background: 'rgba(177, 39, 4, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(177, 39, 4, 0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
              {products.length === 0 && <div style={{ gridColumn: '1 / -1' }}><div className="empty-state"><Box size={48} color="var(--primary)" /><h3>{translate('inventory_empty')}</h3></div></div>}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="premium-card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '16px 20px', textAlign: lang === 'ar' ? 'right' : 'left', fontWeight: '700' }}>{translate('name')}</th>
                    <th style={{ padding: '16px 20px', textAlign: lang === 'ar' ? 'right' : 'left', fontWeight: '700' }}>{translate('email')}</th>
                    <th style={{ padding: '16px 20px', textAlign: lang === 'ar' ? 'right' : 'left', fontWeight: '700' }}>{translate('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '700' }}>{u.name || 'N/A'}</td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-dim)' }}>{u.email || 'N/A'}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <button onClick={() => handleDeleteUser(u.id)} style={{ padding: '8px', background: 'rgba(177, 39, 4, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="empty-state"><Users size={48} style={{ opacity: 0.3 }} /><p>No users yet</p></div>}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ width: '100%', maxWidth: '650px', padding: '35px', borderRadius: 'var(--radius-xl)', maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface)', boxShadow: 'var(--shadow-float)' }}>
              <h2 style={{ marginBottom: '25px', fontWeight: '900', fontSize: '1.8rem' }}>{translate('add_product')}</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>{translate('product_name')}</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>{translate('price')} ($)</label>
                      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: 'var(--danger)' }}>{translate('discount')}</label>
                      <div style={{ position: 'relative' }}>
                        <Percent size={14} style={{ position: 'absolute', right: 10, top: 18, color: 'var(--danger)' }}/>
                        <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" style={{ width: '100%', padding: '14px', paddingRight: '30px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(177, 39, 4, 0.3)', background: 'rgba(177, 39, 4, 0.05)', color: 'var(--danger)', fontWeight: '800' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>{translate('description')}</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', resize: 'vertical' }}></textarea>
                </div>

                <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '30px', textAlign: 'center', background: 'var(--bg)' }}>
                  {image ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={image} alt="" style={{ height: '160px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }} />
                      <button type="button" onClick={() => setImage(null)} style={{ position: 'absolute', top: -10, right: -10, background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '32px', height: '32px', border: 'none', cursor: 'pointer', fontWeight: '800', boxShadow: 'var(--shadow-sm)' }}>×</button>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                        <ImageIcon size={28} color="var(--primary)" />
                      </div>
                      <span style={{ color: 'var(--text-dim)', fontWeight: '600' }}>{translate('upload_image')}</span>
                      <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
                    </label>
                  )}
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(0, 130, 150, 0.05) 0%, rgba(0, 130, 150, 0.1) 100%)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 130, 150, 0.2)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--accent)', fontWeight: '800' }}>
                    <Sparkles size={18} /> {translate('ai_engine')}
                  </h4>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="checkbox" checked={useAI_BG} onChange={(e) => setUseAI_BG(e.target.checked)} style={{ width: '18px', height: '18px' }}/>
                      {translate('auto_bg')}
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="checkbox" checked={useAI_Enhance} onChange={(e) => setUseAI_Enhance(e.target.checked)} style={{ width: '18px', height: '18px' }}/>
                      {translate('auto_quality')}
                    </label>
                  </div>
                </div>

                {processingAI && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', justifyContent: 'center', padding: '10px' }}>
                    <Loader2 className="animate-spin" size={20} />
                    <span style={{ fontWeight: '700' }}>{translate('ai_processing')}</span>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700' }}>{translate('countries_available')}</label>
                  <div className="no-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                    <button type="button" onClick={() => setSelectedCountries(['Global'])} style={{
                      padding: '10px 16px', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: '700', transition: 'var(--transition)',
                      background: selectedCountries.includes('Global') ? 'var(--secondary)' : 'var(--bg)',
                      color: selectedCountries.includes('Global') ? 'white' : 'var(--text-dim)'
                    }}>{translate('global_all')}</button>
                    {globalCountries.map(c => (
                      <button key={c.code} type="button" onClick={() => {
                        if (selectedCountries.includes('Global')) { setSelectedCountries([c.code]); }
                        else { setSelectedCountries(prev => prev.includes(c.code) ? prev.filter(x => x !== c.code) : [...prev, c.code]); }
                      }} style={{
                        padding: '10px 16px', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: '700', transition: 'var(--transition)', display: 'flex', alignItems: 'center', gap: '6px',
                        background: selectedCountries.includes(c.code) ? 'var(--secondary)' : 'var(--bg)',
                        color: selectedCountries.includes(c.code) ? 'white' : 'var(--text-dim)'
                      }}><span>{c.flag}</span> {c.code}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: 'var(--radius-md)' }}>{translate('cancel')}</button>
                  <button type="submit" className="btn-primary" disabled={loading || !image} style={{ flex: 2, padding: '14px', borderRadius: 'var(--radius-md)' }}>
                    {loading ? translate('saving') : translate('add_product')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showReviewsModal && selectedProductReviews && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ width: '100%', maxWidth: '600px', padding: '30px', borderRadius: 'var(--radius-xl)', maxHeight: '80vh', overflowY: 'auto', background: 'var(--surface)', boxShadow: 'var(--shadow-float)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Reviews for "{selectedProductReviews.name}"</h3>
                <button onClick={() => setShowReviewsModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-dim)' }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {selectedProductReviews.reviews ? Object.keys(selectedProductReviews.reviews).map(revId => {
                  const rev = selectedProductReviews.reviews[revId];
                  return (
                    <div key={revId} style={{ background: 'var(--bg)', padding: '15px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700' }}>{rev.userName}</span>
                        <span style={{ color: '#F59E0B', fontWeight: '800' }}>★ {rev.rating}</span>
                      </div>
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', margin: 0 }}>{rev.text}</p>
                      <button onClick={async () => {
                        await remove(ref(db, `products/${selectedProductReviews.id}/reviews/${revId}`));
                        setSelectedProductReviews(prev => {
                          const updated = { ...prev };
                          delete updated.reviews[revId];
                          return updated;
                        });
                      }} style={{ marginTop: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>Delete Review</button>
                    </div>
                  );
                }) : (
                  <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>No reviews yet for this product.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
export const _fingerprint_dash = _SH_DASH;
