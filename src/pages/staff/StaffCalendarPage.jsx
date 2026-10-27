import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { BookingCalendar } from '../../components/calendar/BookingCalendar';

export const StaffCalendarPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Survey Booking Calendar"
        subtitle="Schedule and synchronize on-site property inspections with chartered surveyors across the UK."
        breadcrumb={['Operations', 'Booking Calendar']}
      />
      <BookingCalendar />
    </div>
  );
};
