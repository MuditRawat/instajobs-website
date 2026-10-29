/**
 * India-First Location Foundation for InstaJobs
 * Source of truth for 28 Indian States, 8 Union Territories, and major employment hubs.
 * Includes format validation for 6-digit Indian PIN codes.
 */

// 28 Indian States & 8 Union Territories
export const INDIA_STATES_AND_UTS = [
  // 28 States
  { code: 'AP', name: 'Andhra Pradesh', type: 'State' },
  { code: 'AR', name: 'Arunachal Pradesh', type: 'State' },
  { code: 'AS', name: 'Assam', type: 'State' },
  { code: 'BR', name: 'Bihar', type: 'State' },
  { code: 'CG', name: 'Chhattisgarh', type: 'State' },
  { code: 'GA', name: 'Goa', type: 'State' },
  { code: 'GJ', name: 'Gujarat', type: 'State' },
  { code: 'HR', name: 'Haryana', type: 'State' },
  { code: 'HP', name: 'Himachal Pradesh', type: 'State' },
  { code: 'JH', name: 'Jharkhand', type: 'State' },
  { code: 'KA', name: 'Karnataka', type: 'State' },
  { code: 'KL', name: 'Kerala', type: 'State' },
  { code: 'MP', name: 'Madhya Pradesh', type: 'State' },
  { code: 'MH', name: 'Maharashtra', type: 'State' },
  { code: 'MN', name: 'Manipur', type: 'State' },
  { code: 'ML', name: 'Meghalaya', type: 'State' },
  { code: 'MZ', name: 'Mizoram', type: 'State' },
  { code: 'NL', name: 'Nagaland', type: 'State' },
  { code: 'OD', name: 'Odisha', type: 'State' },
  { code: 'PB', name: 'Punjab', type: 'State' },
  { code: 'RJ', name: 'Rajasthan', type: 'State' },
  { code: 'SK', name: 'Sikkim', type: 'State' },
  { code: 'TN', name: 'Tamil Nadu', type: 'State' },
  { code: 'TS', name: 'Telangana', type: 'State' },
  { code: 'TR', name: 'Tripura', type: 'State' },
  { code: 'UP', name: 'Uttar Pradesh', type: 'State' },
  { code: 'UK', name: 'Uttarakhand', type: 'State' },
  { code: 'WB', name: 'West Bengal', type: 'State' },

  // 8 Union Territories
  { code: 'AN', name: 'Andaman and Nicobar Islands', type: 'UT' },
  { code: 'CH', name: 'Chandigarh', type: 'UT' },
  { code: 'DH', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'UT' },
  { code: 'DL', name: 'Delhi', type: 'UT' },
  { code: 'JK', name: 'Jammu and Kashmir', type: 'UT' },
  { code: 'LA', name: 'Ladakh', type: 'UT' },
  { code: 'LD', name: 'Lakshadweep', type: 'UT' },
  { code: 'PY', name: 'Puducherry', type: 'UT' }
];

// Curated list of major Indian cities mapped by State/UT for cascading forms
export const STATE_CITY_MAP = {
  Karnataka: ['Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Shivamogga', 'Other (Karnataka)'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Navi Mumbai', 'Aurangabad', 'Solapur', 'Other (Maharashtra)'],
  Delhi: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Other (Delhi NCR)'],
  Telangana: ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Other (Telangana)'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Other (Tamil Nadu)'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Other (Gujarat)'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Other (West Bengal)'],
  'Uttar Pradesh': ['Noida', 'Greater Noida', 'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Other (Uttar Pradesh)'],
  Haryana: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Rohtak', 'Hisar', 'Other (Haryana)'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Other (Rajasthan)'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Other (Punjab)'],
  Chandigarh: ['Chandigarh'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Other (Madhya Pradesh)'],
  Kerala: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Other (Kerala)'],
  Bihar: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Other (Bihar)'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Other (Odisha)'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Other (Jharkhand)'],
  Chhattisgarh: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Other (Chhattisgarh)'],
  Assam: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Other (Assam)'],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Other (Goa)'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Other (Uttarakhand)'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu', 'Other (Himachal Pradesh)'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Other (Jammu & Kashmir)'],
  Ladakh: ['Leh', 'Kargil'],
  Puducherry: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Other (Andhra Pradesh)']
};

// Top 8 Indian Metro & Tier-1 Hubs for homepage and quick-search
export const TOP_INDIAN_HUBS = [
  {
    name: 'Bengaluru',
    state: 'Karnataka',
    roleLabel: 'Tech & Gig Capital',
    jobsCount: '1,200+ Gigs',
    image: '/images/resource/city-1.jpg'
  },
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    roleLabel: 'Commercial & Logistics Hub',
    jobsCount: '1,500+ Gigs',
    image: '/images/resource/city-2.jpg'
  },
  {
    name: 'Delhi NCR',
    state: 'Delhi',
    roleLabel: 'Retail, Delivery & Events',
    jobsCount: '1,800+ Gigs',
    image: '/images/resource/city-3.jpg'
  },
  {
    name: 'Hyderabad',
    state: 'Telangana',
    roleLabel: 'Services & Operations',
    jobsCount: '950+ Gigs',
    image: '/images/resource/city-4.jpg'
  },
  {
    name: 'Pune',
    state: 'Maharashtra',
    roleLabel: 'Hospitality & Fleet Hub',
    jobsCount: '800+ Gigs',
    image: '/images/resource/city-5.jpg'
  },
  {
    name: 'Chennai',
    state: 'Tamil Nadu',
    roleLabel: 'Manufacturing & Tech Logistics',
    jobsCount: '750+ Gigs',
    image: '/images/resource/city-6.jpg'
  },
  {
    name: 'Kolkata',
    state: 'West Bengal',
    roleLabel: 'Trade & Creative Services',
    jobsCount: '650+ Gigs',
    image: '/images/resource/city-7.jpg'
  },
  {
    name: 'Ahmedabad',
    state: 'Gujarat',
    roleLabel: 'Retail & Transport Hub',
    jobsCount: '600+ Gigs',
    image: '/images/resource/city-8.jpg'
  }
];

/**
 * Validates Indian PIN code format (strictly 6 digits, first digit between 1 and 9).
 * NOTE: Format validation only confirms structural correctness, not that the PIN code is assigned or real.
 * @param {string|number} pinCode
 * @returns {boolean}
 */
export function isValidIndianPinCode(pinCode) {
  if (!pinCode) return false;
  const pinStr = String(pinCode).trim();
  // Valid Indian postal codes: exactly 6 digits, cannot start with 0
  return /^[1-9][0-9]{5}$/.test(pinStr);
}

/**
 * Normalizes an Indian PIN code by stripping spaces
 * @param {string|number} pinCode
 * @returns {string|null}
 */
export function normalizeIndianPinCode(pinCode) {
  if (!pinCode) return null;
  const cleaned = String(pinCode).replace(/\s+/g, '').trim();
  return isValidIndianPinCode(cleaned) ? cleaned : null;
}

/**
 * Helper to get available cities for a chosen State
 * Falls back to generic list if state is custom or not mapped
 * @param {string} stateName
 * @returns {string[]}
 */
export function getCitiesForState(stateName) {
  if (!stateName) return [];
  return STATE_CITY_MAP[stateName] || ['Other'];
}
