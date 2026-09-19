/**
 * Identifier Validation and Normalization Helper
 * Accepts:
 *  - Valid Email Address (e.g. user@example.com)
 *  - Valid Indian Mobile Number (e.g. 9876543210, +919876543210, +91 9876543210, 09876543210)
 * Rejects arbitrary strings (e.g. "mr", "abc", "12345")
 */
function validateAndNormalizeIdentifier(input) {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      type: null,
      normalized: null,
      error: 'Enter a valid email address or mobile number.'
    };
  }

  const raw = input.trim();
  if (!raw) {
    return {
      isValid: false,
      type: null,
      normalized: null,
      error: 'Enter a valid email address or mobile number.'
    };
  }

  // 1. Email Validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(raw)) {
    return {
      isValid: true,
      type: 'email',
      normalized: raw.toLowerCase(),
      error: null
    };
  }

  // 2. Indian Mobile Number Validation & Normalization
  // Strip whitespace, hyphens, and parentheses
  const cleaned = raw.replace(/[\s\-\(\)]/g, '');

  let digits = cleaned;
  if (digits.startsWith('+91')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  // Valid Indian mobile numbers are 10 digits starting with 6, 7, 8, or 9
  const mobileRegex = /^[6-9]\d{9}$/;
  if (mobileRegex.test(digits)) {
    return {
      isValid: true,
      type: 'mobile',
      normalized: `+91${digits}`,
      error: null
    };
  }

  return {
    isValid: false,
    type: null,
    normalized: null,
    error: 'Enter a valid email address or mobile number.'
  };
}

module.exports = {
  validateAndNormalizeIdentifier
};
