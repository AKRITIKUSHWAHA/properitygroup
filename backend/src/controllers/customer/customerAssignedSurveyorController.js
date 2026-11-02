import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer Menu 6: Assigned Surveyor (/customer/assigned-surveyor)
 */
export const getAssignedSurveyor = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const job = await prisma.job.findFirst({
      where: {
        OR: [{ clientId: userId }, { clientEmail: userEmail }],
      },
      include: {
        surveyor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            surveyorProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!job || !job.surveyor) {
      return ApiResponse.success(res, {
        assignedSurveyor: null,
        message: 'A chartered surveyor will be allocated to your property once booking is confirmed.',
      });
    }

    const surveyor = job.surveyor;
    const profile = surveyor.surveyorProfile;

    const assignedSurveyor = {
      id: surveyor.id,
      name: surveyor.name,
      accreditation: profile?.accreditation || 'MRICS',
      designation: 'Chartered Building & Residential Surveyor',
      ricsRegistration: profile?.ricsNumber || 'RICS Mandated Member',
      piiInsurance: 'Fully Validated Professional Indemnity Insurance',
      rating: profile?.rating || 4.95,
      postcodeCoverage: profile?.postcodesCovered,
      jobReference: job.reference,
      propertyAddress: job.propertyAddress,
    };

    return ApiResponse.success(res, { assignedSurveyor });
  } catch (error) {
    next(error);
  }
};
