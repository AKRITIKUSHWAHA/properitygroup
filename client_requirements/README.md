# Client Requirements, Media & Feedback Archive

**Project:** UK Property Surveying Practice  
**Client:** NJS Property Group  
**Benchmark:** [e.surv Chartered Surveyors](https://www.esurv.co.uk/) & [SurveyBooker CRM](https://www.surveybooker.com/)  
**Created:** October 2026  

---

## 📁 Folder Structure

```
client_requirements/
├── audio/                      # Original WhatsApp audio voice notes (.ogg)
│   ├── WhatsApp Audio 2026-10-28 at 12.35.04.ogg
│   ├── WhatsApp Audio 2026-10-28 at 12.44.51.ogg
│   ├── WhatsApp Audio 2026-10-28 at 12.47.33.ogg
│   ├── WhatsApp Audio 2026-10-28 at 12.58.36 (1).ogg
│   ├── WhatsApp Audio 2026-10-28 at 12.58.36.ogg
│   └── WhatsApp Audio 2026-10-28 at 12.58.37.ogg
│
├── videos/                     # Original WhatsApp screen recording videos (.mp4)
│   ├── WhatsApp Video 2026-10-28 at 12.44.50.mp4  (SurveyBooker dashboard tour)
│   └── WhatsApp Video 2026-10-28 at 12.58.37.mp4  (Quote email template reference)
│
├── screenshots/                # User & client feedback screenshots (29 images)
│   └── media_*.jpg / .png      # Exact UI state captures reviewed during development
│
└── README.md                   # This master inventory and requirement index
```

---

## 🎙️ 1. Audio Notes (Transcripts & Requirements)

### Audio 1: `WhatsApp Audio 2026-10-28 at 12.35.04.ogg` (Duration: 01:09)
* **Client Request:**
  > *"Those who log in as admin, the client's profile doesn't have notes like they called at this time, they made this complaint, they said this. It should have a separate log of complaints... And when the leads of CRM come, for example, integrations, local survey directs, when they come through email, they come in quotes first. When we give a quote, it says quoted, it means we have given a quote, the lead has now made a deal with it."*
* **Implemented Solution:**
  1. Split communication buttons in Client Profile & Job Details: `Save as note` (internal note) vs `Save as call` (timestamped call history).
  2. Dedicated **Complaints Register** (`Open`, `Under Investigation`, `Resolved`) with severity and resolution audit.
  3. CRM Leads integration with **Local Surveyors Direct (LSD)** source badge and 1-click **"Mark Quoted"** action.

---

### Audio 2: `WhatsApp Audio 2026-10-28 at 12.44.51.ogg` (Duration: 01:00)
* **Client Request:**
  > *"First of all, take a look at the survey booker, which I will send you on the computer in a while. It is very simple... And you don't need an agent's login. Like when we log in on our link, we don't need an agent's login. It should be like a customer first, then server [surveyor], then admin. Like only the customer link should be on the front. Because there is more chance of getting hacked. It should be in their backlog / back-office."*
* **Implemented Solution:**
  1. Permanent removal of the "Agent" role across the entire codebase.
  2. Public frontend shows only **Customer / Client Portal** sign in (`/login`).
  3. Isolated back-office endpoints for **Admin** (`/login/admin`) and **Surveyor** (`/login/surveyor`).
  4. SurveyBooker 6-stage pipeline: `Quote` ➔ `Paid` ➔ `Accepted` ➔ `Booked` ➔ `Preparing report` ➔ `Complete`.

---

### Audio 3: `WhatsApp Audio 2026-10-28 at 12.47.33.ogg` (Duration: 00:31)
* **Client Request:**
  > *"The whole website itself is not good. It is very old, dated, text is very simple, etc. There is no image. And when you create a system, along with that, the website should also be updated a little, right? This is an example, esurv.co.uk. This is how the website should be made."*
* **Implemented Solution:**
  1. Complete website overhaul benchmarked to **`esurv.co.uk`**.
  2. 60-Second Instant Postcode Quote Estimator on the homepage hero.
  3. Official RICS Traffic-Light Condition Ratings (Condition 1 Green, Condition 2 Amber, Condition 3 Red) with real UK defect case studies.
  4. Interactive "Which Survey Do I Need?" decision tool.
  5. Trustpilot 4.8★ rating banner and sample RICS report preview.

---

### Audio 4, 5 & 6: `WhatsApp Audio 2026-10-28 at 12.58.36 - 12.58.37`
* **Client Request:**
  > Clarifications on email automation triggers, milestone dispatches, and quote email proposal design.
* **Implemented Solution:**
  1. 6-stage transactional email automation system with dynamic tags (`{{customer_name}}`, `{{property_address}}`).
  2. Quote proposal template featuring 8-point RICS inspection inclusions scope and verified buyer testimonials.

---

## 🎥 2. Video Screen Recordings

1. **`WhatsApp Video 2026-10-28 at 12.44.50.mp4`** (12.1 MB):
   * Walkthrough of the **SurveyBooker** action buckets: *Quotes to submit*, *Terms to send*, *Jobs to book*, *Appointments*, *Reports to upload*, and *Calendar & tasks*.
2. **`WhatsApp Video 2026-10-28 at 12.58.37.mp4`** (2.5 MB):
   * Walkthrough of the quotation proposal email layout sent to clients, including dual pricing and Trustpilot integration.

---

## 🖼️ 3. Client UI Review Screenshots

The `screenshots/` directory holds 29 user-uploaded review images capturing exact UI iterations:
* `media_1793179322220_*.png` to `media_1793181416333_*.png`: Initial CRM and bucket reviews.
* `media_1793270976813_*.jpg` to `media_1793279164759_*.jpg`: Leads table, LSD filters, and Quote modal adjustments.
* `media_1793335611439_*.jpg` to `media_1793340663118_*.png`: Table cleanup, 3-dot dropdown menus, KPI typography, and removal of the sidebar role switcher pill.
* `media_1793341651948_*.jpg` & `media_1793342542628_*.jpg`: Role separation for Login pages and single-line typography refinement.

---

## 🔗 Related Documentation Files

* **[`client.md`](../client.md):** Detailed technical log of client requirements, audio transcripts, and task status checklist.
* **[`workflow.md`](../workflow.md):** Complete architectural workflow, 3 user roles, 6-stage lifecycle, and developer reference.
