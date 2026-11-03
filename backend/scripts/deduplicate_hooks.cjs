const fs = require('fs');
const path = require('path');

// 1. mock/jobs.js: Clean useJobs to avoid duplicate network calls
const jobsFile = path.resolve('frontend/src/mock/jobs.js');
let jobsCode = fs.readFileSync(jobsFile, 'utf8').replace(/\r\n/g, '\n');

const cleanJobsHook = `export const useJobs = () => {
  const [jobs, setJobsState] = useState(getStoredJobs);

  useEffect(() => {
    const onUpdate = () => {
      setJobsState(getStoredJobs());
    };
    window.addEventListener('propertygroup_jobs_updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('propertygroup_jobs_updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  const setJobs = (updater) => {
    setJobsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveStoredJobs(next);
      return next;
    });
  };

  const updateJob = (id, updates) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...updates } : j))
    );
    const token = localStorage.getItem('property_group_auth_token');
    if (token && (updates.stage || updates.status)) {
      fetch(\`/api/v1/survey-jobs/\${id}/stage\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({
          newStage: (updates.stage || updates.status || '').toUpperCase().replace(/\\s+/g, '_'),
          reason: updates.reason || 'Status updated via UI',
        }),
      }).catch(() => {});
    }
  };

  const addJob = (newJob) => {
    setJobs((prev) => [newJob, ...prev]);
    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      fetch('/api/v1/survey-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({
          serviceType: newJob.surveyType || 'RICS Level 2 Home Survey',
          propertyAddress: newJob.property || newJob.location || 'London Property',
          postcode: newJob.postcode || 'SW1A 1AA',
          clientName: newJob.customer || newJob.clientName || 'Private Client',
          clientEmail: newJob.customerEmail || 'client@example.com',
          clientPhone: newJob.customerPhone || '+44 7700 900000',
          baseFee: 650.0,
        }),
      }).catch(() => {});
    }
  };

  return { jobs, setJobs, updateJob, addJob };
};`;

const jobsHookStart = jobsCode.indexOf('export const useJobs = () => {');
if (jobsHookStart !== -1) {
  jobsCode = jobsCode.slice(0, jobsHookStart) + cleanJobsHook + '\n';
  fs.writeFileSync(jobsFile, jobsCode, 'utf8');
  console.log('✅ Cleaned mock/jobs.js (removed redundant multi-component fetches)');
}

// 2. mock/leads.js: Clean useLeads
const leadsFile = path.resolve('frontend/src/mock/leads.js');
let leadsCode = fs.readFileSync(leadsFile, 'utf8').replace(/\r\n/g, '\n');

const cleanLeadsHook = `export const useLeads = () => {
  const [leads, setLeadsState] = useState(getStoredLeads);

  useEffect(() => {
    const onUpdate = () => {
      setLeadsState(getStoredLeads());
    };
    window.addEventListener('propertygroup_leads_updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('propertygroup_leads_updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  const setLeads = (updater) => {
    setLeadsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveStoredLeads(next);
      return next;
    });
  };

  const updateLeadStatus = (leadId, newStatus, extraData = {}) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        return {
          ...l,
          status: newStatus,
          ...extraData,
        };
      })
    );
    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      const statusMap = {
        New: 'NEW',
        Contacted: 'CONTACTED',
        Quoted: 'QUOTE_SENT',
        Converted: 'CONVERTED',
        Lost: 'LOST',
      };
      fetch(\`/api/v1/crm-and-leads/\${leadId}/status\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({ status: statusMap[newStatus] || newStatus.toUpperCase() }),
      }).catch(() => {});
    }
  };

  const addLead = (newLead) => {
    setLeads((prev) => [newLead, ...prev]);
    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      fetch('/api/v1/crm-and-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({
          clientName: newLead.customerName || 'Private Client',
          clientEmail: newLead.customerEmail || 'client@example.com',
          clientPhone: newLead.customerPhone || '+44 7700 900000',
          propertyAddress: newLead.property || newLead.location || 'London Property',
          postcode: newLead.location?.split(',')?.pop()?.trim() || 'W1K 2PB',
          serviceType: newLead.enquiry || 'RICS Level 2 Home Survey',
          source: 'WEBSITE',
        }),
      }).catch(() => {});
    }
  };

  const deleteLead = (leadId) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  return { leads, setLeads, updateLeadStatus, addLead, deleteLead };
};`;

const leadsHookStart = leadsCode.indexOf('export const useLeads = () => {');
if (leadsHookStart !== -1) {
  leadsCode = leadsCode.slice(0, leadsHookStart) + cleanLeadsHook + '\n';
  fs.writeFileSync(leadsFile, leadsCode, 'utf8');
  console.log('✅ Cleaned mock/leads.js');
}

// 3. mock/quotes.js: Clean useQuotes
const quotesFile = path.resolve('frontend/src/mock/quotes.js');
let quotesCode = fs.readFileSync(quotesFile, 'utf8').replace(/\r\n/g, '\n');

const cleanQuotesHook = `export const useQuotes = () => {
  const [quotes, setQuotesState] = useState(getStoredQuotes);

  useEffect(() => {
    const onUpdate = () => {
      setQuotesState(getStoredQuotes());
    };
    window.addEventListener('propertygroup_quotes_updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('propertygroup_quotes_updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  const setQuotes = (updater) => {
    setQuotesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveStoredQuotes(next);
      return next;
    });
  };

  const addQuote = (newQuote) => {
    setQuotes((prev) => [newQuote, ...prev]);
    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      fetch('/api/v1/quotations-and-payments/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({
          baseFee: newQuote.baseFee || 650.0,
          vatRate: 20.0,
        }),
      }).catch(() => {});
    }
  };

  const updateQuoteStatus = (id, newStatus) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const isPaid = newStatus === 'Paid';
        return {
          ...q,
          status: newStatus,
          paidDate: isPaid ? new Date().toLocaleDateString('en-GB') : q.paidDate,
          paymentMethod: isPaid && !q.paymentMethod ? 'Stripe UK Online Card Settlement' : q.paymentMethod,
        };
      })
    );
  };

  return { quotes, setQuotes, addQuote, updateQuoteStatus };
};`;

const quotesHookStart = quotesCode.indexOf('export const useQuotes = () => {');
if (quotesHookStart !== -1) {
  quotesCode = quotesCode.slice(0, quotesHookStart) + cleanQuotesHook + '\n';
  fs.writeFileSync(quotesFile, quotesCode, 'utf8');
  console.log('✅ Cleaned mock/quotes.js');
}

// 4. mock/terms.js: Clean useTerms
const termsFile = path.resolve('frontend/src/mock/terms.js');
let termsCode = fs.readFileSync(termsFile, 'utf8').replace(/\r\n/g, '\n');

const cleanTermsHook = `export const useTerms = () => {
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
  }, []);

  const setAgreements = (updater) => {
    setAgreementsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveStoredAgreements(next);
      return next;
    });
  };

  const addAgreement = (newAgreement) => {
    setAgreements((prev) => [newAgreement, ...prev]);
  };

  const markAgreementSigned = (idOrJobNo, details = {}) => {
    setAgreements((prev) =>
      prev.map((a) => {
        if (a.id !== idOrJobNo && a.jobNo !== idOrJobNo) return a;
        return {
          ...a,
          status: 'Signed',
          signedDate: details.signedDate || \`\${new Date().toLocaleDateString('en-GB')}, \${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}\`,
          signerIp: details.signerIp || '86.142.19.42 (London, UK)',
          auditCode: details.auditCode || \`DOC-ESIGN-\${Math.floor(10000 + Math.random() * 89999)}-VERIFIED\`,
          signatureType: details.signatureType || 'typed',
          signatureValue: details.signatureValue || a.client,
        };
      })
    );
  };

  return { agreements, setAgreements, addAgreement, markAgreementSigned };
};`;

const termsHookStart = termsCode.indexOf('export const useTerms = () => {');
if (termsHookStart !== -1) {
  termsCode = termsCode.slice(0, termsHookStart) + cleanTermsHook + '\n';
  fs.writeFileSync(termsFile, termsCode, 'utf8');
  console.log('✅ Cleaned mock/terms.js');
}

// 5. mock/messages.js: Clean useMessages
const messagesFile = path.resolve('frontend/src/mock/messages.js');
let messagesCode = fs.readFileSync(messagesFile, 'utf8').replace(/\r\n/g, '\n');

if (messagesCode.includes('fetch(\'/api/v1/messages/threads\'')) {
  messagesCode = messagesCode.replace(
    /\n\s+\/\/ Sync live threads from backend messages API[\s\S]+?\}\)\.catch\(\(\) => \{\}\);\s+\}/,
    ''
  );
  fs.writeFileSync(messagesFile, messagesCode, 'utf8');
  console.log('✅ Cleaned mock/messages.js');
}

console.log('🏁 Multi-component duplicate API storms eliminated!');

