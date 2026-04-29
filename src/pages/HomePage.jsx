import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

const features = [
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <path d="M10 2L4 10h5l-1 6 6-8H9l1-6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Fast extraction',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <path d="M9 2L3 5v4c0 4 2.5 6.5 6 7.5 3.5-1 6-3.5 6-7.5V5L9 2z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6.5 9l2 2 3.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Auto validation',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <path d="M9 2L2 6l7 4 7-4-7-4zM2 9l7 4 7-4M2 12l7 4 7-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Multi-format support',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <path d="M1.5 9s3-5.5 7.5-5.5S16.5 9 16.5 9s-3 5.5-7.5 5.5S1.5 9 1.5 9z" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    label: 'Review and fix',
  },
];

const formats = [
  ['PDF', '#EF4444'],
  ['CSV', '#10B981'],
  ['TXT', '#6366F1'],
  ['PNG', '#F59E0B'],
  ['JPG', '#EC4899'],
];

export default function HomePage({ docCount = 0 }) {
  const navigate = useNavigate();

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <h1 className="fade-up">
            Check messy business<br />
            documents <span className={styles.accent}>without guessing</span>
          </h1>
          <p className="fade-up fade-up-delay-1">
            Upload invoices and purchase orders, or load the provided task dataset.
            SmartDoc extracts what it can, shows the weak spots, and makes review simple.
          </p>
          <div className={`${styles.heroCta} fade-up fade-up-delay-2`}>
            <button className={styles.btnPrimary} onClick={() => navigate('/upload')}>
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M8 3v8m0-8L5 6m3-3l3 3M3 12v.5a1.5 1.5 0 001.5 1.5h7a1.5 1.5 0 001.5-1.5V12"
                  stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Upload documents
            </button>
            {docCount > 0 && (
              <button className={styles.btnSecondary} onClick={() => navigate('/dashboard')}>
                View dashboard →
              </button>
            )}
          </div>
          <div className={`${styles.features} fade-up fade-up-delay-3`}>
            {features.map((feature) => (
              <div className={styles.feature} key={feature.label}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                {feature.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '56px 24px 64px' }}>
        <div className={styles.formatsBar}>
          <div>
            <div className={styles.formatsTitle}>Supported formats</div>
            <div className={styles.formatsSub}>CSV and TXT are parsed; PDF/images are accepted for review.</div>
          </div>
          <div className={styles.formatIcons}>
            {formats.map(([ext, color]) => (
              <div key={ext} className={styles.formatIcon} style={{ background: `${color}12`, color }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path d="M5 2h7l4 4v11a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z" stroke={color} strokeWidth="1.2" />
                </svg>
                {ext}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
