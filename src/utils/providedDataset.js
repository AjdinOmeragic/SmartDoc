import { processFiles } from './fileProcessor';

export const PROVIDED_DATASET_FILES = [
  'data_1.csv',
  'data_2.csv',
  'data_3.csv',
  'text_1.txt',
  'text_2.txt',
  'text_3.txt',
  'invoice_1.pdf',
  'invoice_2.pdf',
  'invoice_3.pdf',
  'invoice_4.pdf',
  'invoice_5.pdf',
  'invoice_6.pdf',
  'po_1.pdf',
  'po_2.pdf',
  'img_1.png',
  'img_2.png',
  'img_3.png',
  'img_4.png',
  'img_5.png',
  'img_6.png',
];

export async function loadProvidedDataset() {
  const files = await Promise.all(
    PROVIDED_DATASET_FILES.map(async (name) => {
      const response = await fetch(`/sample-documents/${encodeURIComponent(name)}`);
      if (!response.ok) {
        throw new Error(`Could not load sample document: ${name}`);
      }

      const blob = await response.blob();
      return new File([blob], name, {
        type: blob.type || inferMimeType(name),
      });
    })
  );

  const docs = await processFiles(files);
  return docs.map((doc) => ({ ...doc, source: 'provided_dataset' }));
}

function inferMimeType(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return 'text/csv';
  if (ext === 'txt') return 'text/plain';
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}
