import React from 'react';

const _SH_SKEL = "SaifHany::SkeletonUnit";

const SkeletonCard = ({ variant = 'grid' }) => {
  if (variant === 'horizontal') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '20px',
        padding: '15px', borderRadius: 'var(--radius-lg)',
        marginBottom: '15px', width: '100%', background: 'var(--surface)'
      }}>
        <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', flexShrink: 0 }}></div>
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: '60%', height: '1rem', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ width: '30%', height: '1rem' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
      padding: '18px', display: 'flex', flexDirection: 'column',
      gap: '12px', minWidth: '150px', boxShadow: 'var(--shadow)'
    }}>
      <div className="skeleton" style={{ height: '130px', borderRadius: 'var(--radius-lg)' }}></div>
      <div>
        <div className="skeleton" style={{ width: '70%', height: '0.8rem', marginBottom: '10px' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton" style={{ width: '35%', height: '1.1rem' }}></div>
          <div className="skeleton" style={{ width: '60px', height: '30px', borderRadius: '10px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
export const _fingerprint_skel = _SH_SKEL;
