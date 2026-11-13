import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Superadmin Menu 2: Users & Roles
 */
export const getUsersAndRoles = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const where = {};

    if (role) where.role = role.toUpperCase();
    if (status) where.status = status.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        status: true,
        createdAt: true,
        surveyorProfile: true,
        _count: {
          select: {
            assignedJobs: true,
            clientJobs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, { users, total: users.length });
  } catch (error) {
    next(error);
  }
};

export const getUsersMetrics = async (req, res, next) => {
  try {
    const [totalUsers, adminCount, surveyorCount, customerCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'SURVEYOR' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);

    return ApiResponse.success(res, {
      totalUsers,
      adminCount,
      surveyorCount,
      customerCount,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'CUSTOMER', phone, accreditation, postcodesCovered } = req.body;

    if (!name || !email || !password) {
      throw ApiError.badRequest('Name, email and password are required');
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      throw ApiError.badRequest('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const rawRole = String(role).toUpperCase();
    const normalizedRole = ['ADMIN', 'SUPER_ADMIN'].includes(rawRole)
      ? 'ADMIN'
      : (rawRole === 'SURVEYOR' ? 'SURVEYOR' : 'CUSTOMER');

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: normalizedRole,
        phone,
        status: 'ACTIVE',
        ...(normalizedRole === 'SURVEYOR'
          ? {
              surveyorProfile: {
                create: {
                  accreditation: accreditation || 'MRICS',
                  postcodesCovered: postcodesCovered || 'W, SW, WC',
                  activeLoad: 0,
                  maxLoad: 8,
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    return ApiResponse.created(res, { user }, 'User created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, role, status } = req.body;
    const userId = parseInt(id);

    const data = {};
    if (name) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (role) data.role = role.toUpperCase();
    if (status) data.status = status.toUpperCase();

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        updatedAt: true,
      },
    });

    return ApiResponse.success(res, { user }, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Prevent deleting self
    if (req.user.id === userId) {
      throw ApiError.badRequest('You cannot delete your own administrative account');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'INACTIVE' },
    });

    return ApiResponse.success(res, null, 'User account deactivated successfully');
  } catch (error) {
    next(error);
  }
};

