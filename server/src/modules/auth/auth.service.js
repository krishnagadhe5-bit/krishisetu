import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db.js';

export class AuthService {
  static async register(data) {
    const { email, password, fullName, role, phone, state, district, preferredLang, specialization, qualifications, experienceYears } = data;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const err = new Error('Email already registered');
      err.statusCode = 409;
      err.isOperational = true;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user and profile in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
          accountStatus: 'ACTIVE',
          profile: {
            create: {
              fullName,
              phone,
              state: state || 'Maharashtra',
              district,
              preferredLang: preferredLang || 'en',
            },
          },
        },
        include: { profile: true },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          resource: 'User',
          resourceId: user.id,
          details: { role, email },
        },
      });

      return user;
    });

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'krishisetu_super_secret_jwt_key_2026_production_change',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        accountStatus: newUser.accountStatus,
        profile: newUser.profile,
      },
      token,
    };
  }

  static async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.isOperational = true;
      throw err;
    }

    if (user.accountStatus === 'SUSPENDED') {
      const err = new Error('Account suspended. Please contact support.');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.isOperational = true;
      throw err;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'krishisetu_super_secret_jwt_key_2026_production_change',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Audit login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'User',
        resourceId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        profile: user.profile,
      },
      token,
    };
  }

  static async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      profile: user.profile,
    };
  }

  static async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Do not reveal email existence to prevent user enumeration
      return { message: 'If an account exists with this email, password reset instructions have been generated.' };
    }

    const resetToken = jwt.sign(
      { userId: user.id, purpose: 'pwd_reset' },
      process.env.JWT_SECRET || 'krishisetu_super_secret_jwt_key_2026_production_change',
      { expiresIn: '1h' }
    );

    return {
      message: 'Password reset token generated successfully (for dev/demo use token below)',
      resetToken,
    };
  }

  static async resetPassword(token, newPassword) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'krishisetu_super_secret_jwt_key_2026_production_change'
      );

      if (decoded.purpose !== 'pwd_reset') {
        const err = new Error('Invalid token type');
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash },
      });

      return { message: 'Password has been updated successfully' };
    } catch (e) {
      const err = new Error('Invalid or expired reset token');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }
  }
}
