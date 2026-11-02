import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Surveyor Menu 6: My Availability (/surveyor/my-availability)
 * Workload Capacity, Postcode Coverage & Availability Toggle
 */
export const getMyAvailability = async (req, res, next) => {
  try {
    const surveyorId = req.user.id;

    const profile = await prisma.surveyorProfile.findUnique({
      where: { userId: surveyorId },
    });

    const activeLoad = await prisma.job.count({
      where: {
        surveyorId,
        stage: { in: ['BOOKED', 'PREPARING_REPORT'] },
      },
    });

    return ApiResponse.success(res, {
      profile: {
        ...profile,
        activeLoad,
        capacityRemaining: Math.max(0, (profile?.maxLoad || 8) - activeLoad),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyAvailability = async (req, res, next) => {
  try {
    const surveyorId = req.user.id;
    const { available, postcodesCovered, maxLoad } = req.body;

    const data = {};
    if (available !== undefined) data.available = Boolean(available);
    if (postcodesCovered) data.postcodesCovered = postcodesCovered;
    if (maxLoad !== undefined) data.maxLoad = parseInt(maxLoad);

    const profile = await prisma.surveyorProfile.update({
      where: { userId: surveyorId },
      data,
    });

    return ApiResponse.success(res, { profile }, 'Availability and postal coverage settings updated');
  } catch (error) {
    next(error);
  }
};

