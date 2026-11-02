import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer Menu 13: My Details (/customer/my-details)
 * Profile & Contact Information Management
 */
export const getCustomerDetails = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    });

    return ApiResponse.success(res, { customer: user });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerDetails = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        updatedAt: true,
      },
    });

    return ApiResponse.success(res, { customer: updated }, 'Contact details updated successfully');
  } catch (error) {
    next(error);
  }
};
