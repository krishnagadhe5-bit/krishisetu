import { apiError } from '../utils/response.js';

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiError(res, 'Authentication required before role verification', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return apiError(
        res,
        `Access denied. Requires one of: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`,
        403
      );
    }

    next();
  };
};
