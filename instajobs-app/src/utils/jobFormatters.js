/**
 * Helpers for formatting Job database records to UI display formats
 */

export function formatSalary(job) {
  if (!job) return 'Negotiable';
  const min = job.salary_min;
  const max = job.salary_max;
  const rate = job.salary_rate ? ` / ${job.salary_rate.toLowerCase().replace('per ', '')}` : '';

  const formatNum = (num) => {
    if (num >= 1000 && num % 1000 === 0) {
      return `$${num / 1000}k`;
    }
    return `$${Number(num).toLocaleString()}`;
  };

  if (min !== undefined && min !== null && max !== undefined && max !== null) {
    return `${formatNum(min)} - ${formatNum(max)}${rate}`;
  }
  if (min !== undefined && min !== null) {
    return `From ${formatNum(min)}${rate}`;
  }
  if (max !== undefined && max !== null) {
    return `Up to ${formatNum(max)}${rate}`;
  }
  return 'Negotiable';
}

export function formatTimeAgo(dateString) {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

export function formatLocation(job) {
  if (!job) return 'Remote';
  const parts = [];
  if (job.city) parts.push(job.city);
  if (job.country) parts.push(job.country);
  if (parts.length > 0) return parts.join(', ');
  if (job.address) return job.address;
  return 'Remote';
}

export function formatCompanyName(job) {
  return job?.employer_profile?.company_name || 'Hiring Company';
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
