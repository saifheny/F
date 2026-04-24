import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Heart, Star, Minus, Plus, Share2, Send, Check } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { ref, get, onValue, push, set } from 'firebase/database';
import { useCart } from '../lib/CartContext';
import { useLanguage } from '../lib/LanguageContext';

const _SH_DETAIL = "SaifHany::ProductView";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { translate, lang, formatPrice } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const productRef = ref(db, 'products/' + id);
    const unsub = onValue(productRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setProduct({ id, ...data });
        if (data.reviews) {
          setReviews(Object.values(data.reviews).reverse());
        } else {
          setReviews([]);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const finalPrice = product.discount > 0 ? product.price - (product.price * (product.discount / 100)) : product.price;
    for (let i = 0; i < qty; i++) {
      addToCart({ ...product, price: finalPrice });
    }
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      navigate('/');
    }, 1500);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch (err) { }
    } else {
      navigator.clipboard.writeText(url);
      alert(translate('link_copied') || 'Link copied!');
    }
  };

  const submitReview = async () => {
    if (!reviewText.trim()) return;
    const user = auth.currentUser;
    if (!user) {
      alert('Please log in to leave a review.');
      navigate('/auth');
      return;
    }
    const newReviewRef = push(ref(db, `products/${id}/reviews`));
    await set(newReviewRef, {
      userId: user.uid,
      userName: user.displayName || user.email.split('@')[0],
      text: reviewText,
      rating,
      date: new Date().toISOString()
    });
    setReviewText('');
    setRating(5);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (!product) return null;

  const finalPrice = product.discount > 0 ? product.price - (product.price * (product.discount / 100)) : product.price;
  const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '120px' }}>
      <div style={{
        height: '400px',
        background: product.bgRemoved ? 'white' : 'linear-gradient(135deg, var(--secondary) 0%, #1a1a2e 100%)',
        borderRadius: '0 0 40px 40px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <header style={{
          position: 'absolute', top: 20, left: 20, right: 20,
          display: 'flex', justifyContent: 'space-between', zIndex: 10
        }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(0,0,0,0.2)', color: 'white', padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleShare} style={{ background: 'rgba(0,0,0,0.2)', color: 'white', padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
              <Share2 size={20} />
            </button>
            <button onClick={() => navigate('/')} style={{ background: 'rgba(0,0,0,0.2)', color: 'white', padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
              <ShoppingBag size={20} />
            </button>
          </div>
        </header>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ width: '80%', maxWidth: '350px', position: 'relative' }}
        >
          {!product.bgRemoved && (
            <h1 style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '4rem', color: 'rgba(255,255,255,0.04)',
              whiteSpace: 'nowrap', zIndex: 1, fontWeight: '900'
            }}>
              {product.category || 'Premium'}
            </h1>
          )}
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className={product.bgRemoved ? "bg-removed" : ""}
              style={{ width: '100%', position: 'relative', zIndex: 2, objectFit: 'contain', maxHeight: '280px' }}
            />
          )}
        </motion.div>
      </div>

      <div style={{ padding: '30px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Aura Premium</span>
            <h2 style={{ fontSize: '1.8rem', margin: '5px 0', fontWeight: '800' }}>{product.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px' }}>
              <Star size={16} fill="#FFD700" color="#FFD700" />
              <span style={{ fontSize: '0.9rem', fontWeight: '700', marginLeft: '4px' }}>{avgRating}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginLeft: '4px' }}>({reviews.length} reviews)</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button
              onClick={() => setLiked(!liked)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
            >
              <Heart size={24} fill={liked ? '#ff4444' : 'none'} color={liked ? '#ff4444' : 'var(--text-dim)'} />
            </button>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', marginTop: '5px', color: 'var(--primary)' }}>{formatPrice(finalPrice)}</div>
            {product.discount > 0 && (
              <div style={{ fontSize: '1rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>{formatPrice(product.price)}</div>
            )}
          </div>
        </div>

        {product.description && (
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', fontWeight: '700' }}>{translate('description') || 'Description'}</h3>
            <p style={{ color: 'var(--text-dim)', lineHeight: '1.8', fontSize: '0.95rem' }}>{product.description}</p>
          </div>
        )}

        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', fontWeight: '800' }}>Reviews</h3>
          
          <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '1rem' }}>Write a Review</h4>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
              {[1,2,3,4,5].map(star => (
                <Star key={star} size={24} onClick={() => setRating(star)} fill={star <= rating ? '#FFD700' : 'none'} color={star <= rating ? '#FFD700' : 'var(--border)'} style={{ cursor: 'pointer' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your thoughts..." style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)' }} />
              <button onClick={submitReview} className="btn-primary" style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)' }}><Send size={18} /></button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {reviews.map((r, idx) => (
              <div key={idx} style={{ background: 'var(--surface)', padding: '15px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{r.userName}</strong>
                  <div style={{ display: 'flex' }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= r.rating ? '#FFD700' : 'none'} color={s <= r.rating ? '#FFD700' : '#eee'} />)}
                  </div>
                </div>
                <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem' }}>{r.text}</p>
                <span style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '10px', display: 'block' }}>{new Date(r.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '20px', background: 'var(--surface)',
          borderTop: '1px solid var(--border)', zIndex: 100,
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom))'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg)', padding: '10px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}><Minus size={18} /></button>
              <span style={{ fontWeight: '800', minWidth: '20px', textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}><Plus size={18} /></button>
            </div>
            <motion.button
              animate={{ backgroundColor: isAdded ? 'var(--success)' : 'var(--primary)' }}
              onClick={handleAddToCart}
              style={{
                flex: 1, padding: '16px', borderRadius: 'var(--radius-pill)',
                fontSize: '1rem', fontWeight: '800',
                boxShadow: isAdded ? '0 8px 25px rgba(16, 185, 129, 0.4)' : '0 8px 25px var(--primary-glow)',
                color: 'white', border: 'none', cursor: 'pointer'
              }}
            >
              {isAdded ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Check size={20} /> Added Successfully
                </span>
              ) : (
                <>{translate('add_to_cart') || 'Add to Cart'} · {formatPrice(finalPrice * qty)}</>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
export const _fingerprint_detail = _SH_DETAIL;
