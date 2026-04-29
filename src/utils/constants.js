export const STATUS = {
  UPLOADED: 'uploaded',
  NEEDS_REVIEW: 'needs_review',
  VALIDATED: 'validated',
  REJECTED: 'rejected',
};

export const STATUS_CONFIG = {
  [STATUS.UPLOADED]: {
    label: 'Uploaded',
    dot: '#60A5FA',
    bg: '#EFF6FF',
    text: '#1E40AF',
  },
  [STATUS.NEEDS_REVIEW]: {
    label: 'Needs review',
    dot: '#FBBF24',
    bg: '#FFFBEB',
    text: '#92400E',
  },
  [STATUS.VALIDATED]: {
    label: 'Validated',
    dot: '#34D399',
    bg: '#ECFDF5',
    text: '#065F46',
  },
  [STATUS.REJECTED]: {
    label: 'Rejected',
    dot: '#F87171',
    bg: '#FEF2F2',
    text: '#991B1B',
  },
};

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: 'EUR ',
  GBP: 'GBP ',
  BAM: 'KM ',
  CHF: 'CHF ',
};

export const SUPPORTED_EXTENSIONS = ['csv', 'txt', 'pdf', 'png', 'jpg', 'jpeg'];

export const STORAGE_KEY = 'smartdoc-store-v1';
