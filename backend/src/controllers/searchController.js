import { prisma } from '../config/db.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * GET /api/v1/search?q=...
 * Role-based global search across jobs, leads, clients, quotes, and postcodes
 */
export const globalSearch = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const user = req.user;

    if (!q || q.length < 2) {
      return ApiResponse.success(res, {
        results: { jobs: [], leads: [], clients: [], quotes: [] },
        total: 0,
        query: q,
      });
    }

    if (user.role === 'ADMIN') {
      const [jobs, leads, users, quotes] = await Promise.all([
        prisma.job.findMany({
          where: {
            OR: [
              { reference: { contains: q } },
              { propertyAddress: { contains: q } },
              { postcode: { contains: q } },
              { clientName: { contains: q } },
              { serviceType: { contains: q } },
            ],
          },
          select: {
            id: true,
            reference: true,
            propertyAddress: true,
            postcode: true,
            clientName: true,
            serviceType: true,
            stage: true,
          },
          take: 6,
        }),
        prisma.lead.findMany({
          where: {
            OR: [
              { reference: { contains: q } },
              { clientName: { contains: q } },
              { clientEmail: { contains: q } },
              { postcode: { contains: q } },
              { propertyAddress: { contains: q } },
            ],
          },
          select: {
            id: true,
            reference: true,
            clientName: true,
            clientEmail: true,
            postcode: true,
            serviceType: true,
            status: true,
          },
          take: 6,
        }),
        prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
            ],
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
          take: 6,
        }),
        prisma.quote.findMany({
          where: {
            reference: { contains: q },
          },
          select: {
            id: true,
            reference: true,
            totalAmount: true,
            status: true,
          },
          take: 6,
        }),
      ]);

      const total = jobs.length + leads.length + users.length + quotes.length;
      return ApiResponse.success(res, {
        results: { jobs, leads, clients: users, quotes },
        total,
        query: q,
      });
    } else if (user.role === 'SURVEYOR') {
      const jobs = await prisma.job.findMany({
        where: {
          surveyorId: user.id,
          OR: [
            { reference: { contains: q } },
            { propertyAddress: { contains: q } },
            { postcode: { contains: q } },
            { serviceType: { contains: q } },
          ],
        },
        select: {
          id: true,
          reference: true,
          propertyAddress: true,
          postcode: true,
          serviceType: true,
          stage: true,
        },
        take: 10,
      });

      return ApiResponse.success(res, {
        results: { jobs, leads: [], clients: [], quotes: [] },
        total: jobs.length,
        query: q,
      });
    } else {
      // CUSTOMER
      const jobs = await prisma.job.findMany({
        where: {
          clientId: user.id,
          OR: [
            { reference: { contains: q } },
            { propertyAddress: { contains: q } },
            { postcode: { contains: q } },
          ],
        },
        select: {
          id: true,
          reference: true,
          propertyAddress: true,
          postcode: true,
          serviceType: true,
          stage: true,
        },
        take: 10,
      });

      return ApiResponse.success(res, {
        results: { jobs, leads: [], clients: [], quotes: [] },
        total: jobs.length,
        query: q,
      });
    }
  } catch (error) {
    next(error);
  }
};
