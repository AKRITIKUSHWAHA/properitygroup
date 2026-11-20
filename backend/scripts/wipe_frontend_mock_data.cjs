const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../../frontend/src');

// 1. Wipe jobs.js INITIAL_JOBS
const jobsPath = path.join(root, 'mock/jobs.js');
let jobsCode = fs.readFileSync(jobsPath, 'utf8');
const jobsRegex = /export const INITIAL_JOBS = \[[\s\S]*?\];\s*export const getStoredJobs/;
if (jobsRegex.test(jobsCode)) {
  const replacement = `export const INITIAL_JOBS = [];\n\nexport const getStoredJobs = () => {\n  try {\n    if (!localStorage.getItem('njs_fresh_clean_state_v1')) {\n      localStorage.removeItem('propertygroup_jobs');\n      localStorage.setItem('njs_fresh_clean_state_v1', 'true');\n      return [];\n    }\n    const raw = localStorage.getItem('propertygroup_jobs');\n    if (raw) return JSON.parse(raw);\n  } catch (e) {\n    console.error(e);\n  }\n  return [];\n};\n\nexport const getStoredJobsLegacy`;
  jobsCode = jobsCode.replace(jobsRegex, replacement);
  // Also fix the duplicate function name or cleanup
  jobsCode = jobsCode.replace('export const getStoredJobsLegacy = () => {', '// legacy\nconst _unused = () => {');
  fs.writeFileSync(jobsPath, jobsCode, 'utf8');
  console.log('✓ Wiped jobs.js dummy data');
} else {
  console.log('⚠ Could not find INITIAL_JOBS pattern in jobs.js');
}

// 2. Wipe leads.js INITIAL_LEADS
const leadsPath = path.join(root, 'mock/leads.js');
let leadsCode = fs.readFileSync(leadsPath, 'utf8');
const leadsRegex = /export const INITIAL_LEADS = \[[\s\S]*?\];\s*const LEADS_STORAGE_KEY/;
if (leadsRegex.test(leadsCode)) {
  const replacement = `export const INITIAL_LEADS = [];\n\nconst LEADS_STORAGE_KEY = 'propertygroup_crm_leads_v1';\n\nexport const getStoredLeads = () => {\n  try {\n    if (!localStorage.getItem('njs_fresh_leads_clean_v1')) {\n      localStorage.removeItem(LEADS_STORAGE_KEY);\n      localStorage.setItem('njs_fresh_leads_clean_v1', 'true');\n      return [];\n    }\n    const raw = localStorage.getItem(LEADS_STORAGE_KEY);\n    if (raw) {\n      const parsed = JSON.parse(raw);\n      if (Array.isArray(parsed)) return parsed;\n    }\n  } catch (e) {\n    console.error('Failed reading leads from storage', e);\n  }\n  return [];\n};\n\nconst _legacyLeads`;
  leadsCode = leadsCode.replace(leadsRegex, replacement);
  leadsCode = leadsCode.replace('export const getStoredLeads = () => {', '// legacy\nconst _unusedLeads = () => {');
  fs.writeFileSync(leadsPath, leadsCode, 'utf8');
  console.log('✓ Wiped leads.js dummy data');
} else {
  console.log('⚠ Could not find INITIAL_LEADS pattern in leads.js');
}

// 3. Wipe quotes.js INITIAL_QUOTES
const quotesPath = path.join(root, 'mock/quotes.js');
let quotesCode = fs.readFileSync(quotesPath, 'utf8');
const quotesRegex = /export const INITIAL_QUOTES = \[[\s\S]*?\];\s*export const getStoredQuotes/;
if (quotesRegex.test(quotesCode)) {
  const replacement = `export const INITIAL_QUOTES = [];\n\nexport const getStoredQuotes = () => {\n  try {\n    if (!localStorage.getItem('njs_fresh_quotes_clean_v1')) {\n      localStorage.removeItem('propertygroup_quotes');\n      localStorage.setItem('njs_fresh_quotes_clean_v1', 'true');\n      return [];\n    }\n    const raw = localStorage.getItem('propertygroup_quotes');\n    if (raw) return JSON.parse(raw);\n  } catch (e) {\n    console.error(e);\n  }\n  return [];\n};\n\nconst _unusedQuotes`;
  quotesCode = quotesCode.replace(quotesRegex, replacement);
  quotesCode = quotesCode.replace('export const getStoredQuotes = () => {', '// legacy\nconst _legacyQuotes = () => {');
  fs.writeFileSync(quotesPath, quotesCode, 'utf8');
  console.log('✓ Wiped quotes.js dummy data');
} else {
  console.log('⚠ Could not find INITIAL_QUOTES pattern in quotes.js');
}

// 4. Wipe terms.js INITIAL_AGREEMENTS
const termsPath = path.join(root, 'mock/terms.js');
let termsCode = fs.readFileSync(termsPath, 'utf8');
const termsRegex = /export const INITIAL_AGREEMENTS = \[[\s\S]*?\];\s*export const getStoredAgreements/;
if (termsRegex.test(termsCode)) {
  const replacement = `export const INITIAL_AGREEMENTS = [];\n\nexport const getStoredAgreements = () => {\n  try {\n    if (!localStorage.getItem('njs_fresh_agreements_clean_v1')) {\n      localStorage.removeItem('propertygroup_agreements');\n      localStorage.setItem('njs_fresh_agreements_clean_v1', 'true');\n      return [];\n    }\n    const raw = localStorage.getItem('propertygroup_agreements');\n    if (raw) return JSON.parse(raw);\n  } catch (e) {\n    console.error(e);\n  }\n  return [];\n};\n\nconst _unusedTerms`;
  termsCode = termsCode.replace(termsRegex, replacement);
  termsCode = termsCode.replace('export const getStoredAgreements = () => {', '// legacy\nconst _legacyTerms = () => {');
  fs.writeFileSync(termsPath, termsCode, 'utf8');
  console.log('✓ Wiped terms.js dummy data');
} else {
  console.log('⚠ Could not find INITIAL_AGREEMENTS pattern in terms.js');
}

// 5. Wipe messages.js INITIAL_CONVERSATIONS
const messagesPath = path.join(root, 'mock/messages.js');
let messagesCode = fs.readFileSync(messagesPath, 'utf8');
const messagesRegex = /export const INITIAL_CONVERSATIONS = \[[\s\S]*?\];\s*const STORAGE_KEY/;
if (messagesRegex.test(messagesCode)) {
  const replacement = `export const INITIAL_CONVERSATIONS = [];\n\nconst STORAGE_KEY = 'propertygroup_conversations_v1';`;
  messagesCode = messagesCode.replace(messagesRegex, replacement);
  // Also clean the getter
  messagesCode = messagesCode.replace(
    /const stored = localStorage\.getItem\(STORAGE_KEY\);[\s\S]*?return INITIAL_CONVERSATIONS;/,
    `if (!localStorage.getItem('njs_fresh_messages_clean_v1')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem('njs_fresh_messages_clean_v1', 'true');
      return [];
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return [];`
  );
  fs.writeFileSync(messagesPath, messagesCode, 'utf8');
  console.log('✓ Wiped messages.js dummy data');
} else {
  console.log('⚠ Could not find INITIAL_CONVERSATIONS pattern in messages.js');
}

// 6. Wipe partners.js
const partnersPath = path.join(root, 'mock/partners.js');
let partnersCode = fs.readFileSync(partnersPath, 'utf8');
partnersCode = partnersCode.replace(/export const PARTNER_AGENCIES = \[[\s\S]*?\];/, 'export const PARTNER_AGENCIES = [];');
partnersCode = partnersCode.replace(/export const INITIAL_PARTNER_REFERRALS = \[[\s\S]*?\];/, 'export const INITIAL_PARTNER_REFERRALS = [];');
partnersCode = partnersCode.replace(
  /const raw = localStorage\.getItem\(STORAGE_KEY\);[\s\S]*?return INITIAL_PARTNER_REFERRALS;/,
  `if (!localStorage.getItem('njs_fresh_partners_clean_v1')) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem('njs_fresh_partners_clean_v1', 'true');
    return [];
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  return [];`
);
fs.writeFileSync(partnersPath, partnersCode, 'utf8');
console.log('✓ Wiped partners.js dummy data');

// 7. Wipe clientProfiles.js
const clientProfilesPath = path.join(root, 'mock/clientProfiles.js');
let cpCode = fs.readFileSync(clientProfilesPath, 'utf8');
cpCode = cpCode.replace(/export const INITIAL_CLIENT_PROFILES = \{[\s\S]*?\};\s*export const getClientProfile/, `export const INITIAL_CLIENT_PROFILES = {};\n\nexport const getClientProfile`);
fs.writeFileSync(clientProfilesPath, cpCode, 'utf8');
console.log('✓ Wiped clientProfiles.js dummy data');

// 8. Wipe AdminCompaniesPage.jsx default mock state
const compPagePath = path.join(root, 'pages/admin/AdminCompaniesPage.jsx');
let compCode = fs.readFileSync(compPagePath, 'utf8');
compCode = compCode.replace(/const \[companies, setCompanies\] = useState\(\[[\s\S]*?\]\);/, 'const [companies, setCompanies] = useState([]);');
fs.writeFileSync(compPagePath, compCode, 'utf8');
console.log('✓ Wiped AdminCompaniesPage.jsx dummy companies');

console.log('🏁 All mock and dummy data wiped successfully across frontend!');

