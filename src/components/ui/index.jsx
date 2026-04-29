import React from 'react';
import { STATUS_CONFIG } from '@/utils/constants';
import styles from './ui.module.css';

// ── Status Badge ──

export function Badge({ status }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className={styles.badge}
      style={{ background: config.bg, color: config.text }}
    >
      <span
        className={styles.badgeDot}
        style={{ background: config.dot }}
      />
      {config.label}
    </span>
  );
}

// ── Issue Severity Icon ──

export function IssueIcon({ severity }) {
  const color =
    severity === 'error'
      ? 'var(--red)'
      : severity === 'warning'
        ? 'var(--amber)'
        : 'var(--accent)';

  const paths = {
    error: (
      <>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" fill="none" />
        <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </>
    ),
    warning: (
      <path
        d="M8 5v3.5m0 2v.5M3 14h10L8 3 3 14z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    info: (
      <>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" fill="none" />
        <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  };

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ color, flexShrink: 0, display: 'block' }}
    >
      {paths[severity] || paths.info}
    </svg>
  );
}

// ── File Type Icon ──

const FILE_TYPE_COLORS = {
  csv: '#10B981',
  txt: '#6366F1',
  pdf: '#EF4444',
  png: '#F59E0B',
  jpg: '#F59E0B',
  jpeg: '#F59E0B',
};

export function FileIcon({ type }) {
  const bg = FILE_TYPE_COLORS[type] || '#94A3B8';

  return (
    <div className={styles.fileIcon} style={{ background: bg }}>
      {type.toUpperCase()}
    </div>
  );
}

// ── Stat Card ──

export function StatCard({ label, value, accent, className = '' }) {
  return (
    <div className={`${styles.statCard} ${className}`}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue} style={accent ? { color: accent } : undefined}>
        {value}
      </div>
    </div>
  );
}
