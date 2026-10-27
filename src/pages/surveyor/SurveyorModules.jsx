import React from 'react';
import { PlaceholderModule } from '../../components/PlaceholderModule';

export const SurveyorCalendarPage = () => {
  const stats = [
    { label: 'Inspections This Week', value: '8 Scheduled', subtext: 'Home Counties & SW London' },
    { label: 'Average Travel Radius', value: '14.2 Miles', subtext: 'Optimized route planning' },
    { label: 'Blocked Leave Days', value: '0 Days', subtext: 'Full capacity this week' },
    { label: 'Upcoming Calendar Holds', value: '4 Tentative', subtext: 'Awaiting client terms' },
  ];

  const columns = [
    { header: 'Inspection Date', accessor: 'date' },
    { header: 'Time Slot', accessor: 'time' },
    { header: 'Property Address', accessor: 'address' },
    { header: 'Survey Standard', accessor: 'standard' },
    { header: 'Contact Telephone', accessor: 'phone' },
    {
      header: 'Booking State',
      accessor: 'status',
      render: (val) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          val === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { date: '27/10/2026', time: '10:00 - 13:00', address: '18 Highfield Ave, Guildford GU2', standard: 'Level 2 Home Survey', phone: '+44 7700 900384', status: 'Confirmed' },
    { date: '27/10/2026', time: '14:30 - 16:30', address: '24 Kensington Palace Gardens, W8', standard: 'Level 3 Building Survey', phone: '+44 20 7946 0912', status: 'Confirmed' },
    { date: '28/10/2026', time: '10:00 - 12:30', address: '45 Park Mansions, Battersea SW11', standard: 'Level 2 Home Survey', phone: '+44 7700 900512', status: 'Confirmed' },
    { date: '29/10/2026', time: '11:00 - 14:00', address: '82 St Andrews Rd, Surbiton KT6', standard: 'Specific Defect Survey', phone: '+44 7700 900891', status: 'Confirmed' },
    { date: '30/10/2026', time: '09:30 - 12:00', address: '15 High St, Wimbledon SW19', standard: 'Level 3 Building Survey', phone: '+44 7700 900223', status: 'Confirmed' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Surveyor"
      menuTitle="My Inspection Calendar"
      menuDescription="Review your scheduled on-site inspections, route timings, and contact numbers."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Sync Google / Outlook"
    />
  );
};

export const SurveyorJobsPage = () => {
  const stats = [
    { label: 'Assigned Active Jobs', value: '9', subtext: 'In various survey stages' },
    { label: 'Site Visits Completed', value: '6', subtext: 'Ready for typing / photo upload' },
    { label: 'Finalized Reports (Mo)', value: '14', subtext: 'Approved by lead surveyor' },
    { label: 'Avg Feedback Score', value: '4.98 / 5', subtext: 'Client survey reviews' },
  ];

  const columns = [
    { header: 'Job Ref', accessor: 'ref' },
    { header: 'Property Address', accessor: 'address' },
    { header: 'Type', accessor: 'type' },
    { header: 'Client', accessor: 'client' },
    { header: 'Agreed Deadline', accessor: 'deadline' },
    {
      header: 'My Status',
      accessor: 'status',
      render: (val) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          val === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
          val === 'Report Typing' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { ref: 'JOB-2026-081', address: '24 Kensington Palace Gardens, W8', type: 'Level 3 Building Survey', client: 'Kensington Estates', deadline: '29/10/2026', status: 'Inspection Today' },
    { ref: 'JOB-2026-080', address: '14 Mayfair Gate, London W1K', type: 'Level 2 Home Survey', client: 'Emma Watson', deadline: '28/10/2026', status: 'Report Typing' },
    { ref: 'JOB-2026-079', address: '8 Chichester Rd, Richmond TW10', type: 'Defect Survey', client: 'Richmond Borough', deadline: '26/10/2026', status: 'Completed' },
    { ref: 'JOB-2026-078', address: '42 Belgrave Square, London SW1X', type: 'Commercial Valuation', client: 'Apex Holdings', deadline: '25/10/2026', status: 'Completed' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Surveyor"
      menuTitle="My Survey Jobs Register"
      menuDescription="Full register of property inspections allocated to you with SLA delivery tracking."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Create Field Job Note"
    />
  );
};

export const SurveyorSiteVisitsPage = () => {
  const stats = [
    { label: 'Visited Sites (This Month)', value: '18', change: '+3 vs last month', isPositive: true },
    { label: 'Photographs Uploaded', value: '482', subtext: 'High-res defect evidence' },
    { label: 'Defect Alerts Flagged', value: '12 Red', subtext: 'Condition Rating 3 items' },
    { label: 'Access Issues Recorded', value: '0', subtext: 'Smooth agent collections' },
  ];

  const columns = [
    { header: 'Visit Date', accessor: 'date' },
    { header: 'Property Inspected', accessor: 'property' },
    { header: 'Key Collection Point', accessor: 'keys' },
    { header: 'Defect Severity Count', accessor: 'defects' },
    {
      header: 'Site Sign-Off',
      accessor: 'signOff',
      render: (val) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { date: '26/10/2026', property: '14 Mayfair Gate, London W1K', keys: 'Vendor present on site', defects: '2 Condition Rating 3 (Roof flashing)', signOff: 'Inspected' },
    { date: '25/10/2026', property: '8 Chichester Rd, Richmond TW10', keys: 'Keys returned to Dexters', defects: '1 CR3 (Subsidence monitoring)', signOff: 'Inspected' },
    { date: '24/10/2026', property: '42 Belgrave Square, SW1X', keys: 'Concierge check-out', defects: 'No critical defects', signOff: 'Inspected' },
    { date: '22/10/2026', property: '14 Kingston Hill, Kingston KT2', keys: 'Key safe on site', defects: '1 Condition Rating 2 (Timber rot)', signOff: 'Inspected' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Surveyor"
      menuTitle="Site Visits & On-Site Evidence"
      menuDescription="Log property access, key check-in/out timestamps, moisture meter readings, and defect severity notes."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Check-In at Site"
    />
  );
};

export const SurveyorUploadReportsPage = () => {
  const stats = [
    { label: 'Drafts Awaiting Upload', value: '2', subtext: 'Due for upload today' },
    { label: 'Under QA Review', value: '1', subtext: 'Peer review in progress' },
    { label: 'Dispatched to Customer', value: '14', subtext: 'This month' },
    { label: 'Avg File Size', value: '18.4 MB', subtext: 'High-res PDF reports' },
  ];

  const columns = [
    { header: 'Report Reference', accessor: 'ref' },
    { header: 'Property Address', accessor: 'address' },
    { header: 'Report Standard', accessor: 'type' },
    { header: 'Draft Version', accessor: 'version' },
    {
      header: 'Upload Status',
      accessor: 'status',
      render: (val) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          val === 'Approved & Dispatched' ? 'bg-emerald-100 text-emerald-800' :
          val === 'In QA Review' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { ref: 'RPT-2026-080', address: '14 Mayfair Gate, London W1K', type: 'RICS Level 2 Home Survey', version: 'Draft v1.1', status: 'Ready for Upload' },
    { ref: 'RPT-2026-079', address: '8 Chichester Rd, Richmond TW10', type: 'Specific Defect Report', version: 'Final v2.0', status: 'Approved & Dispatched' },
    { ref: 'RPT-2026-078', address: '42 Belgrave Square, SW1X', type: 'Commercial Valuation Report', version: 'Final v1.0', status: 'Approved & Dispatched' },
    { ref: 'RPT-2026-077', address: '18 Highfield Ave, Guildford', type: 'RICS Level 2 Home Survey', version: 'Pre-inspection template', status: 'Pending Site Visit' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Surveyor"
      menuTitle="Upload Survey Reports & Documents"
      menuDescription="Upload completed RICS survey reports, high-resolution photographs, structural defect sketches, and sign-offs."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Upload PDF Report"
    />
  );
};

export const SurveyorAvailabilityPage = () => {
  const stats = [
    { label: 'Weekly Inspection Slots', value: '10 Slots', subtext: '2 per day (Mon-Fri)' },
    { label: 'Active Coverage Postcodes', value: 'GU, KT, SW', subtext: 'Surrey & South West London' },
    { label: 'Notice Period Required', value: '24 Hours', subtext: 'For short-notice bookings' },
    { label: 'Next Scheduled Leave', value: 'None booked', subtext: 'Full availability in Nov' },
  ];

  const columns = [
    { header: 'Day of Week', accessor: 'day' },
    { header: 'Available Inspection Windows', accessor: 'windows' },
    { header: 'Maximum Inspections per Day', accessor: 'max' },
    { header: 'Postcode Restrictions', accessor: 'postcodes' },
    {
      header: 'Working Status',
      accessor: 'status',
      render: (val) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { day: 'Monday', windows: '09:00 - 13:00, 14:00 - 17:30', max: '2 Inspections', postcodes: 'GU, KT Postcodes', status: 'Available' },
    { day: 'Tuesday', windows: '09:00 - 13:00, 14:00 - 17:30', max: '2 Inspections', postcodes: 'SW, W London', status: 'Available' },
    { day: 'Wednesday', windows: '09:00 - 13:00, 14:00 - 17:30', max: '2 Inspections', postcodes: 'GU, RH Surrey', status: 'Available' },
    { day: 'Thursday', windows: '09:00 - 13:00, 14:00 - 17:30', max: '2 Inspections', postcodes: 'KT, TW Postcodes', status: 'Available' },
    { day: 'Friday', windows: '09:00 - 13:00, 14:00 - 16:30', max: '2 Inspections', postcodes: 'SW London', status: 'Available' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Surveyor"
      menuTitle="My Availability & Coverage Settings"
      menuDescription="Define your working days, daily inspection limits, regional UK postcode coverage, and holiday bookings."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Update Working Hours"
    />
  );
};
