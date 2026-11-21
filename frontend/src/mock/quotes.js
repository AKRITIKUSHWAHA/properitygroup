import { useState, useEffect, useCallback } from 'react';
import { getApiBaseUrl } from '../api/apiClient';

// Initial Quotations, Invoices, and Payments (Clean state for fresh client testing)
export const INITIAL_QUOTES = [];

export const getStoredQuotes = () => {
  try {
    const raw = localStorage.getItem('propertygroup_quotes');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((q) => {
          const name = (q.customer || q.clientName || '').toLowerCase().trim();
          const email = (q.customerEmail || q.clientEmail || '').toLowerCase().trim();
          const addr = (q.property || q.propertyAddress || '').toLowerCase().trim();
          return !name.includes('akku') && !email.includes('akku') && !addr.includes('mp nagar') && !addr.includes('bhopal') && q.id !== 7;
        });
      }
    }
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

  const setQuotes = useCallback((updater) => {
    setQuotesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveStoredQuotes(next);
      return next;
    });
  }, []);

  const addQuote = useCallback((newQuote) => {
    setQuotes((prev) => [newQuote, ...prev]);
    const token = localStorage.getItem('property_group_auth_token');
    if (token) {
      fetch(`${getApiBaseUrl()}/quotations-and-payments/quotes`, {
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
  }, [setQuotes]);

  const updateQuote = (id, updatedFields) => {
    setQuotes((prev) =>
      prev.map((q) => {
        const matches =
          q.id === id ||
          q.refNo === id ||
          (id !== undefined && id !== null && String(q.id) === String(id)) ||
          (id !== undefined && id !== null && q.dbId && String(q.dbId) === String(id));
        if (!matches) return q;
        const currentFee = updatedFields.baseFee !== undefined ? parseFloat(updatedFields.baseFee) : (q.baseFee || 0);
        const currentDiscount = updatedFields.discount !== undefined ? parseFloat(updatedFields.discount) : (q.discount || 0);
        const extras = updatedFields.extras !== undefined ? updatedFields.extras : (q.extras || []);
        const extrasTotal = Array.isArray(extras)
          ? extras.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
          : 0;
        const subtotal = Math.max(0, currentFee + extrasTotal - currentDiscount);
        const vatAmount = subtotal * 0.2;
        const totalAmount = subtotal + vatAmount;

        return {
          ...q,
          ...updatedFields,
          baseFee: currentFee,
          discount: currentDiscount,
          extras,
          amountExVat: subtotal,
          vatAmount,
          totalAmount,
        };
      })
    );
  };

  const updateQuoteStatus = (id, newStatus) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== id && q.refNo !== id) return q;
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

  return { quotes, setQuotes, addQuote, updateQuote, updateQuoteStatus };
};
