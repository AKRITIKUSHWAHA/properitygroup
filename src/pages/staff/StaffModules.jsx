import React from 'react';
import { PlaceholderModule } from '../../components/PlaceholderModule';
import { AdminQuotesPage } from '../admin/AdminQuotesPage';
import { AdminTermsPage } from '../admin/AdminTermsPage';
import { AdminCompaniesPage } from '../admin/AdminCompaniesPage';
import { AdminReportsPage } from '../admin/AdminReportsPage';
import { AdminLeadsPage } from '../admin/AdminLeadsPage';

export const StaffCompaniesPage = () => {
  return <AdminCompaniesPage />;
};

export const StaffLeadsPage = () => {
  return <AdminLeadsPage />;
};

export const StaffQuotesPage = () => {
  return <AdminQuotesPage />;
};

export const StaffTermsPage = () => {
  return <AdminTermsPage />;
};

export const StaffReportsPage = () => {
  return <AdminReportsPage />;
};

