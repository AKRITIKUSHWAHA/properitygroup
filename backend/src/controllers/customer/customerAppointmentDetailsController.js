import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer Menu 5: Appointment Details (/customer/appointment-details)
 */
export const getAppointmentDetails = async (req, res, next) => {
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
            name: true,
            phone: true,
            email: true,
            surveyorProfile: true,
          },
        },
        company: {
          select: { name: true, branchName: true, contactPhone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!job) {
      return ApiResponse.success(res, { appointment: null });
    }

    const appointment = {
      jobReference: job.reference,
      propertyAddress: job.propertyAddress,
      postcode: job.postcode,
      serviceType: job.serviceType,
      inspectionDate: job.inspectionDate,
      inspectionTimeSlot: job.inspectionTime || '10:00 AM - 12:30 PM (Morning Window)',
      status: job.stage === 'QUOTE' ? 'Awaiting Payment & Agreement' : 'Confirmed on RICS Schedule',
      surveyor: job.surveyor ? {
        name: job.surveyor.name,
        accreditation: job.surveyor.surveyorProfile?.accreditation || 'MRICS',
        ricsNumber: job.surveyor.surveyorProfile?.ricsNumber,
      } : null,
      keyCollectionArrangement: job.company ? {
        agentName: job.company.name,
        branch: job.company.branchName,
        phone: job.company.contactPhone,
        notes: 'Keys will be collected directly by the surveyor from the estate agent.',
      } : {
        notes: 'Client / Vendor to provide access at property on inspection day.',
      },
      clientPreparationChecklist: [
        'Ensure loft hatch is accessible and clear of obstructions.',
        'Ensure boiler cupboard and consumer unit (fuse box) are unlocked.',
        'Notify estate agent or vendor of the scheduled inspection window.',
      ],
    };

    return ApiResponse.success(res, { appointment });
  } catch (error) {
    next(error);
  }
};

