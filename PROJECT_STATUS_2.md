# NJS Property Group — Post-Remediation Project Status Report (`PROJECT_STATUS_2.md`)

> **Generated Date:** 25 November 2026  
> **Scope:** Read-only full-project audit after Prompts 1–15 (no code modified during this audit). Secrets and credential values are omitted.

---

## 1. Module Status Table (WORKING / PARTIAL / BROKEN)

| Module | Status | Notes & Evidence |
| :--- | :--- | :--- |
| **Authentication & JWT Security** | **WORKING** | `backend/src/middlewares/authMiddleware.js` strictly requires `Bearer` JWT (`verifyJWT`), loads active user from DB, no role fallback, no `x-user-email` header trust. `backend/src/config/env.js` exits if `JWT_SECRET` is missing or uses the old default. *(Note: `authController.js` lines 130–219 still have dev/demo login email checks for `demo.com` / `njsadmin@gmail.com` when matching DB records.)* |
| **CRM, Leads, Call Notes & Complaints** | **WORKING** | `backend/src/controllers/crmAndLeadsController.js` + `AdminLeadsPage.jsx`. Call logs (`CallLog`) and complaints (`ComplaintLog`) persisted in MySQL. `/crm-and-leads/lsd` protected by `LSD_WEBHOOK_SECRET`. |
| **Quote Issuance (`quoteService.js`)** | **WORKING** | Single transactional service (`issueQuote`) supersedes prior active quotes (`SUPERSEDED`), creates sequential unique references (`references.js`), prevents duplicate notifications, and never returns fake quotes on DB error. |
| **Customer Portal (14 Menus)** | **WORKING** | All 14 routes mounted in `frontend/src/App.jsx` (`L435–454`) and `backend/src/routes/customer/index.js`, backed by MySQL APIs with ownership checks (`clientId` / `clientEmail`). |
| **Terms of Engagement & Digital Signature** | **WORKING** | `termsAndDocumentsController.js` blocks Terms dispatch if job has no `ACCEPTED` quote (`400`). `customerTermsToSignController.js` enforces strict ownership (`403`), logs SHA-256 tamper hash, and transitions job to `TERMS_SIGNED`. |
| **Invoices, Stripe & BACS Payments** | **WORKING** | `customerInvoicesAndPaymentsController.js` enforces signed Terms before payment (`400`), never marks card payments `PAID` without Stripe verification, and allows Admin BACS settlement (`settleBacsPayment`). |
| **10-Stage Job Lifecycle & Tracker** | **WORKING** | Canonical 10-stage `JobStage` enum (`ENQUIRY`, `QUOTE_ISSUED`, `QUOTE_ACCEPTED`, `TERMS_SIGNED`, `PAID`, `BOOKED`, `INSPECTED`, `DRAFTING`, `QA_REVIEW`, `COMPLETE`) enforced via `backend/src/utils/jobStages.js` (`isValidTransition`) and `AuditLog`. |
| **Surveyor Portal & Isolation** | **PARTIAL** | Strict `surveyorId` isolation across `surveyorJobsController.js`, `surveyorSiteVisitsController.js`, `surveyorUploadReportsController.js`, `surveyorCalendarController.js`, and `surveyJobsController.js`. On-site buttons & PDF report upload (`.pdf`, <=50MB) work end-to-end. **Partial:** 48h SLA countdown in `SurveyorDashboardPage.jsx` is static UI state, and on-site room photos/defect notes are not stored in a dedicated DB model. |
| **Booking Reminder Scheduler** | **WORKING** | `backend/src/services/bookingReminderJob.js` runs on configurable `setInterval` (`ENABLE_BOOKING_REMINDER_JOB`), scans `PAID` + signed-terms + unbooked jobs, enforces max 2 reminders via `AuditLog` (`BOOKING_REMINDER_SENT`), plus Admin trigger `POST /api/v1/survey-jobs/reminders/run`. |
| **Messaging & Point 9 Notifications** | **WORKING** | `customerMessagesController.js` isolates `conv-user-${userId}` threads, triggers `sendClientMessageToAdminNotificationEmail` + `ADMIN` notification on customer/surveyor message, and `sendAdminReplyToClientNotificationEmail` + recipient notification on admin reply. |
| **Email Service (`emailService.js`)** | **WORKING** | Uses Resend (`RESEND_API_KEY`). When unconfigured/failing, logs `EMAIL_DELIVERY_FAILED` and returns `{ success: false, emailSent: false }` (never fakes success). Includes `sendPostInspectionUpdateEmail`, `sendBookingReminderEmail`, and Trustpilot review CTA in `sendReportReadyEmail`. |
| **Frontend State vs `localStorage`** | **PARTIAL** | Core business flows use backend APIs, but legacy `localStorage` reads/writes still remain in several frontend files (`CustomerModules.jsx`, `AdminUsersPage.jsx`, `autoQuoteService.js`, `AuthContext.jsx`, `mock/*.js`). |

---

## 2. Remaining `localStorage` / `sessionStorage`, Empty `catch {}`, and Hardcoded Fallbacks

### 2.1 Remaining `localStorage` / `sessionStorage` Usage (Frontend)
Top files by occurrence count (grep across `frontend/src`):
- `frontend/src/pages/customer/CustomerModules.jsx` (88)
- `frontend/src/pages/admin/AdminUsersPage.jsx` (63)
- `frontend/src/services/autoQuoteService.js` (43)
- `frontend/src/auth/AuthContext.jsx` (26 — includes auth token + legacy cleanup)
- `frontend/src/pages/customer/CustomerDashboardPage.jsx` (20)
- `frontend/src/mock/jobs.js` (19), `leads.js` (13), `messages.js` (10), `partners.js` (5), `permissions.js` (5), `emailAutomations.js` (5), `clientProfiles.js` (4), `quotes.js` (3), `terms.js` (2)
- `frontend/src/pages/jobs/JobDetailsPage.jsx` (12), `AdminSettingsPage.jsx` (8), `QuoteRequestForm.jsx` (7), `NotificationDropdown.jsx` (6), `App.jsx` (6), `AdminLeadsPage.jsx` (5), `AdminQuotesPage.jsx` (5), `Sidebar.jsx` (4), `RegisterPage.jsx` (4), `SurveyorDashboardPage.jsx` (4), `notificationService.js` (4), `apiClient.js` (3), `BookingCalendar.jsx` (2), `SendTermsModal.jsx` (2), `SurveyorModules.jsx` (2), `ActivatePage.jsx` (2), `AdminReportsPage.jsx` (1), `AdminSurveyorsPage.jsx` (1), `AdminTermsPage.jsx` (1), `LoginPage.jsx` (1)

### 2.2 Remaining Empty `catch {}` / `.catch(() => {})`
- **Backend (`backend/src`):** **0** empty catch blocks found.
- **Frontend (`frontend/src`):** Remaining empty catches in `apiClient.js:46`, `AuthContext.jsx:75,408,455`, `BookingCalendar.jsx:51,281,291,300,478`, `NewBookingModal.jsx:50`, `RescheduleModal.jsx:69,184,194`, `SendTermsModal.jsx:53`, `QuoteRequestForm.jsx:149,152,185`, `NotificationDropdown.jsx:160,172,358,374`, `Sidebar.jsx:129,138,174`, `mock/*.js` (13), `AdminLeadsPage.jsx:441,737`, `AdminQuotesPage.jsx:46,52,57,63,87,362,603`, `AdminSettingsPage.jsx:67`, `AdminUsersPage.jsx` (12 occurrences).

### 2.3 Remaining Hardcoded Fallbacks / Demo Emails / Sample Postcodes
- **Backend (`backend/src`):**
  - `authController.js:130,150,170,207,213,219` — demo email checks (`admin@demo.com`, `surveyor@demo.com`, `customer@demo.com`, `njsadmin@gmail.com`, `njssurveyor@gmail.com`)
  - `customerMessagesController.js:165` — `u.email.includes('demo.com')` tie-breaker in contact dedup
  - `crmAndLeadsController.js:392` — `clientEmail || 'client@demo.com'` fallback on LSD lead ingest
- **Frontend (`frontend/src`):**
  - `AuthContext.jsx:53-56,213-215`, `mock/users.js:17-187`, `mock/jobs.js:60`, `NotificationDropdown.jsx:119,123` — demo account definitions/checks
  - `EmailTemplatePreviewModal.jsx:55-57,299,310` — preview template placeholders (`customer@demo.com`, `W1K 2PB`)
  - `RecentActivityRow.jsx:19`, `AdminDashboardPage.jsx:89,229,477`, `mock/messages.js:103,106`, `mock/emailAutomations.js:394` — fallback postcodes (`W1K 2PB`, `SW1A`) and `customer@demo.com`
  - `HeroSlider.jsx:204`, `InstantQuoteCalculator.jsx:41,72,187` — UI placeholder examples (`SW1A 1AA`, `GU1 4AA`)

---

## 3. Client's Original 10 Points — Code Trace

| # | Client Requirement | How Handled Now & File/Line | Status / UNSURE |
| :--- | :--- | :--- | :--- |
| **1** | CRM call notes & complaints log | `crmAndLeadsController.js:248-315` (`addCallLog`, `addComplaint`, `resolveComplaint`), `leadController.js:87-130`, `surveyJobsController.js:611` (`CallLog` & `ComplaintLog` in Prisma). | **WORKING** |
| **2** | Automated quote email & deduplication | `backend/src/services/quoteService.js` (`issueQuote`): single Prisma transaction supersedes prior quotes, generates `QUO-YYYY-XXXX`, sends `sendQuoteProposalEmail`, prevents duplicate notifications. | **WORKING** |
| **3** | Quote acceptance → exact fee in Terms & Invoice | `customerQuotationsController.js:170-269` (`acceptCustomerQuotation`): sets `QUOTE_ACCEPTED`, creates `Term` and `Invoice` using quote's exact `baseFee`, `vatAmount`, `totalAmount`. | **WORKING** |
| **4** | Terms of Engagement & digital signature | `termsAndDocumentsController.js:59-129` (requires `ACCEPTED` quote), `customerTermsToSignController.js:55-283` (ownership check, SHA-256 hash, sets `TERMS_SIGNED`, sends `sendTermsSignedEmail`). | **WORKING** |
| **5** | Payment gate (Terms signed + Stripe/BACS) | `customerInvoicesAndPaymentsController.js:51-333`: blocks payment if `!termsSigned` (`400`), card requires Stripe verification, admin BACS settle (`quotationsAndPaymentsController.js`) marks `PAID` + sends receipt. | **WORKING** |
| **6** | Booking & surveyor assignment prerequisites | `surveyJobsController.js:402-494` (`assignSurveyor`) & `273-283` (`updateJobStage` `BOOKED`): enforces `PAID` invoice + signed `Term`, transitions to `BOOKED`, sends `sendInspectionBookedEmail`. | **WORKING** |
| **7** | Booking reminder (unbooked, max 2) | `backend/src/services/bookingReminderJob.js:11-125` + `server.js:25` + `surveyJobsRoutes.js:25` (`POST /reminders/run`): scans `PAID`/`TERMS_SIGNED` jobs with `inspectionDate: null`, max 2 via `AuditLog` (`BOOKING_REMINDER_SENT`), calls `sendBookingReminderEmail`. | **WORKING** |
| **8** | Inspection complete update email | `surveyorSiteVisitsController.js:78-174` (`completeSiteVisit`) & `surveyJobsController.js:359-390` (`updateJobStage`): transitions to `INSPECTED`/`DRAFTING` and sends `sendPostInspectionUpdateEmail`. | **WORKING** |
| **9** | Customer message ↔ Admin Gmail & portal notification | `customerMessagesController.js:354-501` (`sendCustomerMessage`): customer/surveyor message triggers `sendClientMessageToAdminNotificationEmail` + `ADMIN` notification; admin reply triggers `sendAdminReplyToClientNotificationEmail` + recipient notification. | **WORKING** |
| **10** | QA Review → Final Report PDF + Trustpilot link | `surveyorUploadReportsController.js:39-142` (PDF type/size check → `QA_REVIEW`), `reportsAndAnalyticsController.js:117-209` (`approveQaReport` → `COMPLETE` + `sendReportReadyEmail`), `emailService.js:1217-1224` (Trustpilot CTA). `customerReportsController.js:19-22` gates customer access on `COMPLETE` + `reportPdfUrl` + `qaApprovedAt`. | **WORKING** *(Surveyor 48h SLA timer & room-photo DB persistence remain **UNSURE** / not yet scoped as separate DB models).* |

---

## 4. Automated Checks & Test Results (Executed After All Edits)

| Check | Command | Result | Details |
| :--- | :--- | :--- | :--- |
| **Backend Syntax** | `node --check` on all 115 `.js` files in `backend/src` | **PASS (0 errors)** | All 115 files valid ESM syntax. |
| **Backend Tests** | `npm --prefix backend test` (`vitest run`) | **PASS (13/13)** | Auth/401/header impersonation, cross-customer 403, quote dedup, exact £600 fee, terms/payment guards, BACS settle, stage jump 400, surveyor isolation, email honesty. Isolated on `njs_db_test`. |
| **10-Step E2E Flow** | `npm --prefix backend run test:flow` | **PASS (1/1)** | Lead → £600 Quote → Accept → Terms → Sign → BACS claim → Admin Settle (`PAID`) → Admin notifications verified on `njs_db_test`. |
| **Frontend Build** | `npm --prefix frontend run build` (`vite build`) | **PASS** | 2269 modules transformed, exit code 0. |
| **Frontend Lint** | `npm --prefix frontend run lint` (`oxlint`) | **PASS (0 errors)** | 532 warnings, 0 errors across 182 files. |
| **Frontend Smoke** | `npm --prefix frontend run test:smoke` | **PASS** | Verified `/login` renders on `http://localhost:5175`. |

---

## 5. Security Recheck

- **Unauthenticated (Public) Endpoints:**
  - `GET /api/v1/health` (`routes/index.js:26`)
  - `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/activate` (`routes/authRoutes.js:7-10`)
  - `POST /api/v1/crm-and-leads/lsd` — protected by `LSD_WEBHOOK_SECRET` header check (`routes/crmAndLeadsRoutes.js:18`)
  - `POST /api/v1/payments/webhook` — protected by Stripe signature verification (`routes/paymentRoutes.js:11`)
  - `POST /api/v1/public/*` (public enquiry/quote calculator) and `/api/v1/postcodes/*` (postcode lookup)
  - `GET /api/v1/surveyor/my-calendar/feed.ics` — requires either JWT or `?surveyorId=X&token=njs-cal-srv-X`
- **Header Trust:** `authMiddleware.js` ignores `x-user-email` / `x-user-name` / `x-user-role`; `req.user` is populated strictly from verified JWT + DB user lookup.
- **IDOR:** Customer quotations, terms (`executeDigitalSignature`), invoices (`payInvoiceWithCard`), and surveyor site-visits/reports/ICS downloads all enforce ownership (`clientId`/`clientEmail` or `surveyorId`).
- **Secrets in Git:** `git ls-files` shows only `.env.example` and `frontend/.env.production` (no `.env` with private keys/secrets tracked).
- **CORS (`backend/src/app.js:26-44`):** **WARNING:** `cors` origin callback currently ends with `else { callback(null, true); }` as a permissive fallback, allowing any origin in production.

---

## 6. Top 10 Remaining Risks (Prioritized)

1. **HIGH — Permissive CORS Fallback (`backend/src/app.js:40-42`):** Unknown origins are still allowed via `callback(null, true)`. Restrict to `env.CLIENT_URL` in production.
2. **HIGH — Legacy `localStorage` Business State (`CustomerModules.jsx`, `autoQuoteService.js`, `mock/*.js`):** Several frontend views still read/write `localStorage` keys alongside API calls, risking stale UI state across devices.
3. **MEDIUM — Demo Email Branches in `authController.js` (`L130–219`):** Hardcoded demo email checks remain in login flow; should be gated behind `NODE_ENV !== 'production'` or removed in favor of standard DB auth.
4. **MEDIUM — Calendar `.ics` Static Token (`surveyorCalendarController.js:164`):** `njs-cal-srv-${parsedId}` is predictable if `surveyorId` is guessed; replace with per-user random/HMAC calendar token.
5. **MEDIUM — `BookingCalendar.jsx` Custom Tasks in `localStorage` (`L145,477`):** Ad-hoc calendar tasks are not persisted to MySQL.
6. **MEDIUM — Frontend Error Swallowing (`empty catch {}`):** ~55 empty `catch` blocks remain in `frontend/src` (mostly `mock/*.js`, `AdminUsersPage.jsx`, `AdminQuotesPage.jsx`), hiding failed background requests.
7. **LOW — Static 48h SLA Timer & Unpersisted Defect Photos (Point 14):** Surveyor 48h SLA countdown and on-site photo modal notes are UI-only.
8. **LOW — Duplicate/Legacy Route Files:** Both singular (`jobRoutes.js`, `leadRoutes.js`, `quoteController.js`) and plural (`surveyJobsRoutes.js`, `crmAndLeadsRoutes.js`) route modules exist; consolidate to prevent drift.
9. **LOW — Frontend ESLint/Oxlint Warnings (532 warnings):** Mostly unused variables/imports and hook dependency warnings.
10. **LOW — `live backend/njs-proprty-group` Mirror Directory:** Separate mirror folder exists in repo; ensure deployment pulls from canonical `backend/` or syncs cleanly before release.

---

## 7. Live Deploy Checklist

1. **Database Backup & Migrations:**
   - Take a full MySQL dump of the live database before deploying.
   - Ensure Prisma migrations (`20260403084349_init`, 10-stage `JobStage` migration, and performance index migration) are applied/baselined cleanly (`npx prisma migrate deploy`), and run `backend/prisma/diagnose.sql` + `fix_data.js` on a backup copy first if upgrading from legacy 6-stage data.
2. **Railway / Backend Environment Variables:**
   - `NODE_ENV=production`
   - `DATABASE_URL` (production MySQL connection string)
   - `JWT_SECRET` (strong 64+ char random secret — server will refuse to start without it)
   - `CLIENT_URL` (comma-separated production frontend URLs, e.g. `https://njspropertygroup.com,https://www.njspropertygroup.com`)
   - `LSD_WEBHOOK_SECRET` (shared secret for `/crm-and-leads/lsd`)
   - `ENABLE_CLIENT_PORTAL_LOGIN=true`
   - `ENABLE_BOOKING_REMINDER_JOB=true`, `BOOKING_REMINDER_INTERVAL_MS`, `BOOKING_REMINDER_MIN_AGE_HOURS=48`
3. **Resend Email Verification:**
   - Set `RESEND_API_KEY` (live `re_...` key), `EMAIL_FROM`, and `ENQUIRY_NOTIFICATION_EMAIL`.
   - Verify SPF/DKIM/DMARC DNS records for `njspropertygroup.com` in Resend dashboard.
4. **Stripe Live Keys & Webhook:**
   - Switch `STRIPE_SECRET_KEY` (`sk_live_...`) and `STRIPE_WEBHOOK_SECRET` (`whsec_...`) from test to live mode.
   - Register production `/api/v1/payments/webhook` endpoint in Stripe Dashboard (`checkout.session.completed`, `payment_intent.succeeded`).
5. **Frontend (`Netlify` / Static Host):**
   - Set `VITE_API_URL=https://<your-railway-backend-domain>/api/v1` and rebuild (`npm run build`).
   - Run post-deploy smoke test (`SMOKE_CUSTOMER_EMAIL=... SMOKE_CUSTOMER_PASSWORD=... npm run test:smoke`).
