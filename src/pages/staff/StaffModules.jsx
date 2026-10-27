import React from 'react';
import { PlaceholderModule } from '../../components/PlaceholderModule';
import { AdminQuotesPage } from '../admin/AdminQuotesPage';
import { AdminTermsPage } from '../admin/AdminTermsPage';

export const StaffCompaniesPage = () => {
  const stats = [
    { label: 'Active Panel Firms', value: '24', change: '+2 this month', isPositive: true },
    { label: 'Estate Agent Offices', value: '62', subtext: 'Referring survey leads' },
    { label: 'Corporate Accounts', value: '18', subtext: 'Monthly account billing' },
    { label: 'Pending Panel Approvals', value: '3', subtext: 'Under review' },
  ];

  const columns = [
    { header: 'Practice / Agency', accessor: 'name' },
    { header: 'Branch Office', accessor: 'branch' },
    { header: 'Primary Contact', accessor: 'contact' },
    { header: 'Lead Volume (Mo)', accessor: 'leads' },
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
    { name: 'Foxtons Residential Surveys', branch: 'Richmond & Twickenham', contact: 'Marcus Bell', leads: '18', status: 'Active' },
    { name: 'Dexters Estate Agents', branch: 'Chelsea & Kensington', contact: 'Sarah Croft', leads: '29', status: 'Active' },
    { name: 'Hamptons International', branch: 'Guildford & Surrey', contact: 'James Wright', leads: '14', status: 'Active' },
    { name: 'Winkworth Property Group', branch: 'Battersea & Clapham', contact: 'Lucy Henderson', leads: '11', status: 'Active' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Admin / Staff"
      menuTitle="Companies & Estate Agent Panels"
      menuDescription="Manage estate agency branches, panel contacts, key collection procedures, and lead referrals."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Add Agency Branch"
    />
  );
};

export const StaffLeadsPage = () => {
  const stats = [
    { label: 'Open Inbound Inquiries', value: '14', change: '8 need call today', isPositive: false },
    { label: 'Quotes Generated Today', value: '9', subtext: 'Total value £5,850' },
    { label: 'Call Back Requests', value: '4', subtext: 'Requested callback after 5pm' },
    { label: 'Conversion Rate', value: '71.2%', change: '+4.1%', isPositive: true },
  ];

  const columns = [
    { header: 'Client Name', accessor: 'client' },
    { header: 'Contact Telephone', accessor: 'phone' },
    { header: 'Property Location', accessor: 'location' },
    { header: 'Survey Standard', accessor: 'type' },
    { header: 'Quote (GBP)', accessor: 'quote' },
    {
      header: 'Action Needed',
      accessor: 'action',
      render: (val) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { client: 'Richard & Sophie Hall', phone: '+44 7700 900512', location: '15 High St, Wimbledon SW19', type: 'Level 3 Survey', quote: '£1,250.00', action: 'Send Formal Quote' },
    { client: 'Gareth Edwards', phone: '+44 7700 900891', location: '82 St Andrews Rd, Surbiton KT6', type: 'Level 2 Survey', quote: '£620.00', action: 'Call Back Client' },
    { client: 'Samantha Ross', phone: '+44 7700 900334', location: '3 Victoria Terrace, Weybridge KT13', type: 'Structural Defect', quote: '£850.00', action: 'Check Surveyor Availability' },
    { client: 'David Miller', phone: '+44 7700 900219', location: '29 Palace Court, London W2', type: 'Level 2 Survey', quote: '£650.00', action: 'Terms Pending Sign' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Admin / Staff"
      menuTitle="CRM & Lead Management"
      menuDescription="Process incoming survey requests, provide quick telephone quotes, and convert inquiries into booked surveys."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Log New Inquiry"
    />
  );
};

export const StaffJobsPage = () => {
  const stats = [
    { label: 'Active Instructions', value: '36', change: '+6 today', isPositive: true },
    { label: 'Site Visits Today', value: '8', subtext: 'Keys checked out' },
    { label: 'Reports in Typing / QA', value: '11', subtext: 'Target 48hr delivery' },
    { label: 'Awaiting Client Payment', value: '3', subtext: 'Prior to report release' },
  ];

  const columns = [
    { header: 'Job #', accessor: 'id' },
    { header: 'Property Address', accessor: 'address' },
    { header: 'Assigned Surveyor', accessor: 'surveyor' },
    { header: 'Access Method', accessor: 'access' },
    { header: 'Fee (GBP)', accessor: 'fee' },
    {
      header: 'Job Stage',
      accessor: 'stage',
      render: (val) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          val === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
          val === 'Inspection Today' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
        }`}>
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { id: 'JOB-2026-081', address: '24 Kensington Palace Gdns, W8', surveyor: 'David Thorne MRICS', access: 'Keys via Foxtons', fee: '£1,850.00', stage: 'Inspection Today' },
    { id: 'JOB-2026-080', address: '14 Mayfair Gate, London W1K', surveyor: 'Oliver Hughes MRICS', access: 'Vendor at property', fee: '£650.00', stage: 'Report Drafting' },
    { id: 'JOB-2026-079', address: '8 Chichester Rd, Richmond TW10', surveyor: 'Claire Bennet AssocRICS', access: 'Agent accompanied', fee: '£920.00', stage: 'Delivered' },
    { id: 'JOB-2026-078', address: '42 Belgrave Square, SW1X', surveyor: 'David Thorne MRICS', access: 'Concierge desk', fee: '£3,200.00', stage: 'Delivered' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Admin / Staff"
      menuTitle="Survey Operations & Dispatch"
      menuDescription="Coordinate on-site property access, keys from estate agents, surveyor equipment, and report deliveries."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Create Survey Job"
    />
  );
};

export const StaffQuotesPage = () => {
  return <AdminQuotesPage />;
};

export const StaffTermsPage = () => {
  return <AdminTermsPage />;
};


export const StaffReportsPage = () => {
  const stats = [
    { label: 'Surveys Dispatched This Week', value: '28', change: '+15%', isPositive: true },
    { label: 'Pending QA Proofreading', value: '4', subtext: 'With Chief Surveyor' },
    { label: 'Average Delivery Time', value: '44 Hours', subtext: 'SLA target: 48 Hours' },
    { label: 'Client Feedback Rating', value: '4.95 / 5.0', subtext: 'Trustpilot UK verified' },
  ];

  const columns = [
    { header: 'Report ID', accessor: 'id' },
    { header: 'Property Inspected', accessor: 'property' },
    { header: 'Survey Standard', accessor: 'type' },
    { header: 'Chartered Surveyor', accessor: 'surveyor' },
    { header: 'Completion Date', accessor: 'date' },
    {
      header: 'Delivery State',
      accessor: 'status',
      render: (val) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { id: 'RPT-9042', property: '8 Chichester Rd, Richmond TW10', type: 'Specific Defect Report', surveyor: 'Claire Bennet AssocRICS', date: '25/10/2026', status: 'Sent to Client' },
    { id: 'RPT-9041', property: '42 Belgrave Square, London SW1X', type: 'Full Valuation Certificate', surveyor: 'David Thorne MRICS', date: '24/10/2026', status: 'Sent to Client' },
    { id: 'RPT-9040', property: '107 Queenstown Rd, Battersea', type: 'RICS Level 2 Home Survey', surveyor: 'Jonathan Cross FRICS', date: '23/10/2026', status: 'Sent to Client' },
    { id: 'RPT-9039', property: '14 Kingston Hill, Kingston KT2', type: 'Residential Valuation (Red Book)', surveyor: 'David Thorne MRICS', date: '22/10/2026', status: 'Sent to Client' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Admin / Staff"
      menuTitle="Survey Reports & Dispatch Registry"
      menuDescription="Review finalized RICS survey reports, verify fee settlement, and dispatch branded PDFs to homeowners and solicitors."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Dispatch Final Report"
    />
  );
};
