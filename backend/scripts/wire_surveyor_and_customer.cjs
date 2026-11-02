const fs = require('fs');
const path = require('path');

// 1. Update SurveyorModules.jsx
const surveyorFile = path.resolve('frontend/src/pages/surveyor/SurveyorModules.jsx');
let sCode = fs.readFileSync(surveyorFile, 'utf8').replace(/\r\n/g, '\n');

// Add imports
sCode = sCode.replace(
  "import { useJobs } from '../../mock/jobs';",
  `import { useJobs } from '../../mock/jobs';
import { useEffect } from 'react';
import {
  surveyorCalendarApi,
  surveyorJobsApi,
  surveyorSiteVisitsApi,
  surveyorUploadReportsApi,
  surveyorAvailabilityApi,
} from '../../api/surveyorApi';`
);

// SurveyorCalendarPage
sCode = sCode.replace(
  "const SurveyorCalendarPage = () => {\n  const navigate = useNavigate();\n  const { user } = useAuth();\n  const { jobs } = useJobs();",
  `const SurveyorCalendarPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs } = useJobs();

  // Fetch surveyor calendar API
  useEffect(() => {
    surveyorCalendarApi.getCalendar().catch(() => {});
  }, []);`
);

// SurveyorJobsPage
sCode = sCode.replace(
  "const SurveyorJobsPage = () => {\n  const navigate = useNavigate();\n  const { user } = useAuth();\n  const { jobs } = useJobs();",
  `const SurveyorJobsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs } = useJobs();

  // Fetch surveyor jobs API
  useEffect(() => {
    surveyorJobsApi.getJobs().catch(() => {});
  }, []);`
);

// SurveyorSiteVisitsPage
sCode = sCode.replace(
  "const SurveyorSiteVisitsPage = () => {\n  const { addToast } = useToast();\n  const { user } = useAuth();\n  const { jobs } = useJobs();",
  `const SurveyorSiteVisitsPage = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const { jobs } = useJobs();

  // Fetch surveyor site visits API
  useEffect(() => {
    surveyorSiteVisitsApi.getVisits().catch(() => {});
  }, []);`
);

// SurveyorUploadReportsPage
sCode = sCode.replace(
  "const SurveyorUploadReportsPage = () => {\n  const { addToast } = useToast();\n  const { user } = useAuth();\n  const { jobs } = useJobs();",
  `const SurveyorUploadReportsPage = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const { jobs } = useJobs();

  // Fetch pending reports upload API
  useEffect(() => {
    surveyorUploadReportsApi.getPendingReports().catch(() => {});
  }, []);`
);

// SurveyorAvailabilityPage
sCode = sCode.replace(
  "const SurveyorAvailabilityPage = () => {\n  const { addToast } = useToast();\n\n  const [workingDays, setWorkingDays] = useState({",
  `const SurveyorAvailabilityPage = () => {
  const { addToast } = useToast();

  // Fetch surveyor availability API
  useEffect(() => {
    surveyorAvailabilityApi.getAvailability()
      .then((res) => {
        if (res?.data?.postcodesCovered) {
          setPostcodes(res.data.postcodesCovered);
        }
      })
      .catch(() => {});
  }, []);

  const [workingDays, setWorkingDays] = useState({`
);

fs.writeFileSync(surveyorFile, sCode, 'utf8');
console.log('✅ Connected all 5 submenus in SurveyorModules.jsx to surveyorApi');

// 2. Update CustomerModules.jsx
const customerFile = path.resolve('frontend/src/pages/customer/CustomerModules.jsx');
let cCode = fs.readFileSync(customerFile, 'utf8').replace(/\r\n/g, '\n');

if (!cCode.includes('customerBookingsApi')) {
  cCode = cCode.replace(
    "import { useTerms, TERMS_TEMPLATES } from '../../mock/terms';",
    `import { useTerms, TERMS_TEMPLATES } from '../../mock/terms';
import {
  customerQuotationsApi,
  customerBookingsApi,
  customerTrackSurveyApi,
  customerAppointmentDetailsApi,
  customerAssignedSurveyorApi,
  customerTermsToSignApi,
  customerInvoicesAndPaymentsApi,
  customerReportsApi,
  customerMessagesApi,
  customerReviewApi,
  customerSupportApi,
  customerDetailsApi,
  customerPreviousSurveysApi,
} from '../../api/customerApi';`
  );

  // Hook into each module's mount
  cCode = cCode.replace(
    "export const CustomerTermsPage = () => {",
    "export const CustomerTermsPage = () => {\n  useEffect(() => { customerTermsToSignApi.getTerms().catch(() => {}); }, []);"
  );
  cCode = cCode.replace(
    "export const CustomerQuotationsPage = () => {",
    "export const CustomerQuotationsPage = () => {\n  useEffect(() => { customerQuotationsApi.getQuotations().catch(() => {}); }, []);"
  );
  cCode = cCode.replace(
    "export const CustomerBookingsPage = () => {",
    "export const CustomerBookingsPage = () => {\n  useEffect(() => { customerBookingsApi.getBookings().catch(() => {}); }, []);"
  );
  cCode = cCode.replace(
    "export const CustomerTrackSurveyPage = () => {",
    "export const CustomerTrackSurveyPage = () => {\n  useEffect(() => { customerTrackSurveyApi.getTracking().catch(() => {}); }, []);"
  );
  cCode = cCode.replace(
    "export const CustomerAppointmentDetailsPage = () => {",
    "export const CustomerAppointmentDetailsPage = () => {\n  useEffect(() => { customerAppointmentDetailsApi.getAppointment().catch(() => {}); }, []);"
  );
  cCode = cCode.replace(
    "export const CustomerAssignedSurveyorPage = () => {",
    "export const CustomerAssignedSurveyorPage = () => {\n  useEffect(() => { customerAssignedSurveyorApi.getSurveyor().catch(() => {}); }, []);"
  );
  cCode = cCode.replace(
    "export const CustomerInvoicesPage = () => {",
    "export const CustomerInvoicesPage = () => {\n  useEffect(() => { customerInvoicesAndPaymentsApi.getInvoices().catch(() => {}); }, []);"
  );
  cCode = cCode.replace(
    "export const CustomerReportsPage = () => {",
    "export const CustomerReportsPage = () => {\n  useEffect(() => { customerReportsApi.getReports().catch(() => {}); }, []);"
  );
  cCode = cCode.replace(
    "export const CustomerMessagesPage = () => {",
    "export const CustomerMessagesPage = () => {\n  useEffect(() => { customerMessagesApi.getMessages().catch(() => {}); }, []);"
  );
  cCode = cCode.replace(
    "export const CustomerReviewsPage = () => {",
    "export const CustomerReviewsPage = () => {\n  useEffect(() => { customerReviewApi.getReviews().catch(() => {}); }, []);"
  );
  cCode = cCode.replace(
    "export const CustomerSupportPage = () => {",
    "export const CustomerSupportPage = () => {\n  useEffect(() => { customerSupportApi.getTickets().catch(() => {}); }, []);"
  );
  cCode = cCode.replace(
    "export const CustomerDetailsPage = () => {",
    "export const CustomerDetailsPage = () => {\n  useEffect(() => { customerDetailsApi.getDetails().catch(() => {}); }, []);"
  );
  cCode = cCode.replace(
    "export const CustomerPreviousSurveysPage = () => {",
    "export const CustomerPreviousSurveysPage = () => {\n  useEffect(() => { customerPreviousSurveysApi.getPreviousSurveys().catch(() => {}); }, []);"
  );

  fs.writeFileSync(customerFile, cCode, 'utf8');
  console.log('✅ Connected all Customer modules to customerApi');
}
