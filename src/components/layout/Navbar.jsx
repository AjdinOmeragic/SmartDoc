import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar({ reviewCount = 0 }) {
  const navigate = useNavigate();

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <NavLink to="/" className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#2563EB" />
            <path
              d="M8 9h7M8 13h12M8 17h9"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          SmartDoc
        </NavLink>

        {/* Links */}
        <div className={styles.links}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            Upload
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            Dashboard
            {reviewCount > 0 && (
              <span className={styles.badge}>{reviewCount}</span>
            )}
          </NavLink>
        </div>

        {/* CTA */}
        <div className={styles.right}>
          <button
            className={styles.cta}
            onClick={() => navigate('/upload')}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path
                d="M8 3v8m0-8L5 6m3-3l3 3M3 12v.5a1.5 1.5 0 001.5 1.5h7a1.5 1.5 0 001.5-1.5V12"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Upload files
          </button>
        </div>
      </div>
    </nav>
  );
}
