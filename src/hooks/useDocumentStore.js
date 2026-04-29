import { useState, useEffect, useMemo, useCallback } from 'react';
import { STORAGE_KEY } from '@/utils/constants';
import { findDuplicates } from '@/utils/validation';

export function useDocumentStore() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setDocuments(JSON.parse(stored));
    } catch (err) {
      console.error('Failed to load stored documents:', err);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch (err) {
      console.error('Failed to save documents:', err);
    }
  }, [documents, isLoading]);

  const enrichedDocuments = useMemo(() => {
    const duplicates = findDuplicates(documents);

    return documents.map((doc, index) => {
      const duplicate = duplicates.find((item) => item.index === index);
      const alreadyFlagged = doc.issues.some((issue) => issue.message?.includes('Duplicate'));

      if (!duplicate || alreadyFlagged) return doc;

      return {
        ...doc,
        issues: [
          ...doc.issues,
          {
            field: 'docNumber',
            severity: 'warning',
            message: `Duplicate document number: ${duplicate.docNumber}`,
          },
        ],
      };
    });
  }, [documents]);

  const addDocuments = useCallback((newDocs) => {
    setDocuments((prev) => {
      const next = [...prev];

      newDocs.forEach((newDoc) => {
        const replaceIndex =
          newDoc.source === 'provided_dataset'
            ? next.findIndex((doc) => doc.fileName === newDoc.fileName)
            : -1;

        if (replaceIndex >= 0) {
          next[replaceIndex] = newDoc;
        } else {
          next.push(newDoc);
        }
      });

      return next;
    });
  }, []);

  const updateDocument = useCallback((updated) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === updated.id ? updated : doc))
    );
  }, []);

  const deleteDocument = useCallback((id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setDocuments([]);
  }, []);

  const stats = useMemo(() => {
    const counts = {
      total: enrichedDocuments.length,
      uploaded: 0,
      needs_review: 0,
      validated: 0,
      rejected: 0,
      totalIssues: 0,
    };

    const currencyTotals = {};

    enrichedDocuments.forEach((doc) => {
      counts[doc.status] = (counts[doc.status] || 0) + 1;
      counts.totalIssues += doc.issues.length;

      if (doc.status === 'validated' && doc.extracted?.total) {
        const currency = doc.extracted.currency || 'USD';
        currencyTotals[currency] =
          (currencyTotals[currency] || 0) + doc.extracted.total;
      }
    });

    return { counts, currencyTotals };
  }, [enrichedDocuments]);

  return {
    documents: enrichedDocuments,
    isLoading,
    stats,
    addDocuments,
    updateDocument,
    deleteDocument,
    clearAll,
  };
}
