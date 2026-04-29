import { extractFromText, extractFromCSV, parseCSV } from './extraction';
import { validateDocument, deriveStatus } from './validation';
import { generateId } from './formatters';

const RAW_SAMPLES = [
  {
    name: 'invoice_001.txt',
    type: 'txt',
    raw: `INVOICE

From: TechFlow Solutions Ltd.
Invoice Number: INV-2024-001
Date: 2024-03-15
Due Date: 2024-04-15
Currency: USD

Bill To: Acme Corp

Items:
2 x Cloud Hosting (Monthly) @ $299.00 = $598.00
5 x API Integration License @ $150.00 = $750.00
1 x Premium Support Package @ $499.00 = $499.00

Subtotal: $1,847.00
Tax (10%): $184.70
Total: $2,031.70`,
  },
  {
    name: 'invoice_002.txt',
    type: 'txt',
    raw: `INVOICE

Supplier: DataStream Analytics Inc.
Invoice #: INV-2024-002
Issue Date: March 20, 2024
Due Date: April 20, 2024

3 x Data Pipeline Setup @ $500.00 = $1,500.00
10 x Monthly Data Processing @ $75.00 = $750.00
1 x Custom Dashboard @ $1,200.00 = $1,200.00

Subtotal: $3,450.00
Tax (8%): $276.00
Total: $3,726.00`,
  },
  {
    name: 'po_001.txt',
    type: 'txt',
    raw: `PURCHASE ORDER

Company: Alpine Manufacturing GmbH
PO Number: PO-2024-101
Order Date: 2024-02-28
Expected Delivery: 2024-03-30
Currency: EUR

Items:
50 x Steel Brackets (Type A) @ EUR 12.50 = EUR 625.00
100 x Rubber Gaskets @ EUR 3.75 = EUR 375.00
25 x Aluminum Plates @ EUR 45.00 = EUR 1,125.00
10 x Custom Bolts Set @ EUR 18.00 = EUR 180.00

Subtotal: EUR 2,305.00
Tax (19%): EUR 437.95
Total: EUR 2,742.95`,
  },
  {
    name: 'invoice_error.csv',
    type: 'csv',
    raw: `description,quantity,unit_price,total
"Web Development - Phase 1",1,5000.00,5000.00
"UI/UX Design Package",1,3500.00,3500.00
"QA Testing (40 hours)",40,85.00,3400.00
"Project Management",1,2000.00,2500.00
"Server Setup & Config",1,1500.00,1500.00`,
  },
  {
    name: 'po_002.txt',
    type: 'txt',
    raw: `PURCHASE ORDER

From: Nordic Supply Chain AS
PO #: PO-2024-102
Date: 2024-04-01
Due: 2024-02-15

20 x Office Chairs (Ergonomic) @ $385.00 = $7,700.00
10 x Standing Desks @ $650.00 = $6,500.00
40 x Monitor Arms @ $89.00 = $3,560.00

Subtotal: $17,760.00
Tax (7%): $1,243.20
Total: $19,003.20`,
  },
  {
    name: 'invoice_duplicate.txt',
    type: 'txt',
    raw: `INVOICE

From: TechFlow Solutions Ltd.
Invoice Number: INV-2024-001
Date: 2024-03-15
Due Date: 2024-04-15

1 x Consulting Service @ $2,000.00 = $2,000.00

Subtotal: $2,000.00
Tax: $200.00
Total: $2,200.00`,
  },
];

export function generateSampleDocs() {
  return RAW_SAMPLES.map((sample) => {
    let extracted;

    if (sample.type === 'csv') {
      const rows = parseCSV(sample.raw);
      extracted = rows
        ? extractFromCSV(rows, sample.name)
        : extractFromText(sample.raw, sample.name);
    } else {
      extracted = extractFromText(sample.raw, sample.name);
    }

    const issues = validateDocument(extracted);
    const status = deriveStatus(issues);

    return {
      id: generateId(),
      fileName: sample.name,
      fileType: sample.type,
      source: 'demo',
      rawText: sample.raw,
      extracted,
      issues,
      status,
      uploadedAt: new Date().toISOString(),
      preview: null,
    };
  });
}
