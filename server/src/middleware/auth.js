import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { apiError } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return apiError(res, 'Authentication required. No token provided.', 401);
    }

    let user = null;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'krishisetu_super_secret_jwt_key_2026_production_change');
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { profile: true },
      });
    } catch (jwtErr) {
      // Check if this is a Supabase Auth token
      const { verifySupabaseToken } = await import('../config/supabase.js');
      const supabaseUser = await verifySupabaseToken(token);
      if (supabaseUser && supabaseUser.email) {
        user = await prisma.user.findUnique({
          where: { email: supabaseUser.email },
          include: { profile: true },
        });
      }
    }

    if (!user) {
      return apiError(res, 'User no longer exists', 401);
    }

    if (user.accountStatus === 'SUSPENDED') {
      return apiError(res, 'Your account has been suspended. Please contact support.', 403);
    }

    if (user.accountStatus === 'DEACTIVATED') {
      return apiError(res, 'Account deactivated.', 403);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      profile: user.profile,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return apiError(res, 'Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return apiError(res, 'Token expired', 401);
    }
    return apiError(res, 'Authentication failed', 401);
  }
};
