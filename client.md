# Client Feedback & Requirements Document

**Project:** UK Property Surveying Practice  
**Date Logged:** 28 October 2026  
**Reference Website:** [https://www.esurv.co.uk/](https://www.esurv.co.uk/) (UK Benchmark for Residential Surveying & Valuation)

---

## 1. Raw Audio Transcripts (Client Voice Notes)

### Audio 1: `WhatsApp Audio 2026-10-28 at 12.35.04` (Duration: 01:09)
> *(0:00)* Those who log in as admin, the client's profile doesn't have notes like they called at this time, they made this complaint, they said this.  
> *(0:14)* It should have a separate log of complaints.  
> *(0:17)* I can show you by doing a survey, like when we log in on the computer, because their setup is very simple, it seems a little difficult to me.  
> *(0:30)* And when the leads of CRM come, for example, integrations, local survey directs, when they come through email, they come in quotes first.  
> *(0:48)* When we give a quote, it says quoted, it means we have given a quote, the lead has now made a deal with it.  
> *(0:57)* I can show you a little, for example, I have to do it on the computer, I am not in the office right now, I will do it, it is morning here, I will tell you in a little while.

---

### Audio 2: `WhatsApp Audio 2026-10-28 at 12.44.51` (Duration: 01:00)
> *(0:00)* First of all, take a look at the survey booker, which I will send you on the computer in a while.  
> *(0:07)* It is very simple, like their setup.  
> *(0:11)* Here, it is happening a lot, like on the system, which you have shown a demo.  
> *(0:19)* And you don't need an agent's login.  
> *(0:24)* Like when we log in on our link, we don't need an agent's login.  
> *(0:29)* It should be like a customer first, then server [surveyor], then admin.  
> *(0:40)* Like the admin and server link can be separate.  
> *(0:48)* Like only the customer link should be on the front. Because there is more chance of getting hacked.  
> *(0:57)* It should be in their backlog / back-office.

---

### Audio 3: `WhatsApp Audio 2026-10-28 at 12.47.33` (Duration: 00:31)
> *(0:00)* The whole website itself is not good.  
> *(0:05)* It is very old, dated, text is very simple, etc.  
> *(0:09)* There is no image.  
> *(0:11)* And when you create a system, along with that, the website should also be updated a little, right?  
> *(0:20)* This is an example, `esurv.co.uk`.  
> *(0:23)* This is how the website should be made.  
> *(0:24)* Now look at mine, how is it?  
> *(0:26)* You can compare and see what changes have to be made.

---

## 2. Structured Requirements Breakdown

### Requirement 1: Client Profile — Call Notes & Dedicated Complaints Log (COMPLETED)
* **Call Communication Log:**
  * Chronological log of all interactions with exact date, time, handler, and summary.
  * 1-Click "+ Log Call Note" quick capture.
* **Separate Complaints Log:**
  * Dedicated complaints register with Complaint ID, Status (`Open`, `Under Investigation`, `Resolved`), Category, Severity, and Resolution Audit notes.

---

### Requirement 2: CRM Leads Pipeline — 'Quoted' Status & Local Survey Directs (COMPLETED)
* **Lead Sources Integration:**
  * Supported UK lead sources: Local Surveyors Direct (LSD), Email Inquiry, Website, Referral.
* **Quote & Deal Lifecycle:**
  * 1-Click "Send Quote / Mark Quoted" dispatch modal with UK VAT calculation.
  * Automatic lead transition to `Quoted` status.
  * Pipeline revenue value tracking and 1-click deal conversion.

---

### Requirement 3: Portal Login & Security Architecture (COMPLETED)
* **Remove "Agent Login":**
  * Eliminated all "Agent" login roles. Order is now strictly: Customer -> Surveyor -> Admin.
* **Customer-First Front Website:**
  * Public navbar shows only clean "Client Portal" entrance.
* **Separated Back-Office Entrance:**
  * Isolated `/backoffice` entrance for staff & surveyor credentials, keeping public portal secure from hacking.

---

### Requirement 4 & 5: Website Modernization (Benchmarked to `esurv.co.uk`) (COMPLETED)
* **Hero Section & Instant Postcode Quote Tool:**
  * Interactive 60-second Postcode Quote Estimator with instant pricing calculation (Level 2 vs Level 3).
  * Direct synchronization with CRM Leads pipeline (`propertygroup_crm_leads_v1`).
  * Top utility bar with Trustpilot 4.8★ rating, RICS Regulated notice, and direct hotline `0800 169 9661`.
* **Traffic-Light Condition Ratings Showcase:**
  * Official RICS Condition 1 (Green), Condition 2 (Amber), and Condition 3 (Red) explanatory pillars.
  * Live report defect inspector with real UK case studies (Chimney, Damp, Guttering, Glazing).
* **"Which Survey Do I Need?" Decision Tool:**
  * Interactive 3-step property age & condition questionnaire providing instant customized recommendations.
* **Trust & Credibility Elements:**
  * Trustpilot 4.8★ Excellent showcase with authentic homeowner reviews.
  * Sample RICS Report preview modal with specimen PDF page spread.

---

## 3. Implementation Checklist & Progress Tracking

- [x] **Task 1: Login & Security Cleanup**
  - [x] Remove all "Agent" references from Login page and portal options.
  - [x] Update public header to show only "Client Portal".
  - [x] Default `LoginPage.jsx` to Customer Sign In.
  - [x] Move Admin & Surveyor logins to a secure "Staff & Surveyor Back-Office" entrance (`/backoffice`).
- [x] **Task 2: Client Profile — Call Notes & Complaints Log**
  - [x] Add interactive Client Profile drawer/modal in `AdminUsersPage.jsx`, `JobDetailsPage.jsx`, and `AdminLeadsPage.jsx`.
  - [x] Add Call History log with exact timestamps, caller name, and discussion summary.
  - [x] Add dedicated Complaints Register with status (`Open`, `Investigating`, `Resolved`), category, severity, and resolution notes.
- [x] **Task 3: CRM Leads — 'Quoted' Status & Local Survey Directs**
  - [x] Add "Local Surveyors Direct" & "Email Inquiry" source filters and badges in `AdminLeadsPage.jsx`.
  - [x] Add 1-click "Create Quote / Mark Quoted" action that updates lead status to `Quoted`.
  - [x] Executive pipeline banner showing total quoted deal value.
- [x] **Task 4 & 5: Website Modernization (`esurv.co.uk` style)**
  - [x] Upgrade Homepage hero section with rich UK residential imagery and an interactive instant postcode quote widget (`InstantQuoteCalculator.jsx`).
  - [x] Add visual service comparison cards with features checklist, starting prices, and 48h turnaround tags.
  - [x] Add official RICS Traffic-Light Condition Ratings showcase (`TrafficLightRatings.jsx`).
  - [x] Add "Which Survey Do I Need?" interactive questionnaire (`SurveySelector.jsx`).
  - [x] Add Trustpilot 4.8★ reviews section and metrics banner (`ReviewsSection.jsx`).
  - [x] Add authentic sample RICS report preview and specimen modal (`SampleReportSection.jsx`).
