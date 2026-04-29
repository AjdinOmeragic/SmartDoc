import React from 'react';
import { Badge, FileIcon } from '@/components/ui';
import { formatCurrency } from '@/utils/formatters';
import styles from './DocumentRow.module.css';

export default function DocumentRow({ doc, onClick, onDelete }) {
  const { extracted, issues, status, fileName, fileType } = doc;
  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length;

  const typeLabel =
    extracted.docType === 'invoice'
      ? 'Invoice'
      : extracted.docType === 'purchase_order'
        ? 'Purchase order'
        : 'Document';

  return (
    <div className={styles.row} onClick={onClick}>
      <FileIcon type={fileType} />

      <div className={styles.info}>
        <div className={styles.name}>{fileName}</div>
        <div className={styles.meta}>
          {typeLabel}
          {extracted.supplier && ` - ${extracted.supplier}`}
          {extracted.docNumber && ` - ${extracted.docNumber}`}
        </div>
      </div>

      <div className={styles.amount}>
        <div className={styles.amountValue}>
          {extracted.total > 0
            ? formatCurrency(extracted.total, extracted.currency)
            : '--'}
        </div>
        {(errorCount > 0 || warningCount > 0) && (
          <div className={styles.issues}>
            {errorCount > 0 && `${errorCount} error${errorCount > 1 ? 's' : ''}`}
            {errorCount > 0 && warningCount > 0 && ', '}
            {warningCount > 0 && `${warningCount} warning${warningCount > 1 ? 's' : ''}`}
          </div>
        )}
      </div>

      <Badge status={status} />

      <button
        className={styles.deleteBtn}
        onClick={(event) => {
          event.stopPropagation();
          const confirmed = window.confirm(`Delete "${fileName}" from this browser?`);
          if (confirmed) onDelete(doc.id);
        }}
        title="Delete document"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
          <path
            d="M2.5 4h9M5 4V2.5h4V4m-5 0l.5 8h5l.5-8"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 16 16"
        className={styles.chevron}
      >
        <path
          d="M6 3l5 5-5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
