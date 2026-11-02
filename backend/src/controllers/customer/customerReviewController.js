import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer Menu 11: Leave a Review (/customer/leave-review)
 * Trustpilot & Customer Feedback
 */
export const getCustomerReviews = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const reviews = await prisma.customerReview.findMany({
      where: { userId },
      include: {
        job: { select: { reference: true, propertyAddress: true, serviceType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, { reviews });
  } catch (error) {
    next(error);
  }
};

export const submitCustomerReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { rating, title, reviewText, platform = 'TRUSTPILOT', jobId } = req.body;

    if (!rating || !reviewText?.trim()) {
      throw ApiError.badRequest('Rating (1-5) and review description are required');
    }

    const review = await prisma.customerReview.create({
      data: {
        userId,
        jobId: jobId ? parseInt(jobId) : null,
        rating: parseInt(rating),
        title,
        reviewText: reviewText.trim(),
        platform,
        verified: true,
      },
    });

    return ApiResponse.created(res, { review }, 'Thank you! Your verified Trustpilot review has been submitted.');
  } catch (error) {
    next(error);
  }
};
