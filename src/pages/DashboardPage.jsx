import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/ui';
import DocumentRow from '@/components/documents/DocumentRow';
import { formatCurrency } from '@/utils/formatters';
import { generateSampleDocs } from '@/utils/sampleData';
import { loadProvidedDataset, PROVIDED_DATASET_FILES } from '@/utils/providedDataset';
import styles from './DashboardPage.module.css';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'uploaded', label: 'Uploaded' },
  { key: 'needs_review', label: 'Review' },
  { key: 'validated', label: 'Validated' },
  { key: 'rejected', label: 'Rejected' },
];

export default function DashboardPage({
  documents,
  stats,
  onDelete,
  onAddDocuments,
  onClearAll,
}) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoadingDataset, setIsLoadingDataset] = useState(false);
  const navigate = useNavigate();

  const { counts, currencyTotals } = stats;

  const filtered = documents.filter((doc) => {
    if (filter !== 'all' && doc.status !== filter) return false;
    if (!search) return true;

    const needle = search.toLowerCase();
    return (
      doc.fileName.toLowerCase().includes(needle) ||
      (doc.extracted.supplier || '').toLowerCase().includes(needle) ||
      (doc.extracted.docNumber || '').toLowerCase().includes(needle)
    );
  });

  const handleLoadDemoSamples = () => {
    onAddDocuments(generateSampleDocs());
  };

  const handleLoadProvidedDataset = async () => {
    setIsLoadingDataset(true);
    try {
      const docs = await loadProvidedDataset();
      onAddDocuments(docs);
    } catch (err) {
      console.error('Failed to load provided dataset:', err);
      onAddDocuments(generateSampleDocs());
    } finally {
      setIsLoadingDataset(false);
    }
  };

  const handleClearAll = () => {
    const confirmed = window.confirm('Clear all processed documents from this browser?');
    if (confirmed) onClearAll();
  };

  return (
    <section className={`container ${styles.page}`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Document dashboard</h2>
          <p className={styles.subtitle}>
            {documents.length} document{documents.length !== 1 ? 's' : ''} processed
            {documents.length === 0 && ` - ${PROVIDED_DATASET_FILES.length} bundled task files available`}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.btn}
            onClick={handleLoadProvidedDataset}
            disabled={isLoadingDataset}
          >
            {isLoadingDataset
              ? 'Loading dataset...'
              : documents.length === 0
                ? 'Load provided dataset'
                : 'Refresh provided dataset'}
          </button>
          {documents.length === 0 && (
            <>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={handleLoadDemoSamples}>
                Load demo samples
              </button>
            </>
          )}
          {documents.length > 0 && (
            <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleClearAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Total" value={counts.total} className="fade-up" />
        <StatCard
          label="Needs review"
          value={counts.needs_review}
          accent={counts.needs_review > 0 ? 'var(--amber)' : undefined}
          className="fade-up fade-up-delay-1"
        />
        <StatCard
          label="Validated"
          value={counts.validated}
          accent={counts.validated > 0 ? 'var(--green)' : undefined}
          className="fade-up fade-up-delay-2"
        />
        <StatCard
          label="Issues found"
          value={counts.totalIssues}
          accent={counts.totalIssues > 0 ? 'var(--red)' : undefined}
          className="fade-up fade-up-delay-3"
        />
      </div>

      {Object.keys(currencyTotals).length > 0 && (
        <div className={styles.currencyBar}>
          <strong>Validated totals:</strong>
          {Object.entries(currencyTotals).map(([currency, total]) => (
            <span key={currency}>{formatCurrency(total, currency)}</span>
          ))}
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.filterTabs}>
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.filterTab} ${filter === key ? styles.filterActive : ''}`}
              onClick={() => setFilter(key)}
            >
              {label} ({counts[key] ?? counts.total})
            </button>
          ))}
        </div>
        <div className={styles.searchBox}>
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <input
            placeholder="Search documents..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              d="M6 2h8.5L19 6.5V21a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 015 21V3.5A1.5 1.5 0 016 2z"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path d="M14 2v5h5" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <p>{documents.length === 0 ? 'No documents yet' : 'No matching documents'}</p>
          <span className={styles.emptySub}>
            {documents.length === 0
              ? 'Upload files or load sample data to get started'
              : 'Try adjusting your filters'}
          </span>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((doc, index) => (
            <div key={doc.id} className="fade-up" style={{ animationDelay: `${index * 0.03}s` }}>
              <DocumentRow
                doc={doc}
                onClick={() => navigate(`/dashboard/${doc.id}`)}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
