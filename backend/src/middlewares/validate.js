import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    const errorMessages = err.errors?.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })) || [{ message: err.message }];

    next(ApiError.badRequest('Validation failed', errorMessages));
  }
};

