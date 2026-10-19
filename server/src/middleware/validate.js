import { apiError } from '../utils/response.js';

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Assign back sanitized/transformed values
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;
      next();
    } catch (error) {
      if (error.errors) {
        const formatted = error.errors.map((e) => ({
          field: e.path.slice(1).join('.'),
          message: e.message,
        }));
        return apiError(res, 'Request validation failed', 400, formatted);
      }
      return apiError(res, 'Invalid request payload', 400);
    }
  };
};
