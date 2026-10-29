/**
 * Indian Mobile Number Normalization & Formatting Helper for InstaJobs
 *
 * Requirements:
 * 1. Supports Indian mobile numbers (10 digits starting with 6, 7, 8, or 9).
 * 2. Formats to standardized E.164 (+91XXXXXXXXXX) for backend and AuthX.
 * 3. Provides clean readable presentation (e.g., "+91 98765 43210").
 * 4. Preserves non-phone identifiers (such as emails) without alteration.
 * 5. Does not modify authentication tokens, protocols, or AuthX config.
 */

/**
 * Checks if a string looks like an Indian mobile number
 * @param {string} input
 * @returns {boolean}
 */
export function isIndianMobileNumber(input) {
  if (!input || typeof input !== 'string') return false;
  const cleaned = input.replace(/[\s\-().]/g, '');
  let digits = cleaned;
  if (digits.startsWith('+91')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }
  return /^[6-9]\d{9}$/.test(digits);
}

/**
 * Normalizes an Indian mobile number to standard E.164 (+91XXXXXXXXXX).
 * If the input is not a recognized mobile number, returns the original trimmed string.
 * @param {string} input
 * @returns {string}
 */
export function normalizeIndianPhone(input) {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  const cleaned = trimmed.replace(/[\s\-().]/g, '');

  let digits = cleaned;
  if (digits.startsWith('+91')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  if (/^[6-9]\d{9}$/.test(digits)) {
    return `+91${digits}`;
  }

  return trimmed;
}

/**
 * Formats a phone number for human-readable display.
 * E.g., "+919876543210" -> "+91 98765 43210"
 * If input is not an Indian mobile number (or is an email), returns it unmodified.
 * @param {string} phone
 * @returns {string}
 */
export function formatIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const trimmed = phone.trim();

  // If email, leave as-is
  if (trimmed.includes('@')) return trimmed;

  const cleaned = trimmed.replace(/[\s\-().]/g, '');
  let digits = cleaned;
  if (digits.startsWith('+91')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  if (/^[6-9]\d{9}$/.test(digits)) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  return trimmed;
}
