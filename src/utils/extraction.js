export function parseCSV(text) {
  const rows = parseCSVRows(text);
  if (rows.length < 2) return null;

  const headers = rows[0].map((header) => normalizeHeader(header));

  return rows
    .slice(1)
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index]?.trim() || '';
      });
      return record;
    });
}

function parseCSVRows(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function normalizeHeader(header) {
  return header
    .trim()
    .toLowerCase()
    .replace(/^"|"$/g, '')
    .replace(/[\s-]+/g, '_');
}

export function extractField(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(new RegExp(pattern, 'im'));
    if (match?.[1]) return match[1].trim();
  }

  return '';
}

export function extractAmount(value) {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.,-]/g, '');

  if (/\d{1,3}(\.\d{3})+,\d{2}$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
  }

  if (/\d{1,3}(,\d{3})+\.\d{2}$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/,/g, '')) || 0;
  }

  if (/,\d{1,2}$/.test(cleaned) && !/\.\d{1,2}$/.test(cleaned)) {
    return parseFloat(cleaned.replace(',', '.')) || 0;
  }

  return parseFloat(cleaned.replace(/,/g, '')) || 0;
}

export function parseDate(value) {
  if (!value) return '';
  const cleaned = value.replace(/[^\w\s\-\/,.]/g, '').trim();
  const dmy = cleaned.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);

  if (dmy) {
    const [, day, month, year] = dmy;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = new Date(cleaned);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  return cleaned;
}

export function extractCurrency(text) {
  if (text.includes('€') || /\beur\b/i.test(text)) return 'EUR';
  if (text.includes('£') || /\bgbp\b/i.test(text)) return 'GBP';
  if (/\bbam\b/i.test(text) || /\bkm\b/i.test(text)) return 'BAM';
  if (/\bchf\b/i.test(text)) return 'CHF';
  if (/\busd\b/i.test(text) || text.includes('$')) return 'USD';
  return 'USD';
}

export function extractDocType(text) {
  const lower = text.toLowerCase();
  if (/purchase\s*order|p\.o\.|po\s*number|po#|po\s*#|\bpo-\d+/.test(lower)) {
    return 'purchase_order';
  }
  if (/invoice|inv\s|inv#|inv\s*#|\binv-\d+/.test(lower)) return 'invoice';
  return 'unknown';
}

export function extractLineItems(text) {
  const items = [];
  const patterns = [
    /(\d+(?:\.\d+)?)\s*[xX×]\s+(.+?)\s+[@aAtT]\s*(?:[$€£]|USD|EUR|GBP|BAM|KM|CHF)?\s*([\d.,]+)\s*(?:=|total:?)?\s*(?:[$€£]|USD|EUR|GBP|BAM|KM|CHF)?\s*([\d.,]+)?/gim,
    /^(.+?)\s+(\d+(?:\.\d+)?)\s+(?:[$€£]|USD|EUR|GBP|BAM|KM|CHF)?\s*([\d.,]+)\s+(?:[$€£]|USD|EUR|GBP|BAM|KM|CHF)?\s*([\d.,]+)$/gim,
    /(\d+(?:\.\d+)?)\s+(.+?)\s+(?:[$€£]|USD|EUR|GBP|BAM|KM|CHF)?\s*([\d.,]+)\s+(?:[$€£]|USD|EUR|GBP|BAM|KM|CHF)?\s*([\d.,]+)/gim,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const item = pattern.source.startsWith('^(.+?)')
        ? buildItem(match[1], match[2], match[3], match[4])
        : buildItem(match[2], match[1], match[3], match[4]);

      if (item) items.push(item);
    }

    if (items.length > 0) break;
  }

  return items;
}

function buildItem(description, quantityRaw, unitPriceRaw, totalRaw) {
  const quantity = Number(quantityRaw) || 1;
  const unitPrice = extractAmount(unitPriceRaw);
  const total = totalRaw ? extractAmount(totalRaw) : quantity * unitPrice;
  const cleanDescription = description?.trim().replace(/^[-*]\s*/, '') || 'Item';

  if (unitPrice <= 0 || cleanDescription.length < 2 || cleanDescription.length > 120) {
    return null;
  }

  return {
    description: cleanDescription,
    quantity,
    unitPrice,
    total: total || quantity * unitPrice,
  };
}

export function extractFromText(text, fileName = '') {
  const combined = `${text} ${fileName}`;
  const docType = extractDocType(combined);

  const supplier = extractField(text, [
    /(?:from|supplier|vendor|company|bill from|sold by)[:\s]+([^\n]+)/,
    /^([A-Z][A-Za-z\s&.,]+(?:Ltd|Inc|LLC|Corp|GmbH|d\.o\.o|Co|AS)\.?)/,
  ]);

  const docNumber = extractField(text, [
    /(?:invoice|inv|po|purchase order|order|document)\s*(?:#|no\.?|number)?[:\s]*([A-Z0-9\-\/]+)/,
    /(?:#|no\.?|number)[:\s]*([A-Z0-9\-\/]+)/,
    /\b([A-Z]{2,4}[\-\/]?\d{3,})\b/,
  ]);

  const issueDate = parseDate(
    extractField(text, [
      /(?:issue date|invoice date|order date|dated|date)[:\s]+([^\n]{6,30})/,
    ])
  );

  const dueDate = parseDate(
    extractField(text, [
      /(?:due date|payment due|due by|pay by|expected delivery|delivery date|due)[:\s]+([^\n]{6,30})/,
    ])
  );

  const currency = extractCurrency(text);
  const lineItems = extractLineItems(text);

  const subtotalStr = extractField(text, [
    /(?:^|\n)\s*(?:subtotal|sub-total|sub total|net)[:\s]*(?:[$€£]|USD|EUR|GBP|BAM|KM|CHF)?\s*([\d.,]+)/,
  ]);
  const taxStr = extractField(text, [
    /(?:^|\n)\s*(?:tax|vat|gst)[^:]*[:\s]*(?:[$€£]|USD|EUR|GBP|BAM|KM|CHF)?\s*([\d.,]+)/,
  ]);
  const totalStr = extractField(text, [
    /(?:^|\n)\s*(?:grand total|total amount|total due|amount due|balance due|total)[:\s]*(?:[$€£]|USD|EUR|GBP|BAM|KM|CHF)?\s*([\d.,]+)/,
  ]);

  const subtotal = extractAmount(subtotalStr) || lineItems.reduce((sum, item) => sum + item.total, 0);
  const tax = extractAmount(taxStr);
  const total = extractAmount(totalStr) || subtotal + tax;

  return {
    docType,
    supplier,
    docNumber,
    issueDate,
    dueDate,
    currency,
    lineItems,
    subtotal,
    tax,
    total,
  };
}

export function extractFromCSV(rows, fileName) {
  const first = rows[0] || {};
  const items = rows
    .map((row) => {
      const description =
        row.description || row.desc || row.item || row.product || row.name || row.service || '';
      const quantity = Number(row.quantity || row.qty || row.units || '1') || 1;
      const unitPrice = extractAmount(row.unit_price || row.price || row.rate || row.cost || '0');
      const total =
        extractAmount(row.total || row.amount || row.line_total || row.line_amount || '0') ||
        quantity * unitPrice;

      return {
        description: description || 'Item',
        quantity,
        unitPrice,
        total,
      };
    })
    .filter((item) => item.unitPrice > 0 || item.total > 0);

  const subtotal = extractAmount(first.subtotal) || items.reduce((sum, item) => sum + item.total, 0);
  const tax = extractAmount(first.tax || first.vat || first.gst);
  const total = extractAmount(first.grand_total || first.total_due || first.document_total) || subtotal + tax;

  return {
    docType: extractDocType(`${fileName} ${JSON.stringify(first)}`),
    supplier: first.supplier || first.vendor || first.company || '',
    docNumber: first.document_number || first.doc_number || first.invoice_number || first.po_number || '',
    issueDate: parseDate(first.issue_date || first.invoice_date || first.order_date || first.date || ''),
    dueDate: parseDate(first.due_date || first.payment_due || first.expected_delivery || ''),
    currency: first.currency || extractCurrency(JSON.stringify(rows)),
    lineItems: items,
    subtotal,
    tax,
    total,
  };
}
