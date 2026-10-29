/**
 * Helpers for formatting Job database records to UI display formats.
 * Built for India-first gig marketplace with backward compatibility for legacy records.
 */

/**
 * Formats a number using the Indian numbering grouping system (Lakhs, Crores, Thousands).
 * Example:
 *   500 -> 500
 *   1500 -> 1,500
 *   150000 -> 1,50,000
 *   1500000 -> 15,00,000
 *   10000000 -> 1,00,00,000
 * @param {number|string} num
 * @returns {string}
 */
export function formatIndianNumber(num) {
  if (num === null || num === undefined || isNaN(Number(num))) return '0';
  const n = Number(num);
  // Using en-IN locale provides standard Indian grouping
  return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

/**
 * Formats compensation into an Indian Rupee representation.
 * Handles missing values, individual min/max, ranges, and rate types.
 *
 * Rate types supported:
 *  - Per Day (e.g., "₹800 - ₹1,200 / day")
 *  - Per Shift (e.g., "₹650 / shift")
 *  - Per Task (e.g., "₹500 / task")
 *  - Per Delivery (e.g., "₹60 / delivery")
 *  - Per Hour (e.g., "₹150 / hr")
 *  - Per Month (e.g., "₹25,000 / month")
 *  - Per Week (e.g., "₹4,000 / week")
 *  - Per Year (e.g., "₹3,50,000 / yr")
 *  - Fixed Assignment (e.g., "₹15,000 fixed")
 *
 * Compatibility:
 *  - If job specifies an explicit foreign currency code or dollar symbol in data, respects it.
 *  - Otherwise defaults to Indian Rupee (₹) without inventing arbitrary conversion rates.
 *  - If both min and max are missing, returns 'Negotiable'.
 *
 * @param {object} job
 * @param {object} options
 * @param {string} options.defaultCurrency - Default currency symbol (defaults to '₹')
 * @returns {string}
 */
export function formatSalary(job, options = {}) {
  if (!job) return 'Negotiable';

  const min = job.salary_min !== undefined && job.salary_min !== null && job.salary_min !== ''
    ? Number(job.salary_min)
    : null;
  const max = job.salary_max !== undefined && job.salary_max !== null && job.salary_max !== ''
    ? Number(job.salary_max)
    : null;

  if (min === null && max === null) {
    return 'Negotiable';
  }

  // Currency symbol resolution: check if explicit currency exists or if legacy job is explicitly non-Indian
  let explicitCurrency = job.currency || null;
  if (!explicitCurrency && job.country && !options.forceInr) {
    const c = String(job.country).trim().toLowerCase();
    if (c === 'australia') explicitCurrency = '$';
    else if (c === 'united states' || c === 'usa' || c === 'us') explicitCurrency = '$';
    else if (c === 'united kingdom' || c === 'uk') explicitCurrency = '£';
    else if (c === 'europe' || c === 'eu') explicitCurrency = '€';
    else if (c !== 'india' && c !== 'in' && c !== '') explicitCurrency = '$';
  }
  const symbol = explicitCurrency ? `${explicitCurrency} ` : (options.currencySymbol || '₹');

  // Rate unit normalization
  let unitText = '';
  if (job.salary_rate && typeof job.salary_rate === 'string') {
    const rawRate = job.salary_rate.trim().toLowerCase();
    if (rawRate.includes('day')) {
      unitText = ' / day';
    } else if (rawRate.includes('shift')) {
      unitText = ' / shift';
    } else if (rawRate.includes('task') || rawRate.includes('gig')) {
      unitText = ' / task';
    } else if (rawRate.includes('delivery') || rawRate.includes('order')) {
      unitText = ' / delivery';
    } else if (rawRate.includes('hour') || rawRate.includes('hr')) {
      unitText = ' / hr';
    } else if (rawRate.includes('month') || rawRate.includes('mo')) {
      unitText = ' / month';
    } else if (rawRate.includes('week') || rawRate.includes('wk')) {
      unitText = ' / week';
    } else if (rawRate.includes('year') || rawRate.includes('annum') || rawRate.includes('yr')) {
      unitText = ' / yr';
    } else if (rawRate.includes('fixed') || rawRate.includes('assignment')) {
      unitText = ' (Fixed)';
    } else {
      unitText = ` / ${rawRate.replace('per ', '')}`;
    }
  }

  const formatNum = (val) => {
    // If large number in Indian context, format cleanly with Indian grouping
    return `${symbol}${formatIndianNumber(val)}`;
  };

  if (min !== null && max !== null) {
    if (min === max) {
      return `${formatNum(min)}${unitText}`;
    }
    return `${formatNum(min)} - ${formatNum(max)}${unitText}`;
  }
  if (min !== null) {
    return `From ${formatNum(min)}${unitText}`;
  }
  if (max !== null) {
    return `Up to ${formatNum(max)}${unitText}`;
  }

  return 'Negotiable';
}

/**
 * Formats a date relative to now (e.g. "2 hours ago", "Yesterday")
 * @param {string|Date} dateString
 * @returns {string}
 */
export function formatTimeAgo(dateString) {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays} days ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

/**
 * Formats a date string in the standard Indian presentation format (DD MMM YYYY, Asia/Kolkata).
 * Example: "2026-10-27" -> "27 Oct 2026"
 * @param {string|Date} dateVal
 * @param {boolean} includeTime
 * @returns {string}
 */
export function formatIndianDate(dateVal, includeTime = false) {
  if (!dateVal) return '—';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return String(dateVal);

  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = true;
  }

  return new Intl.DateTimeFormat('en-IN', options).format(date);
}

/**
 * Formats a job's location, incorporating locality and city cleanly.
 * @param {object} job
 * @returns {string}
 */
export function formatLocation(job) {
  if (!job) return 'Remote / All India';
  const parts = [];
  if (job.city) parts.push(job.city);
  if (job.country && job.country !== 'India') parts.push(job.country);
  if (parts.length > 0) return parts.join(', ');
  if (job.address) return job.address;
  return 'Remote / Flexible Location';
}

export function formatCompanyName(job) {
  return job?.employer_profile?.company_name || 'Hiring Employer';
}

export function formatCompanyLogo(job, fallback = '/images/resource/company-logo/1-1.png') {
  return job?.employer_profile?.logo_url || fallback;
}

export function formatJobTags(job) {
  const tags = [];
  if (job?.job_type) {
    tags.push({ text: job.job_type, className: 'time' });
  }
  if (job?.career_level) {
    tags.push({ text: job.career_level, className: 'privacy' });
  }
  if (job?.category) {
    tags.push({ text: job.category, className: 'required' });
  }
  return tags;
}
