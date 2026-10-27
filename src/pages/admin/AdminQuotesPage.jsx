import React from 'react';
import { PlaceholderModule } from '../../components/PlaceholderModule';

export const AdminQuotesPage = () => {
  const stats = [
    { label: 'Settled Payments (Oct)', value: '£92,450', change: '+18.5%', isPositive: true },
    { label: 'Pending Quotations', value: '£34,200', subtext: 'Awaiting client sign-off' },
    { label: 'Card & BACS Transactions', value: '114', subtext: 'Stripe UK & Bank Transfer' },
    { label: 'Overdue Invoices', value: '£0.00', subtext: '100% upfront / terms policy' },
  ];

  const columns = [
    { header: 'Quotation #', accessor: 'quoteNo' },
    { header: 'Client', accessor: 'client' },
    { header: 'Property & Service', accessor: 'details' },
    { header: 'Date Generated', accessor: 'date' },
    { header: 'Amount (GBP)', accessor: 'amount' },
    {
      header: 'Payment Status',
      accessor: 'payment',
      render: (val) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          val === 'Paid in Full' ? 'bg-emerald-100 text-emerald-800' :
          val === 'Authorized' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { quoteNo: 'KQ-2026-948', client: 'Emma Watson', details: '14 Mayfair Gate - Level 2 Survey', date: '26/10/2026', amount: '£650.00', payment: 'Paid in Full' },
    { quoteNo: 'KQ-2026-947', client: 'Kensington Estates PLC', details: '24 Kensington Palace Gardens - Level 3', date: '25/10/2026', amount: '£1,850.00', payment: 'Paid in Full' },
    { quoteNo: 'KQ-2026-946', client: 'Harrison Croft', details: '12 Pembroke Sq - Level 3 Survey', date: '24/10/2026', amount: '£1,450.00', payment: 'Awaiting Signature' },
    { quoteNo: 'KQ-2026-945', client: 'Apex Asset Holdings', details: '42 Belgrave Square - Valuation', date: '23/10/2026', amount: '£3,200.00', payment: 'Paid in Full' },
    { quoteNo: 'KQ-2026-944', client: 'Richmond Borough Properties', details: '8 Chichester Rd - Defect Survey', date: '22/10/2026', amount: '£920.00', payment: 'Paid in Full' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Super Admin"
      menuTitle="Quotations & Payment Gateway"
      menuDescription="Manage automated survey pricing matrices, client quotation agreements, VAT invoices, and merchant settlements."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Create Quotation"
    />
  );
};
