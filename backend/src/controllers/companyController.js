import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getCompanies = async (req, res, next) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { leads: true, jobs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, { companies, total: companies.length });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req, res, next) => {
  try {
    const { name, branchName, address, contactName, contactEmail, contactPhone, referralRate, keyCollectionProtocol } =
      req.body;

    if (!name) {
      throw ApiError.badRequest('Company name is required');
    }

    const company = await prisma.company.create({
      data: {
        name,
        branchName,
        address,
        contactName,
        contactEmail,
        contactPhone,
        referralRate: referralRate ? parseFloat(referralRate) : 10.0,
        keyCollectionProtocol,
      },
    });

    return ApiResponse.created(res, { company }, 'Company created successfully');
  } catch (error) {
    next(error);
  }
};

