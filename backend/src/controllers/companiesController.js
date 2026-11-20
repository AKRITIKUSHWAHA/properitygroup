import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Superadmin Menu 3: Companies (Estate Agency Panels & Key Logistics)
 */
export const getCompanies = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const where = {};

    if (status) where.status = status.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { branchName: { contains: search } },
        { contactName: { contains: search } },
        { contactEmail: { contains: search } },
      ];
    }

    const companies = await prisma.company.findMany({
      where,
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

export const getCompaniesMetrics = async (req, res, next) => {
  try {
    const [totalBranches, instructionsAggregate] = await Promise.all([
      prisma.company.count({ where: { status: 'ACTIVE' } }),
      prisma.company.aggregate({
        _sum: { totalInstructions: true },
      }),
    ]);

    return ApiResponse.success(res, {
      partnerAgencies: totalBranches,
      referredInstructions: instructionsAggregate._sum.totalInstructions || 0,
      keyAccessProtocol: '100% Verified',
    });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req, res, next) => {
  try {
    const {
      name,
      branchName,
      address,
      contactName,
      contactEmail,
      contactPhone,
      referralRate = 10.0,
      keyCollectionProtocol,
    } = req.body;

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
        referralRate: parseFloat(referralRate),
        keyCollectionProtocol:
          keyCollectionProtocol || 'Key tag verified at reception. Surveyor photo ID mandated.',
        status: 'ACTIVE',
      },
    });

    return ApiResponse.created(res, { company }, 'Estate agency branch panel onboarded');
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = parseInt(id);

    const company = await prisma.company.update({
      where: { id: companyId },
      data: req.body,
    });

    return ApiResponse.success(res, { company }, 'Company details updated');
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = parseInt(id);

    await prisma.company.delete({
      where: { id: companyId },
    });

    return ApiResponse.success(res, null, 'Company record removed');
  } catch (error) {
    next(error);
  }
};

