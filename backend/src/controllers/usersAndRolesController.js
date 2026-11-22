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
    const DEMO_EMAILS = ['admin@demo.com', 'surveyor@demo.com', 'customer@demo.com', 'customer2@demo.com'];
    const where = {
      email: { notIn: DEMO_EMAILS, not: { startsWith: 'deleted_' } },
    };

    if (role) where.role = role.toUpperCase();
    if (status && status.toUpperCase() !== 'ALL') {
      where.status = status.toUpperCase();
    } else if (!status) {
      where.status = { not: 'INACTIVE' };
    }
    if (search) {
      where.AND = [
        { email: { notIn: DEMO_EMAILS } },
        {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        },
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
        updatedAt: true,
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

    // Auto-sync any customer leads that don't yet have a user record into prisma.user
    try {
      const existingEmails = new Set(users.map((u) => (u.email || '').toLowerCase().trim()));
      const leads = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const salt = await bcrypt.genSalt(10);
      const defaultHash = await bcrypt.hash('password123', salt);

      for (const lead of leads) {
        const cleanEmail = (lead.clientEmail || '').toLowerCase().trim();
        if (!cleanEmail || existingEmails.has(cleanEmail) || DEMO_EMAILS.includes(cleanEmail) || cleanEmail.startsWith('deleted_')) continue;

        try {
          const newUser = await prisma.user.create({
            data: {
              name: lead.clientName || cleanEmail.split('@')[0],
              email: cleanEmail,
              password: defaultHash,
              role: 'CUSTOMER',
              phone: lead.clientPhone || null,
              status: 'ACTIVE',
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              phone: true,
              avatar: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              surveyorProfile: true,
              _count: {
                select: {
                  assignedJobs: true,
                  clientJobs: true,
                },
              },
            },
          });
          users.push(newUser);
          existingEmails.add(cleanEmail);
        } catch (uErr) {
          const existing = await prisma.user.findUnique({
            where: { email: cleanEmail },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              phone: true,
              avatar: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              surveyorProfile: true,
              _count: {
                select: {
                  assignedJobs: true,
                  clientJobs: true,
                },
              },
            },
          }).catch(() => null);
          if (existing && !existingEmails.has(cleanEmail)) {
            users.push(existing);
            existingEmails.add(cleanEmail);
          }
        }
      }
    } catch (syncErr) {
      console.warn('Sync leads to users warning:', syncErr.message);
    }

    return ApiResponse.success(res, { users, total: users.length });
  } catch (error) {
    next(error);
  }
};

export const getUsersMetrics = async (req, res, next) => {
  try {
    const DEMO_EMAILS = ['admin@demo.com', 'surveyor@demo.com', 'customer@demo.com', 'customer2@demo.com'];
    const notDemo = { email: { notIn: DEMO_EMAILS } };

    const [totalUsers, adminCount, surveyorCount, customerCount] = await Promise.all([
      prisma.user.count({ where: notDemo }),
      prisma.user.count({ where: { ...notDemo, role: 'ADMIN' } }),
      prisma.user.count({ where: { ...notDemo, role: 'SURVEYOR' } }),
      prisma.user.count({ where: { ...notDemo, role: 'CUSTOMER' } }),
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
    const { name, phone, role, status, password } = req.body;
    const userId = parseInt(id);

    const data = {};
    if (name) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (role) data.role = role.toUpperCase();
    if (status) {
      const upper = status.toUpperCase();
      if (upper.includes('BLOCK') || upper.includes('INACTIVE') || upper.includes('DEACTIVAT')) {
        data.status = 'INACTIVE';
      } else if (upper.includes('PENDING')) {
        data.status = 'PENDING';
      } else {
        data.status = 'ACTIVE';
      }
    }
    if (password && String(password).trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(String(password).trim(), salt);
    }

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
    let userId = parseInt(id, 10);
    if (isNaN(userId)) {
      const digits = String(id).replace(/\D/g, '');
      if (digits) {
        userId = parseInt(digits, 10);
      }
    }

    let targetUser = null;
    if (!isNaN(userId) && userId > 0) {
      targetUser = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!targetUser && typeof id === 'string') {
      const cleanEmail = id.toLowerCase().trim();
      targetUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanEmail },
            { name: cleanEmail },
          ],
        },
      });
      if (targetUser) userId = targetUser.id;
    }

    if (!targetUser) {
      return ApiResponse.success(res, null, 'User account removed successfully');
    }

    // Prevent deleting self or primary admin
    if (targetUser.email === 'njsadmin@gmail.com' || (req.user && req.user.id === targetUser.id)) {
      throw ApiError.badRequest('The primary administrator account cannot be deleted');
    }

    // Cascade cleanups
    await prisma.surveyorProfile.deleteMany({ where: { userId: targetUser.id } }).catch(() => {});
    await prisma.notification.deleteMany({ where: { userId: targetUser.id } }).catch(() => {});
    await prisma.customerReview.deleteMany({ where: { userId: targetUser.id } }).catch(() => {});
    await prisma.supportTicket.deleteMany({ where: { userId: targetUser.id } }).catch(() => {});
    await prisma.auditLog.deleteMany({ where: { userId: targetUser.id } }).catch(() => {});
    await prisma.message.deleteMany({ where: { senderId: targetUser.id } }).catch(() => {});
    // Unlink any jobs so foreign keys don't block deletion
    await prisma.job.updateMany({ where: { clientId: targetUser.id }, data: { clientId: null } }).catch(() => {});
    await prisma.job.updateMany({ where: { surveyorId: targetUser.id }, data: { surveyorId: null } }).catch(() => {});

    // Delete user from database
    await prisma.user.delete({ where: { id: targetUser.id } }).catch(async () => {
      await prisma.user.update({
        where: { id: targetUser.id },
        data: { status: 'INACTIVE', email: `deleted_${Date.now()}_${targetUser.email}` },
      });
    });

    return ApiResponse.success(res, null, 'User account removed successfully');
  } catch (error) {
    next(error);
  }
};

export const getRolePermissions = async (req, res, next) => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'role_menu_permissions' },
    });

    let permissions = null;
    if (setting?.value) {
      try {
        permissions = JSON.parse(setting.value);
      } catch {
        permissions = null;
      }
    }

    return ApiResponse.success(res, { permissions });
  } catch (error) {
    next(error);
  }
};

export const updateRolePermissions = async (req, res, next) => {
  try {
    const { permissions } = req.body;
    if (!permissions || typeof permissions !== 'object') {
      throw ApiError.badRequest('Valid permissions object is required');
    }

    const value = JSON.stringify(permissions);

    const setting = await prisma.systemSetting.upsert({
      where: { key: 'role_menu_permissions' },
      update: { value, category: 'GENERAL' },
      create: { key: 'role_menu_permissions', value, category: 'GENERAL' },
    });

    return ApiResponse.success(res, { permissions: JSON.parse(setting.value) }, 'Role permissions updated successfully');
  } catch (error) {
    next(error);
  }
};


