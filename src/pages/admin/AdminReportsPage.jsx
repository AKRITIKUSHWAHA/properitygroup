import React from 'react';
import { PlaceholderModule } from '../../components/PlaceholderModule';

export const AdminReportsPage = () => {
  const stats = [
    { label: 'YTD Survey Revenue', value: '£1.42M', change: '+22.4%', isPositive: true },
    { label: 'Completed Surveys YTD', value: '1,894', subtext: '99.2% satisfaction rate' },
    { label: 'Top Performing Postcode', value: 'SW London', subtext: '34% of volume' },
    { label: 'Average Order Value', value: '£750', subtext: 'GBP per survey instruction' },
  ];

  const columns = [
    { header: 'Report Name', accessor: 'name' },
    { header: 'Reporting Frequency', accessor: 'frequency' },
    { header: 'Data Scope', accessor: 'scope' },
    { header: 'Last Generated', accessor: 'lastRun' },
    { header: 'File Format', accessor: 'format' },
    {
      header: 'Export State',
      accessor: 'status',
      render: (val) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
          {val}
        </span>
      ),
    },
  ];

  const data = [
    { name: 'Monthly Financial & Revenue Statement', frequency: 'Monthly', scope: 'All Fee Earners & VAT', lastRun: '01/10/2026', format: 'PDF & XLSX', status: 'Ready' },
    { name: 'Surveyor Output & Time-to-Delivery KPI', frequency: 'Weekly', scope: '34 Panel Surveyors', lastRun: '27/10/2026', format: 'CSV', status: 'Ready' },
    { name: 'RICS Quality Audit & Defect Sample Pack', frequency: 'Quarterly', scope: 'Compliance Random Sample', lastRun: '30/09/2026', format: 'ZIP Archive', status: 'Ready' },
    { name: 'Lead Acquisition & Conversion by Channel', frequency: 'Weekly', scope: 'Rightmove / Web / Panels', lastRun: '26/10/2026', format: 'Interactive', status: 'Ready' },
  ];

  return (
    <PlaceholderModule
      roleLabel="Super Admin"
      menuTitle="Reports & Business Intelligence"
      menuDescription="Analyse surveying revenue performance, surveyor field productivity, regional market demand, and compliance metrics."
      stats={stats}
      columns={columns}
      data={data}
      actionLabel="Generate Custom Report"
    />
  );
};
