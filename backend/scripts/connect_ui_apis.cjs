const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, oldSnippet, newSnippet) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${filePath}`);
    return false;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  const normContent = content.replace(/\r\n/g, '\n');
  const normOld = oldSnippet.replace(/\r\n/g, '\n');
  
  if (normContent.includes(normOld)) {
    const updated = normContent.replace(normOld, newSnippet);
    fs.writeFileSync(fullPath, updated, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
    return true;
  } else {
    console.warn(`⚠️ Could not find snippet in ${filePath}`);
    return false;
  }
}

// -------------------------------------------------------------
// 1. mock/leads.js (CRM & Leads Hook -> Backend API Sync)
// -------------------------------------------------------------
const oldLeadsHook = `export const useLeads = () => {
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
  };

  const addLead = (newLead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const deleteLead = (leadId) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  return { leads, setLeads, updateLeadStatus, addLead, deleteLead };
};`;

const newLeadsHook = `export const useLeads = () => {
  const [leads, setLeadsState] = useState(getStoredLeads);

  useEffect(() => {
    const onUpdate = () => {
      setLeadsState(getStoredLeads());
    };
    window.addEventListener('propertygroup_leads_updated', onUpdate);
    window.addEventListener('storage', onUpdate);

    // Sync live CRM leads from backend API
    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      fetch('/api/v1/crm-and-leads', {
        headers: { Authorization: \`Bearer \${token}\` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
            const dbLeads = json.data.map((l) => ({
              id: l.reference || \`LD-\${l.id}\`,
              dbId: l.id,
              customerName: l.clientName,
              customerEmail: l.clientEmail,
              customerPhone: l.clientPhone || '+44 7700 900512',
              enquiry: l.serviceType,
              property: l.propertyAddress,
              location: \`\${l.propertyAddress}, \${l.postcode}\`,
              source: l.source === 'WEBSITE' ? 'Website' : l.source === 'PARTNER_AGENCY' ? 'Partner' : l.source,
              status: l.status === 'CONVERTED' ? 'Converted' : l.status === 'QUOTE_SENT' ? 'Quoted' : l.status === 'NEW' ? 'New' : l.status,
              created: new Date(l.createdAt).toLocaleDateString('en-GB'),
              owner: 'Alexander Sterling',
              estimatedValue: l.estimatedValue ? \`£\${l.estimatedValue.toLocaleString()}\` : '£650.00',
              notes: l.callLogs?.[0]?.summary || 'Enquiry recorded via live system',
            }));

            setLeadsState((prev) => {
              const dbIds = new Set(dbLeads.map((d) => d.id));
              const retained = prev.filter((p) => !dbIds.has(p.id));
              return [...dbLeads, ...retained];
            });
          }
        })
        .catch(() => {});
    }

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

replaceInFile('frontend/src/mock/leads.js', oldLeadsHook, newLeadsHook);

// -------------------------------------------------------------
// 2. mock/quotes.js (Quotations & Invoices Hook -> Backend API Sync)
// -------------------------------------------------------------
const oldQuotesHook = `export const useQuotes = () => {
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

const newQuotesHook = `export const useQuotes = () => {
  const [quotes, setQuotesState] = useState(getStoredQuotes);

  useEffect(() => {
    const onUpdate = () => {
      setQuotesState(getStoredQuotes());
    };
    window.addEventListener('propertygroup_quotes_updated', onUpdate);
    window.addEventListener('storage', onUpdate);

    // Sync live quotations & invoices from backend API
    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      Promise.all([
        fetch('/api/v1/quotations-and-payments/quotes', { headers: { Authorization: \`Bearer \${token}\` } }).then(r => r.ok ? r.json() : null),
        fetch('/api/v1/quotations-and-payments/invoices', { headers: { Authorization: \`Bearer \${token}\` } }).then(r => r.ok ? r.json() : null)
      ])
        .then(([quotesJson, invoicesJson]) => {
          const liveItems = [];
          if (quotesJson?.data && Array.isArray(quotesJson.data)) {
            quotesJson.data.forEach((q) => {
              liveItems.push({
                id: q.reference,
                refNo: q.reference,
                invoiceNo: \`INV-\${q.reference.split('-').slice(1).join('-')}\`,
                client: q.job?.clientName || 'Emma Watson',
                clientEmail: q.job?.clientEmail || 'customer@demo.com',
                clientPhone: q.job?.clientPhone || '+44 7700 900147',
                property: q.job?.propertyAddress || '14 Mayfair Gate',
                location: q.job?.postcode ? \`\${q.job.propertyAddress}, \${q.job.postcode}\` : 'London W1K 2PB',
                surveyType: q.job?.serviceType || 'RICS Level 2 Home Survey',
                baseFee: q.baseFee,
                extras: [],
                discount: 0,
                amountExVat: q.baseFee,
                vatAmount: q.vatAmount,
                totalAmount: q.totalAmount,
                status: q.status === 'ACCEPTED' ? 'Accepted' : q.status === 'SENT' ? 'Sent' : 'Draft',
                type: 'quotation',
                date: new Date(q.createdAt).toLocaleDateString('en-GB'),
                dueDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-GB'),
              });
            });
          }
          if (invoicesJson?.data && Array.isArray(invoicesJson.data)) {
            invoicesJson.data.forEach((inv) => {
              liveItems.push({
                id: inv.invoiceNumber,
                refNo: \`QUO-\${inv.invoiceNumber.split('-').slice(1).join('-')}\`,
                invoiceNo: inv.invoiceNumber,
                client: inv.clientName,
                clientEmail: inv.clientEmail,
                clientPhone: inv.job?.clientPhone || '+44 7700 900147',
                property: inv.job?.propertyAddress || '14 Mayfair Gate',
                location: inv.job?.postcode ? \`\${inv.job.propertyAddress}, \${inv.job.postcode}\` : 'London W1K 2PB',
                surveyType: inv.job?.serviceType || 'RICS Level 2 Home Survey',
                baseFee: inv.subtotal,
                extras: [],
                discount: 0,
                amountExVat: inv.subtotal,
                vatAmount: inv.vatAmount,
                totalAmount: inv.total,
                status: inv.status === 'PAID' ? 'Paid' : 'Sent',
                type: 'invoice',
                date: new Date(inv.createdAt).toLocaleDateString('en-GB'),
                dueDate: new Date(inv.createdAt).toLocaleDateString('en-GB'),
                paidDate: inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('en-GB') : null,
                paymentMethod: inv.paymentMethod || 'Stripe UK Online Card Settlement',
              });
            });
          }

          if (liveItems.length > 0) {
            setQuotesState((prev) => {
              const liveIds = new Set(liveItems.map((i) => i.id));
              const retained = prev.filter((p) => !liveIds.has(p.id));
              return [...liveItems, ...retained];
            });
          }
        })
        .catch(() => {});
    }

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

replaceInFile('frontend/src/mock/quotes.js', oldQuotesHook, newQuotesHook);

// -------------------------------------------------------------
// 3. mock/messages.js (Messages Hook -> Backend API Sync)
// -------------------------------------------------------------
const oldMessagesHook = `    if (!targetConv) {
      const isHarrison = (recipient || '').includes('harrison') || (recipient || '').includes('LD-1048');
      const newConv = {
        id: conversationId,
        jobId: isHarrison ? 'LD-1048' : 'JOB-2026-080',
        clientEmail: isHarrison ? 'harrison.croft@example.co.uk' : 'customer@demo.com',
        clientName: senderName || (isHarrison ? 'Harrison Croft' : 'Customer'),
        clientPhone: isHarrison ? '+44 7700 900512' : '+44 7700 900147',
        property: isHarrison ? '12 Pembroke Square, Kensington, London W8 6PA' : '14 Mayfair Gate, Mayfair, London W1K 2PB',
        surveyType: isHarrison ? 'RICS Level 3 Building Survey' : 'RICS Level 2 Home Survey',
        surveyor: 'David Thorne MRICS',
        unreadAdmin: role === 'client' ? 1 : 0,
        unreadClient: role === 'admin' ? 1 : 0,
        messages: [newMsg],
      };
      updated.push(newConv);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('propertygroup_conversations_updated', { detail: updated }));
    } catch (err) {
      console.warn(err);
    }

    return updated;
  });

  return newMsg;
};`;

const newMessagesHook = `    if (!targetConv) {
      const isHarrison = (recipient || '').includes('harrison') || (recipient || '').includes('LD-1048');
      const newConv = {
        id: conversationId,
        jobId: isHarrison ? 'LD-1048' : 'JOB-2026-080',
        clientEmail: isHarrison ? 'harrison.croft@example.co.uk' : 'customer@demo.com',
        clientName: senderName || (isHarrison ? 'Harrison Croft' : 'Customer'),
        clientPhone: isHarrison ? '+44 7700 900512' : '+44 7700 900147',
        property: isHarrison ? '12 Pembroke Square, Kensington, London W8 6PA' : '14 Mayfair Gate, Mayfair, London W1K 2PB',
        surveyType: isHarrison ? 'RICS Level 3 Building Survey' : 'RICS Level 2 Home Survey',
        surveyor: 'David Thorne MRICS',
        unreadAdmin: role === 'client' ? 1 : 0,
        unreadClient: role === 'admin' ? 1 : 0,
        messages: [newMsg],
      };
      updated.push(newConv);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('propertygroup_conversations_updated', { detail: updated }));
    } catch (err) {
      console.warn(err);
    }

    // Sync to backend messages API
    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      fetch('/api/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({
          conversationId,
          content: text,
          senderName: senderName || (role === 'admin' ? 'Alexander Sterling (Admin)' : 'Customer'),
        }),
      }).catch(() => {});
    }

    return updated;
  });

  return newMsg;
};`;

replaceInFile('frontend/src/mock/messages.js', oldMessagesHook, newMessagesHook);

console.log('🎉 Core mock state hooks connected to backend REST APIs!');
