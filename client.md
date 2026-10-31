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


---

## 4. SurveyBooker & e.surv Video Features (From Videos 1 & 2)

- [x] **Feature 1: SurveyBooker 6 Action Buckets Dashboard**
  - Added `SurveyBookerWorkflowBuckets.jsx` with dynamic live counts:
    - *Quotes to submit* (LSD / inbound quote inquiries)
    - *Terms to send* (Accepted proposals awaiting contract)
    - *Jobs to book* (Payment settled, awaiting inspection scheduling)
    - *Appointments* (Confirmed field visits)
    - *Reports to upload* (Awaiting PDF report release)
    - *Calendar and tasks* (Direct link to calendar)
  - Integrated in both `AdminDashboardPage.jsx` and `StaffDashboardPage.jsx`.

- [x] **Feature 2: Job Details "What's Next?" Action Box & 6-Stage Pipeline**
  - Implemented canonical 6-stage SurveyBooker pipeline: `Quote` ➔ `Paid` ➔ `Accepted` ➔ `Booked` ➔ `Preparing report` ➔ `Complete`.
  - Added dynamic "What's Next?" guidance box with contextual actions for each stage (Confirm/Adjust quote, Confirm inspection, Reschedule, Choose PDF file and Upload Report).

- [x] **Feature 3: Notes & Calls Split Buttons (`Save as note` vs `Save as call`)**
  - Updated `Notes and calls` tab in `JobDetailsPage.jsx`:
    - Direction toggle: Inbound vs Outbound call.
    - Two distinct buttons: `Save as note` (internal staff note) and `Save as call` (auto-timestamped call log that updates both job notes and `clientProfiles.js`).

- [x] **Feature 4: Customer Quote Email Preview (Video 2 Template)**
  - Enhanced `SendQuoteModal.jsx` with full customer email preview:
    - e.surv / NJS Property Group header with Trustpilot 5-Star banner.
    - Dual pricing display (Survey alone vs Survey + Valuation).
    - 8-point inspection inclusions checklist.
    - Direct phone booking hotline and verified buyer testimonial.

- [x] **Feature 5: Visual Calendar & Daily To-Do Tasks View**
  - Updated `BookingCalendar.jsx`:
    - Month calendar now displays colored dots (Blue = Inspection, Purple = Report due).
    - Selecting any date renders the Day's To-Do list with time-slot cards.
    - Quick `+` modal to add new tasks for the selected date.

- [x] **Feature 6: 6-Stage Customer Email Automation & Real-Time Triggers**
  - Added `emailAutomations.js` mock store managing the 6 SurveyBooker stages:
    - *Stage 1 (Quote):* Quotation Proposal & Inclusions Scope
    - *Stage 2 (Paid):* Payment Receipt & Welcome Pack
    - *Stage 3 (Accepted):* Terms of Engagement Signed Confirmation
    - *Stage 4 (Booked):* Site Inspection Confirmed & Access Logistics
    - *Stage 5 (Preparing report):* Inspection Completed & Report in Progress
    - *Stage 6 (Complete):* Final RICS Survey Report Ready for Download
  - Added Central Governance Control in `AdminSettingsPage.jsx` (`Email Automations & Workflows` tab) with Active/Paused toggles, template editor, variable tags (`{{property_address}}`, `{{customer_name}}`, `{{job_no}}`), and live email preview modal (`EmailTemplatePreviewModal.jsx`).
  - Added Real-Time Auto-Dispatch in `JobDetailsPage.jsx`:
    - Stepper advancement automatically formats and dispatches the corresponding milestone email to customer.
    - Real-time live status indicator below pipeline stepper.
    - Upgraded `Emails` tab with rich transactional ledger, "View Sent Email" modal, and "Resend Current Milestone Email" action.
  - Added Customer Portal Inbox Card in `CustomerDashboardPage.jsx` for viewing all official correspondence and notices.


---

## 5. Direct Client Written Communications (Verbatim / Unedited)

### Client Message 1 (Roadmap Review & Clarifications)
> Hi,
>
> Thank you for preparing the development roadmap. I appreciate the detailed explanation and the clarification about which parts of the platform are currently demonstration features.
>
> I’m happy with the overall direction, and I want to continue developing the platform into a fully operational system for NJS Property Group.
>
> However, before we proceed further, I want to clarify a few important points.
>
> 1. Client messaging system — please keep this feature
>
> I noticed the document says the real-time messaging system has been removed and email will be used instead.
>
> I don’t want to lose the client messaging functionality.
>
> I specifically want:
>
> * A Messages section in the client portal.
> * Customers to be able to send messages to the NJS admin team.
> * An inbox in the admin dashboard where we can read and reply.
> * All conversations saved against the relevant client and survey job.
> * Automatic notifications sent to our business Gmail account whenever a customer messages us.
> * Email notifications to customers when we respond.
> * Unread-message notifications and conversation history.
>
> Resend can be used for automatic email notifications if appropriate, but I still want the actual messaging system within the client and admin portals.
>
> Direct two-way Gmail reply synchronisation can be quoted separately if it involves significant additional work.
>
> Please confirm how this will be achieved.
>
> 2. Terms of Engagement
>
> Please confirm that the public Terms of Engagement button/link will be removed from the website.
>
> Terms should only become available privately when a customer has started a booking or an instruction has been created for them, including bookings arranged by phone or email.
>
> Clients must be able to review and sign their relevant terms securely before becoming contractually committed.
>
> The public Privacy Policy should remain available.
>
> 3. Trustpilot integration
>
> Please ensure we have:
>
> * Our genuine NJS Trustpilot link on the public website.
> * A “Leave a Review” button inside the customer portal.
> * An automatic Trustpilot review invitation after a customer’s completed survey report has been delivered.
>
> 4. Development timeline
>
> I understand that exact dates may change during development.
>
> However, I would still like an estimated timeline for each of the six phases.
>
> Please provide:
>
> * Estimated start and completion dates.
> * Expected deliverables for each phase.
> * Which tasks can be completed immediately.
> * What will be demonstrated at the end of each phase.
> * Any dependencies that could cause delays.
>
> I’m not asking for unrealistic guarantees, but I need a clear schedule so I can plan the business around it.
>
> 5. Development costs
>
> The document outlines possible third-party and hosting costs.
>
> Please also confirm:
>
> * The total development cost or an itemised estimate for the remaining work.
> * Whether the existing agreed development fee covers all six phases.
> * Which features would require additional charges.
> * Any ongoing maintenance or support costs.
> * Whether there are any other expected monthly expenses.
>
> I don’t want any additional paid services activated without my approval.
>
> 6. Existing functionality and bugs
>
> Before focusing on optional new features, I want all existing functionality completed and tested.
>
> This includes:
>
> * Secure logins and proper logout.
> * Working quotation forms.
> * Correct and consistent job information.
> * Actual downloadable reports and invoices.
> * Working digital signatures.
> * Online payments.
> * Surveyor allocation.
> * Automated notifications.
> * All broken links and navigation issues.
>
> Please demonstrate these functions rather than just confirming that the interface is complete.
>
> 7. Postcode and address lookup
>
> I’m happy to start with free postcode validation and manual address entry if necessary.
>
> However, I would like you to verify the current availability of GetAddress.io for UK address autofill and compare it with other supported providers before we choose a paid integration.
>
> 8. Website branding and ownership
>
> The platform should use NJS Property Group branding throughout.
>
> I agree that production hosting, domain registration, databases, payment accounts and business email integrations should remain under NJS Property Group’s ownership.
>
> Please also confirm that we will have access to the full source code, repository and relevant documentation.
>
> 9. Priority order
>
> I would like the work completed in this order:
>
> 1. Fix existing bugs, company details, links and security.
> 2. Complete the backend, database and client/admin portals.
> 3. Finish quotations, bookings, payments and document handling.
> 4. Complete the client messaging and Gmail notification system.
> 5. Complete surveyor operations and reporting.
> 6. Add Trustpilot automation, property intelligence and news features.
>
> The property intelligence and news features are exciting, but I want the core booking and management platform operating properly first.
>
> 10. Regular updates
>
> Can we agree on a weekly progress update showing:
>
> * Completed work.
> * Work currently in progress.
> * Outstanding issues.
> * Any decisions needed from me.
> * Upcoming deliverables.
>
> I’m keen to move forward and get this platform launched, but I want to make sure we have a clear scope, timeline and fully tested system.
>
> Please send me an updated roadmap covering these points.
>
> Thanks!

---

### Client Message 2 (Final Feedback & Live Site Review)
> Hi,
>
> Thank you for your detailed response and for confirming that all the requirements have been understood.
>
> I’m pleased with the direction we’re taking, and I’m happy for development to continue.
>
> Before I give formal approval of the updated platform, I would like to clarify a few final points.
>
> 1. Updated Website for Review
>
> I have checked https://uk-property-surveying.netlify.app/ again.
>
> The live website still appears to have some of the previous information, including:
>
> * The Trustpilot link directing visitors to e.surv instead of NJS Property Group.
> * The public Terms of Engagement link still appearing in the footer.
> * Generic UK Property Surveying branding.
> * Placeholder telephone numbers and contact details.
>
> I understand that the final branding may not have been applied yet.
>
> Please confirm whether this is the latest updated version. If the recent improvements are on a separate development or staging website, please send me the correct link.
>
> 2. Complete Portal Demonstration
>
> Before I approve the functionality, I would like to see the complete system working from beginning to end.
>
> Please demonstrate the following:
>
> * A customer requests a quotation.
> * The quotation appears in the admin dashboard.
> * The admin team approves or adjusts the quotation.
> * The customer receives the quotation and can accept it.
> * The customer receives and digitally signs the correct Terms of Engagement.
> * The customer books and pays for the survey.
> * The admin team allocates the job to a surveyor.
> * The surveyor updates the job status.
> * The survey report is uploaded and the customer can download the actual PDF.
> * The customer sends a message through their portal.
> * The admin team receives the message, including a Gmail notification, and replies.
> * The customer receives a notification of the reply.
> * Once the report has been delivered, the customer is invited to leave a Trustpilot review.
>
> I want to ensure these are genuinely functioning features connected to the database, rather than demonstration screens.
>
> 3. Client and Admin Messaging
>
> I’m happy with your proposed messaging system.
>
> Please ensure the messaging service is easy to use, works properly on mobile phones and keeps a complete record of conversations.
>
> The admin team should be able to see which customers have sent messages and which conversations require replies.
>
> Gmail notifications are essential.
>
> Direct replies from Gmail into the portal can remain an optional future feature if this would significantly increase development costs.
>
> 4. Development Timeline and Costs
>
> Please now provide an estimated development schedule, including:
>
> * The expected completion date for each development phase.
> * An estimated date when the full system will be operational.
> * The total development cost.
> * What is included in our existing agreement.
> * Whether any of the requirements will result in additional charges.
> * Expected monthly operating costs once the system goes live.
>
> I appreciate that development dates may change, but I would like a realistic timetable with clear milestones.
>
> 5. Full NJS Branding
>
> Once the current functionality and layout are agreed, please ensure the whole platform is professionally branded as NJS Property Group.
>
> This includes:
>
> * Main website.
> * Customer portal.
> * Admin dashboard.
> * Surveyor portal.
> * Quotations and invoices.
> * Survey reports and downloadable documents.
> * Automated emails and notifications.
> * Digital Terms of Engagement.
>
> Everything should feel like one professional system.
>
> 6. Website Design and User Experience
>
> I would like the finished website to look premium, modern and more impressive than a standard surveying website.
>
> It should be exceptionally easy for customers to request quotations, book surveys, make payments and access their reports.
>
> Please ensure the mobile version is as good as the desktop version.
>
> I also want all menus, dropdowns, buttons and links tested thoroughly, including the booking journey and password recovery.
>
> 7. Platform Ownership
>
> Please confirm that NJS Property Group will have ownership and appropriate administrator access to the hosting, database, source code repository, payment gateway and associated business accounts.
>
> We should also receive the relevant technical documentation and access details through a secure process.
>
> 8. Final Testing and Approval
>
> Once the updates are ready, please provide test access so that we can review the customer, admin and surveyor journeys.
>
> I would like any remaining bugs recorded and resolved before the platform goes live.
>
> Please don’t activate additional paid services without checking with me first.
>
> 9. Future Features
>
> I am still keen to add the property intelligence section and live UK property information once the core system is ready.
>
> This could include recent sold prices, local market trends, property news and useful information for buyers.
>
> I want the platform to offer something genuinely different from other surveying websites, but agree that the main booking and client management system must come first.
>
> Overall, I’m pleased with the progress and want to keep moving forward.
>
> Please send me the updated review link, proposed development timetable and cost breakdown so we can agree the next milestones.
>
> Kind regards,
>
> Natasha  
> NJS Property Group

---

### Client Message 3 (Security & Privacy on Booking Access Details)
> Please also see that currently the Client on the booking can see the axis details. These need to be private as that is only for the Surveyor to see the client should not be able to see how the Surveyor is accessing the property because that includes things like key numbers and codes to enter the property which the public are not allowed to know it’s only between the estate agent and the Surveyor
