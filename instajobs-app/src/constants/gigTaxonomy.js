/**
 * Centralized Gig-Work Taxonomy & Configuration for InstaJobs
 * Source of truth for categories, job types, payment rates, payout frequencies, and shift availability.
 *
 * NOTE: Stored database values are preserved for backward compatibility with legacy jobs.
 */

// 1. Approved Gig-Work Categories (Primary + Preserved Legacy for Filtering/Display)
export const GIG_CATEGORIES = [
  {
    id: 'delivery-logistics',
    value: 'Delivery, Logistics & Courier',
    label: 'Delivery, Logistics & Courier',
    shortLabel: 'Delivery & Logistics',
    description: 'Food delivery, parcel dispatch, courier, bike runner, e-commerce fleet',
    icon: 'flaticon-delivery-truck'
  },
  {
    id: 'drivers-transport',
    value: 'Drivers & Transport',
    label: 'Drivers & Transport',
    shortLabel: 'Drivers & Transport',
    description: 'Cab driver, commercial vehicle driver, personal chauffeur, transit',
    icon: 'flaticon-car'
  },
  {
    id: 'housekeeping-cleaning',
    value: 'Housekeeping, Cleaning & Domestic Help',
    label: 'Housekeeping, Cleaning & Domestic Help',
    shortLabel: 'Cleaning & Housekeeping',
    description: 'Deep cleaning, office housekeeping, domestic help, sanitization',
    icon: 'flaticon-clean'
  },
  {
    id: 'technicians-repair',
    value: 'Technicians, Electricians & Repair',
    label: 'Technicians, Electricians & Repair',
    shortLabel: 'Technicians & Repairs',
    description: 'AC mechanic, electrician, plumber, appliance repair, carpenter',
    icon: 'flaticon-wrench'
  },
  {
    id: 'hospitality-kitchen',
    value: 'Restaurant, Hospitality & Catering',
    label: 'Restaurant, Hospitality & Catering',
    shortLabel: 'Hospitality & Kitchen',
    description: 'Kitchen steward, cook, chef, barista, waiter, event catering staff',
    icon: 'flaticon-chef'
  },
  {
    id: 'retail-warehouse',
    value: 'Retail, Warehouse & Packing',
    label: 'Retail, Warehouse & Packing',
    shortLabel: 'Retail & Warehouse',
    description: 'Store assistant, inventory picker/packer, shelf stocker, cashier',
    icon: 'flaticon-boxes'
  },
  {
    id: 'events-promotion',
    value: 'Event Staff & Temporary Promotion',
    label: 'Event Staff & Temporary Promotion',
    shortLabel: 'Events & Promotion',
    description: 'Event usher, booth promoter, brand ambassador, security helper',
    icon: 'flaticon-megaphone'
  },
  {
    id: 'moving-helpers',
    value: 'Moving, Loading & Physical Labor',
    label: 'Moving, Loading & Physical Labor',
    shortLabel: 'Moving & Loading',
    description: 'Packers and movers, warehouse loaders, helper, physical crew',
    icon: 'flaticon-package'
  },
  {
    id: 'tutors-home-services',
    value: 'Tutors, Trainers & Home Services',
    label: 'Tutors, Trainers & Home Services',
    shortLabel: 'Tutors & Local Services',
    description: 'Home tutor, fitness coach, local instructor, elder assistance',
    icon: 'flaticon-graduation-cap'
  },
  {
    id: 'digital-freelance',
    value: 'Digital Freelance, Design & Online Tasks',
    label: 'Digital Freelance, Design & Online Tasks',
    shortLabel: 'Digital & Freelance',
    description: 'Graphic design, telecalling, content writing, data entry, virtual assistance',
    icon: 'flaticon-laptop'
  }
];

// Preserved Legacy Categories to prevent breaking existing jobs or filter matching
export const LEGACY_CATEGORIES = [
  'Accounting / Finance',
  'Automotive Jobs',
  'Customer',
  'Design',
  'Development',
  'Health and Care',
  'Marketing',
  'Project Management'
];

// All category strings for unified filter lists (Gig first, then legacy for backwards compatibility)
export const ALL_CATEGORY_VALUES = [
  ...GIG_CATEGORIES.map((c) => c.value),
  ...LEGACY_CATEGORIES
];

// 2. Job & Engagement Types (Gig-First + Legacy)
export const GIG_JOB_TYPES = [
  {
    id: 'daily-gig',
    value: 'Daily Gig',
    label: 'Daily Gig (1–3 Days)',
    badgeColor: 'primary'
  },
  {
    id: 'shift-based',
    value: 'Shift Based',
    label: 'Shift Based',
    badgeColor: 'info'
  },
  {
    id: 'task-based',
    value: 'Task / Deliverable Based',
    label: 'Task / Deliverable Based',
    badgeColor: 'success'
  },
  {
    id: 'part-time',
    value: 'Part Time',
    label: 'Part Time (Flexible)',
    badgeColor: 'warning'
  },
  {
    id: 'temporary',
    value: 'Temporary',
    label: 'Temporary / Seasonal',
    badgeColor: 'secondary'
  },
  {
    id: 'freelance',
    value: 'Freelance',
    label: 'Freelance / Remote',
    badgeColor: 'info'
  },
  {
    id: 'full-time',
    value: 'Full Time',
    label: 'Full Time (Direct Role)',
    badgeColor: 'dark'
  },
  {
    id: 'internship',
    value: 'Internship',
    label: 'Internship / Apprenticeship',
    badgeColor: 'light'
  }
];

export const ALL_JOB_TYPE_VALUES = GIG_JOB_TYPES.map((t) => t.value);

// 3. Compensation Rate Types (Per Day, Per Shift, Per Task, etc.)
export const COMPENSATION_RATE_TYPES = [
  {
    id: 'per-day',
    value: 'Per Day',
    label: 'Per Day',
    unit: 'day'
  },
  {
    id: 'per-shift',
    value: 'Per Shift',
    label: 'Per Shift',
    unit: 'shift'
  },
  {
    id: 'per-task',
    value: 'Per Task',
    label: 'Per Task / Gig',
    unit: 'task'
  },
  {
    id: 'per-delivery',
    value: 'Per Delivery',
    label: 'Per Delivery / Order',
    unit: 'delivery'
  },
  {
    id: 'per-hour',
    value: 'Per Hour',
    label: 'Per Hour',
    unit: 'hr'
  },
  {
    id: 'per-month',
    value: 'Per Month',
    label: 'Per Month',
    unit: 'month'
  },
  {
    id: 'fixed-assignment',
    value: 'Fixed Assignment',
    label: 'Fixed Assignment / Milestone',
    unit: 'assignment'
  },
  {
    id: 'per-week',
    value: 'Per Week',
    label: 'Per Week',
    unit: 'week'
  },
  {
    id: 'per-year',
    value: 'Per Year',
    label: 'Per Year (Annual)',
    unit: 'year'
  }
];

export const ALL_COMPENSATION_RATE_VALUES = COMPENSATION_RATE_TYPES.map((r) => r.value);

// 4. Payout Frequencies (Explicit options for jobs that specify payout schedule)
export const PAYOUT_FREQUENCIES = [
  { id: 'daily', value: 'Daily', label: 'Daily (Same-Day / Next-Day)' },
  { id: 'weekly', value: 'Weekly', label: 'Weekly Payout' },
  { id: 'bi-weekly', value: 'Bi-Weekly', label: 'Bi-Weekly (Every 2 Weeks)' },
  { id: 'on-completion', value: 'On Completion', label: 'On Gig / Task Completion' },
  { id: 'monthly', value: 'Monthly', label: 'Monthly Payout' }
];

// 5. Shift & Work Timing Options
export const SHIFT_TIMINGS = [
  { id: 'day-shift', value: 'Day Shift', label: 'Morning / Day Shift' },
  { id: 'evening-shift', value: 'Evening Shift', label: 'Evening Shift' },
  { id: 'night-shift', value: 'Night Shift', label: 'Night Shift' },
  { id: 'weekend-only', value: 'Weekend Only', label: 'Weekend Only' },
  { id: 'flexible-hours', value: 'Flexible Hours', label: 'Flexible Hours' },
  { id: 'urgent-immediate', value: 'Immediate / Urgent', label: 'Immediate / Urgent Start' }
];

// Helper to look up human label from stored value
export function getCategoryLabel(val) {
  if (!val) return 'General';
  const found = GIG_CATEGORIES.find((c) => c.value.toLowerCase() === val.toLowerCase());
  return found ? found.label : val;
}

export function getJobTypeBadge(val) {
  if (!val) return { label: 'Flexible', badgeColor: 'secondary' };
  const found = GIG_JOB_TYPES.find((t) => t.value.toLowerCase() === val.toLowerCase());
  return found ? { label: found.label, badgeColor: found.badgeColor } : { label: val, badgeColor: 'secondary' };
}
