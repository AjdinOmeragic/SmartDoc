import { parseCSV, extractFromText, extractFromCSV } from './extraction';
import { validateDocument, deriveStatus } from './validation';
import { generateId } from './formatters';
import { SUPPORTED_EXTENSIONS } from './constants';
import { readImageText, readPdfText } from './documentReaders';

export async function processFiles(files) {
  const results = [];

  for (const file of files) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) continue;

    try {
      const doc = await processFile(file, ext);
      if (doc) results.push(doc);
    } catch (err) {
      console.error(`Error processing ${file.name}:`, err);
      results.push(createFailedDocument(file, ext, err));
    }
  }

  return results;
}

async function processFile(file, ext) {
  const id = generateId();
  let rawText = '';
  let extracted = null;
  let preview = null;
  let processingWarning = '';

  switch (ext) {
    case 'csv': {
      rawText = await file.text();
      const rows = parseCSV(rawText);
      extracted = rows
        ? extractFromCSV(rows, file.name)
        : extractFromText(rawText, file.name);
      break;
    }

    case 'txt': {
      rawText = await file.text();
      extracted = extractFromText(rawText, file.name);
      break;
    }

    case 'pdf': {
      rawText = await readPdfText(file);
      extracted = rawText
        ? extractFromText(rawText, file.name)
        : createReviewShell(file.name);
      if (!rawText) processingWarning = 'No selectable text was found in this PDF';
      break;
    }

    case 'png':
    case 'jpg':
    case 'jpeg': {
      preview = await fileToBase64(file);
      rawText = await readImageText(file);
      extracted = rawText
        ? extractFromText(rawText, file.name)
        : createReviewShell(file.name);
      if (!rawText) processingWarning = 'OCR could not read text from this image';
      break;
    }

    default:
      return null;
  }

  if (!extracted) return null;

  const issues = validateDocument(extracted);
  if (processingWarning) {
    issues.unshift({
      field: 'rawText',
      severity: 'warning',
      message: processingWarning,
    });
  }

  return {
    id,
    fileName: file.name,
    fileType: ext,
    source: 'upload',
    rawText,
    extracted,
    issues,
    status: deriveStatus(issues),
    uploadedAt: new Date().toISOString(),
    preview,
  };
}

function createFailedDocument(file, ext, err) {
  const extracted = createReviewShell(file.name);

  return {
    id: generateId(),
    fileName: file.name,
    fileType: ext,
    source: 'upload',
    rawText: '',
    extracted,
    issues: [
      {
        field: 'rawText',
        severity: 'error',
        message: `Processing failed: ${err.message || 'Unknown error'}`,
      },
      ...validateDocument(extracted),
    ],
    status: 'needs_review',
    uploadedAt: new Date().toISOString(),
    preview: null,
  };
}

function createReviewShell(fileName) {
  return {
    docType: /po/i.test(fileName)
      ? 'purchase_order'
      : /inv/i.test(fileName)
        ? 'invoice'
        : 'unknown',
    supplier: '',
    docNumber: '',
    issueDate: '',
    dueDate: '',
    currency: 'USD',
    lineItems: [],
    subtotal: 0,
    tax: 0,
    total: 0,
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
