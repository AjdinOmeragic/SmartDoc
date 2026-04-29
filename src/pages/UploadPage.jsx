import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploadZone from '@/components/documents/FileUploadZone';
import { processFiles } from '@/utils/fileProcessor';
import styles from './UploadPage.module.css';

export default function UploadPage({ onFilesProcessed }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleFiles = useCallback(async (files) => {
    setIsProcessing(true);
    try {
      const docs = await processFiles(files);
      if (docs.length > 0) {
        onFilesProcessed(docs);
        // Small delay to show animation then navigate
        setTimeout(() => navigate('/dashboard'), 600);
      }
    } catch (err) {
      console.error('Processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [onFilesProcessed, navigate]);

  return (
    <section className={`container ${styles.page}`}>
      <h2 className={styles.title}>Upload your documents</h2>
      <p className={styles.subtitle}>
        Drop files below or click to browse. CSV, TXT, PDF, and image files are parsed automatically.
      </p>

      <FileUploadZone
        onFilesSelected={handleFiles}
        isProcessing={isProcessing}
      />

      <div className={styles.security}>
        <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
          <path
            d="M8 1.5L3 4v3.5c0 3.5 2 5.5 5 6.5 3-1 5-3 5-6.5V4L8 1.5z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M5.5 8l2 2 3-3.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Files stay in this browser session and are saved locally
      </div>
    </section>
  );
}
