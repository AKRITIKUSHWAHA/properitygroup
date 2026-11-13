import { useState, useEffect } from 'react';

// Initial Mock Quotations, Invoices, and Payments
export const INITIAL_QUOTES = [
  {
    id: 'QUO-2026-080',
    refNo: 'QTE-2026-080',
    invoiceNo: 'INV-2026-080',
    client: 'Emma Watson',
    clientEmail: 'customer@demo.com',
    clientPhone: '+44 7911 123456',
    property: '14 Mayfair Gate, Mayfair, London',
    location: 'Mayfair, London W1K 2PB',
    surveyType: 'RICS Level 2 Home Survey',
    baseFee: 650.0,
    extras: [{ name: 'Same-day Verbal Debrief by Surveyor', amount: 50.0 }],
    discount: 50.0,
    amountExVat: 650.0,
    vatAmount: 130.0,
    totalAmount: 780.0,
    status: 'Paid',
    type: 'invoice',
    date: '04/11/2026',
    dueDate: '04/11/2026',
    paidDate: '04/11/2026',
    paymentMethod: 'Stripe UK Online Card Settlement',
  },
  {
    id: 'QUO-2026-081',
    refNo: 'QTE-2026-081',
    invoiceNo: 'INV-2026-081',
    client: 'Kensington Estates PLC',
    clientEmail: 'acquisitions@kensingtonestates.co.uk',
    clientPhone: '+44 20 7946 0841',
    property: '24 Kensington Palace Gardens, London',
    location: 'Kensington, London W8 4QQ',
    surveyType: 'RICS Level 3 Building Survey',
    baseFee: 1100.0,
    extras: [],
    discount: 0.0,
    amountExVat: 1100.0,
    vatAmount: 220.0,
    totalAmount: 1320.0,
    status: 'Paid',
    type: 'invoice',
    date: '12/10/2026',
    dueDate: '12/10/2026',
    paidDate: '13/10/2026',
    paymentMethod: 'BACS (BACS-NJS-88BELG)',
  },
  {
    id: 'QUO-2026-082',
    refNo: 'QTE-2026-082',
    invoiceNo: 'INV-2026-082',
    client: 'Harrison Croft',
    clientEmail: 'harrison@demo.com',
    clientPhone: '+44 7700 900512',
    property: '12 Pembroke Square, Kensington, London',
    location: 'Kensington, London W8 6PA',
    surveyType: 'RICS Level 3 Building Survey',
    baseFee: 1450.0,
    extras: [],
    discount: 0.0,
    amountExVat: 1450.0,
    vatAmount: 290.0,
    totalAmount: 1740.0,
    status: 'Accepted',
    type: 'quotation',
    date: '28/10/2026',
    dueDate: '04/11/2026',
    paidDate: null,
    paymentMethod: null,
  },
  {
    id: 'QUO-2026-083',
    refNo: 'QTE-2026-083',
    invoiceNo: 'INV-2026-083',
    client: 'Priya Sharma',
    clientEmail: 'priya.s@sharmainvest.com',
    clientPhone: '+44 7700 900891',
    property: '45 Park Mansions, Battersea, London',
    location: 'Battersea, London SW11 4HG',
    surveyType: 'RICS Level 2 Home Survey',
    baseFee: 595.0,
    extras: [],
    discount: 0.0,
    amountExVat: 595.0,
    vatAmount: 119.0,
    totalAmount: 714.0,
    status: 'Sent',
    type: 'quotation',
    date: '02/11/2026',
    dueDate: '09/11/2026',
    paidDate: null,
    paymentMethod: null,
  },
];

export const getStoredQuotes = () => {
  try {
    const raw = localStorage.getItem('propertygroup_quotes');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_QUOTES;
};

export const saveStoredQuotes = (quotes) => {
  try {
    localStorage.setItem('propertygroup_quotes', JSON.stringify(quotes));
    window.dispatchEvent(new Event('propertygroup_quotes_updated'));
  } catch (e) {
    console.error(e);
  }
};

export const useQuotes = () => {
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
          Authorization: `Bearer ${token}`,
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
};
