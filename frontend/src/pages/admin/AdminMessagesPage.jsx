import React from 'react';
import { CustomerMessagesPage } from '../customer/CustomerModules';

/**
 * Superadmin & Staff Menu 7: Messages Inbox
 * Uses the modern 2-column role-isolated communications hub
 * Admins manage 1-on-1 conversations with all active Customers and Surveyors.
 */
export const AdminMessagesPage = () => {
  return <CustomerMessagesPage />;
};

export default AdminMessagesPage;
