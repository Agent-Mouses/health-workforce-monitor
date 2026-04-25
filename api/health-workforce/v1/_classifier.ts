/**
 * Keyword Classifier — api/health-workforce/v1/_classifier.ts
 *
 * Classifies health workforce articles by threat/importance level and category.
 * Mirrors drone-monitor's ThreatLevel scheme for API compatibility.
 */

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type WorkforceCategory =
  | 'nursing-workforce'
  | 'licensure-regulation'
  | 'community-health'
  | 'rural-health'
  | 'medicaid-policy'
  | 'international-recruitment'
  | 'workforce-pipeline'
  | 'telehealth'
  | 'labor'
  | 'general';

export interface Classification {
  level: ThreatLevel;
  category: WorkforceCategory;
}

const RULES: Array<{ re: RegExp; level: ThreatLevel; category: WorkforceCategory }> = [
  // ── CRITICAL ──
  { re: /medicaid\s+(cut|slash|eliminat|end|repeal|block.?grant)/i, level: 'CRITICAL', category: 'medicaid-policy' },
  { re: /hospital\s+clos(ure|ing|ed)|emergency\s+room\s+clos/i, level: 'CRITICAL', category: 'rural-health' },
  { re: /nurse\s+strike|healthcare\s+strike|hospital\s+strike/i, level: 'CRITICAL', category: 'labor' },
  { re: /mass\s+layoff.{0,20}(hospital|health|nurs)/i, level: 'CRITICAL', category: 'nursing-workforce' },

  // ── HIGH ──
  { re: /nursing\s+shortage|nurse\s+shortage|RN\s+shortage|staffing\s+crisis/i, level: 'HIGH', category: 'nursing-workforce' },
  { re: /nurse.{0,10}(vacanc|turnover|burnout|leav(e|ing)\s+the\s+profession)/i, level: 'HIGH', category: 'nursing-workforce' },
  { re: /rural\s+health.{0,15}(crisis|shortage|desert)|physician\s+desert/i, level: 'HIGH', category: 'rural-health' },
  { re: /medicaid\s+work\s+require|lose\s+medicaid|medicaid\s+(disenroll|coverage\s+loss)/i, level: 'HIGH', category: 'medicaid-policy' },
  { re: /H-?1B.{0,20}(fee|ban|restrict|nurse|healthcare)/i, level: 'HIGH', category: 'international-recruitment' },
  { re: /critical\s+access\s+hospital.{0,15}(clos|risk|threat)/i, level: 'HIGH', category: 'rural-health' },
  { re: /behavioral\s+health.{0,10}(crisis|shortage|workforce)/i, level: 'HIGH', category: 'workforce-pipeline' },

  // ── MEDIUM ──
  { re: /nurse\s+licensure\s+compact|eNLC|\bNLC\b.{0,15}(state|join|adopt)/i, level: 'MEDIUM', category: 'licensure-regulation' },
  { re: /scope\s+of\s+practice|full\s+practice\s+authority|APRN.{0,15}(expand|restrict)/i, level: 'MEDIUM', category: 'licensure-regulation' },
  { re: /community\s+health\s+worker|\bCHW\b.{0,15}(certif|reimburse|medicaid|bill)/i, level: 'MEDIUM', category: 'community-health' },
  { re: /school.?based\s+health|\bSBHC\b/i, level: 'MEDIUM', category: 'community-health' },
  { re: /medicaid\s+(expan|waiver|reimburse|provider\s+rate)/i, level: 'MEDIUM', category: 'medicaid-policy' },
  { re: /rural\s+health\s+clinic|\bRHC\b.{0,10}(enroll|cms|certif)/i, level: 'MEDIUM', category: 'rural-health' },
  { re: /\bHPSA\b|health\s+professional\s+shortage|medically\s+underserved/i, level: 'MEDIUM', category: 'rural-health' },
  { re: /graduate\s+medical\s+education|\bGME\b.{0,10}(fund|slot|residen)/i, level: 'MEDIUM', category: 'workforce-pipeline' },
  { re: /nursing\s+(school|faculty|program).{0,15}(capacity|shortage|enrollment)/i, level: 'MEDIUM', category: 'workforce-pipeline' },
  { re: /international\s+nurs|foreign.?educated\s+nurs|\bNCLEX\b/i, level: 'MEDIUM', category: 'international-recruitment' },
  { re: /telehealth.{0,15}(workforce|nurs|staffing|provider)/i, level: 'MEDIUM', category: 'telehealth' },
  { re: /travel\s+nurs|agency\s+nurs|temporary\s+staffing/i, level: 'MEDIUM', category: 'nursing-workforce' },
  { re: /nurse.{0,5}(union|collective\s+bargain|CBA)/i, level: 'MEDIUM', category: 'labor' },
  { re: /opioid.{0,15}(workforce|treatment|provider|buprenorphine)/i, level: 'MEDIUM', category: 'workforce-pipeline' },
  { re: /\bAI\b.{0,15}(healthcare|nursing|health\s+worker|clinical)/i, level: 'MEDIUM', category: 'telehealth' },

  // ── LOW ──
  { re: /staffing\s+ratio|nurse.?to.?patient/i, level: 'LOW', category: 'nursing-workforce' },
  { re: /health\s+workforce|healthcare\s+workforce|health.?care\s+worker/i, level: 'LOW', category: 'general' },
  { re: /\bHRSA\b|\bNHSC\b|national\s+health\s+service\s+corps/i, level: 'LOW', category: 'workforce-pipeline' },
  { re: /title\s+(VII|VIII).{0,15}(health|nurs)/i, level: 'LOW', category: 'workforce-pipeline' },
  { re: /nurse\s+practitioner|\bAPRN\b|\bNP\b.{0,10}(bill|law|regulat)/i, level: 'LOW', category: 'licensure-regulation' },
  { re: /registered\s+nurse|\bRN\b.{0,10}(supply|demand|pipeline)/i, level: 'LOW', category: 'nursing-workforce' },
];

export function classify(title: string): Classification {
  for (const { re, level, category } of RULES) {
    if (re.test(title)) return { level, category };
  }
  return { level: 'INFO', category: 'general' };
}
