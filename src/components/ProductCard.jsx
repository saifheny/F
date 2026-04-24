import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingBag, Percent, Share2, Check } from 'lucide-react';
import { useCart } from '../lib/CartContext';
import { useLanguage } from '../lib/LanguageContext';
import { useNavigate } from 'react-router-dom';

const _SH_CARD = "SaifHany::CardUnit";

const ProductCard = ({ product, variant = 'grid' }) => {
  const { addToCart } = useCart();
  const { translate, formatPrice } = useLanguage();
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);

  const finalPrice = product.discount > 0 
    ? product.price - (product.price * (product.discount / 100)) 
    : product.price;

  const handleShare = async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url }); } catch (err) {}
    } else {
      navigator.clipboard.writeText(url);
      alert(translate('link_copied') || 'Link copied!');
    }
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart({ ...product, price: finalPrice });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  if (variant === 'horizontal') {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '20px',
          padding: '15px', borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)', marginBottom: '15px',
          width: '100%', boxShadow: 'var(--shadow)', cursor: 'pointer'
        }}
        onClick={() => navigate('/product/' + product.id)}
      >
        <div
          className="premium-img"
          style={{
            width: '80px', height: '80px',
            background: product.bgRemoved ? 'white' : '#f8f8f8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0, position: 'relative'
          }}
        >
          {product.image && <img src={product.image} alt="" className={product.bgRemoved ? "bg-removed premium-img" : "premium-img"} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />}
          {product.discount > 0 && (
            <span style={{ position: 'absolute', top: 4, right: 4, background: 'var(--danger)', color: 'white', padding: '2px 4px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '800' }}>
              -{product.discount}%
            </span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '5px', fontWeight: '700' }}>{product.name}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <p style={{ color: 'var(--primary)', fontWeight: '800', margin: 0 }}>{formatPrice(finalPrice)}</p>
            {product.discount > 0 && (
              <p style={{ color: 'var(--text-dim)', textDecoration: 'line-through', fontSize: '0.8rem', margin: 0 }}>{formatPrice(product.price)}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleShare} style={{ background: 'var(--secondary)', color: 'var(--primary)', borderRadius: '12px', padding: '12px', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <Share2 size={18} />
          </button>
          <motion.button
            animate={{ backgroundColor: isAdded ? 'var(--success)' : 'var(--primary)' }}
            onClick={handleAdd}
            style={{ color: 'white', borderRadius: '12px', padding: '12px', border: 'none', cursor: 'pointer', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}
          >
            {isAdded ? <Check size={18} /> : <ShoppingBag size={18} />}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: 'var(--shadow-lg)' }}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        padding: '16px',
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        gap: '12px', boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden', height: '100%',
        transition: 'all 0.3s'
      }}
    >
      <div
        onClick={() => navigate('/product/' + product.id)}
        className="premium-img"
        style={{
          height: '140px', background: product.bgRemoved ? 'white' : '#f8f8f8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '15px', cursor: 'pointer', overflow: 'hidden', position: 'relative',
          flexShrink: 0
        }}
      >
        {product.image && (
          <motion.img
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={product.image}
            alt=""
            className={product.bgRemoved ? "bg-removed premium-img" : "premium-img"}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
        {product.discount > 0 && (
          <span style={{ position: 'absolute', top: 10, right: 10, background: 'var(--danger)', color: 'white', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px', boxShadow: 'var(--shadow-sm)' }}>
            <Percent size={10} /> -{product.discount}%
          </span>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3
          onClick={() => navigate('/product/' + product.id)}
          style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: '700', cursor: 'pointer', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {product.name}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px', gap: '2px', flex: 1 }}>
          {product.discount > 0 && (
            <span style={{ color: 'var(--text-dim)', textDecoration: 'line-through', fontSize: '0.75rem' }}>
              {formatPrice(product.price)}
            </span>
          )}
          <span style={{ fontWeight: '900', fontSize: '1.2rem', color: 'var(--text)' }}>
            {formatPrice(finalPrice)}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <motion.button
            animate={{ backgroundColor: isAdded ? 'var(--success)' : 'var(--primary)' }}
            onClick={handleAdd}
            style={{
              flex: 1, color: 'white', borderRadius: 'var(--radius-md)', padding: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              fontSize: '0.85rem', fontWeight: '700', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(255, 138, 0, 0.2)'
            }}
          >
            {isAdded ? <><Check size={16} /> Added</> : <><Plus size={16} /> {translate('add_to_cart')}</>}
          </motion.button>
          
          <button onClick={handleShare} style={{ background: 'var(--secondary)', color: 'var(--primary)', borderRadius: 'var(--radius-md)', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', width: '42px', flexShrink: 0 }}>
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
export const _fingerprint_card = _SH_CARD;
