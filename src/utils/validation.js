export function validateDocument(data) {
  const issues = [];

  if (!data.supplier) {
    issues.push({ field: 'supplier', severity: 'warning', message: 'Supplier name is missing' });
  }
  if (!data.docNumber) {
    issues.push({ field: 'docNumber', severity: 'warning', message: 'Document number is missing' });
  }
  if (!data.issueDate) {
    issues.push({ field: 'issueDate', severity: 'warning', message: 'Issue date is missing' });
  } else if (!isValidDate(data.issueDate)) {
    issues.push({ field: 'issueDate', severity: 'error', message: 'Issue date is not a valid date' });
  }
  if (data.docType === 'invoice' && !data.dueDate) {
    issues.push({ field: 'dueDate', severity: 'info', message: 'Due date is missing' });
  } else if (data.dueDate && !isValidDate(data.dueDate)) {
    issues.push({ field: 'dueDate', severity: 'error', message: 'Due date is not a valid date' });
  }
  if (data.docType === 'unknown') {
    issues.push({ field: 'docType', severity: 'warning', message: 'Could not determine document type' });
  }
  if (!data.lineItems?.length) {
    issues.push({ field: 'lineItems', severity: 'warning', message: 'No line items were detected' });
  }
  if (!data.total) {
    issues.push({ field: 'total', severity: 'error', message: 'Total amount is zero or missing' });
  }

  data.lineItems?.forEach((item, index) => {
    const expected = round(item.quantity * item.unitPrice);
    const actual = round(item.total);

    if (expected > 0 && Math.abs(expected - actual) > 0.02) {
      issues.push({
        field: `lineItem_${index}`,
        severity: 'error',
        message: `"${item.description}": ${item.quantity} x ${item.unitPrice.toFixed(2)} = ${expected.toFixed(2)}, shown as ${actual.toFixed(2)}`,
      });
    }
  });

  if (data.lineItems?.length > 0 && data.subtotal > 0) {
    const computedSubtotal = round(
      data.lineItems.reduce((sum, item) => sum + item.total, 0)
    );
    const reportedSubtotal = round(data.subtotal);

    if (Math.abs(computedSubtotal - reportedSubtotal) > 0.02) {
      issues.push({
        field: 'subtotal',
        severity: 'error',
        message: `Subtotal mismatch: items sum to ${computedSubtotal.toFixed(2)}, shown as ${reportedSubtotal.toFixed(2)}`,
      });
    }
  }

  if (data.subtotal > 0 && data.total > 0) {
    const expectedTotal = round(data.subtotal + data.tax);
    const actualTotal = round(data.total);

    if (Math.abs(expectedTotal - actualTotal) > 0.02) {
      issues.push({
        field: 'total',
        severity: 'error',
        message: `Total mismatch: ${data.subtotal.toFixed(2)} + ${data.tax.toFixed(2)} = ${expectedTotal.toFixed(2)}, shown as ${actualTotal.toFixed(2)}`,
      });
    }
  }

  if (data.issueDate && data.dueDate && isValidDate(data.issueDate) && isValidDate(data.dueDate)) {
    const issueDate = new Date(data.issueDate);
    const dueDate = new Date(data.dueDate);

    if (dueDate < issueDate) {
      issues.push({
        field: 'dueDate',
        severity: 'error',
        message: 'Due date is before issue date',
      });
    }
  }

  return issues;
}

export function findDuplicates(docs) {
  const seen = new Map();
  const duplicates = [];

  docs.forEach((doc, index) => {
    const num = doc.extracted?.docNumber;
    if (!num) return;

    const key = num.toUpperCase().replace(/\s/g, '');
    if (seen.has(key)) {
      duplicates.push({
        index,
        duplicateOf: seen.get(key),
        docNumber: num,
      });
    } else {
      seen.set(key, index);
    }
  });

  return duplicates;
}

export function deriveStatus(issues) {
  if (issues.some((i) => i.severity === 'error')) return 'needs_review';
  if (issues.some((i) => i.severity === 'warning')) return 'needs_review';
  return 'uploaded';
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function round(n) {
  return Math.round(n * 100) / 100;
}
