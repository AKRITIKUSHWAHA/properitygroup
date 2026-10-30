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

