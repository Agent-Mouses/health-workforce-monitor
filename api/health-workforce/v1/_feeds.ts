/**
 * Feed Registry — api/health-workforce/v1/_feeds.ts
 *
 * Health workforce RSS feeds organized by tier and category.
 *
 * Tier 1: Core sources — federal agencies, flagship policy outlets
 * Tier 2: Important — trade press, think tanks, associations
 * Tier 3: Supplementary — journals, niche sources, Google News proxies
 */

const gn = (q: string, hl = 'en-US', gl = 'US') =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=${hl}&gl=${gl}&ceid=${gl}:en`;

export interface FeedEntry {
  name: string;
  url: string;
  tier: 1 | 2 | 3;
  category: Category;
  tags: string[];
}

export type Category =
  | 'nursing'
  | 'chw'
  | 'rural'
  | 'medicaid'
  | 'workforce-policy'
  | 'education'
  | 'international'
  | 'general';

// ── Tier 1 ────────────────────────────────────────────────────────────

const TIER1: FeedEntry[] = [
  { name: 'Health Affairs Blog', url: 'https://www.healthaffairs.org/do/section/blog/feed/', tier: 1, category: 'workforce-policy', tags: ['policy', 'research'] },
  { name: 'KFF Health News', url: 'https://kffhealthnews.org/feed/', tier: 1, category: 'workforce-policy', tags: ['policy', 'medicaid'] },
  { name: 'HRSA News', url: gn('site:hrsa.gov'), tier: 1, category: 'workforce-policy', tags: ['federal', 'HRSA'] },
  { name: 'CMS Newsroom', url: gn('site:cms.gov newsroom'), tier: 1, category: 'medicaid', tags: ['federal', 'CMS', 'medicaid'] },
  { name: 'Modern Healthcare', url: 'https://www.modernhealthcare.com/section/rss', tier: 1, category: 'general', tags: ['industry'] },
  { name: 'Fierce Healthcare', url: 'https://www.fiercehealthcare.com/rss/xml', tier: 1, category: 'general', tags: ['industry'] },
  { name: "Becker's Hospital Review", url: 'https://www.beckershospitalreview.com/rss/all-news.xml', tier: 1, category: 'general', tags: ['industry', 'hospital'] },
  { name: 'STAT News', url: 'https://www.statnews.com/feed/', tier: 1, category: 'general', tags: ['health', 'policy'] },
  { name: 'AHA News', url: gn('site:aha.org news'), tier: 1, category: 'workforce-policy', tags: ['hospital', 'AHA'] },
];

// ── Tier 2 ────────────────────────────────────────────────────────────

const TIER2: FeedEntry[] = [
  // Nursing
  { name: 'American Nurse', url: gn('"American Nurse" OR "ANA" nursing workforce'), tier: 2, category: 'nursing', tags: ['nursing', 'ANA'] },
  { name: 'Nurse.com', url: gn('site:nurse.com'), tier: 2, category: 'nursing', tags: ['nursing'] },
  { name: 'NCSBN News', url: gn('site:ncsbn.org OR "Nurse Licensure Compact"'), tier: 2, category: 'nursing', tags: ['nursing', 'NLC', 'licensure'] },
  { name: 'Nursing Times', url: 'https://www.nursingtimes.net/feed/', tier: 2, category: 'nursing', tags: ['nursing', 'UK'] },
  // CHW
  { name: 'NACHW News', url: gn('"community health worker" OR CHW certification OR NACHW'), tier: 2, category: 'chw', tags: ['CHW'] },
  // Rural
  { name: 'NRHA News', url: gn('site:ruralhealth.us OR "rural health" workforce'), tier: 2, category: 'rural', tags: ['rural', 'NRHA'] },
  { name: 'Rural Health Info', url: gn('site:ruralhealthinfo.org'), tier: 2, category: 'rural', tags: ['rural'] },
  // Medicaid
  { name: 'MACPAC', url: gn('site:macpac.gov'), tier: 2, category: 'medicaid', tags: ['medicaid', 'MACPAC'] },
  { name: 'NASHP Blog', url: 'https://nashp.org/feed/', tier: 2, category: 'medicaid', tags: ['state-policy', 'NASHP'] },
  { name: 'Georgetown CCF', url: 'https://ccf.georgetown.edu/feed/', tier: 2, category: 'medicaid', tags: ['medicaid', 'children'] },
  // Think tanks
  { name: 'Commonwealth Fund', url: 'https://www.commonwealthfund.org/rss', tier: 2, category: 'workforce-policy', tags: ['policy', 'research'] },
  { name: 'Brookings Health', url: gn('site:brookings.edu health workforce'), tier: 2, category: 'workforce-policy', tags: ['policy'] },
  { name: 'Urban Institute Health', url: gn('site:urban.org health workforce medicaid'), tier: 2, category: 'workforce-policy', tags: ['policy', 'medicaid'] },
  // Education / Pipeline
  { name: 'AAMC News', url: gn('site:aamc.org'), tier: 2, category: 'education', tags: ['GME', 'physician', 'medical-education'] },
  { name: 'AACN News', url: gn('site:aacnnursing.org'), tier: 2, category: 'education', tags: ['nursing-education', 'AACN'] },
  // SBHC
  { name: 'SBHA News', url: gn('"school-based health" OR SBHC'), tier: 2, category: 'chw', tags: ['SBHC', 'school-health'] },
  // International
  { name: 'WHO Health Workforce', url: gn('site:who.int health workforce'), tier: 2, category: 'international', tags: ['WHO', 'global'] },
  { name: 'ICN News', url: gn('"International Council of Nurses" OR site:icn.ch'), tier: 2, category: 'international', tags: ['nursing', 'global'] },
];

// ── Tier 3 (Google News proxies + journals) ───────────────────────────

const TIER3: FeedEntry[] = [
  // Nursing workforce
  { name: 'GNews: nurse staffing ratio', url: gn('"nurse staffing" OR "staffing ratio" OR "nurse-to-patient"'), tier: 3, category: 'nursing', tags: ['nursing', 'staffing'] },
  { name: 'GNews: nursing shortage', url: gn('"nursing shortage" OR "nurse vacancy" OR "nurse turnover"'), tier: 3, category: 'nursing', tags: ['nursing', 'shortage'] },
  { name: 'GNews: travel nurse', url: gn('"travel nurse" OR "agency nurse" OR "temporary nurse staffing"'), tier: 3, category: 'nursing', tags: ['nursing', 'travel-nurse'] },
  { name: 'GNews: nurse strike union', url: gn('nurse strike OR "nurse union" OR "healthcare union" collective bargaining'), tier: 3, category: 'nursing', tags: ['nursing', 'labor'] },
  { name: 'GNews: NLC compact', url: gn('"Nurse Licensure Compact" OR "eNLC" OR "interstate nurse license"'), tier: 3, category: 'nursing', tags: ['NLC', 'licensure'] },
  { name: 'GNews: NP scope of practice', url: gn('"nurse practitioner" "scope of practice" OR "full practice authority" APRN'), tier: 3, category: 'nursing', tags: ['NP', 'scope-of-practice'] },
  // CHW
  { name: 'GNews: CHW Medicaid', url: gn('"community health worker" Medicaid OR reimbursement OR certification'), tier: 3, category: 'chw', tags: ['CHW', 'medicaid'] },
  // Rural
  { name: 'GNews: rural hospital closure', url: gn('"rural hospital" closure OR "critical access hospital" OR "rural health clinic"'), tier: 3, category: 'rural', tags: ['rural', 'hospital-closure'] },
  { name: 'GNews: HPSA shortage', url: gn('HPSA OR "health professional shortage area" OR "medically underserved"'), tier: 3, category: 'rural', tags: ['rural', 'HPSA'] },
  // Medicaid
  { name: 'GNews: Medicaid work requirements', url: gn('Medicaid "work requirements" OR "Medicaid cuts" OR "Medicaid eligibility"'), tier: 3, category: 'medicaid', tags: ['medicaid', 'work-requirements'] },
  { name: 'GNews: Medicaid expansion', url: gn('Medicaid expansion workforce OR provider OR reimbursement'), tier: 3, category: 'medicaid', tags: ['medicaid', 'expansion'] },
  // Education / Pipeline
  { name: 'GNews: GME residency', url: gn('"graduate medical education" OR "GME" OR "residency slots" OR "Title VII"'), tier: 3, category: 'education', tags: ['GME', 'pipeline'] },
  { name: 'GNews: nursing school', url: gn('"nursing school" capacity OR enrollment OR "nursing faculty shortage"'), tier: 3, category: 'education', tags: ['nursing-education', 'pipeline'] },
  // International recruitment
  { name: 'GNews: international nurse H-1B', url: gn('"international nurse" OR "foreign-educated nurse" OR "H-1B nurse" OR NCLEX'), tier: 3, category: 'international', tags: ['international', 'H-1B'] },
  // Telehealth
  { name: 'GNews: telehealth workforce', url: gn('telehealth workforce OR "telehealth nursing" OR "remote patient monitoring" staffing'), tier: 3, category: 'workforce-policy', tags: ['telehealth'] },
  // Behavioral health
  { name: 'GNews: behavioral health workforce', url: gn('"behavioral health" workforce OR "mental health" workforce shortage'), tier: 3, category: 'workforce-policy', tags: ['behavioral-health'] },
  // AI in healthcare workforce
  { name: 'GNews: AI healthcare workforce', url: gn('AI healthcare workforce OR "artificial intelligence" nursing OR "AI" "health workers"'), tier: 3, category: 'workforce-policy', tags: ['AI', 'technology'] },
  // Opioid
  { name: 'GNews: opioid treatment workforce', url: gn('opioid treatment workforce OR buprenorphine provider OR "MAT" "medication-assisted"'), tier: 3, category: 'workforce-policy', tags: ['opioid', 'OUD'] },
  // Patient safety & staffing (dissertation topic)
  { name: 'GNews: nurse staffing patient safety', url: gn('"patient safety" nurse staffing OR "nurse-to-patient ratio" outcomes'), tier: 3, category: 'nursing', tags: ['patient-safety', 'staffing'] },
  // Value-based care & payment reform
  { name: 'GNews: value-based care workforce', url: gn('"value-based" care workforce OR "primary care payment reform" OR "alternative payment model"'), tier: 3, category: 'workforce-policy', tags: ['VBP', 'payment-reform'] },
  // Direct Primary Care / Concierge (HWRC research)
  { name: 'GNews: direct primary care', url: gn('"direct primary care" OR "concierge medicine" OR DPC physician'), tier: 3, category: 'workforce-policy', tags: ['DPC', 'primary-care'] },
];

export const ALL_FEEDS: FeedEntry[] = [...TIER1, ...TIER2, ...TIER3];

export function feedsByTier(...tiers: number[]): FeedEntry[] {
  const s = new Set(tiers);
  return ALL_FEEDS.filter(f => s.has(f.tier));
}

export function feedsByCategory(cat: Category): FeedEntry[] {
  return ALL_FEEDS.filter(f => f.category === cat);
}
