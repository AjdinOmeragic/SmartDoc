import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomePage from '@/pages/HomePage';
import UploadPage from '@/pages/UploadPage';
import DashboardPage from '@/pages/DashboardPage';
import DocumentDetailPage from '@/pages/DocumentDetailPage';
import { useDocumentStore } from '@/hooks/useDocumentStore';

export default function App() {
  const {
    documents,
    isLoading,
    stats,
    addDocuments,
    updateDocument,
    deleteDocument,
    clearAll,
  } = useDocumentStore();

  const reviewCount = documents.filter((d) => d.status === 'needs_review').length;

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'var(--font-body)',
        color: 'var(--text-muted)',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar reviewCount={reviewCount} />

      <main className="page-content">
        <Routes>
          <Route
            path="/"
            element={<HomePage docCount={documents.length} />}
          />
          <Route
            path="/upload"
            element={<UploadPage onFilesProcessed={addDocuments} />}
          />
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                documents={documents}
                stats={stats}
                onDelete={deleteDocument}
                onAddDocuments={addDocuments}
                onClearAll={clearAll}
              />
            }
          />
          <Route
            path="/dashboard/:id"
            element={
              <DocumentDetailPage
                documents={documents}
                onUpdate={updateDocument}
              />
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
