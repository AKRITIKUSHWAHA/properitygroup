# Client Requirements & Media Archive

**Project:** UK Property Surveying Practice  
**Client:** NJS Property Group  
**Benchmark Reference:** [e.surv Chartered Surveyors](https://www.esurv.co.uk/) & [SurveyBooker CRM](https://www.surveybooker.com/)  
**Date Received:** October 2026  

---

## 📁 Folder Structure

This folder contains **only the client's original WhatsApp voice notes and screen recording videos**:

```
client_requirements/
│
├── 🎙️ audio/                      # Client's original WhatsApp voice notes (.ogg)
│   ├── WhatsApp Audio 2026-10-28 at 12.35.04.ogg
│   ├── WhatsApp Audio 2026-10-28 at 12.44.51.ogg
│   ├── WhatsApp Audio 2026-10-28 at 12.47.33.ogg
│   ├── WhatsApp Audio 2026-10-28 at 12.58.36 (1).ogg
│   ├── WhatsApp Audio 2026-10-28 at 12.58.36.ogg
│   └── WhatsApp Audio 2026-10-28 at 12.58.37.ogg
│
├── 🎥 videos/                     # Client's original WhatsApp screen recording videos (.mp4)
│   ├── WhatsApp Video 2026-10-28 at 12.44.50.mp4  (SurveyBooker live action buckets & workflow tour)
│   └── WhatsApp Video 2026-10-28 at 12.58.37.mp4  (Client Quote proposal email template reference)
│
└── 📄 README.md                   # Requirement breakdown and audio transcripts index
```

---

## 🎙️ 1. Client Audio Notes (Transcripts & Requirements)

### Audio 1: `WhatsApp Audio 2026-10-28 at 12.35.04.ogg` (Duration: 01:09)
* **Client's Actual Words:**
  > *"Those who log in as admin, the client's profile doesn't have notes like they called at this time, they made this complaint, they said this. It should have a separate log of complaints... And when the leads of CRM come, for example, integrations, local survey directs, when they come through email, they come in quotes first. When we give a quote, it says quoted, it means we have given a quote, the lead has now made a deal with it."*
* **Core Requirements:**
  1. Call Notes vs General Notes in Client Profile (`Save as note` vs `Save as call`).
  2. Dedicated **Complaints Register** (`Open`, `Under Investigation`, `Resolved`) with severity and audit history.
  3. CRM Leads integration with **Local Surveyors Direct (LSD)** source filter and 1-click **"Mark Quoted"** action.

---

### Audio 2: `WhatsApp Audio 2026-10-28 at 12.44.51.ogg` (Duration: 01:00)
* **Client's Actual Words:**
  > *"First of all, take a look at the survey booker, which I will send you on the computer in a while. It is very simple... And you don't need an agent's login. Like when we log in on our link, we don't need an agent's login. It should be like a customer first, then server [surveyor], then admin. Like only the customer link should be on the front. Because there is more chance of getting hacked. It should be in their backlog / back-office."*
* **Core Requirements:**
  1. Complete removal of the "Agent" login role across the entire software.
  2. The public website header shows only **Customer / Client Login** (`/login`).
  3. Staff/Surveyor entrances moved to isolated route endpoints (`/login/admin` and `/login/surveyor`).
  4. Implementation of SurveyBooker's 6-stage lifecycle: `Quote` ➔ `Paid` ➔ `Accepted` ➔ `Booked` ➔ `Preparing report` ➔ `Complete`.

---

### Audio 3: `WhatsApp Audio 2026-10-28 at 12.47.33.ogg` (Duration: 00:31)
* **Client's Actual Words:**
  > *"The whole website itself is not good. It is very old, dated, text is very simple, etc. There is no image. And when you create a system, along with that, the website should also be updated a little, right? This is an example, esurv.co.uk. This is how the website should be made. Now look at mine, how is it? You can compare and see what changes have to be made."*
* **Core Requirements:**
  1. Modernize public website benchmarked to **`esurv.co.uk`**.
  2. 60-Second Instant Postcode Quote Estimator on the homepage hero.
  3. Official RICS Traffic-Light Condition Ratings (Condition 1 Green, Condition 2 Amber, Condition 3 Red).
  4. Interactive "Which Survey Do I Need?" decision helper.
  5. Trustpilot 4.8★ reviews and sample RICS report specimen modal.

---

### Audio 4, 5 & 6: `WhatsApp Audio 2026-10-28 at 12.58.36 - 12.58.37`
* **Client's Actual Words:**
  > Clarifications regarding automated transactional email notices across the 6 milestones, and layout of quotation emails sent to clients.
* **Core Requirements:**
  1. Real-time automated email triggers linked to the 6 workflow stages.
  2. Professional quotation proposal layout with 8-point RICS inspection scope and Trustpilot social proof.

---

## 🎥 2. Client Video Screen Recordings

1. **`WhatsApp Video 2026-10-28 at 12.44.50.mp4`** (12.1 MB):
   * Client demonstrating the **SurveyBooker** dashboard workflow action buckets:
     * *Quotes to submit*
     * *Terms to send*
     * *Jobs to book*
     * *Appointments*
     * *Reports to upload*
     * *Calendar and tasks*
2. **`WhatsApp Video 2026-10-28 at 12.58.37.mp4`** (2.5 MB):
   * Client demonstrating the proposal email format, dual pricing options (Survey alone vs Survey + Valuation), and booking hotline details.

---

## 🔗 Related Documentation

* **[`../client.md`](../client.md):** Full client requirement specification and implementation checklist.
* **[`../workflow.md`](../workflow.md):** Architectural workflow guide, 3 user roles, and developer reference.



---

## 3. Direct Client Written Communications (Verbatim / Unedited)

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
