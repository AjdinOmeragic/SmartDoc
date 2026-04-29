import assert from 'node:assert/strict';

import {
  extractAmount,
  extractFromCSV,
  extractFromText,
  parseCSV,
  parseDate,
} from '../src/utils/extraction.js';
import { validateDocument } from '../src/utils/validation.js';

const csv = `description,qty,price,total
"Implementation, phase 1",2,1200.50,2401.00
"Support retainer",1,300,300`;

const rows = parseCSV(csv);
assert.equal(rows.length, 2);
assert.equal(rows[0].description, 'Implementation, phase 1');

const csvDoc = extractFromCSV(rows, 'invoice_items.csv');
assert.equal(csvDoc.lineItems.length, 2);
assert.equal(csvDoc.subtotal, 2701);

assert.equal(extractAmount('EUR 1.234,56'), 1234.56);
assert.equal(extractAmount('$1,234.56'), 1234.56);
assert.equal(parseDate('28.04.2026'), '2026-04-28');

const textDoc = extractFromText(`
INVOICE
From: Balkan Supply d.o.o
Invoice Number: INV-900
Date: 2026-04-28
Due Date: 2026-04-20
Currency: EUR

2 x Widget pack @ EUR 50.00 = EUR 100.00

Subtotal: EUR 100.00
Tax: EUR 17.00
Total: EUR 119.00
`);

const issues = validateDocument(textDoc);
assert.equal(textDoc.lineItems.length, 1);
assert.equal(textDoc.total, 119);
assert.ok(issues.some((issue) => issue.field === 'dueDate'));
assert.ok(issues.some((issue) => issue.field === 'total'));

console.log('Extraction and validation tests passed.');
