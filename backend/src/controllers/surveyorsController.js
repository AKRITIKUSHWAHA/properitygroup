import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Superadmin Menu 4: Surveyors (Chartered Directory, Postcodes, Allocations)
 */
export const getSurveyors = async (req, res, next) => {
  try {
    const { accreditation, search } = req.query;

    const surveyors = await prisma.user.findMany({
      where: {
        role: 'SURVEYOR',
        ...(search
          ? {
              OR: [{ name: { contains: search } }, { email: { contains: search } }],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        surveyorProfile: true,
        assignedJobs: {
          select: {
            id: true,
            reference: true,
            propertyAddress: true,
            stage: true,
            inspectionDate: true,
            inspectionTime: true,
          },
          where: { stage: { not: 'COMPLETE' } },
        },
      },
      orderBy: { name: 'asc' },
    });

    let filtered = surveyors;
    if (accreditation) {
      filtered = surveyors.filter(
        (s) => s.surveyorProfile?.accreditation?.toLowerCase() === accreditation.toLowerCase()
      );
    }

    return ApiResponse.success(res, { surveyors: filtered, total: filtered.length });
  } catch (error) {
    next(error);
  }
};

export const getSurveyorsMetrics = async (req, res, next) => {
  try {
    const [surveyorCount, totalActiveLoad] = await Promise.all([
      prisma.user.count({ where: { role: 'SURVEYOR', status: 'ACTIVE' } }),
      prisma.surveyorProfile.aggregate({
        _sum: { activeLoad: true },
      }),
    ]);

    return ApiResponse.success(res, {
      accreditedPanel: surveyorCount,
      activeMonthlyLoad: totalActiveLoad._sum.activeLoad || 0,
      piiCompliance: '100% Validated',
    });
  } catch (error) {
    next(error);
  }
};

export const onboardSurveyor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password = 'password123',
      accreditation = 'MRICS',
      ricsNumber,
      piiPolicyNumber,
      postcodesCovered = 'SW, W, WC, NW',
      maxLoad = 8,
    } = req.body;

    if (!name || !email) {
      throw ApiError.badRequest('Surveyor name and email are required');
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      throw ApiError.badRequest('A surveyor with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const surveyor = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'SURVEYOR',
        phone,
        status: 'ACTIVE',
        surveyorProfile: {
          create: {
            accreditation,
            ricsNumber,
            piiPolicyNumber,
            piiValidated: true,
            postcodesCovered,
            activeLoad: 0,
            maxLoad: parseInt(maxLoad),
            rating: 5.0,
            available: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        surveyorProfile: true,
      },
    });

    return ApiResponse.created(res, { surveyor }, 'Chartered surveyor onboarded successfully');
  } catch (error) {
    next(error);
  }
};

export const updateSurveyorProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { name, phone, postcodesCovered, maxLoad, available, accreditation, piiPolicyNumber } = req.body;

    if (name || phone !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name ? { name } : {}),
          ...(phone !== undefined ? { phone } : {}),
        },
      });
    }

    const profileData = {};
    if (postcodesCovered) profileData.postcodesCovered = postcodesCovered;
    if (maxLoad !== undefined) profileData.maxLoad = parseInt(maxLoad);
    if (available !== undefined) profileData.available = Boolean(available);
    if (accreditation) profileData.accreditation = accreditation;
    if (piiPolicyNumber) profileData.piiPolicyNumber = piiPolicyNumber;

    const profile = await prisma.surveyorProfile.update({
      where: { userId },
      data: profileData,
    });

    return ApiResponse.success(res, { profile }, 'Surveyor profile updated successfully');
  } catch (error) {
    next(error);
  }
};
