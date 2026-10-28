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

### Requirement 1: Client Profile — Call Notes & Dedicated Complaints Log
* **Call Communication Log:**
  * When viewing a client/customer record (in Users/Clients or Job Details), there must be a chronological log of all interactions.
  * Fields required: Exact Date & Time (e.g. `28/10/2026, 10:15 AM`), Call Direction (Inbound Call / Outbound Call / Email), Staff Member who handled the call, and Detailed Call Summary.
  * Quick action: `+ Log Call Note`.
* **Separate Complaints Log:**
  * Client explicitly requested: *"It should have a separate log of complaints."*
  * Needs a dedicated complaints register/tab on the client profile:
    * Complaint ID (e.g. `CMP-101`)
    * Timestamp Logged
    * Category (e.g., Report Delivery Delay, Valuation Dispute, Surveyor Conduct, Booking Reschedule, Fee Discrepancy)
    * Severity / Priority (Low, Medium, High, Urgent)
    * Status (`Open`, `Under Investigation`, `Resolved`, `Escalated`)
    * Description of the client's issue
    * Resolution notes & Staff member who resolved it

---

### Requirement 2: CRM Leads Pipeline — 'Quoted' Status & Local Survey Directs
* **Lead Sources Integration:**
  * Support UK lead sources prominently:
    * **Local Surveyors Direct (LSD)**
    * **Email Inquiries**
    * **Website Direct Quotes**
    * **Estate Agent Referrals**
* **Quote & Deal Lifecycle:**
  * Inbound lead arrives as `New`.
  * Staff creates/dispatches a fee proposal.
  * Status changes immediately to **`Quoted`** (indicating price proposal is sent and negotiation/deal is live).
  * Direct 1-click `Send Quote / Mark Quoted` action button on the lead row and lead drawer.

---

### Requirement 3: Portal Login & Security Architecture
* **Remove "Agent Login":**
  * Client explicitly confirmed: *"You don't need an agent's login... remove agent login."*
  * The roles are:
    1. **Customer / Client** (Property Buyer)
    2. **Surveyor** (RICS Field Surveyor)
    3. **Admin / Super Admin** (HQ Management)
* **Customer-First Front Website:**
  * On the public website header/navbar: Only show a clean **"Client Portal"** (or "Customer Sign In") button.
  * Do NOT display Admin or Surveyor login links on the public front navbar to protect against unauthorized probing/hacking.
* **Separated Back-Office Entrance:**
  * Provide a discreet, secure back-office link (e.g., in the website footer under *Staff & Surveyor Portal* or a dedicated toggle on the login page).
  * Main login page defaults strictly to **Customer Sign In**.
  * Back-office credentials area is cleanly isolated for authorized practice personnel only.

---

### Requirement 4: Website Modernization (Benchmarked to `esurv.co.uk`)
* **Critique from Client:** Current site has plain text, dated layout, and lacks rich imagery.
* **Key Enhancements from `esurv.co.uk`:**
  1. **Hero Section:**
     * High-resolution, professional British residential photography (Victorian/Edwardian properties, modern new builds, surveyors on site with inspection tools).
     * Instant Quote / Postcode Checker widget: *"Enter your UK postcode to compare survey options & get an instant price in 60 seconds"*.
  2. **Clear Visual Survey Comparison:**
     * Dedicated visual cards for **RICS Home Survey Level 2**, **RICS Building Survey Level 3**, **Snagging Reports**, and **Property Valuations**.
     * Features checklist, traffic-light condition rating preview, and clear "Get a Quote" CTAs.
  3. **Trust & Credibility Badges:**
     * Prominent **Trustpilot 4.8★** Excellent rating banner.
     * Official **RICS Regulated** crest and ISO certification badges.
  4. **3-Step "How It Works" Section:**
     * Step 1: Instant Quote in 60s
     * Step 2: Expert On-Site RICS Inspection
     * Step 3: Fast Digital Report Delivery (within 48 Hours)

---

## 3. Implementation Checklist & Progress Tracking

- [ ] **Task 1: Login & Security Cleanup**
  - [ ] Remove all "Agent" references from Login page and portal options.
  - [ ] Update public header to show only "Client Portal".
  - [ ] Default `LoginPage.jsx` to Customer Sign In.
  - [ ] Move Admin & Surveyor logins to a secure "Staff & Surveyor Back-Office" entrance.
- [ ] **Task 2: Client Profile — Call Notes & Complaints Log**
  - [ ] Add interactive Client Profile drawer/modal in `AdminUsersPage.jsx` and `JobDetailsPage.jsx`.
  - [ ] Add Call History log with exact timestamps, caller name, and discussion summary.
  - [ ] Add dedicated Complaints Register with status (`Open`, `Investigating`, `Resolved`), category, severity, and resolution notes.
- [ ] **Task 3: CRM Leads — 'Quoted' Status & Local Survey Directs**
  - [ ] Add "Local Surveyors Direct" & "Email Inquiry" source filters and badges in `AdminLeadsPage.jsx`.
  - [ ] Add 1-click "Create Quote / Mark Quoted" action that updates lead status to `Quoted`.
- [ ] **Task 4: Website Modernization (`esurv.co.uk` style)**
  - [ ] Upgrade Homepage hero section with rich UK residential imagery and an interactive instant postcode quote widget.
  - [ ] Add visual service comparison cards with features checklist and clear pricing guidance.
  - [ ] Add Trustpilot reviews section, RICS badges, and "How It Works" 3-step visual workflow.

