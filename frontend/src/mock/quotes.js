import { useState, useEffect } from 'react';

// Initial Mock Quotations, Invoices, and Payments
export const INITIAL_QUOTES = [];

export const getStoredQuotes = () => {
  try {
    if (!localStorage.getItem('njs_fresh_quotes_clean_v1')) {
      localStorage.removeItem('propertygroup_quotes');
      localStorage.setItem('njs_fresh_quotes_clean_v1', 'true');
      return [];
    }
    const raw = localStorage.getItem('propertygroup_quotes');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
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
