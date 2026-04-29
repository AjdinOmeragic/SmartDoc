import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, IssueIcon } from '@/components/ui';
import { formatCurrency } from '@/utils/formatters';
import { validateDocument } from '@/utils/validation';
import { STATUS_CONFIG } from '@/utils/constants';
import styles from './DocumentDetailPage.module.css';

export default function DocumentDetailPage({ documents, onUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const doc = documents.find((d) => d.id === id);

  if (!doc) {
    return (
      <section className={`container ${styles.page}`}>
        <p>Document not found.</p>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ? Back to dashboard
        </button>
      </section>
    );
  }

  return <DetailView doc={doc} onUpdate={onUpdate} onBack={() => navigate('/dashboard')} />;
}

function DetailView({ doc, onUpdate, onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...doc.extracted });
  const [editItems, setEditItems] = useState([...doc.extracted.lineItems]);
  const [showRaw, setShowRaw] = useState(false);

  const data = isEditing ? editData : doc.extracted;
  const items = isEditing ? editItems : doc.extracted.lineItems;
  const handleSave = () => {
    const updated = { ...editData, lineItems: editItems };
    const issues = validateDocument(updated);
    const status = issues.some((i) => i.severity === 'error') ? 'needs_review' : 'validated';
    onUpdate({ ...doc, extracted: updated, issues, status });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...doc.extracted });
    setEditItems([...doc.extracted.lineItems]);
  };
  const updateItem = (index, field, value) => {
    const newItems = [...editItems];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'description' ? value : Number(value) || 0,
    };
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    setEditItems(newItems);
    recalcTotals(newItems);
  };

  const addItem = () => {
    setEditItems([...editItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = editItems.filter((_, i) => i !== index);
    setEditItems(newItems);
    recalcTotals(newItems);
  };

  const recalcTotals = (lineItems) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    setEditData((prev) => ({
      ...prev,
      subtotal,
      total: subtotal + (prev.tax || 0),
    }));
  };

  const handleStatusChange = (status) => {
    onUpdate({ ...doc, status });
  };
  const Field = ({ label, field, type = 'text' }) => (
    <div className={styles.field}>
      <label>{label}</label>
      {isEditing ? (
        <input
          type={type}
          value={editData[field] || ''}
          onChange={(e) =>
            setEditData({
              ...editData,
              [field]: type === 'number' ? Number(e.target.value) : e.target.value,
            })
          }
        />
      ) : (
        <div className={`${styles.fieldValue} ${!data[field] ? styles.empty : ''}`}>
          {data[field] || 'Not detected'}
          {doc.issues.some((i) => i.field === field) && (
            <span style={{ marginLeft: 6 }}>
              <IssueIcon severity={doc.issues.find((i) => i.field === field).severity} />
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className={`container ${styles.page}`}>
      <button className={styles.backBtn} onClick={onBack}>
        <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to dashboard
      </button>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{doc.fileName}</h2>
          <p className={styles.fileInfo}>
            {doc.fileType.toUpperCase()} - Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Badge status={doc.status} />
          {!isEditing ? (
            <button className={styles.btn} onClick={() => setIsEditing(true)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <path d="M9 2.5l2.5 2.5L5 11.5H2.5V9L9 2.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Edit
            </button>
          ) : (
            <>
              <button className={styles.btn} onClick={handleCancel}>Cancel</button>
              <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleSave}>
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Save
              </button>
            </>
          )}
        </div>
      </div>
      {doc.issues.length > 0 && (
        <div className={`${styles.issuesBanner} ${doc.issues.some((i) => i.severity === 'error') ? styles.issuesError : styles.issuesWarning}`}>
          <div className={styles.issuesTitle}>
            {doc.issues.length} issue{doc.issues.length !== 1 ? 's' : ''} detected
          </div>
          {doc.issues.map((issue, i) => (
            <div key={i} className={styles.issueRow}>
              <IssueIcon severity={issue.severity} />
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      )}
      {doc.preview && (
        <div className={styles.previewCard}>
          <img src={doc.preview} alt={doc.fileName} />
        </div>
      )}
      <div className={`${styles.card} fade-up`}>
        <h3 className={styles.cardTitle}>Document details</h3>
        <div className={styles.fieldGrid}>
          <Field label="Document type" field="docType" />
          <Field label="Supplier / company" field="supplier" />
          <Field label="Document number" field="docNumber" />
          <Field label="Currency" field="currency" />
          <Field label="Issue date" field="issueDate" type={isEditing ? 'date' : 'text'} />
          <Field label="Due date" field="dueDate" type={isEditing ? 'date' : 'text'} />
        </div>
      </div>
      <div className={`${styles.card} fade-up fade-up-delay-1`}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Line items ({items.length})</h3>
          {isEditing && (
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={addItem}>
              + Add item
            </button>
          )}
        </div>
        {items.length === 0 ? (
          <p className={styles.emptyText}>No line items detected</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Description</th>
                <th style={{ width: '12%' }}>Qty</th>
                <th style={{ width: '18%' }}>Unit price</th>
                <th style={{ width: '18%' }}>Total</th>
                {isEditing && <th style={{ width: '8%' }} />}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const hasError = doc.issues.some((x) => x.field === `lineItem_${i}`);
                return (
                  <tr key={i} className={hasError ? styles.errorRow : ''}>
                    <td>
                      {isEditing ? (
                        <input value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} />
                      ) : (
                        item.description
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input type="number" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
                      ) : (
                        item.quantity
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', e.target.value)} />
                      ) : (
                        formatCurrency(item.unitPrice, data.currency)
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {isEditing ? (
                        <input type="number" step="0.01" value={item.total} onChange={(e) => updateItem(i, 'total', e.target.value)} />
                      ) : (
                        <>
                          {formatCurrency(item.total, data.currency)}
                          {hasError && !isEditing && (
                            <span style={{ marginLeft: 4 }}>
                              <IssueIcon severity="error" />
                            </span>
                          )}
                        </>
                      )}
                    </td>
                    {isEditing && (
                      <td>
                        <button className={`${styles.btn} ${styles.btnDanger}`} style={{ padding: 4 }} onClick={() => removeItem(i)}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                            <path d="M2.5 4h9M5 4V2.5h4V4m-5 0l.5 8h5l.5-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className={styles.totals}>
          <TotalRow
            label="Subtotal"
            value={data.subtotal}
            currency={data.currency}
            isEditing={isEditing}
            onChange={(v) => setEditData({ ...editData, subtotal: v })}
          />
          <TotalRow
            label="Tax"
            value={data.tax}
            currency={data.currency}
            isEditing={isEditing}
            onChange={(v) => setEditData({ ...editData, tax: v, total: editData.subtotal + v })}
          />
          <div className={`${styles.totalRow} ${styles.grandTotal}`}>
            <span className={styles.totalLabel}>Total</span>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                value={editData.total}
                onChange={(e) => setEditData({ ...editData, total: Number(e.target.value) })}
                className={styles.totalInput}
                style={{ fontWeight: 600 }}
              />
            ) : (
              <span style={{
                color: doc.issues.some((x) => x.field === 'total' && x.severity === 'error')
                  ? 'var(--red)' : undefined,
              }}>
                {formatCurrency(data.total, data.currency)}
                {doc.issues.some((x) => x.field === 'total' && x.severity === 'error') && (
                  <span style={{ marginLeft: 4 }}><IssueIcon severity="error" /></span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
      {!isEditing && (
        <div className={`${styles.card} fade-up fade-up-delay-2`}>
          <h3 className={styles.cardTitle}>Update status</h3>
          <div className={styles.statusControls}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                className={`${styles.statusBtn} ${doc.status === key ? styles.statusActive : ''}`}
                onClick={() => handleStatusChange(key)}
                style={
                  doc.status === key
                    ? { background: cfg.bg, color: cfg.text, borderColor: cfg.dot }
                    : undefined
                }
              >
                <span
                  className={styles.statusDot}
                  style={{ background: cfg.dot }}
                />
                {cfg.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {doc.rawText && !doc.rawText.startsWith('[') && (
        <div style={{ marginTop: 8 }}>
          <button className={styles.rawToggle} onClick={() => setShowRaw(!showRaw)}>
            <svg
              width="14" height="14" fill="none" viewBox="0 0 14 14"
              style={{ transform: showRaw ? 'rotate(90deg)' : 'none', transition: '0.2s' }}
            >
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showRaw ? 'Hide' : 'View'} raw text
          </button>
          {showRaw && <pre className={styles.rawText}>{doc.rawText}</pre>}
        </div>
      )}
    </section>
  );
}

function TotalRow({ label, value, currency, isEditing, onChange }) {
  return (
    <div className={styles.totalRow}>
      <span className={styles.totalLabel}>{label}</span>
      {isEditing ? (
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={styles.totalInput}
        />
      ) : (
        <span>{formatCurrency(value, currency)}</span>
      )}
    </div>
  );
}

