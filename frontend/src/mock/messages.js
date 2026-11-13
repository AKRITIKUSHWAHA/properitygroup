import { useState, useEffect } from 'react';

// Initial messages between Customer (Emma Watson) and NJS Operations Desk
export const INITIAL_CONVERSATIONS = [];

const STORAGE_KEY = 'propertygroup_conversations_v1';

export const useMessages = () => {
  const [conversations, setConversations] = useState(() => {
    try {
      if (!localStorage.getItem('njs_fresh_messages_clean_v1')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem('njs_fresh_messages_clean_v1', 'true');
        return [];
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      return [];
    } catch {
      return [];
    }
  });

  // Cross-component and cross-tab reactive synchronization
  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const merged = [...parsed];
          INITIAL_CONVERSATIONS.forEach((init) => {
            if (!merged.some((m) => m.id === init.id || m.jobId === init.jobId || m.clientEmail === init.clientEmail)) {
              merged.push(init);
            }
          });
          setConversations(merged);
        }
      } catch (err) {
        console.warn('Unable to sync conversations', err);
      }
    };

    window.addEventListener('propertygroup_conversations_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('propertygroup_conversations_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Unable to persist conversations to localStorage', e);
    }
  }, [conversations]);

  // Send a message to a specific conversation
  const sendMessage = (conversationId, text, senderName, role = 'admin', syncToRemote = true) => {
    const timeString = `${new Date().toLocaleDateString('en-GB')}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    const newMsg = {
      id: Date.now(),
      sender: senderName,
      role: role,
      text: text,
      time: timeString,
      readByCustomer: role === 'customer',
    };

    let updatedList = null;

    setConversations((prev) => {
      let matched = false;
      const updated = prev.map((c) => {
        if (c.id === conversationId || c.jobId === conversationId || c.clientEmail === conversationId) {
          matched = true;
          // Guard against duplicate insertion (e.g. React StrictMode running updater twice)
          const isDuplicate = (c.messages || []).some(
            (m) => m.text === text && m.role === role && Math.abs((m.id || 0) - newMsg.id) < 2000
          );
          if (isDuplicate) return c;
          return {
            ...c,
            unreadAdmin: role === 'client' ? (c.unreadAdmin || 0) + 1 : 0,
            unreadClient: role === 'admin' ? (c.unreadClient || 0) + 1 : 0,
            messages: [...(c.messages || []), newMsg],
          };
        }
        return c;
      });

      // If conversationId did not match any existing conversation, create and add it
      if (!matched) {
        const isHarrison = (senderName || '').toLowerCase().includes('harrison') || conversationId.includes('harrison') || conversationId === 'conv-3';
        const newConv = {
          id: conversationId,
          jobId: isHarrison ? 'JOB-2026-082' : (conversationId.startsWith('JOB-') ? conversationId : 'JOB-2026-080'),
          clientEmail: isHarrison ? 'harrison@demo.com' : 'customer@demo.com',
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

      updatedList = updated;
      return updated;
    });

    // Side effects executed ONCE outside the setState updater
    if (updatedList) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        window.dispatchEvent(new CustomEvent('propertygroup_conversations_updated', { detail: updatedList }));
      } catch (err) {
        console.warn(err);
      }
    }

    // Sync to backend messages API only if requested and not handled directly by the caller
    if (syncToRemote) {
      const token = localStorage.getItem('property_group_auth_token');
      if (token) {
        fetch('/api/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationId,
            content: text,
            senderName: senderName || (role === 'admin' ? 'Alexander Sterling (Admin)' : 'Customer'),
          }),
        }).catch(() => {});
      }
    }

    return newMsg;
  };

  // Mark conversation as read
  const markAsRead = (conversationId, readerRole = 'admin') => {
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === conversationId || c.jobId === conversationId || c.clientEmail === conversationId) {
          return {
            ...c,
            [readerRole === 'admin' ? 'unreadAdmin' : 'unreadClient']: 0,
          };
        }
        return c;
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('propertygroup_conversations_updated', { detail: updated }));
      } catch (err) {
        console.warn(err);
      }

      return updated;
    });
  };

  return {
    conversations,
    setConversations,
    sendMessage,
    markAsRead,
  };
};

