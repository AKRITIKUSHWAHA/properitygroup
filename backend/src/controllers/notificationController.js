import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Seed initial role-based notifications if none exist for this role/user
 */
async function seedDefaultNotificationsForRole(user) {
  if (!prisma?.notification) return;
  const existingCount = await prisma.notification.count({
    where: {
      OR: [
        { userId: user.id },
        { role: user.role, userId: null },
      ],
    },
  });

  if (existingCount > 0) return;

  const now = new Date();
  const formatTime = (minutesAgo) => {
    const d = new Date(now.getTime() - minutesAgo * 60 * 1000);
    return `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  };

  let defaults = [];

  if (user.role === 'ADMIN') {
    defaults = [
      {
        role: 'ADMIN',
        title: 'RICS Level 2 Survey Booked',
        desc: 'Property inspection scheduled for 18 Highfield Ave, Surrey GU2 7YZ',
        type: 'booking',
        amount: '£650.00',
        read: false,
      },
      {
        role: 'ADMIN',
        title: 'Terms & Conditions Signed',
        desc: 'Client Emma Watson digitally signed contract for quotation #KQ-9042',
        type: 'terms',
        read: false,
      },
      {
        role: 'ADMIN',
        title: 'Payment Received',
        desc: 'Full advance payment received for Building Survey (Commercial, Mayfair)',
        type: 'payment',
        amount: '£1,450.00',
        read: true,
      },
      {
        role: 'ADMIN',
        title: 'Survey Report Uploaded',
        desc: 'Assigned Chartered Surveyor uploaded preliminary defect schedule',
        type: 'report',
        read: true,
      },
    ];
  } else if (user.role === 'SURVEYOR') {
    defaults = [
      {
        userId: user.id,
        role: 'SURVEYOR',
        title: 'New Survey Inspection Assigned',
        desc: 'Building Survey Level 3 allocated at 18 Highfield Ave, Surrey GU2 7YZ. Please review instruction notes.',
        type: 'booking',
        read: false,
      },
      {
        userId: user.id,
        role: 'SURVEYOR',
        title: 'Keyholder Access Logistics',
        desc: 'Access confirmed: Keys with Foxtons Mayfair Branch (Ref #FX-402). Concierge code available in job file.',
        type: 'booking',
        read: false,
      },
      {
        userId: user.id,
        role: 'SURVEYOR',
        title: 'Physical Survey Schedule Confirmed',
        desc: 'On-site property inspection confirmed with vendor for tomorrow 10:00 AM.',
        type: 'booking',
        read: true,
      },
      {
        userId: user.id,
        role: 'SURVEYOR',
        title: 'Defect Schedule Ready for Drafting',
        desc: 'Preliminary photos synced. Please complete the RICS standard report draft within 48 business hours.',
        type: 'report',
        read: true,
      },
    ];
  } else {
    // CUSTOMER
    defaults = [
      {
        userId: user.id,
        role: 'CUSTOMER',
        title: 'Formal Survey Quotation Ready',
        desc: 'Your tailored fixed-fee RICS quotation #KQ-9042 is available to review and accept online.',
        type: 'booking',
        amount: '£650.00',
        read: false,
      },
      {
        userId: user.id,
        role: 'CUSTOMER',
        title: 'Chartered Surveyor Allocated',
        desc: 'An accredited RICS Chartered Surveyor has been assigned as your lead independent surveyor.',
        type: 'terms',
        read: false,
      },
      {
        userId: user.id,
        role: 'CUSTOMER',
        title: 'Payment Receipt & VAT Invoice',
        desc: 'Advance payment confirmed. HMRC-compliant VAT invoice #INV-2026-891 is ready in your portal.',
        type: 'payment',
        amount: '£650.00',
        read: true,
      },
      {
        userId: user.id,
        role: 'CUSTOMER',
        title: 'Terms of Engagement Signed',
        desc: 'Electronic contract confirmed and countersigned. Your property inspection is secured.',
        type: 'report',
        read: true,
      },
    ];
  }

  for (const item of defaults) {
    await prisma.notification.create({
      data: item,
    });
  }
}

/**
 * GET /api/v1/notifications
 * Fetch notifications filtered strictly for the authenticated user's role & ID
 */
export const getNotifications = async (req, res, next) => {
  try {
    const user = req.user;

    if (!prisma?.notification) {
      return ApiResponse.success(res, {
        notifications: [],
        unreadCount: 0,
        total: 0,
      });
    }

    // Fetch clean real notifications without injecting artificial demo data
    // await seedDefaultNotificationsForRole(user);

    const userEmail = (user.email || '').trim().toLowerCase();
    let userIds = [user.id];
    if (userEmail) {
      try {
        const matchingUsers = await prisma.user.findMany({
          where: { email: userEmail },
          select: { id: true },
        });
        userIds = Array.from(new Set([user.id, ...matchingUsers.map((u) => u.id)].filter(Boolean)));
      } catch {}
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: { in: userIds } },
          { role: user.role, userId: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    const isSurveyor = (user.role || '').toLowerCase() === 'surveyor';
    const isAdmin = (user.role || '').toUpperCase() === 'ADMIN' || (user.role || '').toUpperCase() === 'SUPER_ADMIN';
    const isCustomer = !isAdmin && !isSurveyor;

    let formatted = notifications.map((n) => {
      const d = new Date(n.createdAt);
      const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
      return {
        id: n.id,
        title: n.title,
        desc: n.desc,
        time: timeStr,
        createdAt: n.createdAt,
        read: n.read,
        type: n.type,
        amount: isSurveyor ? null : n.amount,
        link: n.link,
      };
    });

    // 2. Real-time Dynamic Action Aggregation from Database across the whole lifecycle
    try {
      const dynamicNotifs = [];

      // A. Leads / Enquiries
      if (isAdmin) {
        const recentLeads = await prisma.lead.findMany({
          orderBy: { createdAt: 'desc' },
          take: 15,
        });
        for (const l of recentLeads) {
          const d = new Date(l.createdAt);
          const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
          dynamicNotifs.push({
            id: `live-lead-${l.id}`,
            title: `📋 New Enquiry — ${l.clientName}`,
            desc: `Enquiry for ${l.serviceType} at ${l.propertyAddress}. Ref: ${l.reference}`,
            time: timeStr,
            createdAt: l.createdAt,
            read: false,
            type: 'enquiry',
            link: '/admin/crm-and-leads',
          });
        }
      } else if (isCustomer && userEmail) {
        const clientLeads = await prisma.lead.findMany({
          where: { clientEmail: { equals: userEmail, mode: 'insensitive' } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });
        for (const l of clientLeads) {
          const d = new Date(l.createdAt);
          const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
          dynamicNotifs.push({
            id: `live-lead-${l.id}`,
            title: `📋 Survey Enquiry Registered (${l.reference})`,
            desc: `Your enquiry for ${l.serviceType} at ${l.propertyAddress} has been received. Quote estimation pending.`,
            time: timeStr,
            createdAt: l.createdAt,
            read: false,
            type: 'enquiry',
            link: '/customer/my-quotations',
          });
        }
      }

      // B. Quotations
      if (isAdmin) {
        const recentQuotes = await prisma.quote.findMany({
          include: { job: true, lead: true },
          orderBy: { updatedAt: 'desc' },
          take: 15,
        });
        for (const q of recentQuotes) {
          const clientName = q.job?.clientName || q.lead?.clientName || 'Customer';
          const address = q.job?.propertyAddress || q.lead?.propertyAddress || 'Property';
          const isAccepted = q.status === 'ACCEPTED' || !!q.acceptedAt;
          const timestamp = q.acceptedAt || q.updatedAt || q.createdAt;
          const d = new Date(timestamp);
          const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

          if (isAccepted) {
            dynamicNotifs.push({
              id: `live-quote-acc-${q.id}`,
              title: `✅ Quote Accepted — ${clientName}`,
              desc: `Customer accepted quote ${q.reference} (£${q.totalAmount}) for ${address}. Ready for Terms.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'quote',
              amount: `£${q.totalAmount}`,
              link: '/admin/quotes',
            });
          } else {
            dynamicNotifs.push({
              id: `live-quote-${q.id}`,
              title: `🏷️ Quote Issued — ${q.reference}`,
              desc: `Formal quote of £${q.totalAmount} dispatched to ${clientName} for ${address}.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'quote',
              amount: `£${q.totalAmount}`,
              link: '/admin/quotes',
            });
          }
        }
      } else if (isCustomer && userEmail) {
        const clientQuotes = await prisma.quote.findMany({
          where: {
            OR: [
              { job: { clientEmail: { equals: userEmail, mode: 'insensitive' } } },
              { lead: { clientEmail: { equals: userEmail, mode: 'insensitive' } } },
            ],
          },
          include: { job: true, lead: true },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        });
        for (const q of clientQuotes) {
          const address = q.job?.propertyAddress || q.lead?.propertyAddress || 'Property';
          const isAccepted = q.status === 'ACCEPTED' || !!q.acceptedAt;
          const timestamp = q.acceptedAt || q.updatedAt || q.createdAt;
          const d = new Date(timestamp);
          const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

          if (isAccepted) {
            dynamicNotifs.push({
              id: `live-quote-acc-${q.id}`,
              title: `✅ Quotation Accepted (${q.reference})`,
              desc: `You accepted the quotation for ${address}. RICS Terms are being generated.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'quote',
              amount: `£${q.totalAmount}`,
              link: '/customer/terms-to-sign',
            });
          } else {
            dynamicNotifs.push({
              id: `live-quote-${q.id}`,
              title: `🏷️ Official RICS Quotation Ready`,
              desc: `Your tailored quotation of £${q.totalAmount} for ${address} (${q.reference}) is ready to review.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'quote',
              amount: `£${q.totalAmount}`,
              link: '/customer/my-quotations',
            });
          }
        }
      }

      // C. Terms of Engagement (Admin & Customer only - Privacy Shield for Surveyors)
      if (isAdmin) {
        const recentTerms = await prisma.term.findMany({
          include: { job: true },
          orderBy: { updatedAt: 'desc' },
          take: 15,
        });
        for (const t of recentTerms) {
          const address = t.job?.propertyAddress || 'Subject Property';
          const timestamp = t.signedAt || t.updatedAt || t.createdAt;
          const d = new Date(timestamp);
          const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

          if (t.signed) {
            dynamicNotifs.push({
              id: `live-term-signed-${t.id}`,
              title: `✍️ Terms Signed by ${t.clientName}`,
              desc: `Client signed RICS Terms of Engagement for ${address} (Ref: ${t.reference}).`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'terms',
              link: '/admin/terms',
            });
          } else {
            dynamicNotifs.push({
              id: `live-term-${t.id}`,
              title: `📝 Terms Dispatched — ${t.reference}`,
              desc: `Terms sent to ${t.clientName} for ${address}. Awaiting electronic signature.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'terms',
              link: '/admin/terms',
            });
          }
        }
      } else if (isCustomer && userEmail) {
        const clientTerms = await prisma.term.findMany({
          where: {
            OR: [
              { clientEmail: { equals: userEmail, mode: 'insensitive' } },
              { job: { clientEmail: { equals: userEmail, mode: 'insensitive' } } },
            ],
          },
          include: { job: true },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        });
        for (const t of clientTerms) {
          const address = t.job?.propertyAddress || 'Subject Property';
          const timestamp = t.signedAt || t.updatedAt || t.createdAt;
          const d = new Date(timestamp);
          const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

          if (t.signed) {
            dynamicNotifs.push({
              id: `live-term-signed-${t.id}`,
              title: `✍️ Contract Signed & Confirmed`,
              desc: `Your signed RICS terms for ${address} (${t.reference}) are confirmed and archived.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'terms',
              link: '/customer/terms-to-sign',
            });
          } else {
            dynamicNotifs.push({
              id: `live-term-${t.id}`,
              title: `📝 Terms of Engagement Ready to Sign`,
              desc: `Please review and digitally sign your agreement for ${address} (Ref: ${t.reference}).`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'terms',
              link: '/customer/terms-to-sign',
            });
          }
        }
      }

      // D. Invoices & Payments (Admin & Customer only - Privacy Shield for Surveyors)
      if (isAdmin) {
        const recentInvoices = await prisma.invoice.findMany({
          include: { job: true },
          orderBy: { updatedAt: 'desc' },
          take: 15,
        });
        for (const inv of recentInvoices) {
          const address = inv.job?.propertyAddress || 'Subject Property';
          const timestamp = inv.paidAt || inv.updatedAt || inv.createdAt;
          const d = new Date(timestamp);
          const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

          if (inv.status === 'PAID') {
            dynamicNotifs.push({
              id: `live-inv-paid-${inv.id}`,
              title: `💳 Payment Received — ${inv.clientName}`,
              desc: `Payment of £${inv.total} confirmed for ${address} (Invoice #${inv.invoiceNumber}).`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'payment',
              amount: `£${inv.total}`,
              link: '/admin/quotes-and-payments',
            });
          }
        }
      } else if (isCustomer && userEmail) {
        const clientInvoices = await prisma.invoice.findMany({
          where: {
            OR: [
              { clientEmail: { equals: userEmail, mode: 'insensitive' } },
              { job: { clientEmail: { equals: userEmail, mode: 'insensitive' } } },
            ],
          },
          include: { job: true },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        });
        for (const inv of clientInvoices) {
          const address = inv.job?.propertyAddress || 'Subject Property';
          const timestamp = inv.paidAt || inv.updatedAt || inv.createdAt;
          const d = new Date(timestamp);
          const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

          if (inv.status === 'PAID') {
            dynamicNotifs.push({
              id: `live-inv-paid-${inv.id}`,
              title: `💳 Payment Receipt & Confirmation`,
              desc: `Your payment of £${inv.total} for ${address} is confirmed. VAT Receipt #${inv.invoiceNumber} ready.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'payment',
              amount: `£${inv.total}`,
              link: '/customer/invoices-and-payments',
            });
          } else {
            dynamicNotifs.push({
              id: `live-inv-${inv.id}`,
              title: `🧾 Invoice Ready for Payment`,
              desc: `Advance invoice of £${inv.total} for ${address} (#${inv.invoiceNumber}) is pending settlement.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'payment',
              amount: `£${inv.total}`,
              link: '/customer/invoices-and-payments',
            });
          }
        }
      }

      // E. Jobs & Inspections (Allocations, Calendar Bookings, Reports)
      if (isAdmin) {
        const recentJobs = await prisma.job.findMany({
          include: { surveyor: true },
          orderBy: { updatedAt: 'desc' },
          take: 15,
        });
        for (const j of recentJobs) {
          const timestamp = j.qaApprovedAt || j.reportGeneratedAt || j.updatedAt || j.createdAt;
          const d = new Date(timestamp);
          const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

          if (j.qaApprovedAt || j.stage === 'COMPLETED') {
            dynamicNotifs.push({
              id: `live-job-qa-${j.id}`,
              title: `✅ Report Delivered — ${j.reference}`,
              desc: `Certified survey report for ${j.propertyAddress} QA approved and delivered to ${j.clientName}.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'report',
              link: '/admin/reports',
            });
          } else if (j.reportGeneratedAt || j.reportPdfUrl) {
            dynamicNotifs.push({
              id: `live-job-draft-${j.id}`,
              title: `📄 Survey Report Submitted to QA Desk`,
              desc: `Surveyor draft uploaded for ${j.propertyAddress} (${j.reference}). Ready for QA review.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'report',
              link: '/admin/reports',
            });
          } else if (j.inspectionDate) {
            dynamicNotifs.push({
              id: `live-job-insp-${j.id}`,
              title: `📅 Inspection Booked: ${j.reference}`,
              desc: `Site inspection at ${j.propertyAddress} confirmed for ${new Date(j.inspectionDate).toLocaleDateString('en-GB')}${j.inspectionTime ? ' at ' + j.inspectionTime : ''}${j.surveyor?.name ? ' with ' + j.surveyor.name : ''}.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'booking',
              link: '/admin/jobs',
            });
          } else if (j.surveyorId) {
            dynamicNotifs.push({
              id: `live-job-surv-${j.id}`,
              title: `👨‍💼 Surveyor Allocated: ${j.reference}`,
              desc: `${j.surveyor?.name || 'Surveyor'} allocated to inspect ${j.propertyAddress} for ${j.clientName}.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'booking',
              link: '/admin/jobs',
            });
          }
        }
      } else if (isSurveyor) {
        const surveyorJobs = await prisma.job.findMany({
          where: {
            OR: [
              { surveyorId: user.id },
              { surveyor: { email: { equals: userEmail, mode: 'insensitive' } } },
            ],
          },
          orderBy: { updatedAt: 'desc' },
          take: 15,
        });
        for (const j of surveyorJobs) {
          const timestamp = j.qaApprovedAt || j.reportGeneratedAt || j.updatedAt || j.createdAt;
          const d = new Date(timestamp);
          const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

          if (j.qaApprovedAt || j.stage === 'COMPLETED') {
            dynamicNotifs.push({
              id: `live-job-qa-${j.id}`,
              title: `✅ Report QA Approved & Dispatched`,
              desc: `Your survey report for ${j.propertyAddress} (${j.reference}) has passed QA audit and was delivered to client.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'report',
              link: '/surveyor/reports',
            });
          } else if (j.reportGeneratedAt || j.reportPdfUrl) {
            dynamicNotifs.push({
              id: `live-job-draft-${j.id}`,
              title: `📄 Report Draft in Peer Review`,
              desc: `Report draft for ${j.propertyAddress} (${j.reference}) submitted to QA desk.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'report',
              link: '/surveyor/reports',
            });
          } else if (j.inspectionDate) {
            dynamicNotifs.push({
              id: `live-job-insp-${j.id}`,
              title: `📅 Physical Survey Confirmed`,
              desc: `On-site inspection confirmed at ${j.propertyAddress} on ${new Date(j.inspectionDate).toLocaleDateString('en-GB')}${j.inspectionTime ? ' at ' + j.inspectionTime : ''}.${j.keyCollectionDetails ? ' Access: ' + j.keyCollectionDetails : ''}`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'booking',
              link: '/surveyor/calendar',
            });
          } else {
            dynamicNotifs.push({
              id: `live-job-alloc-${j.id}`,
              title: `🎯 New Survey Instruction Assigned`,
              desc: `You have been allocated ${j.serviceType} at ${j.propertyAddress} (Ref: ${j.reference}). Review file & access notes.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'booking',
              link: '/surveyor/dashboard',
            });
          }
        }
      } else if (isCustomer && userEmail) {
        const clientJobs = await prisma.job.findMany({
          where: {
            OR: [
              { clientId: user.id },
              { clientEmail: { equals: userEmail, mode: 'insensitive' } },
            ],
          },
          include: { surveyor: true },
          orderBy: { updatedAt: 'desc' },
          take: 15,
        });
        for (const j of clientJobs) {
          const timestamp = j.qaApprovedAt || j.updatedAt || j.createdAt;
          const d = new Date(timestamp);
          const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

          if (j.qaApprovedAt || j.stage === 'COMPLETED') {
            dynamicNotifs.push({
              id: `live-job-qa-${j.id}`,
              title: `🎉 Your RICS Survey Report is Ready!`,
              desc: `Your official certified survey report for ${j.propertyAddress} is published and ready to download.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'report',
              link: '/customer/my-reports',
            });
          } else if (j.inspectionDate) {
            dynamicNotifs.push({
              id: `live-job-insp-${j.id}`,
              title: `📅 Survey Appointment Booked`,
              desc: `Physical inspection of ${j.propertyAddress} scheduled for ${new Date(j.inspectionDate).toLocaleDateString('en-GB')}${j.inspectionTime ? ' at ' + j.inspectionTime : ''}.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'booking',
              link: '/customer/appointment-details',
            });
          } else if (j.surveyorId) {
            dynamicNotifs.push({
              id: `live-job-surv-${j.id}`,
              title: `👨‍💼 Chartered Surveyor Allocated`,
              desc: `An accredited RICS surveyor has been assigned to your survey at ${j.propertyAddress}.`,
              time: timeStr,
              createdAt: timestamp,
              read: false,
              type: 'booking',
              link: '/customer/assigned-surveyor',
            });
          }
        }
      }

      // Merge dynamic action notifications with de-duplication
      const existingKeys = new Set(
        formatted.map((f) => `${(f.title || '').trim().toLowerCase()}||${(f.desc || '').slice(0, 35).trim().toLowerCase()}`)
      );
      for (const dn of dynamicNotifs) {
        const key = `${(dn.title || '').trim().toLowerCase()}||${(dn.desc || '').slice(0, 35).trim().toLowerCase()}`;
        if (!existingKeys.has(key)) {
          existingKeys.add(key);
          formatted.push(dn);
        }
      }
    } catch (dynErr) {
      console.warn('Dynamic action notifications aggregation note:', dynErr.message);
    }

    // Privacy Shield for Surveyors: Block payments and terms signature notices
    if (isSurveyor) {
      formatted = formatted.filter((n) => {
        if (n.type === 'payment') return false;
        const title = (n.title || '').toLowerCase();
        const desc = (n.desc || '').toLowerCase();
        if (
          title.includes('payment') ||
          desc.includes('payment') ||
          title.includes('invoice') ||
          desc.includes('invoice') ||
          title.includes('paid') ||
          title.includes('£') ||
          desc.includes('£')
        ) {
          return false;
        }
        if (
          (title.includes('terms') || title.includes('contract')) &&
          (title.includes('signed') || desc.includes('signed'))
        ) {
          return false;
        }
        return true;
      });
    }

    // Live Unread Messages from Chat Hub - Ensure incoming messages alert the bell instantly
    try {
      const userRole = (user.role || 'CUSTOMER').toUpperCase();
      let unreadMessages = [];

      if (userRole === 'CUSTOMER' || userRole === 'SURVEYOR') {
        const convConditions = userIds.map((uid) => ({ conversationId: `conv-user-${uid}` }));
        convConditions.push({ conversationId: `conv-user-${user.id}` });
        convConditions.push({ conversationId: `conv-usr_${user.id}` });
        if (userEmail) {
          convConditions.push({ conversationId: { contains: userEmail } });
        }
        unreadMessages = await prisma.message.findMany({
          where: {
            OR: convConditions,
            readByCustomer: false,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });
      } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        unreadMessages = await prisma.message.findMany({
          where: {
            readByAdmin: false,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });
      }

      const existingNotifDescs = new Set(
        formatted
          .filter((n) => n.type === 'message')
          .map((n) => (n.desc || '').trim())
      );

      for (const msg of unreadMessages) {
        const cleanContent = (msg.content || '').trim();
        const snippet = cleanContent.length > 140 ? `${cleanContent.slice(0, 140)}...` : cleanContent;
        if (!existingNotifDescs.has(cleanContent) && !existingNotifDescs.has(snippet)) {
          const d = new Date(msg.createdAt);
          const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
          const msgLink =
            userRole === 'SURVEYOR'
              ? '/surveyor/messages'
              : userRole === 'ADMIN'
              ? `/admin/messages?conversationId=${msg.conversationId}`
              : '/customer/messages';

          formatted.unshift({
            id: `msg-${msg.id}`,
            title: `💬 New Message from ${msg.senderName || 'Operations Desk'}`,
            desc: snippet || 'You have an unread message.',
            time: timeStr,
            read: false,
            type: 'message',
            link: msgLink,
          });
        }
      }
    } catch (msgErr) {
      console.warn('Unread messages query in notifications notice:', msgErr.message);
    }

    // Sort all notifications by timestamp descending so newest real action is always on top
    formatted.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    const unreadCount = formatted.filter((n) => !n.read).length;

    return ApiResponse.success(res, {
      notifications: formatted,
      unreadCount,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a specific notification as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const rawId = String(req.params.id);

    if (rawId.startsWith('msg-')) {
      const msgId = parseInt(rawId.replace('msg-', ''), 10);
      if (!isNaN(msgId)) {
        await prisma.message.updateMany({
          where: { id: msgId },
          data: {
            readByCustomer: true,
            readByAdmin: req.user.role === 'ADMIN',
          },
        });
      }
      return ApiResponse.success(res, null, 'Message notification marked as read');
    }

    const id = parseInt(req.params.id, 10);
    if (!id || isNaN(id)) {
      throw ApiError.badRequest('Invalid notification ID');
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    // Role security check
    if (notification.userId && notification.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw ApiError.forbidden('Unauthorized access to this notification');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: !notification.read },
    });

    return ApiResponse.success(res, { notification: updated }, 'Notification status updated');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/mark-all-read
 * Mark all notifications for the current user and their role as read
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const user = req.user;

    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId: user.id },
          { role: user.role, userId: null },
        ],
        read: false,
      },
      data: { read: true },
    });

    try {
      const userRole = (user.role || 'CUSTOMER').toUpperCase();
      if (userRole === 'CUSTOMER' || userRole === 'SURVEYOR') {
        const convId = `conv-user-${user.id}`;
        await prisma.message.updateMany({
          where: {
            OR: [
              { conversationId: convId },
              { conversationId: `conv-usr_${user.id}` },
            ],
            readByCustomer: false,
          },
          data: { readByCustomer: true },
        });
      } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        await prisma.message.updateMany({
          where: { readByAdmin: false },
          data: { readByAdmin: true },
        });
      }
    } catch {}

    return ApiResponse.success(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/notifications
 * Dispatch a new notification (Admin or Internal triggers)
 */
export const createNotification = async (req, res, next) => {
  try {
    const { userId, role, title, desc, type = 'booking', amount, link } = req.body;

    if (!title || !desc) {
      throw ApiError.badRequest('Title and description are required');
    }

    const notification = await prisma.notification.create({
      data: {
        userId: userId ? parseInt(userId, 10) : null,
        role: role ? String(role).toUpperCase() : null,
        title,
        desc,
        type,
        amount,
        link,
      },
    });

    return ApiResponse.created(res, { notification }, 'Notification created successfully');
  } catch (error) {
    next(error);
  }
};
