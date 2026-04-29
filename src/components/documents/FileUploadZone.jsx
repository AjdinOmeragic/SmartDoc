import React, { useRef, useState } from 'react';
import styles from './FileUploadZone.module.css';

export default function FileUploadZone({ onFilesSelected, isProcessing = false }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList) => {
    if (isProcessing) return;
    onFilesSelected(Array.from(fileList));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!isProcessing) inputRef.current?.click();
  };

  return (
    <div
      className={`${styles.zone} ${isDragging ? styles.dragging : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".csv,.txt,.pdf,.png,.jpg,.jpeg"
        className={styles.input}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className={styles.icon}>
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path
            d="M12 4v12m0-12L7 9m5-5l5 5"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className={styles.title}>
        {isProcessing ? 'Processing files...' : 'Drop files here to upload'}
      </div>

      <div className={styles.divider}>or</div>

      <button
        className={styles.button}
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
        disabled={isProcessing}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
          <path
            d="M8 3v8m0-8L5 6m3-3l3 3M3 12v.5a1.5 1.5 0 001.5 1.5h7a1.5 1.5 0 001.5-1.5V12"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Upload from your device
      </button>

      <div className={styles.hint}>Supports CSV, TXT, PDF, PNG, and JPG</div>

      {isProcessing && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} />
        </div>
      )}
    </div>
  );
}
