# NJS Property Group — Backend API

This directory houses the backend service for the NJS Property Group platform.

## Proposed Stack Options:
- **Node.js (Express / Fastify / NestJS)** with Prisma / PostgreSQL or Mongoose / MongoDB
- **Python (FastAPI / Django)** with SQLAlchemy / PostgreSQL

## Core Backend Responsibilities:
1. **Authentication & RBAC**: JWT auth for Admin, Surveyor, Customer, Staff, Partner
2. **6-Stage State Machine**: Job lifecycle transitions (`quote` -> `paid` -> `accepted` -> `booked` -> `preparing_report` -> `complete`)
3. **Stripe Integration & Webhooks**: Automated payment verification and VAT invoice receipts
4. **Email Automation**: Transactional dispatch via Resend / SendGrid
5. **Realtime / Direct Messaging**: Isolated message threads between Admin & Customer
6. **Digital Signature Audit Trail**: Legally binding signature capture with IP, timestamp, and user agent
7. **Document & Photo Storage**: S3 / Cloudinary for surveyor inspection photos & RICS reports
