import React from 'react';
import { PlaceholderModule } from '../../components/PlaceholderModule';

export const CustomerBookingsPage = () => {
  const stats = [
    { label: 'Active Survey Bookings', value: '1', subtext: 'Site inspected' },
    { label: 'Completed Past Surveys', value: '2', subtext: 'Archived in portal' },
    { label: 'Assigned Chartered Surveyor', value: 'David Thorne MRICS', subtext: 'RICS #489211' },
    { label: 'Next Status Milestone', value: 'Report Delivery', subtext: 'Scheduled for 28/10/2026' },
  ];

  const columns = [
    { header: 'Booking Ref', accessor: 'ref' },
    { header: 'Property Address', accessor: 'address' },
    { header: 'Survey Type', accessor: 'type' },
    { header: 'Inspection Date', accessor: 'date' },
    { header: 'Fee Paid (GBP)', accessor: 'fee' },
    {
      header: 'Booking Status',
      accessor: 'status',
      render: (val) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          val === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { ref: 'JOB-2026-080', address: '14 Mayfair Gate, London W1K 2PB', type: 'RICS Home Survey - Level 2', date: '26/10/2026', fee: '£650.00', status: 'Report Drafting' },
    { ref: 'JOB-2025-412', address: '9 Chelsea Manor St, London SW3 5PU', type: 'Specific Defect Survey', date: '14/09/2025', fee: '£550.00', status: 'Completed' },
    { ref: 'JOB-2024-190', address: '22 Richmond Green, Richmond TW9 1LX', type: 'RICS Level 2 Survey', date: '05/03/2024', fee: '£595.00', status: 'Completed' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Customer Portal"
      menuTitle="My Survey Bookings"
      menuDescription="Review your scheduled and completed property surveys, inspector notes, and key logistics."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Book Another Survey"
    />
  );
};

export const CustomerQuotationsPage = () => {
  const stats = [
    { label: 'Accepted Quotations', value: '3', subtext: 'All converted' },
    { label: 'Active Pending Quotes', value: '1 New', subtext: 'Valid for 30 days' },
    { label: 'Average Quotation Value', value: '£680', subtext: 'RICS standard pricing' },
    { label: 'Price Guarantee', value: 'Fixed Fee', subtext: 'No hidden disbursements' },
  ];

  const columns = [
    { header: 'Quote Ref', accessor: 'ref' },
    { header: 'Property Address', accessor: 'property' },
    { header: 'Scope of Inspection', accessor: 'scope' },
    { header: 'Total (inc. VAT)', accessor: 'total' },
    { header: 'Valid Until', accessor: 'valid' },
    {
      header: 'Action / State',
      accessor: 'state',
      render: (val) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          val === 'Accepted & Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
        }`}>
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { ref: 'KQ-9042', property: '14 Mayfair Gate, London W1K', scope: 'RICS Level 2 Home Survey with Valuation', total: '£650.00', valid: '20/11/2026', state: 'Accepted & Paid' },
    { ref: 'KQ-9102', property: '33 Eaton Mews South, SW1W', scope: 'RICS Level 3 Building Survey', total: '£1,450.00', valid: '27/11/2026', state: 'Awaiting Your Decision' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Customer Portal"
      menuTitle="My Survey Quotations"
      menuDescription="Review transparent pricing proposals tailored to your property's age, size, and location."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Request New Quote"
    />
  );
};

export const CustomerTermsPage = () => {
  const stats = [
    { label: 'Signed Agreements', value: '3', subtext: 'Legally binding RICS terms' },
    { label: 'Action Required', value: '0 Pending', subtext: 'All current terms executed' },
    { label: 'PII Liability Cover', value: '£1,000,000', subtext: 'Per claim surveyor insurance' },
    { label: 'Complaints Procedure', value: 'RICS DRS', subtext: 'Dispute resolution service' },
  ];

  const columns = [
    { header: 'Agreement Name', accessor: 'name' },
    { header: 'Associated Property', accessor: 'property' },
    { header: 'Signed Date', accessor: 'date' },
    { header: 'Signature Verification', accessor: 'verify' },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { name: 'RICS Level 2 Standard Terms of Engagement', property: '14 Mayfair Gate, London W1K', date: '26/10/2026, 11:15', verify: 'E-Signed (Emma Watson)', status: 'Executed' },
    { name: 'Terms & Conditions for Specific Defect Assessment', property: '9 Chelsea Manor St, SW3', date: '14/09/2025, 14:02', verify: 'E-Signed (Emma Watson)', status: 'Executed' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Customer Portal"
      menuTitle="Terms to Sign & Engagement Documents"
      menuDescription="Access copies of your signed agreements, liability limits, and surveyor terms of engagement."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Download Terms PDF"
    />
  );
};

export const CustomerInvoicesPage = () => {
  const stats = [
    { label: 'Total Invoiced (GBP)', value: '£1,795.00', subtext: 'Historical transactions' },
    { label: 'Outstanding Balance', value: '£0.00', subtext: 'Account fully settled' },
    { label: 'VAT Paid (20%)', value: '£299.17', subtext: 'UK VAT receipts issued' },
    { label: 'Payment Method', value: 'Visa ending 4242', subtext: 'Stripe UK Secure' },
  ];

  const columns = [
    { header: 'Invoice #', accessor: 'no' },
    { header: 'Description / Property', accessor: 'desc' },
    { header: 'Date Settled', accessor: 'date' },
    { header: 'VAT Amount', accessor: 'vat' },
    { header: 'Total Paid (GBP)', accessor: 'total' },
    {
      header: 'Payment Status',
      accessor: 'status',
      render: (val) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { no: 'INV-UK-2026-904', desc: 'RICS Level 2 Survey - 14 Mayfair Gate', date: '26/10/2026', vat: '£108.33', total: '£650.00', status: 'Paid in Full' },
    { no: 'INV-UK-2025-412', desc: 'Specific Defect Survey - 9 Chelsea Manor St', date: '14/09/2025', vat: '£91.67', total: '£550.00', status: 'Paid in Full' },
    { no: 'INV-UK-2024-190', desc: 'Home Survey - 22 Richmond Green', date: '05/03/2024', vat: '£99.17', total: '£595.00', status: 'Paid in Full' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Customer Portal"
      menuTitle="Invoices & Payment Receipts"
      menuDescription="Download official UK VAT invoices, receipt summaries, and payment confirmation slips."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Download All Invoices"
    />
  );
};

export const CustomerReportsPage = () => {
  const stats = [
    { label: 'Delivered Reports', value: '2 Completed', subtext: 'Available for download' },
    { label: 'In Progress Report', value: '1 Pending', subtext: 'Ready within 24 hours' },
    { label: 'Report Format', value: 'RICS Digital PDF', subtext: 'High-res full colour' },
    { label: 'Follow-Up Call', value: 'Included (15m)', subtext: 'Direct with David Thorne' },
  ];

  const columns = [
    { header: 'Report Reference', accessor: 'ref' },
    { header: 'Property Inspected', accessor: 'property' },
    { header: 'Survey Standard', accessor: 'type' },
    { header: 'Lead Surveyor', accessor: 'surveyor' },
    { header: 'Report Date', accessor: 'date' },
    {
      header: 'Availability',
      accessor: 'status',
      render: (val) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          val === 'Ready for Download' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { ref: 'RPT-2026-080', property: '14 Mayfair Gate, London W1K 2PB', type: 'RICS Level 2 Home Survey', surveyor: 'David Thorne MRICS', date: '28/10/2026 (ETA)', status: 'Drafting (90%)' },
    { ref: 'RPT-2025-412', property: '9 Chelsea Manor St, London SW3 5PU', type: 'Specific Defect Assessment', surveyor: 'Claire Bennet AssocRICS', date: '16/09/2025', status: 'Ready for Download' },
    { ref: 'RPT-2024-190', property: '22 Richmond Green, TW9 1LX', type: 'RICS Home Survey - Level 2', surveyor: 'Jonathan Cross FRICS', date: '08/03/2024', status: 'Ready for Download' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Customer Portal"
      menuTitle="My Final Survey Reports"
      menuDescription="Download your comprehensive RICS survey reports, defect photos, condition ratings (1-3), and valuation certificates."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Download Latest Report"
    />
  );
};

export const CustomerDetailsPage = () => {
  const stats = [
    { label: 'Primary Contact', value: 'Emma Watson', subtext: 'Watson Holdings UK' },
    { label: 'Contact Phone', value: '+44 7700 900147', subtext: 'Verified UK mobile' },
    { label: 'Registered Email', value: 'customer@demo.com', subtext: 'Primary correspondence' },
    { label: 'Solicitor on File', value: 'Farrer & Co LLP', subtext: 'Lincoln’s Inn Fields' },
  ];

  const columns = [
    { header: 'Property / Correspondence Address', accessor: 'address' },
    { header: 'Associated Conveyancing Solicitor', accessor: 'solicitor' },
    { header: 'Estate Agent Contact', accessor: 'agent' },
    { header: 'Account Created', accessor: 'created' },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { address: '14 Mayfair Gate, London W1K 2PB', solicitor: 'Farrer & Co LLP (Ref: FC-9482)', agent: 'Knight Frank Mayfair', created: '02/09/2025', status: 'Active' },
    { address: 'Flat 4, 9 Chelsea Manor St, SW3 5PU', solicitor: 'Cripps LLP (Ref: CR-1102)', agent: 'Savills Chelsea', created: '02/09/2025', status: 'Active' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Customer Portal"
      menuTitle="My Personal Details & Solicitors"
      menuDescription="Maintain your UK contact information, conveyancing solicitor details for report sharing, and estate agent contacts."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Update Details"
    />
  );
};

export const CustomerSupportPage = () => {
  const stats = [
    { label: 'Customer Helpline', value: '020 7946 0912', subtext: '09:00 - 17:30 Mon-Fri (UK)' },
    { label: 'Average Support Response', value: '12 Minutes', subtext: 'During business hours' },
    { label: 'Assigned Account Manager', value: 'Sarah Jenkins', subtext: 'Operations lead' },
    { label: 'Urgent Survey Hotline', value: 'Available', subtext: 'For exchange deadlines' },
  ];

  const columns = [
    { header: 'Support Ticket #', accessor: 'ticket' },
    { header: 'Inquiry Subject', accessor: 'subject' },
    { header: 'Related Property', accessor: 'property' },
    { header: 'Date Opened', accessor: 'date' },
    {
      header: 'Resolution Status',
      accessor: 'status',
      render: (val) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          val === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { ticket: 'TCK-2026-88', subject: 'Vendor delayed key access by 1 hour', property: '14 Mayfair Gate, W1K', date: '26/10/2026', status: 'Resolved' },
    { ticket: 'TCK-2025-14', subject: 'Query regarding chimney breast condition rating in report', property: '9 Chelsea Manor St, SW3', date: '18/09/2025', status: 'Resolved' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Customer Portal"
      menuTitle="Customer Support & Survey Inquiries"
      menuDescription="Contact our London survey operations desk, request surveyor call-backs, or ask questions about condition ratings."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Open Support Ticket"
    />
  );
};
