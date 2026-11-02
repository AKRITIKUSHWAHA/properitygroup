import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer Menu 3: My Bookings (/customer/my-bookings)
 */
export const getCustomerBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const bookings = await prisma.job.findMany({
      where: {
        OR: [{ clientId: userId }, { clientEmail: userEmail }],
        stage: { in: ['BOOKED', 'PREPARING_REPORT', 'COMPLETE'] },
      },
      include: {
        surveyor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            surveyorProfile: true,
          },
        },
        invoices: true,
        terms: true,
      },
      orderBy: { inspectionDate: 'asc' },
    });

    return ApiResponse.success(res, { bookings, total: bookings.length });
  } catch (error) {
    next(error);
  }
};
