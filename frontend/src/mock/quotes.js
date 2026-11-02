import { useState, useEffect } from 'react';

// Initial Mock Quotations, Invoices, and Payments
export const INITIAL_QUOTES = [
  {
    id: 'QUO-2026-101',
    refNo: 'QUO-2026-101',
    invoiceNo: 'INV-2026-101',
    client: 'Emma Watson',
    clientEmail: 'customer@demo.com',
    clientPhone: '+44 7700 900147',
    property: '14 Mayfair Gate',
    location: 'Mayfair, London W1K 2PB',
    surveyType: 'Homebuyer L2 (RICS Level 2)',
    baseFee: 650.0,
    extras: [
      { name: 'Drone Roof & Flashing Inspection', amount: 120.0 },
      { name: 'Same-day Verbal Debrief by Surveyor', amount: 50.0 },
    ],
    discount: 50.0,
    amountExVat: 770.0,
    vatAmount: 154.0,
    totalAmount: 924.0,
    status: 'Paid', // 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Paid'
    type: 'invoice', // 'quotation' | 'invoice' | 'payment'
    date: '26/10/2026',
    dueDate: '26/10/2026',
    paidDate: '26/10/2026',
    paymentMethod: 'Stripe UK Card Settlement',
  },
  {
    id: 'QUO-2026-102',
    refNo: 'QUO-2026-102',
    invoiceNo: 'INV-2026-102',
    client: 'Kensington Estates PLC',
    clientEmail: 'acquisitions@kensingtonestates.co.uk',
    clientPhone: '+44 20 7946 0841',
    property: '24 Kensington Palace Gardens',
    location: 'Kensington, London W8 4QQ',
    surveyType: 'Building L3 (RICS Level 3)',
    baseFee: 1850.0,
    extras: [{ name: 'Basement Vault & Tanking Inspection', amount: 350.0 }],
    discount: 0.0,
    amountExVat: 2200.0,
    vatAmount: 440.0,
    totalAmount: 2640.0,
    status: 'Paid',
    type: 'invoice',
    date: '25/10/2026',
    dueDate: '25/10/2026',
    paidDate: '25/10/2026',
    paymentMethod: 'BACS Bank Transfer',
  },
  {
    id: 'QUO-2026-103',
    refNo: 'QUO-2026-103',
    invoiceNo: 'INV-2026-103',
    client: 'Harrison Croft',
    clientEmail: 'harrison.croft@example.co.uk',
    clientPhone: '+44 7700 900512',
    property: '12 Pembroke Square',
    location: 'Kensington, London W8 6PA',
    surveyType: 'Building L3 (RICS Level 3)',
    baseFee: 1450.0,
    extras: [{ name: 'Thermal Imaging Damp Survey', amount: 150.0 }],
    discount: 50.0,
    amountExVat: 1550.0,
    vatAmount: 310.0,
    totalAmount: 1860.0,
    status: 'Accepted',
    type: 'quotation',
    date: '26/10/2026',
    dueDate: '02/11/2026',
    paidDate: null,
    paymentMethod: null,
  },
  {
    id: 'QUO-2026-104',
    refNo: 'QUO-2026-104',
    invoiceNo: 'INV-2026-104',
    client: 'Priya Sharma',
    clientEmail: 'priya.s@sharmainvest.com',
    clientPhone: '+44 7700 900891',
    property: '45 Park Mansions',
    location: 'Battersea, London SW11 4HG',
    surveyType: 'Homebuyer L2 (RICS Level 2)',
    baseFee: 595.0,
    extras: [],
    discount: 0.0,
    amountExVat: 595.0,
    vatAmount: 119.0,
    totalAmount: 714.0,
    status: 'Sent',
    type: 'quotation',
    date: '27/10/2026',
    dueDate: '03/11/2026',
    paidDate: null,
    paymentMethod: null,
  },
  {
    id: 'QUO-2026-105',
    refNo: 'QUO-2026-105',
    invoiceNo: 'INV-2026-105',
    client: 'Apex Asset Holdings Ltd',
    clientEmail: 'investments@apexasset.com',
    clientPhone: '+44 20 7946 0773',
    property: '42 Belgrave Square',
    location: 'Belgravia, London SW1X 8NT',
    surveyType: 'Valuation (Red Book Commercial)',
    baseFee: 3200.0,
    extras: [{ name: 'Tenancy Schedule Review', amount: 400.0 }],
    discount: 0.0,
    amountExVat: 3600.0,
    vatAmount: 720.0,
    totalAmount: 4320.0,
    status: 'Paid',
    type: 'payment',
    date: '24/10/2026',
    dueDate: '24/10/2026',
    paidDate: '24/10/2026',
    paymentMethod: 'Corporate Wire Transfer',
  },
  {
    id: 'QUO-2026-106',
    refNo: 'QUO-2026-106',
    invoiceNo: 'INV-2026-106',
    client: 'Richmond Borough Properties',
    clientEmail: 'estates@richmondborough.org.uk',
    clientPhone: '+44 20 8940 1289',
    property: '8 Chichester Road',
    location: 'Richmond, Surrey TW10 6RF',
    surveyType: 'Damp & Defect Survey',
    baseFee: 920.0,
    extras: [],
    discount: 0.0,
    amountExVat: 920.0,
    vatAmount: 184.0,
    totalAmount: 1104.0,
    status: 'Paid',
    type: 'payment',
    date: '23/10/2026',
    dueDate: '23/10/2026',
    paidDate: '23/10/2026',
    paymentMethod: 'Direct Debit / BACS',
  },
  {
    id: 'QUO-2026-107',
    refNo: 'QUO-2026-107',
    invoiceNo: 'INV-2026-107',
    client: 'Arthur Pendelton',
    clientEmail: 'pendelton@btinternet.com',
    clientPhone: '+44 7700 900677',
    property: '107 Queenstown Road',
    location: 'Battersea, London SW8 3RH',
    surveyType: 'Valuation (Red Book Residential)',
    baseFee: 550.0,
    extras: [],
    discount: 0.0,
    amountExVat: 550.0,
    vatAmount: 110.0,
    totalAmount: 660.0,
    status: 'Viewed',
    type: 'quotation',
    date: '26/10/2026',
    dueDate: '02/11/2026',
    paidDate: null,
    paymentMethod: null,
  },
  {
    id: 'QUO-2026-108',
    refNo: 'QUO-2026-108',
    invoiceNo: 'INV-2026-108',
    client: 'Charlotte Montgomery',
    clientEmail: 'charlotte.m@montgomery.co.uk',
    clientPhone: '+44 7700 900223',
    property: '5 Elm Bank Gardens',
    location: 'Barnes, London SW13 0NT',
    surveyType: 'Snagging (New Build Inspection)',
    baseFee: 495.0,
    extras: [{ name: 'Thermal Imaging Defect Assessment', amount: 150.0 }],
    discount: 25.0,
    amountExVat: 620.0,
    vatAmount: 124.0,
    totalAmount: 744.0,
    status: 'Draft',
    type: 'quotation',
    date: '27/10/2026',
    dueDate: '03/11/2026',
    paidDate: null,
    paymentMethod: null,
  },
  {
    id: 'QUO-2026-109',
    refNo: 'QUO-2026-109',
    invoiceNo: 'INV-2026-109',
    client: 'Lord Gregory Cavendish',
    clientEmail: 'cavendish.holdings@uknet.co.uk',
    clientPhone: '+44 20 7946 0331',
    property: '38 Eaton Place',
    location: 'Belgravia, London SW1X 8AL',
    surveyType: 'Expert Witness (CPR Part 35)',
    baseFee: 2400.0,
    extras: [
      { name: 'Specialist Court Witness Appearance Contingency', amount: 600.0 },
      { name: 'Same-day Verbal Debrief by Surveyor', amount: 50.0 },
    ],
    discount: 100.0,
    amountExVat: 2950.0,
    vatAmount: 590.0,
    totalAmount: 3540.0,
    status: 'Sent',
    type: 'quotation',
    date: '27/10/2026',
    dueDate: '03/11/2026',
    paidDate: null,
    paymentMethod: null,
  },
];

export const getStoredQuotes = () => {
  try {
    const raw = localStorage.getItem('propertygroup_quotes');
    if (raw) return JSON.parse(raw);
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
