import { useState, useEffect } from 'react';

// Initial messages between Customer (Emma Watson) and NJS Operations Desk
export const INITIAL_CONVERSATIONS = [
  {
    id: 'conv-1',
    jobId: 'JOB-2026-080',
    clientEmail: 'customer@demo.com',
    clientName: 'Emma Watson',
    clientPhone: '+44 7700 900147',
    property: '14 Mayfair Gate, Mayfair, London W1K 2PB',
    surveyType: 'RICS Level 2 Home Survey',
    surveyor: 'David Thorne MRICS',
    unreadAdmin: 0,
    unreadClient: 0,
    messages: [
      {
        id: 1,
        sender: 'NJS Admin Team (Sarah)',
        role: 'admin',
        text: 'Good morning Emma, thank you for instructing NJS Property Group for your RICS Level 2 survey at 14 Mayfair Gate. Surveyor David Thorne MRICS is confirmed for tomorrow morning.',
        time: '26/10/2026, 14:10',
      },
      {
        id: 2,
        sender: 'Emma Watson',
        role: 'client',
        text: 'Thank you Sarah! Please note that the keys are held at Foxtons Mayfair under branch reference FX-402, and there is a damp spot behind the dining room skirting that I would like David to inspect.',
        time: '26/10/2026, 14:35',
      },
      {
        id: 3,
        sender: 'NJS Admin Team (Sarah)',
        role: 'admin',
        text: 'Noted with thanks! David has added a specific damp meter check in the dining room to his inspection checklist.',
        time: '26/10/2026, 15:02',
      },
    ],
  },
  {
    id: 'conv-2',
    jobId: 'JOB-2026-081',
    clientEmail: 'acquisitions@kensingtonestates.co.uk',
    clientName: 'Kensington Estates PLC',
    clientPhone: '+44 20 7946 0841',
    property: '24 Kensington Palace Gardens, London W8 4QQ',
    surveyType: 'RICS Level 3 Building Survey',
    surveyor: 'Oliver Hughes MRICS',
    unreadAdmin: 1,
    unreadClient: 0,
    messages: [
      {
        id: 1,
        sender: 'NJS Admin Team',
        role: 'admin',
        text: 'Quotation accepted for 24 Kensington Palace Gardens. Terms sent for digital signature.',
        time: '25/10/2026, 10:15',
      },
      {
        id: 2,
        sender: 'Kensington Estates PLC',
        role: 'client',
        text: 'We have executed the agreement. Please confirm if Oliver requires access to the sub-basement vaults.',
        time: '27/10/2026, 09:30',
      },
    ],
  },
  {
    id: 'conv-3',
    jobId: 'JOB-2026-082',
    clientEmail: 'harrison@demo.com',
    clientName: 'Harrison Croft',
    clientPhone: '+44 7700 900512',
    property: '12 Pembroke Square, Kensington, London W8 6PA',
    surveyType: 'RICS Level 3 Building Survey',
    surveyor: 'David Thorne MRICS',
    unreadAdmin: 0,
    unreadClient: 0,
    messages: [
      {
        id: 1,
        sender: 'NJS Admin Team (Alexander)',
        role: 'admin',
        text: 'Hello Harrison, your quotation for RICS Level 3 Building Survey at 12 Pembroke Square (£1,450 + VAT) has been approved. Please review and sign your digital terms of engagement.',
        time: '28/10/2026, 11:00',
      },
      {
        id: 2,
        sender: 'Harrison Croft',
        role: 'client',
        text: 'Thank you Alexander. I will review the inclusions and sign the terms today.',
        time: '28/10/2026, 11:30',
      },
    ],
  },
];

const STORAGE_KEY = 'propertygroup_conversations_v1';

export const useMessages = () => {
  const [conversations, setConversations] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Unable to persist conversations to localStorage', e);
    }
  }, [conversations]);

  // Send a message to a specific conversation
  const sendMessage = (conversationId, text, senderName, role = 'admin') => {
    const timeString = `${new Date().toLocaleDateString('en-GB')}, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    const newMsg = {
      id: Date.now(),
      sender: senderName,
      role: role,
      text: text,
      time: timeString,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId || c.jobId === conversationId || c.clientEmail === conversationId) {
          return {
            ...c,
            unreadAdmin: role === 'client' ? (c.unreadAdmin || 0) + 1 : 0,
            unreadClient: role === 'admin' ? (c.unreadClient || 0) + 1 : 0,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    return newMsg;
  };

  // Mark conversation as read
  const markAsRead = (conversationId, readerRole = 'admin') => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId || c.jobId === conversationId || c.clientEmail === conversationId) {
          return {
            ...c,
            [readerRole === 'admin' ? 'unreadAdmin' : 'unreadClient']: 0,
          };
        }
        return c;
      })
    );
  };

  return {
    conversations,
    setConversations,
    sendMessage,
    markAsRead,
  };
};

