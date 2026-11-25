import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { sendQuoteAcceptedEmail } from '../../services/emailService.js';

/**
 * Customer Menu 2: My Quotations (/customer/quotations)
 */
export const getCustomerQuotations = async (req, res, next) => {
  try {
    const headerEmail = (req.headers['x-user-email'] || '').toLowerCase().trim();
    const userEmail = (headerEmail || req.user?.email || '').toLowerCase().trim();
    const userId = req.user?.id;
    const headerName = (req.headers['x-user-name'] || '').toLowerCase().trim();
    const userName = (headerName || req.user?.name || '').toLowerCase().trim();

    // 1. Fetch live quotes from prisma.quote (strictly scoped by clientId or exact clientEmail)
    const quotes = await prisma.quote.findMany({
      where: {
        OR: [
          ...(userId ? [{ job: { clientId: userId } }] : []),
          ...(userEmail ? [{ job: { clientEmail: userEmail } }] : []),
          ...(userEmail ? [{ lead: { clientEmail: userEmail } }] : []),
          ...(userEmail ? [{ inclusions: { contains: `"clientEmail":"${userEmail}"` } }] : []),
        ],
      },
      include: {
        job: true,
        lead: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedQuotes = quotes.map((q) => {
      let inclusionsObj = {};
      try {
        if (q.inclusions) {
          inclusionsObj = typeof q.inclusions === 'string' ? JSON.parse(q.inclusions) : q.inclusions;
        }
      } catch {}

      const property =
        q.job?.propertyAddress ||
        q.lead?.propertyAddress ||
        inclusionsObj.property ||
        inclusionsObj.propertyAddress ||
        'Subject Property';
      const surveyType =
        q.job?.serviceType ||
        q.lead?.serviceType ||
        inclusionsObj.surveyType ||
        inclusionsObj.serviceName ||
        'RICS Level 2 Home Survey';
      const client =
        q.job?.clientName ||
        q.lead?.clientName ||
        inclusionsObj.client ||
        inclusionsObj.clientName ||
        req.user?.name ||
        'Valued Client';
      const clientEmail =
        q.job?.clientEmail ||
        q.lead?.clientEmail ||
        inclusionsObj.clientEmail ||
        userEmail;

      const rawBase = q.baseFee ? Number(q.baseFee) : null;
      const rawTotal = q.totalAmount ? Number(q.totalAmount) : null;
      const hasFee = (rawBase !== null && rawBase > 0) || (rawTotal !== null && rawTotal > 0);
      const baseFee = hasFee ? (rawBase || Math.round((rawTotal / 1.2) * 100) / 100) : null;
      const vatAmount = hasFee ? (q.vatAmount ? Number(q.vatAmount) : Math.round(((rawTotal || (baseFee * 1.2)) - baseFee) * 100) / 100) : null;
      const totalAmount = hasFee ? (rawTotal || Math.round((baseFee + vatAmount) * 100) / 100) : null;

      return {
        id: q.reference || `QUO-2026-${q.id}`,
        numericId: q.id,
        reference: q.reference,
        jobId: q.job?.reference || (q.jobId ? `JOB-${q.jobId}` : `JOB-2026-${q.id}`),
        property,
        surveyType,
        client,
        clientEmail,
        hasFee,
        baseFee,
        vatAmount,
        totalAmount,
        net: hasFee ? `£${baseFee.toFixed(2)}` : 'Pending Estimation',
        vat: hasFee ? `£${vatAmount.toFixed(2)}` : '—',
        total: hasFee ? `£${totalAmount.toFixed(2)}` : 'Pending Quotation',
        status: q.status === 'ACCEPTED' ? 'Quotation Accepted' : hasFee ? 'Open Proposal' : 'Under Review by NJS Practice',
        isAccepted: q.status === 'ACCEPTED',
        date: q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
        validUntil: q.validUntil ? `Valid until ${new Date(q.validUntil).toLocaleDateString('en-GB')}` : hasFee ? '14 Days Remaining' : 'Pending Fee Review',
        rawQuote: q,
      };
    });

    // 2. Fetch any quoted/pending leads from prisma.lead belonging to this customer
    try {
      if (userEmail) {
        const leads = await prisma.lead.findMany({
          where: {
            clientEmail: userEmail,
          },
          include: {
            quotes: true,
            jobs: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        for (const lead of leads) {
          const alreadyMapped = mappedQuotes.some(
            (mq) =>
              mq.numericId === lead.quotes?.[0]?.id ||
              mq.reference === lead.quotes?.[0]?.reference ||
              mq.jobId === lead.reference ||
              mq.id === lead.reference ||
              (lead.reference && mq.id && mq.id.includes(lead.reference))
          );
          if (alreadyMapped) continue;

          const isQuoted =
            lead.status === 'QUOTE_SENT' ||
            lead.status === 'QUOTED' ||
            lead.status === 'CONVERTED' ||
            (lead.estimatedValue && Number(lead.estimatedValue) > 0);

          if (isQuoted) {
          const rawVal = lead.estimatedValue ? Number(lead.estimatedValue) : null;
          const hasFee = rawVal !== null && rawVal > 0;
          const total = hasFee ? rawVal : null;
          const baseFee = hasFee ? Math.round((total / 1.2) * 100) / 100 : null;
          const vatAmount = hasFee ? Math.round((total - baseFee) * 100) / 100 : null;
          const isAccepted = lead.status === 'CONVERTED';

          mappedQuotes.push({
            id: lead.reference || `QUO-2026-${lead.id}`,
            numericId: lead.id,
            leadId: lead.id,
            reference: lead.reference,
            jobId: lead.reference,
            property: lead.propertyAddress || 'Subject Property',
            surveyType: lead.serviceType || 'Homebuyer Survey – Level 2',
            client: lead.clientName || userName || 'Valued Client',
            clientEmail: lead.clientEmail || userEmail,
            hasFee,
            baseFee,
            vatAmount,
            totalAmount: total,
            net: hasFee ? `£${baseFee.toFixed(2)}` : 'Pending Estimation',
            vat: hasFee ? `£${vatAmount.toFixed(2)}` : '—',
            total: hasFee ? `£${total.toFixed(2)}` : 'Pending Quotation',
            status: isAccepted ? 'Quotation Accepted' : hasFee ? 'Open Proposal' : 'Under Review by NJS Practice',
            isAccepted,
            date: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
            validUntil: hasFee ? '14 Days Remaining' : 'Pending Fee Review',
            rawLead: lead,
          });
          }
        }
      }
    } catch (lErr) {
      console.warn('[getCustomerQuotations] lead sync warning:', lErr.message);
    }

    return ApiResponse.success(res, { quotes: mappedQuotes, total: mappedQuotes.length });
  } catch (error) {
    next(error);
  }
};

export const acceptCustomerQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quoteId = parseInt(id);
    const headerEmail = (req.headers['x-user-email'] || '').toLowerCase().trim();
    const userEmail = (headerEmail || req.user?.email || '').toLowerCase().trim();
    const userId = req.user?.id;
    const headerName = req.headers['x-user-name'] || '';
    const userName = headerName || req.user?.name || '';

    let quote = null;
    let lead = null;

    try {
      if (!isNaN(quoteId) && quoteId > 0) {
        quote = await prisma.quote.findFirst({
          where: {
            OR: [
              { id: quoteId },
              { reference: String(id) },
              { reference: `QUO-${id}` },
              { reference: `QTE-${id}` },
              { leadId: quoteId },
            ],
          },
          include: { job: true, lead: true },
        });
      }
      if (!quote) {
        quote = await prisma.quote.findFirst({
          where: {
            OR: [
              { reference: String(id) },
              ...(userEmail ? [{ job: { clientEmail: userEmail } }, { lead: { clientEmail: userEmail } }] : []),
            ],
          },
          include: { job: true, lead: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {
      console.warn('[acceptCustomerQuotation] quote query error:', err.message);
    }

    // If not found in prisma.quote, check prisma.lead
    try {
      if (!quote) {
        const leadOr = [
          { reference: String(id) },
          ...(id && !isNaN(quoteId) ? [{ id: quoteId }] : []),
          ...(userEmail ? [{ clientEmail: userEmail }] : []),
        ];
        lead = await prisma.lead.findFirst({
          where: { OR: leadOr },
          include: { jobs: true, quotes: true },
          orderBy: { createdAt: 'desc' },
        });
        if (lead && lead.quotes?.length > 0) {
          quote = lead.quotes[0];
        }
      } else if (quote.lead) {
        lead = quote.lead;
      }
    } catch (lErr) {
      console.warn('[acceptCustomerQuotation] lead query error:', lErr.message);
    }

    if (quote) {
      try {
        await prisma.quote.update({
          where: { id: quote.id },
          data: {
            status: 'ACCEPTED',
            acceptedAt: new Date(),
          },
        });
      } catch (upErr) {
        console.warn('[acceptCustomerQuotation] quote update error:', upErr.message);
      }
    }

    const leadTargetId = quote?.leadId || lead?.id;
    if (leadTargetId) {
      try {
        await prisma.lead.update({
          where: { id: leadTargetId },
          data: { status: 'CONVERTED' },
        });
      } catch (lUpErr) {
        console.warn('[acceptCustomerQuotation] lead update error:', lUpErr.message);
      }
    }

    // Ensure Job record exists in prisma.job so it appears in Admin "All records" (/admin/jobs)
    let jobId = quote?.jobId || quote?.job?.id || lead?.jobs?.[0]?.id || null;
    let jobRecord = quote?.job || lead?.jobs?.[0] || null;

    const clientName = req.user?.name || quote?.job?.clientName || quote?.lead?.clientName || lead?.clientName || 'Valued Client';
    const recipientEmail = userEmail || req.user?.email || quote?.job?.clientEmail || quote?.lead?.clientEmail || lead?.clientEmail;
    const clientPhone = quote?.job?.clientPhone || quote?.lead?.clientPhone || lead?.clientPhone || '';
    const propertyAddress = quote?.job?.propertyAddress || quote?.lead?.propertyAddress || lead?.propertyAddress || 'Subject Property';
    const postcode = quote?.job?.postcode || quote?.lead?.postcode || lead?.postcode || 'GU12AA';
    const serviceType = quote?.job?.serviceType || quote?.lead?.serviceType || lead?.serviceType || 'RICS Level 2 Home Survey (Homebuyer)';
    const totalFee = Number(quote?.totalAmount || lead?.estimatedValue || 0);
    const baseFee = totalFee > 0 ? Number(quote?.baseFee || Math.round((totalFee / 1.2) * 100) / 100) : 0;
    const vatFee = totalFee > 0 ? Number(quote?.vatAmount || Math.round((totalFee - baseFee) * 100) / 100) : 0;

    if (!jobId) {
      try {
        const jobRef = lead?.reference
          ? (lead.reference.startsWith('NJS-') ? lead.reference.replace('NJS-', 'JOB-') : `JOB-${lead.reference}`)
          : `JOB-2026-${Math.floor(100 + Math.random() * 900)}`;

        jobRecord = await prisma.job.create({
          data: {
            reference: jobRef,
            clientName,
            clientEmail: recipientEmail,
            clientPhone,
            clientId: userId || null,
            propertyAddress,
            postcode,
            serviceType,
            stage: 'ACCEPTED',
            leadId: leadTargetId || null,
          },
        });
        jobId = jobRecord.id;

        if (quote && !quote.jobId) {
          await prisma.quote.update({
            where: { id: quote.id },
            data: { jobId },
          }).catch(() => {});
        }
      } catch (jCreateErr) {
        console.warn('[acceptCustomerQuotation] job create error:', jCreateErr.message);
      }
    } else {
      // Advance existing job stage to ACCEPTED
      try {
        await prisma.job.update({
          where: { id: jobId },
          data: { stage: 'ACCEPTED' },
        });
      } catch (jUpErr) {}
    }

    // Ensure Term record exists for digital signing step (/customer/terms-to-sign)
    if (jobId) {
      try {
        const existingTerm = await prisma.term.findFirst({ where: { jobId } });
        if (!existingTerm) {
          await prisma.term.create({
            data: {
              reference: `TRM-2026-${jobId}`,
              jobId,
              clientName,
              clientEmail: recipientEmail || 'client@example.com',
              documentTitle: `${serviceType} Terms of Engagement`,
              content: 'RICS Standard Terms of Engagement',
              signed: false,
            },
          });
        }
      } catch (tErr) {
        console.warn('[acceptCustomerQuotation] term create error:', tErr.message);
      }

      // Ensure Invoice record exists for payment step (/customer/invoices)
      try {
        const existingInvoice = await prisma.invoice.findFirst({ where: { jobId } });
        if (!existingInvoice) {
          await prisma.invoice.create({
            data: {
              invoiceNumber: `INV-2026-${String(jobId).padStart(3, '0')}`,
              jobId,
              clientName,
              clientEmail: recipientEmail || 'client@example.com',
              subtotal: baseFee,
              vatAmount: vatFee,
              total: totalFee,
              status: 'PENDING',
            },
          });
        }
      } catch (invErr) {
        console.warn('[acceptCustomerQuotation] invoice create error:', invErr.message);
      }
    }

    // Dispatch Quotation Acceptance Email to Customer & CC Admin
    const quoteRef = quote?.reference || (String(id).startsWith('QUO') ? String(id) : `QUO-${id}`);
    const totalAmount = totalFee > 0 ? totalFee.toString() : 'Pending Estimation';

    if (recipientEmail && recipientEmail.includes('@')) {
      sendQuoteAcceptedEmail({
        to: recipientEmail,
        clientName,
        quoteRef,
        surveyType: serviceType,
        propertyAddress,
        totalAmount,
      }).catch((e) => console.warn('[sendQuoteAcceptedEmail] background error:', e.message));
    }

    // In-App Notifications for Customer & Admin
    if (userId) {
      prisma.notification.create({
        data: {
          userId,
          role: 'CUSTOMER',
          title: `✓ Quotation Accepted (${quoteRef})`,
          desc: `You accepted your quotation for ${propertyAddress}. Please review and execute your RICS Terms of Engagement.`,
          type: 'terms',
          link: '/customer/terms-to-sign',
        },
      }).catch(() => {});
    }

    prisma.notification.create({
      data: {
        role: 'ADMIN',
        title: `✓ Quote Accepted: ${clientName}`,
        desc: `Client accepted quotation ${quoteRef} for ${propertyAddress}.`,
        type: 'terms',
        amount: `£${totalAmount}`,
        link: '/admin/quotes',
      },
    }).catch(() => {});

    return ApiResponse.success(
      res,
      { quoteId: quote?.id || quoteId || id, jobId, status: 'ACCEPTED' },
      'Quotation accepted successfully. Please proceed to payment or terms.'
    );
  } catch (error) {
    next(error);
  }
};
