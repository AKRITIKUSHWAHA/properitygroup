import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { lookupPostcode } from '../services/postcodeService.js';

/**
 * Controller for UK Postcode & Address Lookup
 */

export const lookupAddressByPostcode = async (req, res, next) => {
  try {
    const { postcode } = req.params;
    if (!postcode) {
      throw ApiError.badRequest('Postcode parameter is required');
    }

    const data = await lookupPostcode(postcode);
    return ApiResponse.success(res, data, 'Postcode lookup completed');
  } catch (error) {
    next(error);
  }
};

