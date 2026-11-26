import { useState, useEffect } from 'react';

// Initial messages between Customer (Emma Watson) and NJS Operations Desk
export const INITIAL_CONVERSATIONS = [];

let memoryConversations = [];

export const useMessages = () => {
  const [conversations, setConversations] = useState(() => memoryConversations);

  // Cross-component reactive synchronization (in-memory, no localStorage)
  useEffect(() => {
    const handleSync = () => {
      setConversations([...memoryConversations]);
    };

    window.addEventListener('propertygroup_conversations_updated', handleSync);
    return () => {
      window.removeEventListener('propertygroup_conversations_updated', handleSync);
    };
  }, []);

  useEffect(() => {
    memoryConversations = conversations;
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
      read: false,
      isRead: false,
      readByAdmin: role === 'admin' || role === 'super_admin',
      readByCustomer: role === 'client' || role === 'customer' || role === 'surveyor',
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

      // If conversationId did not match any existing conversation, create and add it in memory
      if (!matched) {
        const newConv = {
          id: conversationId,
          jobId: conversationId.startsWith('JOB-') ? conversationId : '',
          clientEmail: '',
          clientName: senderName || 'Client',
          clientPhone: '',
          property: '',
          surveyType: 'RICS Home Survey',
          surveyor: 'Assigned Chartered Surveyor',
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
      memoryConversations = updatedList;
      window.dispatchEvent(new CustomEvent('propertygroup_conversations_updated', { detail: updatedList }));
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
        }).catch((err) => {
          console.warn('Failed to sync message to backend:', err);
        });
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
            messages: (c.messages || []).map((m) => ({
              ...m,
              read: true,
              isRead: true,
              readByAdmin: readerRole === 'admin' ? true : m.readByAdmin,
              readByCustomer: readerRole !== 'admin' ? true : m.readByCustomer,
            })),
          };
        }
        return c;
      });

      memoryConversations = updated;
      window.dispatchEvent(new CustomEvent('propertygroup_conversations_updated', { detail: updated }));

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

