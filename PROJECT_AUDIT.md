# NJS Property Group — Independent Technical Audit (`PROJECT_AUDIT.md`)

> **Audit Date:** 25 November 2026  
> **Scope:** Independent read-only audit of code, local MySQL DB (`njs_db`), build, lint, and automated tests. No application code, schema, `.env`, or package files were modified during this audit. All raw scan outputs are stored in `audit_evidence/`. Secret values are omitted (`set / not set` only).

---

## PART 8: FINAL SUMMARY (EXECUTIVE OVERVIEW)

### 1. Overall Verdict (5 Lines)
1. **Not yet ready for unrestricted live launch without completing the pre-deploy checklist**, though the core backend transactional pipeline (Lead → Quote → Accept → Terms → Payment → Booking → Inspection → QA → Report) is now **structurally sound and DB-backed**.
2. All backend syntax checks (`115/115` files), Vitest integration tests (`13/13`), 10-step E2E flow (`1/1`), frontend Vite production build, and `oxlint` (`0` errors) pass on the local environment.
3. Key blockers before live go-live: **permissive CORS fallback** (`backend/src/app.js:40-42`), **missing rate limiting** on auth/public/webhook routes, **demo email branches** in `authController.js:130-219`, and **remaining `localStorage` business-state reads/writes** in frontend legacy pages (`CustomerModules.jsx`, `autoQuoteService.js`, `mock/*.js`).
4. Local DB (`njs_db`) is on the 10-stage `JobStage` enum, with `2` legacy orphan quotes (`QTE-2026-101`, `QTE-2026-103`) and `3` orphan notifications left over from earlier test runs (`audit_evidence/07_db_audit.txt`).
5. Production third-party keys (`RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) are currently **not set** locally and must be configured + verified on Railway/Netlify before live traffic.

---

### 2. Scorecard Table

| Module | Backend | DB | UI | Overall |
| :--- | :--- | :--- | :--- | :--- |
| **Public Site & Enquiry** | WORKING | WORKING | WORKING | **WORKING** |
| **Admin Dashboard** | WORKING | WORKING | WORKING | **WORKING** |
| **CRM / Leads** | WORKING | WORKING | PARTIAL (`localStorage` fallback in `AdminLeadsPage.jsx`) | **PARTIAL** |
| **Quotes** | WORKING (`quoteService.js`) | WORKING | PARTIAL (`mock/quotes.js` & `autoQuoteService.js` remnants) | **PARTIAL** |
| **Jobs (10-Stage)** | WORKING | WORKING | WORKING | **WORKING** |
| **Terms & Digital Sign** | WORKING | WORKING | PARTIAL (`mock/terms.js` / `localStorage` flags) | **PARTIAL** |
| **Invoices / Payments** | WORKING (Stripe + BACS) | WORKING | PARTIAL (`CustomerModules.jsx` `localStorage` keys) | **PARTIAL** |
| **Customer Portal (14 Menus)** | WORKING | WORKING | PARTIAL (`CustomerModules.jsx` 88 `localStorage` refs) | **PARTIAL** |
| **Surveyor Portal (6 Menus)** | WORKING | WORKING | PARTIAL (48h SLA timer static; photos not DB-persisted) | **PARTIAL** |
| **Calendar / Booking** | WORKING | WORKING | PARTIAL (`BookingCalendar.jsx` custom tasks in `localStorage`) | **PARTIAL** |
| **Messages (Point 9)** | WORKING | WORKING | WORKING | **WORKING** |
| **Notifications** | WORKING | WORKING | PARTIAL (`NotificationDropdown.jsx` demo checks) | **PARTIAL** |
| **Emails (`emailService.js`)** | WORKING (honest failure) | WORKING (`AuditLog`) | WORKING | **WORKING** |
| **Reports & QA** | WORKING | WORKING | WORKING (`AdminReportsPage.jsx`) | **WORKING** |
| **Users / Roles** | PARTIAL (`authController.js` demo checks) | WORKING | PARTIAL (`AdminUsersPage.jsx` 63 `localStorage` refs) | **PARTIAL** |
| **Settings** | WORKING | WORKING | PARTIAL (`AdminSettingsPage.jsx` `localStorage`) | **PARTIAL** |

---

### 3. Kya Ho Gaya / Kya Baki Hai / Dummy-Hardcoded / Flow Gaps

- **Kya Ho Gaya (Verified):**
  - JWT-only auth (`authMiddleware.js:7-64`), no `x-user-*` header trust, `JWT_SECRET` startup guard (`env.js:9-13`).
  - Single transactional `issueQuote` (`quoteService.js`), `SUPERSEDED` old quotes, sequential `references.js`.
  - 10-stage `JobStage` enum in MySQL (`audit_evidence/07_db_audit.txt:99`) + `jobStages.js` transition matrix.
  - Ownership checks on customer quotes, terms (`executeDigitalSignature`), invoices (`payInvoiceWithCard`), and surveyor jobs/visits/reports/ICS.
  - Backend booking reminder scheduler (`bookingReminderJob.js`), post-inspection email (`sendPostInspectionUpdateEmail`), Trustpilot link in `sendReportReadyEmail`, and Point 9 message emails.
  - Automated test suite: Vitest (`13/13`), 10-step E2E (`1/1`), Playwright smoke (`1/1`).

- **Kya Baki Hai:**
  - Restrict CORS fallback in `backend/src/app.js:40-42`.
  - Add `express-rate-limit` to `/auth/login`, `/auth/register`, `/public/*`, `/crm-and-leads/lsd`.
  - Remove remaining `localStorage` business-state reads/writes in `CustomerModules.jsx`, `AdminUsersPage.jsx`, `autoQuoteService.js`, and `mock/*.js`.
  - Persist surveyor on-site photos/defect notes and live 48h SLA countdown in DB (if required by client).
  - Run `fix_data.js --confirm` on local/backup DB to clean `2` orphan quotes (`QTE-2026-101`, `QTE-2026-103`) and `3` orphan notifications.

- **Abhi Bhi Dummy / Hardcoded Kya Hai:**
  - `backend/src/controllers/authController.js:130-219`: hardcoded demo email branches (`admin@demo.com`, `surveyor@demo.com`, `customer@demo.com`).
  - `backend/src/controllers/crmAndLeadsController.js:392`: `clientEmail || 'client@demo.com'` fallback on LSD ingest.
  - `frontend/src/components/calendar/NewBookingModal.jsx:157,287-288`: default keyRef `'Foxtons Mayfair Ref #FX-402'` and `'client@example.co.uk'` / `'+44 7700 900000'` fallbacks.
  - `frontend/src/components/crm/ClientProfileModal.jsx:55,67,78-79` & `NewLeadModal.jsx:9,79`: `'Alexander Sterling'`, `'test@example.com'`, `'+44 7700 900000'` fallbacks.
  - `frontend/src/pages/admin/AdminDashboardPage.jsx:89,229`: `'W1K 2PB'` and `'customer@demo.com'` fallbacks.

- **Flow Ke Hisaab Se Kya Galat Hai:**
  - `backend/src/services/stripeService.js:71-73` returns a `simulated_fallback` checkout URL when `STRIPE_SECRET_KEY` is missing (though `payInvoiceWithCard` still refuses to mark `PAID` without Stripe verification).
  - `frontend/src/components/calendar/BookingCalendar.jsx:224-312` creates bookings via client-side `addJob` instead of directly awaiting `POST /api/v1/survey-jobs` + `PATCH /assign-surveyor`.

---

### 4. Top 15 Remaining Bugs / Risks (Severity Order)

1. `[Severity: CRITICAL]` | `backend/src/app.js:40-42` | CORS origin callback has `else { callback(null, true); }` allowing any origin in production | Reject unknown origins in production (`callback(new Error('CORS blocked'))`) | `app.js:40-42`
2. `[Severity: HIGH]` | `backend/src/routes/authRoutes.js:7-10` & `publicRoutes.js:7-8` | No rate limiting on login, register, activate, or public enquiry endpoints | Add `express-rate-limit` middleware | `audit_evidence` grep `rateLimit` returned 0 hits
3. `[Severity: HIGH]` | `backend/src/controllers/authController.js:130-219` | Hardcoded demo email checks (`admin@demo.com`, `customer@demo.com`, `surveyor@demo.com`) in login controller | Gate strictly behind `NODE_ENV !== 'production'` or remove | `audit_evidence/03_fake_entities.txt:2-10`
4. `[Severity: HIGH]` | `frontend/src/pages/customer/CustomerModules.jsx` (88 refs) & `autoQuoteService.js` (43 refs) | Business state still read/written in `localStorage` | Remove remaining `localStorage` business-state fallbacks and rely purely on API | `audit_evidence/04_mock_localstorage.txt`
5. `[Severity: MEDIUM]` | `backend/src/controllers/surveyor/surveyorCalendarController.js:164` | Static predictable iCal feed token `njs-cal-srv-${parsedId}` | Use per-user random/HMAC token stored on `SurveyorProfile` | `surveyorCalendarController.js:164`
6. `[Severity: MEDIUM]` | `backend/src/controllers/crmAndLeadsController.js:392` | `clientEmail || 'client@demo.com'` fallback on LSD lead ingest | Reject LSD lead without valid `clientEmail` (`400`) | `audit_evidence/03_fake_entities.txt:11`
7. `[Severity: MEDIUM]` | `frontend/src/components/calendar/NewBookingModal.jsx:287-288` | Fallback `'client@example.co.uk'` and `'+44 7700 900000'` when submitting modal | Require real email/phone or leave `null` | `audit_evidence/03_fake_entities.txt:31-32`
8. `[Severity: MEDIUM]` | `frontend/src/components/crm/ClientProfileModal.jsx:78-79` & `NewLeadModal.jsx:79` | Fallbacks `'test@example.com'`, `'+44 7700 900000'`, `'Alexander Sterling'` | Remove literal fake fallbacks | `audit_evidence/03_fake_entities.txt:36-46`
9. `[Severity: MEDIUM]` | `frontend/src/pages/admin/AdminDashboardPage.jsx:89,229` | Fallback postcode `'W1K 2PB'` and `'customer@demo.com'` | Show `'—'` or empty when missing | `AdminDashboardPage.jsx:89,229`
10. `[Severity: MEDIUM]` | `frontend/src/pages/admin/AdminQuotesPage.jsx` & `AdminUsersPage.jsx` | ~20 empty `catch {}` blocks swallow local/API errors silently | Log warning or show error toast on failures | `audit_evidence/06_catches_resilient.txt:60-79`
11. `[Severity: MEDIUM]` | `backend/src/services/stripeService.js:71-73` | Returns `simulated_fallback` URL when `STRIPE_SECRET_KEY` is unset | Return explicit error/503 in production when Stripe key is missing | `audit_evidence/06_catches_resilient.txt:17-19`
12. `[Severity: LOW]` | `backend/prisma/njs_db` (local DB) | 2 orphan quotes (`QTE-2026-101`, `QTE-2026-103`), 1 `job` with `clientId: null` (`JOB-TEST-3913`), 3 orphan notifications | Run `fix_data.js --confirm` / `clean_test_data.js --confirm` on local DB | `audit_evidence/07_db_audit.txt:23-78`
13. `[Severity: LOW]` | `frontend/src/pages/surveyor/SurveyorDashboardPage.jsx:149` | 48h SLA timer is static `{ hours: 34, minutes: 22 }` and room photos aren't saved to a DB table | Compute from `INSPECTED` `AuditLog.createdAt` + add photo model if needed | `SurveyorDashboardPage.jsx:149`
14. `[Severity: LOW]` | `backend/src/routes/index.js` | Legacy singular routes (`jobRoutes.js`, `leadRoutes.js`) coexist with plural routes (`surveyJobsRoutes.js`, `crmAndLeadsRoutes.js`) | Deprecate/remove unused singular routes after confirming no callers | `routes/index.js`
15. `[Severity: LOW]` | `frontend/` (`oxlint`) | 532 lint warnings (unused vars, hook deps) | Clean up incrementally | `task-3105` lint output

---

### 5. Live Deploy Checklist
- [ ] **MySQL Backup:** Full `mysqldump` of live DB before any migration.
- [ ] **Prisma Migrations:** Run `npx prisma migrate deploy` (verify 10-stage `JobStage` enum + indexes; run `diagnose.sql` + `fix_data.js` on a backup copy if migrating legacy 6-stage rows).
- [ ] **Railway Backend Env Vars:** `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET` (64+ char random), `CLIENT_URL` (exact live origins), `LSD_WEBHOOK_SECRET`, `ENABLE_CLIENT_PORTAL_LOGIN=true`, `ENABLE_BOOKING_REMINDER_JOB=true`, `BOOKING_REMINDER_INTERVAL_MS`, `BOOKING_REMINDER_MIN_AGE_HOURS=48`.
- [ ] **Resend Domain & Keys:** Set `RESEND_API_KEY` (`re_...`), `EMAIL_FROM`, `ENQUIRY_NOTIFICATION_EMAIL`; verify SPF/DKIM/DMARC for `njspropertygroup.com`.
- [ ] **Stripe Live Keys & Webhook:** Set `STRIPE_SECRET_KEY` (`sk_live_...`), `STRIPE_WEBHOOK_SECRET` (`whsec_...`); configure live webhook `/api/v1/payments/webhook`.
- [ ] **Netlify Frontend:** Set `VITE_API_URL=https://<railway-domain>/api/v1`, run `npm run build`, and verify with `npm run test:smoke`.

---

### 6. Decisions / Info Needed From Owner
1. **Booking Reminder Timing:** Should reminders fire only after `PAID` + signed terms (current), or also after `QUOTE_ACCEPTED` before payment?
2. **Surveyor Photos & 48h SLA (Point 14):** Should on-site room photos/defect notes be persisted in a dedicated DB table for Admin QA viewing?
3. **Demo Accounts (`demo.com`):** Should `admin@demo.com` / `customer@demo.com` / `surveyor@demo.com` be completely disabled in production?
4. **Live CORS Origins:** Confirm exact list of allowed production domains (`njspropertygroup.com`, `www.njspropertygroup.com`, Netlify preview URLs).

---

## PART 1: BASELINE

- **Git Branch:** `main` (up to date with `origin/main`). Working tree has uncommitted remediation changes across backend/frontend (`audit_evidence/01_baseline.txt:1-105`).
- **Last 30 Commits:** Recorded in `audit_evidence/01_baseline.txt:110-140` (latest: `570ea88` `2026-11-25` `fix: display backend customer notifications in Bell dropdown without dropping items missing payload email`).
- **Prisma Validate:** `The schema at prisma\schema.prisma is valid` (`audit_evidence/01_baseline.txt:142-144`).
- **Backend `node --check`:** `115/115` `.js` files in `backend/src` passed with `0` errors.
- **Backend Tests (`npm test`):** `13/13` Vitest tests passed on `njs_db_test`; `npm run test:flow` 10-step E2E passed (`1/1`).
- **Frontend Build (`npm run build`):** Passed (`vite build`, 2269 modules, 0 errors).
- **Frontend Lint (`npm run lint`):** Passed (`oxlint`, 0 errors, 532 warnings across 182 files).
- **Health Endpoint (`GET http://127.0.0.1:5000/api/v1/health`):** `200 OK`, `{"status":"healthy","database":"MySQL (Prisma ORM)",...}` (`audit_evidence/01_baseline.txt:146`).

---

## PART 2: 16 FIX-PROMPTS VERIFICATION

| Prompt | Status | Evidence |
| :--- | :--- | :--- |
| **1. Hardcoded fee/postcode/email/phone** | **PARTIAL** | Removed from `quoteService.js`, `customerQuotationsController.js`, `SurveyorModules.jsx`. Still present as fallbacks in `NewBookingModal.jsx:287-288`, `ClientProfileModal.jsx:78-79`, `AdminDashboardPage.jsx:89,229`, `crmAndLeadsController.js:392`. |
| **2. `emailService` honesty** | **DONE** | `emailService.js:47-80` returns `success: false, emailSent: false` and logs `EMAIL_DELIVERY_FAILED`. Callers inspect `emailSent`/`emailError`. |
| **3. Terms backend flow** | **DONE** | `termsAndDocumentsController.js:74-79` requires `ACCEPTED` quote; `customerTermsToSignController.js:64-86` enforces ownership (`403`), removed email fallback & auto-create. |
| **4. Payment guards** | **DONE** | `customerInvoicesAndPaymentsController.js:78-100` enforces ownership, signed terms (`400`), Stripe verification before `PAID`, and Admin BACS settle. |
| **5. Post-payment buckets & tracker** | **DONE** | `surveyJobsController.js:38-41` (`READY_TO_BOOK`), `jobStages.js` 10-stage tracker driven by `job.stage`. |
| **6. Customer User & `/activate`** | **DONE** | `customerUserService.js`, `authRoutes.js:10` (`/activate`), `ActivatePage.jsx`; no `njs_user_pw_*` plaintext cache found. |
| **7. `quoteService.issueQuote`** | **DONE** | Single transactional path in `quoteService.js`; supersedes prior quotes (`SUPERSEDED`), sequential `references.js`, `updateLeadStatus` does not create quotes. |
| **Bonus. Auth & JWT** | **DONE** | `authMiddleware.js:7-64` requires Bearer JWT, ignores `x-user-*` headers, `env.js:9-13` enforces `JWT_SECRET`, `/crm-and-leads/lsd` checks `LSD_WEBHOOK_SECRET`. |
| **8. `localStorage`/mock removal** | **PARTIAL** | Backend APIs used for core writes, but `CustomerModules.jsx` (88), `AdminUsersPage.jsx` (63), `autoQuoteService.js` (43), `mock/*.js` still contain `localStorage` references (`audit_evidence/04_mock_localstorage.txt`). |
| **9. Test-data blacklist filters** | **DONE** | Blacklist filters (`akku`, `bhopal`, `abc`, `www`) removed from `dashboardController.js`, `jobController.js`, `AdminDashboardPage.jsx`, `AdminLeadsPage.jsx`. |
| **10. Silent catch / fake success** | **PARTIAL** | `backend/src` has `0` empty catches (`audit_evidence/06_catches_resilient.txt`); `frontend/src` still has ~55 empty `catch {}` blocks (mostly `mock/*.js`, `AdminUsersPage.jsx`, `AdminQuotesPage.jsx`). |
| **11. 10-stage enum & migration** | **DONE** | `schema.prisma` `JobStage` has all 10 stages, `backend/prisma/migrations/` exists, `jobStages.js` enforces transitions, `AuditLog` written. |
| **12. DB constraints & references** | **DONE** | `references.js` sequential generators (`Math.random()` removed); `diagnose.sql` and `fix_data.js` present. |
| **13. Booking to delivery flow** | **DONE** | `assignSurveyor` enforces `PAID` + signed terms; `surveyorSiteVisitsController.js` & `surveyorUploadReportsController.js` enforce `surveyorId`, `isValidTransition`, PDF <=50MB; `customerReportsController.js` requires `COMPLETE` + `reportPdfUrl` + `qaApprovedAt`. |
| **14. Requirements compliance** | **PARTIAL** | 9/10 requirements working; Surveyor 48h SLA timer is static UI and room photos aren't DB-persisted. |
| **15. Automated tests** | **DONE** | Vitest (`13/13`), 10-step E2E (`1/1`), Playwright smoke (`1/1`) all pass. |
| **16. This audit** | **DONE** | `PROJECT_AUDIT.md` and `audit_evidence/*`. |

---

## PART 3: DUMMY / HARDCODED / FAKE DATA SCAN

Raw outputs saved in `audit_evidence/`:
- `02_fake_amounts.txt` (1,442 lines): Mostly CSS/SVG/UI dimensions, Tailwind widths, and `standard_survey_base_fees` lookup tables; real-flow fee bug in `quoteService` already fixed.
- `03_fake_entities.txt` (272 lines):
  - **REAL-FLOW BUG / FALLBACK:** `authController.js:130-219` (demo logins), `crmAndLeadsController.js:392` (`'client@demo.com'`), `NewBookingModal.jsx:287-288` (`'client@example.co.uk'`, `'+44 7700 900000'`), `ClientProfileModal.jsx:78-79` (`'test@example.com'`), `AdminDashboardPage.jsx:89,229` (`'W1K 2PB'`, `'customer@demo.com'`).
  - **DEMO-PREVIEW-ONLY:** `EmailTemplatePreviewModal.jsx:52-57,299,310`, `RecentActivityRow.jsx:19-31`, `mock/users.js`.
  - **HARMLESS (Placeholders):** `HeroSlider.jsx:204`, `InstantQuoteCalculator.jsx:41,72,187`, `QuoteRequestForm.jsx:549,567`.
- `04_mock_localstorage.txt` (540 lines): Legacy `localStorage` usage concentrated in `CustomerModules.jsx`, `AdminUsersPage.jsx`, `autoQuoteService.js`, `AuthContext.jsx`, and `mock/*.js`.
- `05_placeholders.txt` (111 lines): `'Date: TBD'` / `'Time: TBD'` / `'Assigned Chartered Surveyor'` used when `inspectionDate` or `surveyor` is not yet assigned (handled as fallback display, rejected on reschedule by `surveyJobsController.js:594-595`).
- `06_catches_resilient.txt` (199 lines): `0` empty catches in `backend/src`; `emailService.js:61,78` `simulated: true` is strictly failure-logging (never `success: true`); `stripeService.js:71-73` still has `simulated_fallback` checkout URL when key is missing.

---

## PART 4: DATABASE AUDIT (LOCAL `njs_db` — SELECT ONLY)

Verified `backend/.env` `DATABASE_URL` points to `127.0.0.1:3306/njs_db`. Full JSON output in `audit_evidence/07_db_audit.txt`:
- **Row Counts:** `users: 6`, `leads: 4`, `jobs: 1`, `quotes: 5`, `terms: 1`, `invoices: 1`, `audit_logs: 1`, `system_settings: 10`, `notifications: 22`, `surveyor_profiles: 0`, `companies: 0`, `call_logs: 0`, `complaint_logs: 0`, `messages: 0`, `customer_reviews: 0`, `support_tickets: 0`.
- **Clean Checks (`0` issues):** `multiActiveQuotesPerLead: []`, `multiInvoicesPerJob: []`, `multiTermsPerJob: []`, `jobsNullLeadWithMatchingLead: []`, `invoiceQuoteMismatch: []`, `acceptedQuotesMissingJobTermInv: []`, `impossibleStageCombos: []`.
- **Remaining DB Anomalies:**
  - `orphanQuotes: 2` (`QTE-2026-101` £660 `SENT`, `QTE-2026-103` £840 `SENT` with `leadId=null, jobId=null`).
  - `jobsNullClientIdWithUser: 1` (`JOB-TEST-3913`, `t***@example.co.uk`, matching `userId: 48`).
  - `leadsWithoutCustomerUser: 1` (`NJS-2026-5484`, `a***@gmail.com`).
  - `orphanNotificationsCount: 3` (refs `QTE-2026-102`, `JOB-2026-2026410`, `INV-2026-2026410`).
  - `duplicateNotifications: 1` group (`7` rows of `"Email delivery failed to ..."` in minute `2026-11-25 12:14`).
  - `hardcodedLookingData: 1` (`JOB-TEST-3913`, `t***@example.co.uk`).
- **Enum (`jobs.stage`):** Confirmed 10-stage `enum('ENQUIRY','QUOTE_ISSUED','QUOTE_ACCEPTED','TERMS_SIGNED','PAID','BOOKED','INSPECTED','DRAFTING','QA_REVIEW','COMPLETE')`.

---

## PART 5: CLIENT'S 10 POINTS TRACE & E2E WALKTHROUGH

All 10 original client points trace cleanly to backend controllers/services (see Section 3 of `PROJECT_AUDIT.md` above, and `audit_evidence/01_baseline.txt` + `backend/tests/e2e_flow.js`):
1. **Quote/Activation Email:** `publicEnquiryController.js` / `customerUserService.js` → `sendPortalActivationEmail` + `quoteService.issueQuote` → `sendQuoteProposalEmail`.
2. **Revised Quote Duplicate Notifications:** `quoteService.js` supersedes old quotes in a transaction and deduplicates notifications by reference/type.
3. **£600 Accept → £1740 Terms Mismatch:** `customerQuotationsController.js:170-269` creates `Term` & `Invoice` inside `$transaction` from accepted quote's exact `totalAmount`.
4. **Admin vs Customer Fee Sync:** Both read from MySQL `Quote` / `Invoice` tables.
5. **Manual Terms Wrong Postcode (`W1K 2PB`):** `termsAndDocumentsController.js` reads `job.postcode` from DB.
6. **Manual Terms Wrong Fee:** `termsAndDocumentsController.js:74-79` requires `ACCEPTED` quote first.
7. **Admin-Only Terms Email:** `termsAndDocumentsController.js:107-116` emails `recipientEmail` (customer).
8. **Admin Timeline Stage Accuracy:** `jobStages.js` 10-stage enum + `AuditLog` entries on every transition.
9. **Post-Payment Admin Alert:** `customerInvoicesAndPaymentsController.js` (BACS claim) & `quotationsAndPaymentsController.js` (`settleBacsPayment`) create `ADMIN` notifications and `AuditLog`.
10. **Missing Emails:** `emailService.js` dispatches via Resend when `RESEND_API_KEY` is set and logs `EMAIL_DELIVERY_FAILED` otherwise.

**End-to-End Paper Walkthrough:** Verified live via `npm --prefix backend run test:flow` (`tests/e2e_flow.js`) on `njs_db_test`: `POST /crm-and-leads` → `POST /quotations-and-payments/quotes` (£600) → `POST /customer/quotations/:id/accept` (`Job` + `Term` + `Invoice` £600) → `GET /customer/terms-to-sign` → `POST /customer/terms-to-sign/:id/sign` (`TERMS_SIGNED`) → `POST /customer/invoices/:id/pay` (BACS claim) → `POST /quotations-and-payments/invoices/:id/settle-bacs` (`PAID` + `ADMIN` notification).

---

## PART 6: REQUIREMENTS COMPLIANCE

- **CRM (call notes, complaints):** WORKING (`crmAndLeadsController.js`, `leadController.js`).
- **Customer 14 menus:** WORKING (`routes/customer/index.js`, `App.jsx:435-454`).
- **Messages (Point 9):** WORKING (`customerMessagesController.js:354-501`).
- **10-stage live tracker:** WORKING (`jobStages.js`, `SurveyProgressTracker.jsx`).
- **Surveyor isolation & on-site workflow:** PARTIAL (isolation, arrival/complete, PDF upload <=50MB, QA gate all WORKING; 48h timer static & photos not DB-persisted).
- **Booking reminder scheduler (max 2):** WORKING (`bookingReminderJob.js`, `POST /api/v1/survey-jobs/reminders/run`).
- **Stage/report/payment emails + Trustpilot:** WORKING (`emailService.js`).
- **Stripe + BACS + Role access control:** WORKING (`paymentController.js`, `quotationsAndPaymentsController.js`, `authorizeRoles`).

---

## PART 7: SECURITY RECHECK

- **Unauthenticated Endpoints:** `/api/v1/health`, `/api/v1/auth/{register,login,logout,activate}`, `/api/v1/public/*`, `/api/v1/postcodes/*`, `/api/v1/payments/webhook` (Stripe sig), `/api/v1/crm-and-leads/lsd` (`LSD_WEBHOOK_SECRET`), `/api/v1/surveyor/my-calendar/feed.ics` (token param).
- **Identity Headers (`x-user-*`):** Ignored in `authMiddleware.js` (`req.user` strictly from JWT + DB).
- **IDOR:** Ownership verified on customer quotes, terms, invoices, and surveyor jobs/visits/reports/ICS.
- **Secrets in Repo:** None tracked (`git ls-files` only `.env.example`, `frontend/.env.production`); `.gitignore` ignores `.env` and `.env.*`.
- **CORS / Helmet / Rate Limit:** `helmet()` enabled; `cors` has permissive `callback(null, true)` fallback (`app.js:40-42`); no `express-rate-limit` middleware installed.
- **File Uploads:** `uploadMiddleware.js` + `surveyorUploadReportsController.js` validate PDF mimetype/extension and 50MB limit.
