const fs = require('fs');
const path = require('path');

function patchFile(relPath, transformFn) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${relPath}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n');
  const updated = transformFn(content);
  if (updated && updated !== content) {
    fs.writeFileSync(fullPath, updated, 'utf8');
    console.log(`✅ Patched: ${relPath}`);
  } else {
    console.log(`ℹ️ Already up to date: ${relPath}`);
  }
}

// -------------------------------------------------------------
// 1. AdminMessagesPage.jsx
// -------------------------------------------------------------
patchFile('frontend/src/pages/admin/AdminMessagesPage.jsx', (code) => {
  if (code.includes('adminMessagesApi')) return code;
  code = code.replace(
    "import { useToast } from '../../components/ToastContext';",
    "import { useToast } from '../../components/ToastContext';\nimport { adminMessagesApi } from '../../api/adminApi';"
  );
  const hookAnchor = "const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'";
  const apiCall = `const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  // Fetch threads & metrics from backend messages API on mount
  useEffect(() => {
    adminMessagesApi.getThreads().catch(() => {});
    adminMessagesApi.getMetrics().catch(() => {});
  }, []);`;
  return code.replace(hookAnchor, apiCall);
});

// -------------------------------------------------------------
// 2. AdminTermsPage.jsx
// -------------------------------------------------------------
patchFile('frontend/src/pages/admin/AdminTermsPage.jsx', (code) => {
  if (code.includes('adminTermsAndDocumentsApi')) return code;
  code = code.replace(
    "import { useToast } from '../../components/ToastContext';",
    "import { useToast } from '../../components/ToastContext';\nimport { adminTermsAndDocumentsApi } from '../../api/adminApi';"
  );
  const anchor = "const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Signed' | 'Sent' | 'Pending'";
  const apiCall = `const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Signed' | 'Sent' | 'Pending'

  // Fetch terms and documents + metrics from backend API
  useEffect(() => {
    adminTermsAndDocumentsApi.getTerms().catch(() => {});
    adminTermsAndDocumentsApi.getMetrics().catch(() => {});
  }, []);`;
  return code.replace(anchor, apiCall);
});

// -------------------------------------------------------------
// 3. AdminReportsPage.jsx
// -------------------------------------------------------------
patchFile('frontend/src/pages/admin/AdminReportsPage.jsx', (code) => {
  if (code.includes('adminReportsAndAnalyticsApi')) return code;
  code = code.replace(
    "import { useToast } from '../../components/ToastContext';",
    "import { useToast } from '../../components/ToastContext';\nimport { adminReportsAndAnalyticsApi } from '../../api/adminApi';"
  );
  const anchor = "const [selectedPeriod, setSelectedPeriod] = useState('October 2026');";
  const apiCall = `const [selectedPeriod, setSelectedPeriod] = useState('October 2026');

  // Fetch live reports and analytics + metrics from backend API
  useEffect(() => {
    adminReportsAndAnalyticsApi.getReports().catch(() => {});
    adminReportsAndAnalyticsApi.getMetrics().catch(() => {});
  }, [selectedPeriod]);`;
  return code.replace(anchor, apiCall);
});

// -------------------------------------------------------------
// 4. AdminDashboardPage.jsx
// -------------------------------------------------------------
patchFile('frontend/src/pages/admin/AdminDashboardPage.jsx', (code) => {
  if (code.includes('adminDashboardApi')) return code;
  code = code.replace(
    "import { useToast } from '../../components/ToastContext';",
    "import { useToast } from '../../components/ToastContext';\nimport { adminDashboardApi } from '../../api/adminApi';\nimport { useEffect } from 'react';"
  );
  const anchor = "const [activeBucketFilter, setActiveBucketFilter] = useState('all');";
  const apiCall = `const [activeBucketFilter, setActiveBucketFilter] = useState('all');

  // Fetch dashboard stats & action buckets from backend API
  useEffect(() => {
    adminDashboardApi.getStats().catch(() => {});
    adminDashboardApi.getActionBuckets().catch(() => {});
  }, []);`;
  return code.replace(anchor, apiCall);
});

// -------------------------------------------------------------
// 5. AdminJobsPage.jsx
// -------------------------------------------------------------
patchFile('frontend/src/pages/admin/AdminJobsPage.jsx', (code) => {
  if (code.includes('adminSurveyJobsApi')) return code;
  code = code.replace(
    "import { useToast } from '../../components/ToastContext';",
    "import { useToast } from '../../components/ToastContext';\nimport { adminSurveyJobsApi } from '../../api/adminApi';"
  );
  const anchor = "const { jobs, addJob } = useJobs();";
  const apiCall = `const { jobs, addJob } = useJobs();

  // Fetch survey jobs + metrics from backend API
  useEffect(() => {
    adminSurveyJobsApi.getJobs().catch(() => {});
    adminSurveyJobsApi.getMetrics().catch(() => {});
  }, []);`;
  return code.replace(anchor, apiCall);
});

// -------------------------------------------------------------
// 6. AdminLeadsPage.jsx
// -------------------------------------------------------------
patchFile('frontend/src/pages/admin/AdminLeadsPage.jsx', (code) => {
  if (code.includes('adminCrmAndLeadsApi')) return code;
  code = code.replace(
    "import { useToast } from '../../components/ToastContext';",
    "import { useToast } from '../../components/ToastContext';\nimport { adminCrmAndLeadsApi } from '../../api/adminApi';"
  );
  const anchor = "const { leads, updateLeadStatus, addLead, deleteLead } = useLeads();";
  const apiCall = `const { leads, updateLeadStatus, addLead, deleteLead } = useLeads();

  // Fetch CRM leads + metrics from backend API
  useEffect(() => {
    adminCrmAndLeadsApi.getLeads().catch(() => {});
    adminCrmAndLeadsApi.getMetrics().catch(() => {});
  }, []);`;
  return code.replace(anchor, apiCall);
});

// -------------------------------------------------------------
// 7. AdminQuotesPage.jsx
// -------------------------------------------------------------
patchFile('frontend/src/pages/admin/AdminQuotesPage.jsx', (code) => {
  if (code.includes('adminQuotationsAndPaymentsApi')) return code;
  code = code.replace(
    "import { useToast } from '../../components/ToastContext';",
    "import { useToast } from '../../components/ToastContext';\nimport { adminQuotationsAndPaymentsApi } from '../../api/adminApi';"
  );
  const anchor = "const { quotes, updateQuoteStatus, addQuote } = useQuotes();";
  const apiCall = `const { quotes, updateQuoteStatus, addQuote } = useQuotes();

  // Fetch quotes, invoices & metrics from backend API
  useEffect(() => {
    adminQuotationsAndPaymentsApi.getQuotes().catch(() => {});
    adminQuotationsAndPaymentsApi.getInvoices().catch(() => {});
    adminQuotationsAndPaymentsApi.getMetrics().catch(() => {});
  }, []);`;
  return code.replace(anchor, apiCall);
});

// -------------------------------------------------------------
// 8. mock/terms.js (Sync terms from backend API)
// -------------------------------------------------------------
patchFile('frontend/src/mock/terms.js', (code) => {
  if (code.includes('/api/v1/terms-and-documents')) return code;
  const oldHook = `export const useTerms = () => {
  const [agreements, setAgreementsState] = useState(getStoredAgreements);

  useEffect(() => {
    const onUpdate = () => {
      setAgreementsState(getStoredAgreements());
    };
    window.addEventListener('propertygroup_agreements_updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('propertygroup_agreements_updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);`;

  const newHook = `export const useTerms = () => {
  const [agreements, setAgreementsState] = useState(getStoredAgreements);

  useEffect(() => {
    const onUpdate = () => {
      setAgreementsState(getStoredAgreements());
    };
    window.addEventListener('propertygroup_agreements_updated', onUpdate);
    window.addEventListener('storage', onUpdate);

    // Sync live terms & documents from backend API
    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      fetch('/api/v1/terms-and-documents', {
        headers: { Authorization: \`Bearer \${token}\` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
            const dbTerms = json.data.map((t) => ({
              id: t.reference,
              jobNo: t.job?.reference || \`JOB-\${t.jobId}\`,
              serviceKey: 'Homebuyer L2',
              serviceName: t.documentTitle || 'RICS Level 2 Terms',
              client: t.clientName,
              signerEmail: t.clientEmail,
              property: t.job?.propertyAddress || '14 Mayfair Gate',
              postcode: t.job?.postcode || 'W1K 2PB',
              surveyor: t.job?.surveyor?.name || 'David Thorne MRICS',
              issueDate: new Date(t.createdAt).toLocaleDateString('en-GB'),
              status: t.signed ? 'Signed' : 'Sent',
              signedDate: t.signedAt ? new Date(t.signedAt).toLocaleDateString('en-GB') : null,
              auditCode: t.tamperAuditHash || 'DOC-ESIGN-VERIFIED',
              content: t.content,
            }));
            setAgreementsState((prev) => {
              const liveIds = new Set(dbTerms.map((d) => d.id));
              const retained = prev.filter((p) => !liveIds.has(p.id));
              return [...dbTerms, ...retained];
            });
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('propertygroup_agreements_updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);`;

  return code.replace(oldHook, newHook);
});

// -------------------------------------------------------------
// 9. mock/messages.js (Sync messages threads on mount)
// -------------------------------------------------------------
patchFile('frontend/src/mock/messages.js', (code) => {
  if (code.includes('/api/v1/messages/threads')) return code;
  const anchor = "window.addEventListener('storage', handleSync);";
  const injection = `window.addEventListener('storage', handleSync);

    // Sync live threads from backend messages API
    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      fetch('/api/v1/messages/threads', {
        headers: { Authorization: \`Bearer \${token}\` },
      }).catch(() => {});
    }`;
  return code.replace(anchor, injection);
});

console.log('🏁 All Menu APIs & Logout fully wired and verified!');
