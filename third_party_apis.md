# Third-Party APIs — Simple Guide & Integration Roadmap

**Project:** UK Property Surveying Practice (NJS Property Group)  
**Document Purpose:** Is software ko live chalane ke liye kaun-kaun si external (third-party) APIs lagengi, unka kya kaam hai, aur unka kharcha (cost) kya hoga.  
**Language:** Simple Hinglish + English (Easy to understand for developers & clients)  

---

## 📌 Master API Summary Table

| # | API Name | Category | Primary Purpose (Kyun chahiye) | Pricing / Cost | Priority |
| :-: | :--- | :--- | :--- | :--- | :---: |
| **1** | **Stripe API** | Payment Gateway | UK Debit/Credit cards, Apple Pay aur 20% UK VAT payments lena. | Free account (1.5% + 20p per transaction) | 🔴 Must Have |
| **2** | **Resend API** *(ya SendGrid / Postmark)* | Transactional Email | 6-Stage automated client emails bhejna (deliverability 99.9% in inbox). | Free tier (3,000 emails/month free) | 🔴 Must Have |
| **3** | **Ideal Postcodes** *(ya GetAddress.io)* | UK Address Autocomplete | Postcode (`W1K 2PB`) dalte hi exact house addresses fetch karna. | Free trial, fir ~£10 for 1,000 searches | 🟡 High Priority |
| **4** | **AWS S3** *(ya Cloudinary)* | Cloud Photo Storage | Surveyor ki 50+ defect inspection photos ko cloud par securely store karna. | Free tier (5 GB free), negligible cost | 🟡 High Priority |
| **5** | **LSD Webhook Parser** | CRM Lead Aggregator | *Local Surveyors Direct (LSD)* se aane wali quote leads ko auto-import karna. | Included in LSD Partner Account | 🟢 Important |
| **6** | **Twilio API** *(Optional)* | SMS Notifications | Inspection din customer ko reminder SMS bhejna: *"Surveyor arriving at 10 AM"*. | Pay-as-you-go (~3p per SMS) | ⚪ Optional |

---

## 🔍 Detail me Samjho (Har API ka Kaam aur Flow)

---

### 1. Stripe API (Payments & UK VAT Invoicing)
* **Website:** [https://stripe.com/gb](https://stripe.com/gb)
* **Kyun Zaroori Hai:**
  - UK me property buyers online payment card ya Apple Pay se karte hain.
  - Stripe HMRC-compliant UK 20% VAT receipt aur payout client ke UK bank account me bhejta hai.
* **Kaise Kaam Karega:**
  1. Customer portal me quote accept karke "Pay Online" dabata hai.
  2. Stripe Checkout modal open hota hai.
  3. Payment successful hote hi Stripe ka **Webhook** backend ko signal bhejta hai: `payment_intent.succeeded`.
  4. System turant job status ko `Quote` se badal kar **`Paid`** kar deta hai.

---

### 2. Resend API (Transactional Email Automation)
* **Website:** [https://resend.com/](https://resend.com/) *(Alternative: SendGrid ya Postmark)*
* **Kyun Zaroori Hai:**
  - Aam Gmail SMTP se zyada mail bhejne par emails Spam folder me chali jati hain. Resend se har email customer ke **Primary Inbox** me 1-2 second me deliver hoti hai.
* **Kaise Kaam Karega:**
  - Har milestone par automatically email dispatch karta hai:
    - *Milestone 1:* Quote Proposal & Inclusions Scope
    - *Milestone 2:* Payment Receipt & VAT Invoice
    - *Milestone 3:* Terms of Engagement Signed Confirmation
    - *Milestone 4:* Site Inspection Confirmed & Access Logistics
    - *Milestone 5:* Inspection Completed Notice
    - *Milestone 6:* Final RICS Report Ready for Download
* **Developer Integration (Only 4 Lines of Code):**
  ```javascript
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'UK Property Surveying <admin@njspropertygroup.com>',
    to: customerEmail,
    subject: 'Your RICS Survey Report is Ready',
    html: emailHtmlTemplate,
  });
  ```

---

### 3. Ideal Postcodes / GetAddress.io (UK Postcode Address Lookup)
* **Website:** [https://ideal-postcodes.co.uk/](https://ideal-postcodes.co.uk/) ya [https://getaddress.io/](https://getaddress.io/)
* **Kyun Zaroori Hai:**
  - UK me **koi bhi customer ya surveyor poora address typing nahi karta**.
  - Customer website par sirf postcode daalta hai (jaise: `W1K 2PB`).
  - Ye API UK Royal Mail PAF (Postcode Address File) database se us postcode ke sabhi gharon ke number aur street names return karti hai.
* **User Experience:**
  - Customer dropdown se apna flat/house number select karta hai ➔ instant quote price calculate ho jati hai!

---

### 4. AWS S3 ya Cloudinary (Cloud Photo Storage)
* **Website:** [https://aws.amazon.com/s3/](https://aws.amazon.com/s3/) ya [https://cloudinary.com/](https://cloudinary.com/)
* **Kyun Zaroori Hai:**
  - Ek Level 3 Building survey me **50 se 100 photos** hoti hain (Damp readings, roof cracks, timber defect, loft, boiler).
  - Agar in photos ko regular database me rakhenge to database slow ho jayegi.
  - AWS S3 par photos upload hoti hain aur unka fast CDN link report me embed ho jata hai.

---

### 5. Local Surveyors Direct (LSD) Inbound Webhook / Email Parser
* **Website:** [https://www.localsurveyorsdirect.co.uk/](https://www.localsurveyorsdirect.co.uk/)
* **Kyun Zaroori Hai:**
  - Client ne Audio 1 me clearly bola tha: *"jab LSD ki leads aati hain to wo quotes me aani chahiye"*.
  - LSD jab bhi naye customer ki lead bhejta hai, to unka webhook hamare server par aata hai.
  - System automatically client ka naam, phone number, property postcode aur required survey discipline extract karke CRM Leads me `New` status ke sath add kar deta hai.

---

### 6. Twilio API (SMS Alerts - Optional)
* **Website:** [https://www.twilio.com/](https://www.twilio.com/)
* **Kyun Zaroori Hai:**
  - Email ke alawa, inspection ke din customer ko mobile par instant SMS bhejne ke liye:
    > *"Hello Emma, your chartered surveyor David Thorne MRICS is arriving at 14 Mayfair Gate today between 10:00 - 10:30 AM."*
  - Isse no-show aur missed access ki samasya khatam ho jati hai.

---

## 🚀 Implementation Priority Phases (Kaise Start Karein)

```
[Phase 1: Launch MVP] ──────► 1. Stripe (Payments) + 2. Resend (Emails)
           │
[Phase 2: UX Automation] ───► 3. Ideal Postcodes (Address) + 4. AWS S3 (Photos)
           │
[Phase 3: Scale & Growth] ──► 5. LSD Webhook (Leads) + 6. Twilio (SMS)
```

1. **Phase 1 (Essential for Launch):**
   - **Stripe** + **Resend** laga kar real payments aur automatic emails start ho jayengi.
2. **Phase 2 (Standard UK Practice):**
   - **Postcode Lookup** + **AWS S3** laga kar UK standard address autocomplete aur heavy report photos smoothly chalengi.
3. **Phase 3 (Full Automation):**
   - **LSD Webhook** se external leads bina haath lagaye auto-import hongi.
