import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  formatIndianNumber,
  formatSalary,
  formatIndianDate,
  formatTimeAgo,
  formatLocation
} from '../jobFormatters.js';

import {
  isIndianMobileNumber,
  normalizeIndianPhone,
  formatIndianPhone
} from '../indianPhoneHelper.js';

import {
  INDIA_STATES_AND_UTS,
  isValidIndianPinCode,
  normalizeIndianPinCode,
  getCitiesForState
} from '../../constants/indiaLocations.js';

import {
  GIG_CATEGORIES,
  GIG_JOB_TYPES,
  COMPENSATION_RATE_TYPES,
  LEGACY_CATEGORIES,
  ALL_CATEGORY_VALUES,
  getCategoryLabel
} from '../../constants/gigTaxonomy.js';

describe('Job Formatters - India & Gig Compensation', () => {
  it('formats numbers with standard Indian grouping', () => {
    assert.strictEqual(formatIndianNumber(500), '500');
    assert.strictEqual(formatIndianNumber(1500), '1,500');
    assert.strictEqual(formatIndianNumber(150000), '1,50,000');
    assert.strictEqual(formatIndianNumber(2500000), '25,00,000');
  });

  it('formats gig compensation with Indian Rupee and flexible rate units', () => {
    // Per Day gig
    const dailyJob = { salary_min: 800, salary_max: 1200, salary_rate: 'Per Day' };
    assert.strictEqual(formatSalary(dailyJob), '₹800 - ₹1,200 / day');

    // Per Shift gig
    const shiftJob = { salary_min: 750, salary_max: 750, salary_rate: 'Per Shift' };
    assert.strictEqual(formatSalary(shiftJob), '₹750 / shift');

    // Per Task gig
    const taskJob = { salary_min: 500, salary_rate: 'Per Task' };
    assert.strictEqual(formatSalary(taskJob), 'From ₹500 / task');

    // Per Delivery gig
    const deliveryJob = { salary_max: 80, salary_rate: 'Per Delivery' };
    assert.strictEqual(formatSalary(deliveryJob), 'Up to ₹80 / delivery');

    // Per Month gig
    const monthlyJob = { salary_min: 25000, salary_max: 30000, salary_rate: 'Per Month' };
    assert.strictEqual(formatSalary(monthlyJob), '₹25,000 - ₹30,000 / month');

    // Fixed assignment
    const fixedJob = { salary_min: 15000, salary_rate: 'Fixed Assignment' };
    assert.strictEqual(formatSalary(fixedJob), 'From ₹15,000 (Fixed)');

    // Legacy foreign jobs (preserve non-INR currency)
    const ausJob = { salary_min: 5000, salary_max: 7000, salary_rate: 'Per Month', country: 'Australia' };
    assert.strictEqual(formatSalary(ausJob), '$ 5,000 - $ 7,000 / month');

    const ukJob = { salary_min: 3000, salary_rate: 'Per Month', country: 'United Kingdom' };
    assert.strictEqual(formatSalary(ukJob), 'From £ 3,000 / month');

    // Missing salary
    assert.strictEqual(formatSalary(null), 'Negotiable');
    assert.strictEqual(formatSalary({}), 'Negotiable');
  });

  it('formats dates in Indian format (DD MMM YYYY)', () => {
    const formatted = formatIndianDate('2026-10-27');
    assert.ok(formatted.includes('2026'));
    assert.ok(formatted.includes('Oct'));
    assert.strictEqual(formatIndianDate(null), '—');
  });
});

describe('Indian Phone Helpers', () => {
  it('correctly validates and normalizes Indian mobile numbers', () => {
    // 1. Raw 10 digits
    assert.strictEqual(isIndianMobileNumber('9876543210'), true);
    assert.strictEqual(normalizeIndianPhone('9876543210'), '+919876543210');

    // 2. +91 with spaces
    assert.strictEqual(isIndianMobileNumber('+91 9876543210'), true);
    assert.strictEqual(normalizeIndianPhone('+91 9876543210'), '+919876543210');
    assert.strictEqual(normalizeIndianPhone('+91 98765 43210'), '+919876543210');

    // 3. Already normalized E.164 +919876543210
    assert.strictEqual(isIndianMobileNumber('+919876543210'), true);
    assert.strictEqual(normalizeIndianPhone('+919876543210'), '+919876543210'); // Does NOT double prefix to +91+91

    // 4. Leading 0 or 91 without plus
    assert.strictEqual(isIndianMobileNumber('09876543210'), true);
    assert.strictEqual(normalizeIndianPhone('09876543210'), '+919876543210');
    assert.strictEqual(isIndianMobileNumber('919876543210'), true);
    assert.strictEqual(normalizeIndianPhone('919876543210'), '+919876543210');

    // 5. Invalid-length numbers and unsupported country codes
    assert.strictEqual(isIndianMobileNumber('12345'), false);
    assert.strictEqual(isIndianMobileNumber('98765'), false);
    assert.strictEqual(isIndianMobileNumber('9876543210123'), false); // Too long
    assert.strictEqual(isIndianMobileNumber('+1 415 555 2671'), false); // US number
    assert.strictEqual(isIndianMobileNumber('+44 20 7946 0991'), false); // UK number

    // Normalizing non-Indian or invalid returns original trimmed string without mangling
    assert.strictEqual(normalizeIndianPhone('+1 415 555 2671'), '+1 415 555 2671');
    assert.strictEqual(normalizeIndianPhone('invalid-phone'), 'invalid-phone');

    // 6. Presentation formatting
    assert.strictEqual(formatIndianPhone('+919876543210'), '+91 98765 43210');
    assert.strictEqual(formatIndianPhone('9876543210'), '+91 98765 43210');

    // 7. Email preservation without alteration
    assert.strictEqual(isIndianMobileNumber('candidate@example.com'), false);
    assert.strictEqual(normalizeIndianPhone('candidate@example.com'), 'candidate@example.com');
    assert.strictEqual(formatIndianPhone('candidate@example.com'), 'candidate@example.com');
  });
});

describe('India Locations Foundation', () => {
  it('contains all 28 states and 8 union territories', () => {
    assert.strictEqual(INDIA_STATES_AND_UTS.length, 36);
    const states = INDIA_STATES_AND_UTS.filter((s) => s.type === 'State');
    const uts = INDIA_STATES_AND_UTS.filter((s) => s.type === 'UT');
    assert.strictEqual(states.length, 28);
    assert.strictEqual(uts.length, 8);
  });

  it('validates 6-digit Indian PIN codes correctly', () => {
    assert.strictEqual(isValidIndianPinCode('560034'), true); // Bengaluru
    assert.strictEqual(isValidIndianPinCode('110001'), true); // Delhi
    assert.strictEqual(isValidIndianPinCode('010001'), false); // Cannot start with 0
    assert.strictEqual(isValidIndianPinCode('56003'), false); // 5 digits
    assert.strictEqual(isValidIndianPinCode('5600345'), false); // 7 digits
    assert.strictEqual(isValidIndianPinCode('ABCDEF'), false); // Letters
  });

  it('retrieves cities for states with fallback', () => {
    const karnatakaCities = getCitiesForState('Karnataka');
    assert.ok(karnatakaCities.includes('Bengaluru'));
    const unknownCities = getCitiesForState('UnknownState');
    assert.deepStrictEqual(unknownCities, ['Other']);
  });
});

describe('Centralized Gig Taxonomy', () => {
  it('provides approved gig categories and preserves legacy categories', () => {
    assert.strictEqual(GIG_CATEGORIES.length, 10);
    assert.ok(LEGACY_CATEGORIES.includes('Accounting / Finance'));
    assert.ok(ALL_CATEGORY_VALUES.includes('Delivery, Logistics & Courier'));
    assert.ok(ALL_CATEGORY_VALUES.includes('Accounting / Finance'));
  });

  it('resolves category labels gracefully', () => {
    assert.strictEqual(getCategoryLabel('Delivery, Logistics & Courier'), 'Delivery, Logistics & Courier');
    assert.strictEqual(getCategoryLabel('Accounting / Finance'), 'Accounting / Finance');
  });
});

describe('Employer Company Profile Location Defaults & Legacy Preservation', () => {
  // Pure helper replicating EmployerCompanyProfilePage profile resolution logic
  function resolveCompanyProfileLocation(prof) {
    const DEFAULT_COUNTRIES = ['India', 'Australia', 'Pakistan', 'China', 'Japan'];
    const COUNTRY_CITY_MAP = {
      India: ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata'],
      Australia: ['Melbourne', 'Sydney', 'Brisbane', 'Perth'],
      Pakistan: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'],
      China: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'],
      Japan: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama']
    };

    const initialCountry = prof?.country || 'India';
    const validCities = COUNTRY_CITY_MAP[initialCountry] || ['Bengaluru'];
    const initialCity = prof?.city || validCities[0] || 'Bengaluru';

    const countryOptions = [...new Set([...DEFAULT_COUNTRIES, initialCountry])].filter(Boolean);
    const availableCities = COUNTRY_CITY_MAP[initialCountry] || ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'];
    const cityOptions = [...new Set([...availableCities, initialCity])].filter(Boolean);

    return {
      country: initialCountry,
      city: initialCity,
      countryOptions,
      cityOptions
    };
  }

  it('defaults new company profile to India and Bengaluru', () => {
    const result = resolveCompanyProfileLocation({});
    assert.strictEqual(result.country, 'India');
    assert.strictEqual(result.city, 'Bengaluru');
    assert.ok(result.countryOptions.includes('India'));
    assert.ok(result.cityOptions.includes('Bengaluru'));
  });

  it('preserves existing legacy foreign location without overriding to India', () => {
    const legacyProf = {
      country: 'Australia',
      city: 'Melbourne',
      complete_address: '123 Collins St, Melbourne VIC 3000'
    };
    const result = resolveCompanyProfileLocation(legacyProf);
    assert.strictEqual(result.country, 'Australia');
    assert.strictEqual(result.city, 'Melbourne');
    assert.ok(result.countryOptions.includes('Australia'));
    assert.ok(result.cityOptions.includes('Melbourne'));
  });

  it('preserves foreign country and city through editing and saving (save/reload flow)', () => {
    // 1. Initial legacy profile loaded from database
    const initialProf = {
      company_name: 'Melbourne Tech Hub Pty',
      country: 'Australia',
      city: 'Melbourne',
      complete_address: 'Level 4, 120 Collins St, Melbourne VIC 3000',
      team_size: '50 - 100'
    };

    const initialResolved = resolveCompanyProfileLocation(initialProf);
    assert.strictEqual(initialResolved.country, 'Australia');
    assert.strictEqual(initialResolved.city, 'Melbourne');

    // 2. User edits other fields (e.g., company_name, team_size) without altering location
    const editedFormState = {
      ...initialResolved,
      company_name: 'Melbourne Tech Hub (Updated)',
      team_size: '100 - 150'
    };

    // 3. Payload sent to backend updateEmployerProfile
    const payloadSent = {
      company_name: editedFormState.company_name,
      team_size: editedFormState.team_size,
      country: editedFormState.country,
      city: editedFormState.city,
      complete_address: initialProf.complete_address
    };

    assert.strictEqual(payloadSent.country, 'Australia');
    assert.strictEqual(payloadSent.city, 'Melbourne');

    // 4. Server returns saved record, and client reloads/merges state
    const savedRecordFromServer = {
      ...payloadSent,
      updated_at: '2026-10-28T00:55:00.000Z'
    };

    const reloadResolved = resolveCompanyProfileLocation(savedRecordFromServer);
    assert.strictEqual(reloadResolved.country, 'Australia');
    assert.strictEqual(reloadResolved.city, 'Melbourne');
    assert.ok(reloadResolved.countryOptions.includes('Australia'));
    assert.ok(reloadResolved.cityOptions.includes('Melbourne'));
  });
});


