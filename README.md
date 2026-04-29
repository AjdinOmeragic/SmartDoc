# SmartDoc Processor

A browser-based Smart Document Processing System for invoices and purchase orders. It ingests business documents, extracts structured fields where text is available, validates the results, and gives reviewers a simple workflow for correcting and saving final records.

Built as a take-home engineering task for [Mastery](https://mastery.ba).

## Features

- Multi-format ingestion for CSV, TXT, PDF, PNG, JPG, and JPEG files.
- Bundled "provided dataset" loader with the original task resources in `public/sample-documents`.
- Rule-based extraction for document type, supplier, document number, dates, currency, line items, subtotal, tax, and total.
- Validation for missing fields, invalid dates, due dates before issue dates, line item math, subtotal/total mismatches, zero totals, and duplicate document numbers.
- Review interface with inline corrections, add/remove line items, issue highlighting, raw text view, and image previews.
- Status workflow: `Uploaded -> Needs Review -> Validated / Rejected`.
- Dashboard with search, status filters, issue counts, and validated totals grouped by currency.
- Local persistence with `localStorage`, so processed documents remain available after refresh.
- Lightweight tests for extraction and validation logic.

## Important Implementation Notes

CSV and TXT files are parsed directly in the browser. Image files are accepted and shown with a preview for manual review, but this version does not run OCR. PDF files are accepted and routed into the review workflow with placeholder extraction, because reliable PDF text extraction usually needs `pdf.js`, a backend service, or a dedicated parser. This is called out honestly so reviewers can see what is complete and what would be improved next.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 19 |
| Routing | React Router v7 |
| Build tool | Vite |
| Styling | CSS Modules + global design tokens |
| Persistence | localStorage |
| Tests | Node `assert` |

## Project Structure

```text
src/
  components/
    layout/       Navbar, Footer
    ui/           Badge, FileIcon, StatCard, IssueIcon
    documents/    FileUploadZone, DocumentRow
  pages/
    HomePage.jsx
    UploadPage.jsx
    DashboardPage.jsx
    DocumentDetailPage.jsx
  hooks/
    useDocumentStore.js
  utils/
    constants.js
    extraction.js
    fileProcessor.js
    formatters.js
    providedDataset.js
    sampleData.js
    validation.js
  styles/
    global.css
tests/
  extraction-validation.test.mjs
public/
  sample-documents/
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The Vite dev server opens at [http://localhost:3000](http://localhost:3000).

### Tests

```bash
npm test
```

### Production Build

```bash
npm run build
npm run preview
```

## How To Review The Task Dataset

1. Start the app.
2. Open the dashboard.
3. Click `Load provided dataset`.
4. Open documents marked `Needs review` to inspect validation issues and make corrections.
5. Save corrected documents and update status to `Validated` or `Rejected`.

You can also upload your own CSV/TXT/PDF/image files from the upload page.

## Approach

Extraction is intentionally transparent and rule-based. CSV rows are normalized into a shared document schema, while TXT content is scanned with multiple regex patterns for common invoice and purchase-order layouts. Validation is separate from extraction, which keeps business rules easy to inspect and extend.

The document store lives in a custom hook and persists to `localStorage`. Duplicate detection runs across the current document collection, so duplicate document numbers are surfaced even when the individual file appears valid on its own.

## Deployment

This is a static Vite app and can be deployed to Vercel, Netlify, Render Static Sites, GitHub Pages, or any static host.

Recommended settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `18` or newer

## AI Tools Used

AI assistance was used for implementation support, refactoring, and documentation polish. The extraction and validation logic is deterministic application code and can be reviewed in `src/utils/extraction.js` and `src/utils/validation.js`.

## Improvements I Would Make Next

- Add real PDF text extraction with `pdf.js` or a backend parser.
- Add OCR for images with Tesseract.js or a managed OCR service.
- Replace `localStorage` with SQLite/PostgreSQL persistence.
- Add export to CSV/JSON for validated documents.
- Add more unit tests and end-to-end tests around the upload/review workflow.
- Add Docker and an API layer for server-side processing.

## Submission Placeholders

- GitHub repository: `<repo-link>`
- Live application: `<deployed-link>`
