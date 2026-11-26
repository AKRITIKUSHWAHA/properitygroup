# NJS Property Group - Comprehensive Project Status Report

> **Generated Date:** 25 November 2026  
> **Repository:** NJS Property Group (React SPA Frontend + Node.js / Express / Prisma / MySQL Backend)  
> **Notice:** Kuch bhi code change nahi kiya gaya hai, sirf code aur repository state padhkar report tayyar ki gayi hai. Secrets aur credentials ke values report se bahar rakhe gaye hain. Jahan certainty nahi hai, wahan strictly **UNSURE** likha gaya hai.

---

## 1. PROJECT SNAPSHOT

### 1.1 Folder Structure (2 Levels)
```text
propertygroup/
├── .playwright-mcp/                # Playwright MCP browser session state artifacts
├── backend/                        # Node.js Express REST API backend
│   ├── prisma/                     # Prisma schema, database cleaner, seed files
│   ├── public/                     # Static assets (images, logos)
│   ├── scripts/                    # Database inspection & verification scripts
│   └── src/                        # Controllers, routes, middlewares, services, config
├── client_requirements/            # Client briefings, audio, screenshots, video guides
│   ├── audio/
│   ├── images/
│   ├── natasha2798-attachments/
│   └── videos/
├── frontend/                       # React 19 Vite SPA client
│   ├── dist/                       # Production build distribution output
│   ├── public/                     # Public icons, manifest, favicon
│   ├── scripts/                    # End-to-end testing scripts
│   ├── src/                        # React source code (components, pages, api, mock)
│   └── test-results/               # Automated test run outputs
├── live backend/                   # Deployment mirror directory for Railway/live sync
│   └── njs-proprty-group/
├── netlify/                        # Netlify serverless functions for forms
│   └── functions/
├── scratch/                        # Diagnostic and test scripts
└── PROJECT_STATUS.md               # Current Status Report (this document)
```

### 1.2 Main Packages and Versions

#### Root (`package.json`)
* `name`: `propertygroup` (`1.0.0`)
* Monorepo runner scripts: `dev`, `dev:frontend`, `build`, `build:frontend`, `dev:backend`

#### Backend (`backend/package.json`)
* **Runtime / Core:** `express: ^4.21.0`, `node: ESM` (type: `module`)
* **ORM / Database:** `@prisma/client: ^5.19.1`, `prisma: ^5.19.1` (Dev)
* **Authentication / Security:** `jsonwebtoken: ^9.0.2`, `bcryptjs: ^2.4.3`, `helmet: ^7.1.0`, `cors: ^2.8.5`
* **Validation & Utilities:** `zod: ^3.23.8`, `dotenv: ^16.4.5`, `morgan: ^1.10.0`, `multer: ^2.5.0`
* **Integrations:** `stripe: ^23.1.0` (Stripe UK payments), `resend: ^6.37.0` (Transactional emails)
* **Process Manager:** `nodemon: ^3.1.7` (Dev)

#### Frontend (`frontend/package.json`)
* **Core:** `react: ^19.3.1`, `react-dom: ^19.3.1`
* **Routing:** `react-router-dom: ^7.18.4`
* **Styling:** `tailwindcss: ^4.3.3`, `@tailwindcss/vite: ^4.3.3`, `postcss: ^8.5.32`, `autoprefixer: ^10.6.2`
* **Icons / UI:** `lucide-react: ^1.62.0`
* **PDF Engine:** `jspdf: ^4.2.1`
* **Build / Dev:** `vite: ^8.3.5`, `@vitejs/plugin-react: ^6.1.2`, `oxlint: ^1.89.0`, `playwright: ^1.64.1`

### 1.3 Git Status & Recent History

* **Current Branch:** `main` (tracked to `origin/main`)
* **Uncommitted Changes (`git status`):** `nothing to commit, working tree clean`

#### Last 15 Git Commits
1. `570ea88` | 2026-11-25 | `fix: display backend customer notifications in Bell dropdown without dropping items missing payload email`
2. `7e6b05d` | 2026-11-25 | `fix: sync MySQL-compatible Prisma filters across backend mirror`
3. `ee398c0` | 2026-11-25 | `fix: remove invalid NEW JobStage enum value from duplicate check`
4. `0307892` | 2026-11-25 | `fix: sync QA upload, admin approval, and cross-browser customer Step 7-10 notifications`
5. `660ceaa` | 2026-11-25 | `fix(jobs-sync): prevent CustomerDashboardPage sync and Date: TBD updateJob calls from auto-jumping to Step 6 BOOKED`
6. `e5577ef` | 2026-11-25 | `fix(admin-crm): remove hardcoded abc/www,uk phantom filters blocking real website leads in AdminLeadsPage`
7. `09459b2` | 2026-11-25 | `fix(quotes-jobs): prevent reference collision, fix serviceType var in acceptCustomerQuotation, guard undefined jobId`
8. `2c03fad` | 2026-11-25 | `fix(lifecycle): fix all 10 RICS stages, cascade-delete customer jobs on user removal, remove fuzzy clientName matching, sync bookings/terms/payments to DB`
9. `e8d2ccc` | 2026-11-25 | `fix(customer-portal): fix 10-stage RICS progression - API authoritative step, stale localStorage, blank screen, leads abc filter, admin stage labels`
10. `dd5ffe9` | 2026-11-25 | `fix(customer-portal): resolve ReferenceError isDemo in NotificationDropdown and purge phantom quoted lead from CRM`
11. `9dbea57` | 2026-11-25 | `fix(customer-portal): isolate new leads strictly to Stage 1 Enquiry, eliminate email-level milestone contamination and fix blank screen crashes`
12. `e69f9f6` | 2026-11-25 | `Fix backend syntax error and wipe stale local cached jobs to strictly mirror empty DB`
13. `2441626` | 2026-11-25 | `Fix client portal punch list: isolate notifications, suspend sample reports, turn off auto fee, wire quote & support notifications, gate terms on fee acceptance`
14. `f5c10fa` | 2026-11-24 | `fix(customer): resolve ReferenceError isLocalDelivered in CustomerTrackSurveyPage`
15. `05a91a0` | 2026-11-24 | `clean: remove mock client profiles and preserve only verified admin and surveyor users`

### 1.4 Frontend to Backend URL Mapping
* **Environment Variable Name:** `VITE_API_URL`
* **Resolution Logic (`frontend/src/api/apiClient.js:7-23`):**
  - **Local Development:** When `window.location.hostname` is `localhost` or `127.0.0.1`, `getApiBaseUrl()` returns `'/api/v1'`, routing through Vite local dev proxy (`http://localhost:5000/api/v1`) to prevent CORS errors (`frontend/src/api/apiClient.js:13-15`).
  - **Live Production:** If `window.location.hostname` is a live domain (e.g. Netlify / custom domain):
    - Reads `import.meta.env.VITE_API_URL`.
    - If defined and begins with `https://` (non-localhost), it uses that URL.
    - Otherwise falls back to Railway live backend URL (`frontend/src/api/apiClient.js:20`).
* **Production Configuration:** `frontend/.env.production` defines `VITE_API_URL` pointing to the live Railway backend endpoint.

---

## 2. DATABASE & ORM ARCHITECTURE

### 2.1 Prisma Schema Overview (`backend/prisma/schema.prisma:1-393`)

#### Models (16 Models)
1. **`User`** (`backend/prisma/schema.prisma:10-31`): System accounts (`id`, `name`, `email`, `password`, `role`, `phone`, `avatar`, `status`, `createdAt`, `updatedAt`). Maps to `users`.
2. **`SurveyorProfile`** (`backend/prisma/schema.prisma:33-51`): Professional surveyor accreditation details (`userId`, `accreditation`, `ricsNumber`, `piiPolicyNumber`, `piiExpiryDate`, `piiValidated`, `postcodesCovered`, `activeLoad`, `maxLoad`, `rating`, `available`).
3. **`Company`** (`backend/prisma/schema.prisma:53-71`): B2B Estate agents & referral firms (`name`, `branchName`, `contactEmail`, `referralRate`, `keyCollectionProtocol`).
4. **`Lead`** (`backend/prisma/schema.prisma:73-97`): CRM enquiries (`reference`, `clientName`, `clientEmail`, `clientPhone`, `propertyAddress`, `postcode`, `serviceType`, `estimatedValue`, `source`, `status`, `companyId`).
5. **`CallLog`** (`backend/prisma/schema.prisma:99-115`): Telephone call interactions linked to `leadId` or `jobId`.
6. **`ComplaintLog`** (`backend/prisma/schema.prisma:117-134`): Escalations and disputes linked to `leadId` or `jobId`.
7. **`Job`** (`backend/prisma/schema.prisma:136-180`): Primary surveying instruction (`reference`, `stage`, `serviceType`, `propertyAddress`, `postcode`, `clientName`, `clientEmail`, `clientId`, `surveyorId`, `leadId`, `inspectionDate`, `inspectionTime`, `reportPdfUrl`, `reportGeneratedAt`, `qaApprovedBy`, `qaApprovedAt`).
8. **`Quote`** (`backend/prisma/schema.prisma:182-203`): Fee proposals (`reference`, `jobId`, `leadId`, `baseFee`, `vatRate`, `vatAmount`, `totalAmount`, `inclusions`, `status`, `validUntil`, `acceptedAt`).
9. **`Term`** (`backend/prisma/schema.prisma:205-225`): Electronic contracts (`reference`, `jobId`, `clientName`, `clientEmail`, `documentTitle`, `content`, `signed`, `signatureData`, `signedAt`, `signerIp`, `signerUserAgent`, `tamperAuditHash`).
10. **`Invoice`** (`backend/prisma/schema.prisma:227-248`): Billing & payment records (`invoiceNumber`, `jobId`, `clientName`, `clientEmail`, `subtotal`, `vatAmount`, `total`, `status`, `paymentMethod`, `stripePaymentIntentId`, `stripeReceiptUrl`, `bacsReference`, `paidAt`).
11. **`Message`** (`backend/prisma/schema.prisma:250-267`): Real-time chat messages between client, admin, and surveyor.
12. **`AuditLog`** (`backend/prisma/schema.prisma:269-283`): Event timeline history (`action`, `details`, `ipAddress`, `jobId`, `userId`).
13. **`SystemSetting`** (`backend/prisma/schema.prisma:285-293`): Key-value administrative configurations (`key`, `value`, `category`).
14. **`CustomerReview`** (`backend/prisma/schema.prisma:295-311`): Trustpilot/platform reviews (`userId`, `jobId`, `rating`, `title`, `reviewText`, `platform`, `verified`).
15. **`SupportTicket`** (`backend/prisma/schema.prisma:313-331`): Helpdesk queries (`ticketNo`, `userId`, `jobId`, `subject`, `message`, `category`, `status`, `priority`).
16. **`Notification`** (`backend/prisma/schema.prisma:333-349`): In-app alerts (`userId`, `role`, `title`, `desc`, `type`, `amount`, `link`, `read`).

#### Enums (6 Enums)
* **`Role`** (`backend/prisma/schema.prisma:351-355`): `ADMIN`, `SURVEYOR`, `CUSTOMER`
* **`UserStatus`** (`backend/prisma/schema.prisma:357-361`): `ACTIVE`, `INACTIVE`, `PENDING`
* **`JobStage`** (`backend/prisma/schema.prisma:363-370`): `QUOTE`, `PAID`, `ACCEPTED`, `BOOKED`, `PREPARING_REPORT`, `COMPLETE` *(NOTE: Only 6 values in DB enum, whereas RICS flow has 10 steps)*
* **`LeadStatus`** (`backend/prisma/schema.prisma:372-378`): `NEW`, `CONTACTED`, `QUOTE_SENT`, `CONVERTED`, `LOST`
* **`QuoteStatus`** (`backend/prisma/schema.prisma:380-386`): `DRAFT`, `SENT`, `ACCEPTED`, `DECLINED`, `EXPIRED`
* **`InvoiceStatus`** (`backend/prisma/schema.prisma:388-393`): `PENDING`, `PAID`, `CANCELLED`, `REFUNDED`

#### Unique Constraints
* `User.email` (`@unique`)
* `SurveyorProfile.userId` (`@unique`)
* `Lead.reference` (`@unique`)
* `Job.reference` (`@unique`)
* `Quote.reference` (`@unique`)
* `Term.reference` (`@unique`)
* `Invoice.invoiceNumber` (`@unique`)
* `SystemSetting.key` (`@unique`)
* `SupportTicket.ticketNo` (`@unique`)

### 2.2 Migrations Status & Push Divergence
* **Migration Directory:** There is **NO `backend/prisma/migrations` folder** in the repository.
* **Database Sync Tool:** The team is using `prisma db push` (`"db:push"` in `backend/package.json:11`) to synchronize schema changes directly against the live MySQL instance without versioned SQL migration scripts.
* **Divergence:** Because `prisma db push` is used, there are no historical `.sql` migration files to verify schema drift. Whether the live database matches `schema.prisma` exactly depends entirely on whether `npx prisma db push` was executed on the live MySQL server after the latest schema edits.

### 2.3 Strict Business Constraints in Database (One-to-One / Active Constraints)
* **"Ek lead par ek active quote" constraint hai?** -> **NAHI.**
  - `Quote` model has `leadId Int?` and `@@index([leadId])` (`backend/prisma/schema.prisma:186, 201`). There is **no `@unique` or composite unique constraint** on `leadId`. One lead can have multiple quote records in the DB.
* **"Ek job par ek invoice" constraint hai?** -> **NAHI.**
  - `Invoice` model has `jobId Int` and `@@index([jobId])` (`backend/prisma/schema.prisma:230, 246`). There is **no `@unique`** constraint on `jobId`. Multiple invoices can be attached to the same job.
* **"Ek job par ek term" constraint hai?** -> **NAHI.**
  - `Term` model has `jobId Int` and `@@index([jobId])` (`backend/prisma/schema.prisma:208, 223`). There is **no `@unique`** constraint on `jobId`. Multiple signed or unsigned terms can be attached to the same job.

---

## 3. MAIN BUSINESS FLOW (STEP-BY-STEP TRACE)

```
[1. Enquiry] -> [2. Lead] -> [3. Quote Issued] -> [4. Customer Accept] -> [5. Job Created]
      -> [6. Terms Sign] -> [7. Invoice & Payment] -> [8. Booking] -> [9. Inspection]
      -> [10. Report Drafting] -> [11. QA Audit] -> [12. Delivered]
```

### Step 1 & 2: Public Website Enquiry -> CRM Lead
* **Frontend Trigger:**
  - File: `frontend/src/components/forms/QuoteRequestForm.jsx:250-320`
  - Function: `handleSubmit` calls `publicApi.submitQuoteEnquiry(enquiryData)` (`frontend/src/api/publicApi.js:26-38`).
* **Backend Endpoint & Controller:**
  - Route: `POST /api/v1/public/enquiries` (`backend/src/routes/publicRoutes.js:8`)
  - Controller: `submitPublicEnquiry` (`backend/src/controllers/publicEnquiryController.js:13-159`)
* **DB Operations:**
  - Creates row in `leads` table with status `'NEW'`, source `'WEBSITE'`, reference `NJS-YYYY-XXXX` or `ENQ-YYYY-XXXX` (`backend/src/controllers/publicEnquiryController.js:68-81`).
* **Notifications / Emails:**
  - Sends email to `info@njspropertygroup.com` via `sendWebsiteEnquiryNotificationEmail` (`backend/src/controllers/publicEnquiryController.js:88-106`).
  - Creates in-app `Notification` for `ADMIN` (`/admin/leads/enquiries`) and `CUSTOMER` if customer account already exists (`backend/src/controllers/publicEnquiryController.js:110-131`).
* **Record Matching:** Matches existing customer account strictly by email: `prisma.user.findUnique({ where: { email: customerEmail } })` (`backend/src/controllers/publicEnquiryController.js:57`).

---

### Step 3: Admin Sends Formal Quotation
* **Frontend Trigger:**
  - Primary: `frontend/src/components/crm/SendQuoteModal.jsx:200-245` (`handleSendFormalQuote`)
  - Secondary: `frontend/src/pages/admin/AdminLeadsPage.jsx:450-490` (Changing Lead status dropdown to "Quoted" / "Quote Sent")
  - Tertiary: `frontend/src/pages/admin/AdminQuotesPage.jsx:1450-1550` ("Create Quotation" modal)
* **Backend Endpoints & Controllers:**
  - Route A: `POST /api/v1/quotations-and-payments/quotes` -> `createQuote` (`backend/src/controllers/quotationsAndPaymentsController.js:114-315`)
  - Route B: `PATCH /api/v1/crm-and-leads/:id/status` -> `updateLeadStatus` (`backend/src/controllers/crmAndLeadsController.js:122-234`)
* **DB Operations:**
  - Creates or updates `quotes` table with status `'SENT'`, `baseFee`, `vatAmount`, `totalAmount`, reference `QTE-2026-XXX`.
  - Updates `leads` table status to `'QUOTE_SENT'` and `estimatedValue` to `totalAmount`.
* **Notifications / Emails:**
  - Dispatches `sendQuoteProposalEmail` via Resend to `clientEmail` with a direct link to `/customer/quotations?quoteRef=...` (`backend/src/controllers/quotationsAndPaymentsController.js:263-274`).
  - Creates `Notification` for `CUSTOMER` ("Formal Survey Quotation Ready") and `ADMIN` ("Quote Proposal Issued") (`backend/src/controllers/quotationsAndPaymentsController.js:279-299`).
* **Duplicate Logic Hazard:**
  - **Duplicate Location 1:** `quotationsAndPaymentsController.js:114-315` creates quote + sends email + creates notifications.
  - **Duplicate Location 2:** `crmAndLeadsController.js:148-234` also creates quote + sends email + creates notifications when lead status is set to `QUOTE_SENT`.
* **Record Matching:**
  - Tries numeric `leadId` or `reference`.
  - **Fuzzy matching danger:** `backend/src/controllers/quotationsAndPaymentsController.js:187-190` matches jobs via `propertyAddress: { contains: property.slice(0, 15) }`!

---

### Step 4 & 5: Customer Accepts Quotation -> Job Created
* **Frontend Trigger:**
  - File: `frontend/src/pages/customer/CustomerModules.jsx:260-310` (`handleAcceptQuote`)
  - Action: Calls `customerQuotationsApi.acceptQuote(quoteId)`
* **Backend Endpoint & Controller:**
  - Route: `POST /api/v1/customer/quotations/:id/accept` (`backend/src/routes/customer/customerQuotationsRoutes.js:14`)
  - Controller: `acceptCustomerQuotation` (`backend/src/controllers/customer/customerQuotationsController.js:173-412`)
* **DB Operations:**
  - Updates `quotes` table: `status = 'ACCEPTED'`, `acceptedAt = new Date()` (`line 242`).
  - Updates `leads` table: `status = 'CONVERTED'` (`line 257`).
  - Creates row in `jobs` table: `stage = 'ACCEPTED'`, `reference = 'JOB-...'` (`line 286`).
  - Creates row in `terms` table: `reference = 'TRM-2026-{jobId}'`, `signed = false` (`line 326`).
  - Creates row in `invoices` table: `invoiceNumber = 'INV-2026-{jobId}'`, `status = 'PENDING'`, `total = totalFee` (`line 346`).
* **Notifications / Emails:**
  - Sends `sendQuoteAcceptedEmail` to customer (`line 369`).
  - Creates in-app `Notification` for `CUSTOMER` (link: `/customer/terms-to-sign`) and `ADMIN` (link: `/admin/quotes`) (`lines 381-402`).
* **Record Matching:**
  - Scans `id`, `reference`, `QUO-${id}`, `QTE-${id}`, or `leadId` (`line 190`).
  - **Fallback Matching:** If not matched, it queries ANY quote where `job.clientEmail = userEmail` ordered by `createdAt: desc` (`line 206`).

---

### Step 6: Customer Signs Terms of Engagement
* **Frontend Trigger:**
  - File: `frontend/src/pages/customer/CustomerModules.jsx:1320-1410` (`handleSignContract`)
  - Action: Calls `customerTermsToSignApi.executeSignature(termId, { signatureData })`
* **Backend Endpoint & Controller:**
  - Route: `POST /api/v1/customer/terms-to-sign/:id/sign` (`backend/src/routes/customer/customerTermsToSignRoutes.js:14`)
  - Controller: `executeDigitalSignature` (`backend/src/controllers/customer/customerTermsToSignController.js:54-208`)
* **DB Operations:**
  - Updates `terms` table: `signed = true`, `signatureData`, `signedAt`, `signerIp`, `tamperAuditHash` (`line 101`).
  - Updates `jobs` table: If stage was `'QUOTE'`, advances to `'ACCEPTED'` (`line 114`).
* **Notifications / Emails:**
  - Sends `sendTermsSignedEmail` to customer (`line 161`).
  - Creates `Notification` for `CUSTOMER` (link: `/customer/track-survey`) and `ADMIN` (link: `/admin/terms`) (`lines 175-195`).
* **Record Matching:** Looked up by `id`, `reference`, `jobId`, or falls back to `findFirst({ where: { clientEmail: userEmail } })` (`lines 67-87`).

---

### Step 7: Invoice & Payment (Stripe Card or BACS Transfer)
* **Frontend Trigger:**
  - Card: `frontend/src/pages/customer/CustomerModules.jsx:980-1050` (`handleCardPayment`) calls `customerInvoicesApi.payWithCard(invoiceId, paymentData)`
  - Admin BACS Settlement: `frontend/src/pages/admin/AdminQuotesPage.jsx:620-670` calls `adminQuotationsAndPaymentsApi.settleBacs(invoiceId)`
* **Backend Endpoint & Controller:**
  - Customer Card / Transfer: `POST /api/v1/customer/invoices/:id/pay` (`customerInvoicesAndPaymentsRoutes.js:14`) -> `payInvoiceWithCard` (`customerInvoicesAndPaymentsController.js:54-202`)
  - Admin BACS Settle: `POST /api/v1/quotations-and-payments/invoices/:id/settle-bacs` (`quotationsAndPaymentsRoutes.js:29`) -> `settleBacsPayment` (`quotationsAndPaymentsController.js:499-568`)
* **DB Operations:**
  - Updates `invoices` table: `status = 'PAID'`, `paymentMethod`, `paidAt = new Date()`.
  - Updates `jobs` table: `stage = 'PAID'` (`customerInvoicesAndPaymentsController.js:104, 141`).
* **Notifications / Emails:**
  - Dispatches `sendInvoiceReceiptEmail` to client (`customerInvoicesAndPaymentsController.js:155`).
  - Creates `Notification` for `CUSTOMER` and `ADMIN` (`customerInvoicesAndPaymentsController.js:175-189`).

---

### Step 8: Appointment Booking & Surveyor Assignment
* **Frontend Trigger:**
  - File: `frontend/src/components/calendar/NewBookingModal.jsx:180-250` (`handleCreateBooking`)
  - Calls `adminSurveyJobsApi.rescheduleJob(jobId, bookingData)` or `assignSurveyor(jobId, surveyorId)`
* **Backend Endpoint & Controller:**
  - Route: `POST /api/v1/survey-jobs/:id/assign` and `POST /api/v1/survey-jobs/:id/reschedule` (`backend/src/routes/surveyJobsRoutes.js:23-24`)
  - Controllers: `assignSurveyor` (`surveyJobsController.js:388-473`) & `rescheduleSurveyJob` (`surveyJobsController.js:475-667`)
* **DB Operations:**
  - Updates `jobs` table: `surveyorId`, `inspectionDate`, `inspectionTime`, `stage = 'BOOKED'`.
  - **Prerequisite Validation:** `surveyJobsController.js:263-273` blocks advancing to `BOOKED` unless `invoices.some(status === 'PAID')` AND `terms.some(signed === true)`.
* **Notifications / Emails:**
  - Dispatches `sendBookingConfirmationEmail` to client (`surveyJobsController.js:633`).
  - Dispatches `sendSurveyorJobAssignedEmail` to surveyor (`surveyJobsController.js:446`).
  - Creates `Notification` for `CUSTOMER`, `SURVEYOR`, and `ADMIN`.

---

### Step 9: Site Inspection Completed
* **Frontend Trigger:**
  - File: `frontend/src/pages/surveyor/SurveyorModules.jsx:1080-1130`
  - Calls `surveyorSiteVisitsApi.completeVisit(jobId, visitData)`
* **Backend Endpoint & Controller:**
  - Route: `POST /api/v1/surveyor/site-visits/:id/complete` (`surveyorSiteVisitsRoutes.js:15`)
  - Controller: `completeSiteVisit` (`surveyorSiteVisitsController.js:77-160`)
* **DB Operations:**
  - Updates `jobs` table: `stage = 'PREPARING_REPORT'`.
  - Creates `audit_logs` record: `action = 'SITE_VISIT_COMPLETED'`.
* **Notifications / Emails:**
  - Dispatches `sendPostInspectionSurveyorEmail` to client (`surveyorSiteVisitsController.js:125`).
  - Creates `Notification` for customer: "🔍 Site Inspection Completed" (`line 148`).

---

### Step 10 & 11: Report Drafting & QA Audit
* **Frontend Trigger:**
  - File: `frontend/src/pages/surveyor/SurveyorModules.jsx:1670-1700`
  - Action: Uploads PDF via `api.post('/uploads/report')` then calls `surveyorUploadReportsApi.submitDraft(jobId, { reportPdfUrl })`
* **Backend Endpoint & Controller:**
  - Route: `POST /api/v1/surveyor/upload-reports/:id/draft` (`surveyorUploadReportsRoutes.js:14`)
  - Controller: `submitDraftReport` (`surveyorUploadReportsController.js:39-140`)
* **DB Operations:**
  - Updates `jobs` table: `reportPdfUrl`, `reportGeneratedAt = new Date()`, `stage = 'PREPARING_REPORT'`.
  - Creates `audit_logs` record: `action = 'DRAFT_REPORT_SUBMITTED_FOR_QA'`.
* **Notifications / Emails:**
  - Creates in-app `Notification` for `ADMIN`: "📋 Draft Survey Report Submitted for QA" (`line 119`).
  - Creates in-app `Notification` for `CUSTOMER`: "🛡️ Quality Assurance Review Underway" (`line 134`).

---

### Step 12: QA Approval & Final Report Delivery
* **Frontend Trigger:**
  - File: `frontend/src/pages/admin/AdminReportsPage.jsx:320-380` (`handleApproveReport`)
  - Calls `adminSurveyJobsApi.updateStage(jobId, { newStage: 'COMPLETE', reason: 'Admin QA approved' })`
* **Backend Endpoint & Controller:**
  - Route: `PATCH /api/v1/survey-jobs/:id/stage` (`surveyJobsRoutes.js:22`)
  - Controller: `updateJobStage` (`surveyJobsController.js:216-386`)
* **DB Operations:**
  - Updates `jobs` table: `stage = 'COMPLETE'`, `qaApprovedAt = new Date()`, `qaApprovedBy = req.user.name`.
  - Creates `audit_logs` record: `action = 'STAGE_CHANGED_TO_COMPLETE'`.
* **Notifications / Emails:**
  - Dispatches `sendReportReadyEmail` via Resend with download link (`surveyJobsController.js:356-364`).
  - Creates in-app `Notification` for `CUSTOMER`: "RICS Survey Report Ready" (`surveyJobsController.js:371`).

---

## 4. FRONTEND DATA SOURCES & LOCAL STORAGE

### 4.1 LocalStorage Keys & Data Usage

| Key Name | Files Using Key | Purpose & Stored Data |
|---|---|---|
| `property_group_auth_token` | `apiClient.js:40`, `AuthContext.jsx:349, 459` | JWT token string for `Authorization: Bearer` header. |
| `property_group_user_session` | `apiClient.js:45`, `AuthContext.jsx:75, 425, 458, 491`, `jobs.js:208` | Active user session JSON (`id`, `name`, `email`, `role`, `status`). |
| `property_group_remembered_email` | `AuthContext.jsx:266, 285` | Stored email for login screen "Remember me" box. |
| `property_group_registered_customers` | `AuthContext.jsx:390, 392` | Offline customer registration cache dictionary. |
| `njs_user_pw_{email}` | `AuthContext.jsx:394` | Plaintext fallback password cache for demo offline login. |
| `propertygroup_deleted_user_keys` | `AuthContext.jsx:396`, `AdminUsersPage.jsx:215` | Array of user emails marked deleted locally. |
| `propertygroup_jobs` | `mock/jobs.js:165, 202, 253, 283`, `Sidebar.jsx:122`, `CustomerDashboardPage.jsx:225` | Array of full job objects cached locally. |
| `propertygroup_quotes` | `mock/quotes.js:50`, `Sidebar.jsx:131`, `AdminQuotesPage.jsx:210` | Array of quotations cached locally. |
| `propertygroup_leads` | `mock/leads.js:70`, `AdminLeadsPage.jsx:150` | Array of CRM leads cached locally. |
| `propertygroup_terms` | `mock/terms.js:45`, `AdminTermsPage.jsx:120` | Array of contracts and terms cached locally. |
| `propertygroup_conversations_v1` | `mock/messages.js:40`, `Sidebar.jsx:163` | Array of chat thread objects. |
| `propertygroup_local_notifications` | `NotificationDropdown.jsx:140`, `notificationService.js:45` | Fallback browser notification items. |
| `njs_read_notifs` | `NotificationDropdown.jsx:167, 357, 373` | Array of notification IDs marked read by user. |
| `propertygroup_quote_accepted_{email}`| `Sidebar.jsx:119`, `CustomerModules.jsx:280` | Boolean flag indicating client accepted fee quote. |
| `propertygroup_inspection_completed` | `mock/jobs.js:297` | Boolean flag simulating inspection completed. |
| `propertygroup_drafting` | `mock/jobs.js:301` | Boolean flag simulating drafting stage. |
| `propertygroup_qa_review` | `mock/jobs.js:305` | Boolean flag simulating QA stage. |
| `propertygroup_delivered` | `mock/jobs.js:309` | Boolean flag simulating final delivery. |
| `propertygroup_email_automations` | `mock/emailAutomations.js:309, 341` | Configurable email automation rules cache. |
| `propertygroup_sent_logs` | `mock/emailAutomations.js:331, 349` | Logs of automated emails sent. |

### 4.2 Data Fetching Architecture: Database (API) vs LocalStorage / Mock

* **Pure Database Pages:**
  - `AdminCompaniesPage.jsx` (`adminCompaniesApi`)
  - `AdminSurveyorsPage.jsx` (`adminSurveyorsApi`)
  - `AdminSettingsPage.jsx` (`adminSettingsApi`)
  - `ProfilePage.jsx` (`apiRequest('/auth/me')`)
  - `ChangePasswordPage.jsx` (`apiRequest('/auth/change-password')`)
* **Dual / Hybrid Pages (Database API merged with Mock/LocalStorage):**
  - `AdminDashboardPage.jsx`: Fetches KPI stats & buckets from API, but list items come from `useJobs()` and `useLeads()` mock hooks.
  - `AdminJobsPage.jsx`: Calls `adminSurveyJobsApi.getJobs()` but synchronizes into `useJobs()` and reads from `localStorage['propertygroup_jobs']`.
  - `AdminLeadsPage.jsx`: Calls `adminCrmAndLeadsApi.getLeads()` but merges with `useLeads()`.
  - `AdminQuotesPage.jsx`: Calls `adminQuotationsAndPaymentsApi.getQuotes()` but falls back to `mock/quotes.js`.
  - `CustomerDashboardPage.jsx`: Calls `customerDashboardApi.getDashboard()` but actively writes payload into `localStorage['propertygroup_jobs']` (`CustomerDashboardPage.jsx:225`).
  - `CustomerModules.jsx`: Quotations, Invoices, Terms, and Reports make backend API calls, but read fallback state from localStorage flags.
  - `SurveyorDashboardPage.jsx` & `SurveyorModules.jsx`: Calls surveyor APIs but initial state loads from `useJobs()`.
* **Pure Mock Pages:**
  - `StaffDashboardPage.jsx` & `StaffCalendarPage.jsx`: Reads entirely from mock fixtures.
  - `PartnerPortalPage.jsx`: Reads entirely from `mock/partners.js`.

### 4.3 Hardcoded Test-Data Filters & Hardcoded Values

Multiple files in both frontend and backend contain hardcoded blacklist filters to suppress legacy test entries created during early development:

1. **`AdminDashboardPage.jsx:154-165` & `mock/jobs.js:220-230`:**
   - Filters out `email === 'customer@demo.com'`, `email === 'customer2@demo.com'`.
   - Filters out strings containing `'akku'`, `'mp nagar'`, `'bhopal'`, `'plot no 45'`.
   - Filters out hardcoded IDs `id !== '7'`, `id !== '11'`, `id !== '12'`, `id !== '13'`.
2. **`backend/src/controllers/dashboardController.js:44-51`:**
   - In `getActionBuckets`: `NOT: [{ id: 7 }, { clientName: { contains: 'akku' } }, { propertyAddress: { contains: 'MP Nagar' } }, { propertyAddress: { contains: 'Bhopal' } }, { propertyAddress: { contains: 'Plot No 45' } }, { reference: 'JOB-2026-101' }]`.
3. **`backend/src/controllers/jobController.js:38-41`:**
   - `NOT: [{ clientName: { contains: 'akku' } }, { propertyAddress: { contains: 'MP Nagar' } }, { propertyAddress: { contains: 'Bhopal' } }, { propertyAddress: { contains: 'Plot No 45' } }]`.
4. **`backend/src/controllers/usersAndRolesController.js:12, 144`:**
   - Hardcoded `DEMO_EMAILS = ['admin@demo.com', 'surveyor@demo.com', 'customer@demo.com', 'customer2@demo.com', ...]`.
5. **`backend/src/middlewares/authMiddleware.js:50-51, 80-81`:**
   - Hardcoded admin email checks: `cleanEmail === 'njsadmin@gmail.com' || cleanEmail === 'admin@demo.com' || cleanEmail.includes('admin')`.

---

## 5. AUTHENTICATION & SECURITY AUDIT

### 5.1 Login & JWT Mechanism
* **Backend Login (`backend/src/controllers/authController.js:154-255`):**
  - Validates `email` and `password`. Uses `bcrypt.compare(password, user.password)`.
  - Issues signed JWT token via `jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' })`.
* **Frontend Storage (`frontend/src/auth/AuthContext.jsx:349`):**
  - Stores JWT token in `localStorage.setItem('property_group_auth_token', authToken)`.
  - Attaches token via `Authorization: Bearer <token>` in `frontend/src/api/apiClient.js:60`.

### 5.2 CRITICAL VULNERABILITY: Header Trust & Authentication Bypass
* **File & Lines:** `backend/src/middlewares/authMiddleware.js:33-92` & `103-154`
* **Vulnerability Description:**
  1. The backend middleware explicitly inspects `req.headers['x-user-email']`. If this header is present, **it overrides or replaces the authenticated JWT token context entirely**!
  2. If `x-user-email` contains `admin` (e.g. `admin@demo.com` or `njsadmin@gmail.com`), lines 50-52 synthesize an **`ADMIN`** user context even if the user never passed a valid JWT token:
     ```javascript
     const isAdmin = cleanEmail === 'njsadmin@gmail.com' || cleanEmail === 'admin@demo.com' || cleanEmail.includes('admin');
     const derivedRole = isAdmin ? 'ADMIN' : (isSurveyor ? 'SURVEYOR' : 'CUSTOMER');
     ```
  3. **Unauthenticated Admin Fallback (`authMiddleware.js:103-154`):** If no token and no header is provided, the middleware checks the route path:
     - If path is NOT `/customer` and NOT `/surveyor` (e.g. `/api/v1/users-and-roles` or `/api/v1/settings`), it defaults `targetRole = 'ADMIN'`, queries the first active Admin in MySQL, and sets `req.user = adminUser`!
     - If the database is disconnected, it defaults to a hardcoded Admin user (`Alexander Sterling`, ID 20, Role `ADMIN`).
* **Impact:** **CRITICAL**. Any external attacker who sends an HTTP request with header `x-user-email: admin@demo.com` (or sends a request with no auth headers to admin endpoints) can access, view, modify, and delete all administrative data.

### 5.3 Routes Without Authentication or Role Verification

| Route Path | File & Line | Security Status |
|---|---|---|
| `POST /api/v1/public/enquiries` | `backend/src/routes/publicRoutes.js:8` | Public / Unauthenticated (Expected for enquiry form). |
| `POST /api/v1/crm-and-leads/lsd` | `backend/src/routes/crmAndLeadsRoutes.js:18` | **UNAUTHENTICATED WEBHOOK**. No secret token or HMAC signature verification. Anyone can POST fake leads. |
| `POST /api/v1/payments/create-payment-intent` | `backend/src/routes/paymentRoutes.js:11` | Protected by `verifyJWT`, but subject to the `x-user-email` bypass. |
| `POST /api/v1/payments/webhook` | `backend/src/routes/paymentRoutes.js:12` | Public Stripe webhook. Verified using `stripe.webhooks.constructEvent` if `STRIPE_WEBHOOK_SECRET` is set (`paymentController.js:110-120`). |
| `GET /api/v1/postcodes/lookup/:postcode` | `backend/src/routes/postcodeRoutes.js:10` | Public / Unauthenticated (Read-only UK postcode format check). |

### 5.4 Cross-Customer Data Exposure (IDOR & Tenant Isolation)
Can Customer A see or modify Customer B's data?
* **Direct ID Queries:**
  - `POST /api/v1/customer/quotations/:id/accept` (`customerQuotationsController.js:187-200`): Finds quote by `id: quoteId` **without filtering by the requesting customer's `clientId` or `clientEmail`**. Customer A can accept Customer B's quote if they know or guess the ID.
  - `POST /api/v1/customer/invoices/:id/pay` (`customerInvoicesAndPaymentsController.js:65-76`): Queries invoice by `id: invoiceId` without verifying ownership.
  - `POST /api/v1/customer/terms-to-sign/:id/sign` (`customerTermsToSignController.js:65-76`): Queries terms by `id: termId` without verifying ownership.
* **Header Spoofing:** Because customer controllers read `const headerEmail = req.headers['x-user-email']` (`customerDashboardController.js:12`, `customerQuotationsController.js:11`, `customerReportsController.js:10`), any customer who modifies their outgoing headers can load all quotes, invoices, and reports belonging to any other customer email.

---

## 6. ERROR HANDLING & RESILIENCE AUDIT

### 6.1 Silent / Empty Catch Blocks (`catch(() => {})` or Empty `catch {}`)

#### Backend
1. `backend/src/controllers/crmAndLeadsController.js:229`: `.catch(() => {})` on admin notification creation.
2. `backend/src/controllers/crmAndLeadsController.js:509`: `} catch (_) {}` in lead deletion.
3. `backend/src/controllers/quotationsAndPaymentsController.js:178`: `} catch (fErr) {}` on lead lookup by reference.
4. `backend/src/controllers/quotationsAndPaymentsController.js:192`: `} catch (jErr) {}` on job fuzzy property search.
5. `backend/src/controllers/quotationsAndPaymentsController.js:220`: `} catch (lErr) {}` on lead status update.
6. `backend/src/controllers/quotationsAndPaymentsController.js:251`: `} catch (err) {}` on lead details fallback.
7. `backend/src/controllers/quotationsAndPaymentsController.js:364`: `} catch (e) {}` on quote reference generation collision check.
8. `backend/src/controllers/quotationsAndPaymentsController.js:398`: `} catch (err) {}` on invoice query.
9. `backend/src/controllers/quotationsAndPaymentsController.js:407`: `} catch (err) {}` on quote update.
10. `backend/src/controllers/quotationsAndPaymentsController.js:490`: `} catch (err) {}` on audit log creation.
11. `backend/src/controllers/quotationsAndPaymentsController.js:554`: `} catch (err) {}` on BACS settlement notification.
12. `backend/src/controllers/surveyJobsController.js:289`: `} catch {}` on audit log creation in `updateJobStage`.
13. `backend/src/controllers/surveyJobsController.js:348`: `} catch (notifErr) {}` on customer stage notification.
14. `backend/src/controllers/surveyJobsController.js:379`: `} catch (err) {}` on delivery notification creation.
15. `backend/src/controllers/surveyJobsController.js:467`: `} catch (emailErr) {}` on surveyor assigned email.
16. `backend/src/controllers/surveyJobsController.js:596`: `} catch (e) {}` on booking calendar audit logging.
17. `backend/src/controllers/surveyJobsController.js:610`: `} catch (e) {}` on notification dispatch in reschedule.
18. `backend/src/controllers/surveyJobsController.js:657`: `} catch (emailErr) {}` on booking reschedule email.
19. `backend/src/controllers/reportsAndAnalyticsController.js:196`: `} catch (emailErr) {}` on report export email dispatch.
20. `backend/src/controllers/notificationController.js:137, 906, 958, 969`: `} catch {}` in notification broadcasting.

#### Frontend
1. `frontend/src/api/apiClient.js:46`: `} catch {}` on `localStorage.getItem('property_group_user_session')` JSON parse.
2. `frontend/src/mock/jobs.js:44, 157, 160, 203, 210, 288`: `} catch {}` on localStorage jobs sync and parsing.
3. `frontend/src/mock/leads.js:73, 263`: `} catch {}` on localStorage leads sync.
4. `frontend/src/auth/AuthContext.jsx:121, 422, 469`: `} catch {}` on customer registration storage.
5. `frontend/src/components/NotificationDropdown.jsx:160, 172, 358, 374`: `} catch {}` on read notifications localStorage parse.
6. `frontend/src/components/Sidebar.jsx:129, 138, 174`: `} catch {}` on unread badge computation.

### 6.2 "Resilient Mode" / Mock Fallbacks on Database Failure
* **`backend/src/controllers/quotationsAndPaymentsController.js:222-234`:**
  - If `prisma.quote.create` throws an error, the controller logs:
    `MySQL DB persistence skipped for quote (server running in resilient mode): dbErr.message`
    and synthesizes a fake in-memory quote object, returning HTTP 201 to the caller and proceeding to send emails!
* **`backend/src/controllers/publicEnquiryController.js:66-85`:**
  - If `prisma.lead.create` fails, it catches the error silently, leaves `dbSaved = false`, and returns HTTP 201 Created to the user.
* **`backend/src/controllers/surveyJobsController.js:254-260`:**
  - In `updateJobStage`, if the job is not found in MySQL, it returns `ApiResponse.success(res, { job: { id, reference: id, stage: targetStage } })`, falsely reporting that the stage was updated.
* **`backend/src/middlewares/authMiddleware.js:126-154`:**
  - If the database is completely offline, it synthesizes mock users (Alexander Sterling, Emma Watson, NJS Lead Surveyor) and permits the request to continue.

### 6.3 Enum & Status Discrepancies (Frontend vs Backend DB)
* **Lead Status Discrepancy:**
  - Database Prisma Enum (`schema.prisma:375`): `QUOTE_SENT`.
  - Frontend UI / Filter (`AdminLeadsPage.jsx:45-50` & `crmAndLeadsController.js:134, 149`): Uses `'QUOTED'` interchangeably with `'QUOTE_SENT'`. Controller contains translation patches to prevent enum validation crashes.
* **Job Stage Discrepancy (10 Stages vs 6 DB Stages):**
  - Frontend RICS Tracker (`SurveyProgressTracker.jsx:15-30`): Displays **10 steps** (Enquiry, Quote Issued, Quote Accepted, Terms Signed, Payment Confirmed, Appointment Booked, Inspection Completed, Report Preparation, Quality Check, Report Delivered).
  - Backend Database Enum (`JobStage`, `schema.prisma:364-370`): Only has **6 values** (`QUOTE`, `PAID`, `ACCEPTED`, `BOOKED`, `PREPARING_REPORT`, `COMPLETE`).
  - Collapse: Stages 7, 8, and 9 (Inspected, Drafting, QA Review) all collapse into the single DB value `PREPARING_REPORT`.
  - Stages 10 and Delivered collapse into `COMPLETE`.

---

## 7. FEATURE STATUS TABLE

| Module | Status | Reason / Current Technical State |
|---|---|---|
| **Public Website & Enquiry Form** | **WORKING** | All service pages, UK postcode format check, and public quote enquiry form submit to `/api/v1/public/enquiries` with email notification. |
| **Admin Dashboard** | **PARTIAL** | KPI metrics and action bucket counters load from DB, but bucket click table displays local mock hook items, causing count/list discrepancy. |
| **Leads / CRM** | **PARTIAL** | Leads load from DB and LSD webhook is available, but lead status updates have duplicate quote generation hooks. |
| **Quotes** | **PARTIAL** | Quotations create and email cleanly, but no DB unique constraint on `leadId`, and editing fee input locks to 0 when cleared. |
| **Jobs** | **PARTIAL** | Full job lifecycle exists, but database enum only supports 6 stages for a 10-stage RICS workflow. |
| **Terms** | **PARTIAL** | Digital signature capture with SHA-256 audit hash works, but endpoints lack ownership check (IDOR). |
| **Invoices & Payments (Stripe + BACS)** | **PARTIAL** | Stripe payment intents and BACS manual settlement work, but quote acceptance fails to update preexisting invoice totals. |
| **Customer Portal** | **BROKEN** | Customer Dashboard crashes with `ReferenceError: FileCheck is not defined` when Terms are signed and payment is pending. |
| **Surveyor Portal** | **WORKING** | Surveyor can view assigned appointments, complete site visits, and submit draft report PDFs. |
| **Calendar / Booking** | **PARTIAL** | Booking modal requires payment + signed terms, but calendar views sync partly from mock/localStorage. |
| **Messages (Chat)** | **WORKING** | Real-time polling chat works between client, surveyor, and admin via `messages` table. |
| **Notifications** | **PARTIAL** | In-app alerts work in header bell, but duplicate triggers in CRM and Quotes create multiple identical notifications. |
| **Email Automation** | **PARTIAL** | Transactional emails send via Resend, but automated cron triggers for booking reminders rely on frontend mock timer (`mock/emailAutomations.js`). |
| **Reports & Analytics** | **WORKING** | Generates PDF survey report previews and exports operational data. |
| **Users & Roles** | **PARTIAL** | Admin user management works, but authentication middleware trusts arbitrary `x-user-email` headers. |
| **Settings** | **WORKING** | General, email, and company settings save to `system_settings` table. |

---

## 8. KNOWN BUGS & VULNERABILITIES

### Bug 1: Customer Dashboard Crashes with `ReferenceError: FileCheck is not defined`
* **Severity:** **HIGH** (Breaks customer experience)
* **Location:** `frontend/src/pages/customer/CustomerDashboardPage.jsx:928`
* **What is Wrong:** When a customer completes Stage 4 (Terms Signed) and payment is pending, the prompt banner attempts to render `<FileCheck className="w-5 h-5 text-indigo-100" />`. However, `FileCheck` is **not imported** from `lucide-react` at the top of the file.
* **What Should Happen:** `FileCheck` must be imported in `frontend/src/pages/customer/CustomerDashboardPage.jsx:4-26`, or replaced with an already imported icon such as `CheckCircle2` or `FileText`.

### Bug 2: Admin Quote Fee Input Locks on Value `0` During Editing
* **Severity:** **MEDIUM** (Operational friction)
* **Location:** `frontend/src/components/crm/SendQuoteModal.jsx:463`
* **What is Wrong:** The input has `onChange={(e) => setBaseFee(parseFloat(e.target.value) || 0)}`. When an administrator backspaces to clear the number and type a new one, `parseFloat("")` evaluates to `NaN`, which defaults to `0`. On subsequent keystrokes, the field remains trapped at `0` or prefixes numbers with `0`.
* **What Should Happen:** State should store the raw input string (`e.target.value`), and numeric parsing should occur only upon submission or with a fallback that allows an empty string during active typing.

### Bug 3: Duplicate Quotes and Duplicate Notifications on Quote Dispatch
* **Severity:** **MEDIUM** (Duplicate records and email spam)
* **Location:** `backend/src/controllers/crmAndLeadsController.js:148-230` & `backend/src/controllers/quotationsAndPaymentsController.js:114-300`
* **What is Wrong:** Both controllers contain full logic to create a quote row, send a proposal email, and create customer/admin notifications. If an admin changes status in CRM and clicks "Send Quote" modal, two quotes are generated and duplicate notifications are inserted into `notifications` table.
* **What Should Happen:** Quote creation must be consolidated into a single service, and `prisma.quote` should enforce unique constraints or check existing records before creating new ones.

### Bug 4: Old Invoice Amount Retained When Customer Accepts New Quote
* **Severity:** **HIGH** (Financial discrepancy)
* **Location:** `backend/src/controllers/customer/customerQuotationsController.js:344-361`
* **What is Wrong:** In `acceptCustomerQuotation`, when checking for an invoice:
  ```javascript
  const existingInvoice = await prisma.invoice.findFirst({ where: { jobId } });
  if (!existingInvoice) {
    await prisma.invoice.create({ ... total: totalFee });
  }
  ```
  If an invoice already existed for that `jobId` with a previous quote amount or draft estimate, the code does nothing (`if (!existingInvoice)`). The customer is billed the OLD invoice amount instead of the newly accepted quote fee.
* **What Should Happen:** If `existingInvoice` exists and status is `PENDING`, its `subtotal`, `vatAmount`, and `total` should be updated to reflect the newly accepted quote fee.

### Bug 5: Customer Sees Multiple Quotations for the Same Property
* **Severity:** **LOW / MEDIUM** (Customer confusion)
* **Location:** `backend/src/controllers/customer/customerQuotationsController.js:18-32`
* **What is Wrong:** `getCustomerQuotations` runs `prisma.quote.findMany` matching `clientEmail`. If an admin re-quoted or adjusted a quote multiple times, all quote rows are returned without deduplication or grouping by property/lead.
* **What Should Happen:** Quotes should either be superseded (status marked `EXPIRED`/`SUPERSEDED`), or grouped by `propertyAddress` returning only the latest active quote.

### Bug 6: Dashboard Action Bucket Count Does Not Match Displayed List
* **Severity:** **MEDIUM** (Admin interface inconsistency)
* **Location:** `frontend/src/pages/admin/AdminDashboardPage.jsx:220-360` & `backend/src/controllers/dashboardController.js:41-75`
* **What is Wrong:** The badge count displays `backendBuckets` fetched directly from MySQL (`adminDashboardApi.getActionBuckets()`). However, clicking a bucket filters the local React state `jobs` and `leads` loaded from `useJobs()` / `useLeads()` mock hooks.
* **What Should Happen:** The dashboard table should query the backend API directly with bucket query parameters (e.g. `GET /api/v1/survey-jobs?bucket=jobs_to_book`), displaying the exact records counted by the database.

### Bug 7: Customer Tracker Resets to "Stage 1: Enquiry Received"
* **Severity:** **MEDIUM** (Customer progress tracking error)
* **Location:** `backend/src/controllers/customer/customerTrackSurveyController.js:44-50`
* **What is Wrong:** When checking a lead:
  ```javascript
  const isQuoted = ((lead.status === 'QUOTE_SENT' || lead.status === 'QUOTED') && Boolean(lead.estimatedValue && Number(lead.estimatedValue) > 0));
  const calculatedStep = lead.status === 'CONVERTED' ? 3 : (isQuoted ? 2 : 1);
  ```
  If a lead was marked `QUOTE_SENT` but `estimatedValue` was omitted or null, `isQuoted` evaluates to `false`, causing `calculatedStep` to fall back to `1` ("Enquiry Received") even though a quote was issued.
* **What Should Happen:** `isQuoted` should evaluate true based on `lead.status === 'QUOTE_SENT'` or `lead.quotes.length > 0`, regardless of whether `estimatedValue` is populated.

---

## 9. TESTS & BUILD RUN STATUS

### 9.1 Automated Test Suites
* **Standard Unit / Integration Tests (`npm test`):** **NONE.**
  - Neither `backend/package.json` nor `frontend/package.json` contains a `test` script.
  - No Jest, Vitest, or Mocha test frameworks are configured.
* **Ad-Hoc Playwright Scripts:**
  - Located in `frontend/scripts/` and `scratch/` (e.g. `test_submit_ticket.cjs`, `test_customer_support.cjs`).
  - These are standalone node scripts rather than a CI/CD test runner.

### 9.2 Build & Code Quality Check Results

1. **Backend Syntax Check:**
   - Command: `node --check backend/src/server.js`
   - **Result:** **PASSED** (Exit code `0`). No syntax errors detected in backend entry point.

2. **Frontend Production Build:**
   - Command: `npm --prefix frontend run build` (Vite v8.3.5)
   - **Result:** **PASSED** (Exit code `0`).
   - Output: 2,267 modules transformed, production bundles generated in `frontend/dist/` in 5.86 seconds with **zero fatal build errors**.

3. **Frontend Linter (`oxlint`):**
   - Command: `npm --prefix frontend run lint`
   - **Result:** Finished in 1.4s on 179 files.
   - Warnings: 522 unused import/variable warnings.
   - Errors: 0 fatal syntax errors, but surfaced JSX undefined identifier:
     `! react(jsx-no-undef): 'FileCheck' is not defined at src/pages/customer/CustomerDashboardPage.jsx:928:16`.

---

## 10. TOP 10 RISKS (PRIORITIZED FOR LIVE CLIENT USE)

```
[1. Auth Header Bypass] > [2. Cross-Customer IDOR] > [3. Stale Invoice Amounts]
  > [4. DB Silent Fails] > [5. Customer Dashboard Crash] > [6. 10 vs 6 Stage Mismatch]
  > [7. Duplicate Quotes] > [8. Dual Source of Truth] > [9. Tracker Regressions] > [10. No Automated Tests]
```

1. **Authentication Bypass & Impersonation via Headers (CRITICAL):**
   `backend/src/middlewares/authMiddleware.js:34-92` allows any caller to pass `x-user-email: admin@demo.com` and automatically receive `ADMIN` privileges without a valid JWT or password. Additionally, unauthenticated requests to non-customer endpoints default to an admin user context.
2. **Insecure Direct Object References (IDOR) & Customer Data Exposure (HIGH):**
   Customer endpoints (`/customer/quotations/:id/accept`, `/customer/invoices/:id/pay`, `/customer/terms-to-sign/:id/sign`) query records by integer ID without verifying that the record belongs to the authenticated customer. Customer A can view or manipulate Customer B's files.
3. **Billing Discrepancies & Stale Invoice Amounts (HIGH):**
   When a customer accepts a newly issued quote (`customerQuotationsController.js:344`), if an invoice already existed for that job, it is not updated. The client is billed the wrong amount.
4. **Silent Database Failures ("Resilient Mode") Masking Data Loss (HIGH):**
   Backend controllers (`publicEnquiryController.js:65-85`, `quotationsAndPaymentsController.js:222-234`) catch database errors silently and return successful HTTP 201 responses. Enquiries and quotes appear successful on the screen but are never saved to MySQL.
5. **Runtime Crash on Customer Dashboard (MEDIUM / HIGH):**
   `FileCheck` is not imported in `CustomerDashboardPage.jsx:928`. Any customer who signs their terms and returns to the dashboard experiences a white screen / ErrorBoundary crash.
6. **Data Loss from 10-Stage to 6-Stage Enum Compression (MEDIUM):**
   Prisma enum `JobStage` only has 6 values (`QUOTE`, `PAID`, `ACCEPTED`, `BOOKED`, `PREPARING_REPORT`, `COMPLETE`). The intermediate RICS stages ("Site Inspected", "Report Drafting", "Quality Assurance Review") cannot be preserved natively in the database and are inferred from audit log strings.
7. **Duplicate Quotes and Notification Flooding (MEDIUM):**
   No unique constraints exist in `prisma.quote` for `(leadId)`. Dispatching quotes from CRM and Quotes pages triggers duplicate quote rows and multiple identical notification emails to the client.
8. **Dual Source of Truth (Database vs LocalStorage) Causing State Inconsistencies (MEDIUM):**
   Pages simultaneously read and write to `localStorage` while fetching from MySQL. Changes made by admin on one browser do not reflect for the customer on another browser until localStorage is cleared.
9. **Fragile Milestone Detection in Customer Survey Tracker (LOW / MEDIUM):**
   Customer progress tracking drops from Stage 2/3 back to Stage 1 if `lead.estimatedValue` is empty or 0, showing confusing progress to paying clients.
10. **Lack of Automated CI/CD Regression Testing (LOW / MEDIUM):**
    With 0 unit or integration tests, future changes to quote calculations, stage progressions, or permission checks cannot be validated automatically before deploying to production.

---

## 11. QUESTIONS FOR OWNER / MANAGEMENT

Code padhne ke baad neeche diye gaye points product owner ya management se clarify karna zaroori hai:

1. **Authentication Policy & Header Trust:**
   - Kya `x-user-email` aur `x-user-name` headers development/demo testing ke liye temporarily daale gaye the?
   - Kya live production ke liye is header trust ko completely remove karke strictly JWT token validation enforce karna hai?
2. **Database Migrations vs `db push`:**
   - Kya project mein future changes ke liye proper versioned Prisma migrations (`prisma migrate dev`) shuru karni hain, ya Railway live database hamesha `prisma db push` se sync kiya jayega?
3. **RICS 10-Stage vs 6-Stage Lifecycle:**
   - Kya MySQL database ke `JobStage` enum ko update karke pure 10 stages (`ENQUIRY`, `QUOTE_ISSUED`, `QUOTE_ACCEPTED`, `TERMS_SIGNED`, `PAID`, `BOOKED`, `INSPECTED`, `DRAFTING`, `QA_REVIEW`, `COMPLETE`) add karne hain, taaki audit log par depend na rehna pade?
4. **LSD (Local Surveyors Direct) Webhook Security:**
   - `POST /api/v1/crm-and-leads/lsd` endpoint par koi shared secret key ya token check nahi hai. Kya LSD webhook ke liye koi API key ya secret header define karna hai?
5. **Stripe & Resend Live Environment Status:**
   - Kya live payment aur live email testing ke liye production keys configure ho chuki hain, ya test mode keys use ki ja rahi hain?
6. **Customer Portal Login Toggle:**
   - Backend `authMiddleware.js:156` mein `ENABLE_CLIENT_PORTAL_LOGIN` flag check hota hai. Kya client portal live users ke liye default ON rehna chahiye?
