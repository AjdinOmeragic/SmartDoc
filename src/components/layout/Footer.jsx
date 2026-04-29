import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        SmartDoc Processor · Built for the Mastery Engineering Task
      </div>
    </footer>
  );
}
