const crypto = require('crypto');
const HashUtil = require('../utils/hash');
const JwtUtil = require('../utils/jwt');
const UserRepository = require('../repositories/user.repository');
const SessionRepository = require('../repositories/sessions.repository');

class AuthService {
   constructor() {
      this.userRepo = new UserRepository();
      this.sessionRepo = new SessionRepository();
   }

   buildPublicUser(user) {
      return {
         id: String(user._id),
         firstName: user.firstName,
         lastName: user.lastName,
         name: user.name,
         email: user.email,
         phone: user.phone,
         roles: user.roles || [],
         status: user.status,
         profilePic: user.profilePic || ''
      };
   }

   async register(body) {
      const { firstName, lastName = '', email, phone, password } = body;

      if (!firstName || !phone || !password) {
         throw new Error('First name, phone and password are required');
      }

      if (String(password).length < 6) {
         throw new Error('Password must be at least 6 characters');
      }

      if (email && await this.userRepo.findByEmail(email)) {
         throw new Error('Email already exists');
      }

      if (await this.userRepo.findByPhone(phone)) {
         throw new Error('Phone already exists');
      }

      const passwordHash = await HashUtil.hashPassword(password);

      const user = await this.userRepo.create({
         firstName,
         lastName,
         name: `${firstName} ${lastName}`.trim(),
         email,
         phone,
         passwordHash,
         roles: ['CUSTOMER'],
         status: 'ACTIVE',
         isActive: true,
         isDeleted: false
      });

      return this.buildPublicUser(user);
   }

   async login(payload) {
      const { loginId, email, phone, password, userAgent, ip } = payload;
      const identifier = loginId || email || phone;

      if (!identifier || !password) {
         throw new Error('Login id and password are required');
      }

      const user = await this.userRepo.findByEmailOrPhone(identifier);
      if (!user) throw new Error('Invalid credentials');

      if (!user.isActive || user.status === 'BLOCKED' || user.isDeleted) {
         throw new Error('Account is blocked or inactive');
      }

      const ok = await HashUtil.comparePassword(password, user.passwordHash);
      if (!ok) throw new Error('Invalid credentials');

      const tokens = await this.createTokens(user, userAgent, ip);
      await this.userRepo.updateLastLogin(user._id);

      return {
         ...tokens,
         user: this.buildPublicUser(user)
      };
   }

   async createTokens(user, userAgent = '', ip = '', extraPayload = {}) {
      const accessToken = JwtUtil.signAccessToken({
         sub: String(user._id),
         email: user.email,
         phone: user.phone,
         roles: user.roles || [],
         ...extraPayload
      });

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const session = await this.sessionRepo.createSession({
         userId: user._id,
         refreshTokenHash: 'temp',
         userAgent,
         ip,
         expiresAt,
         revokedAt: null
      });

      const refreshToken = JwtUtil.signRefreshToken({
         sub: String(user._id),
         sid: String(session._id),
         ...extraPayload
      });

      const refreshTokenHash = await HashUtil.hashToken(refreshToken);

      await this.sessionRepo.updateById(session._id, { refreshTokenHash });

      return { accessToken, refreshToken };
   }

   async refresh(refreshToken) {
      if (!refreshToken) throw new Error('Missing refresh token');

      let payload;
      try {
         payload = JwtUtil.verifyRefreshToken(refreshToken);
      } catch (e) {
         throw new Error('Invalid or expired refresh token');
      }

      const session = await this.sessionRepo.findById(payload.sid);
      if (!session) throw new Error('Session not found');

      if (String(session.userId) !== String(payload.sub)) {
         throw new Error('Session mismatch');
      }

      if (session.revokedAt) throw new Error('Session revoked');

      if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
         throw new Error('Session expired');
      }

      const valid = await HashUtil.compareToken(refreshToken, session.refreshTokenHash);
      if (!valid) throw new Error('Invalid refresh token');

      const user = await this.userRepo.findById(payload.sub);
      if (!user) throw new Error('User not found');

      const extraPayload = {};
      if (payload.impersonatedBy) {
         extraPayload.impersonatedBy = payload.impersonatedBy;
         extraPayload.originalRoles = payload.originalRoles || [];
      }

      const accessToken = JwtUtil.signAccessToken({
         sub: String(user._id),
         email: user.email,
         phone: user.phone,
         roles: user.roles || [],
         ...extraPayload
      });

      const newRefreshToken = JwtUtil.signRefreshToken({
         sub: String(user._id),
         sid: String(session._id),
         ...extraPayload
      });

      const newRefreshTokenHash = await HashUtil.hashToken(newRefreshToken);
      await this.sessionRepo.updateById(session._id, {
         refreshTokenHash: newRefreshTokenHash
      });

      return { accessToken, refreshToken: newRefreshToken };
   }

   async logout(refreshToken) {
      if (!refreshToken) return true;

      try {
         const payload = JwtUtil.verifyRefreshToken(refreshToken);
         if (payload?.sid) {
            await this.sessionRepo.revokeById(payload.sid);
         }
      } catch (e) {
         return true;
      }

      return true;
   }

   async logoutAll(userId) {
      if (!userId) throw new Error('Unauthorized');
      await this.sessionRepo.revokeAllByUserId(userId);
      return true;
   }

   async getSessions(userId) {
      if (!userId) throw new Error('Unauthorized');
      return this.sessionRepo.findActiveByUserId(userId);
   }

   async revokeSession(userId, sessionId) {
      const session = await this.sessionRepo.findById(sessionId);
      if (!session) throw new Error('Session not found');

      if (String(session.userId) !== String(userId)) {
         throw new Error('Invalid session');
      }

      await this.sessionRepo.revokeById(sessionId);
      return true;
   }

   async me(userId) {
      if (!userId) throw new Error('Unauthorized');

      const user = await this.userRepo.findPublicById(userId);
      if (!user) throw new Error('User not found');

      return user;
   }

   async updateProfile(userId, body) {
      if (!userId) throw new Error('Unauthorized');

      const updateData = {};

      if (body.firstName) updateData.firstName = body.firstName;
      if (body.lastName !== undefined) updateData.lastName = body.lastName;
      if (body.profilePic) updateData.profilePic = body.profilePic;

      if (updateData.firstName || updateData.lastName !== undefined) {
         const existing = await this.userRepo.findById(userId);
         updateData.name = `${updateData.firstName || existing.firstName || ''} ${updateData.lastName !== undefined ? updateData.lastName : existing.lastName || ''}`.trim();
      }

      return this.userRepo.updateProfile(userId, updateData);
   }

   async uploadProfileImage(userId, filePath) {
      if (!filePath) throw new Error('Profile image is required');

      return this.userRepo.updateProfile(userId, {
         profilePic: filePath
      });
   }

   async changePassword(userId, oldPassword, newPassword) {
      if (!oldPassword || !newPassword) {
         throw new Error('Old password and new password are required');
      }

      if (String(newPassword).length < 6) {
         throw new Error('New password must be at least 6 characters');
      }

      const user = await this.userRepo.findById(userId);
      if (!user) throw new Error('User not found');

      const ok = await HashUtil.comparePassword(oldPassword, user.passwordHash);
      if (!ok) throw new Error('Old password is incorrect');

      const passwordHash = await HashUtil.hashPassword(newPassword);
      await this.userRepo.updatePassword(userId, passwordHash);

      return true;
   }

   async forgotPassword(identifier) {
      if (!identifier) throw new Error('Email or phone is required');

      const user = await this.userRepo.findByEmailOrPhone(identifier);
      if (!user) throw new Error('User not found');

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = await HashUtil.hashToken(resetToken);

      await this.userRepo.updateById(user._id, {
         passwordResetTokenHash: resetTokenHash,
         passwordResetRequestedAt: new Date(),
         passwordResetExpiresAt: new Date(Date.now() + 15 * 60 * 1000)
      });

      return { resetToken };
   }

   async resetPassword(resetToken, newPassword) {
      if (!resetToken || !newPassword) {
         throw new Error('Reset token and new password are required');
      }

      if (String(newPassword).length < 6) {
         throw new Error('New password must be at least 6 characters');
      }

      const users = await this.userRepo.findUsersWithActiveResetToken();

      let matchedUser = null;

      for (const user of users) {
         const matched = await HashUtil.compareToken(resetToken, user.passwordResetTokenHash);
         if (matched) {
            matchedUser = user;
            break;
         }
      }

      if (!matchedUser) throw new Error('Invalid or expired reset token');

      const passwordHash = await HashUtil.hashPassword(newPassword);
      await this.userRepo.updatePassword(matchedUser._id, passwordHash);

      return true;
   }

   async impersonate(superAdminPayload, targetUserId, userAgent = '', ip = '') {
      const superAdmin = await this.userRepo.findById(superAdminPayload.sub);
      if (!superAdmin || !(superAdmin.roles || []).includes('SUPER_ADMIN')) {
         throw new Error('Only super admin can impersonate');
      }

      const targetUser = await this.userRepo.findById(targetUserId);
      if (!targetUser) throw new Error('Target user not found');

      if (targetUser.isDeleted || !targetUser.isActive) {
         throw new Error('Target user is inactive');
      }

      const tokens = await this.createTokens(targetUser, userAgent, ip, {
         impersonatedBy: String(superAdmin._id),
         originalRoles: superAdmin.roles || []
      });

      return {
         ...tokens,
         user: this.buildPublicUser(targetUser),
         impersonatedBy: this.buildPublicUser(superAdmin)
      };
   }

   async stopImpersonation(currentPayload, userAgent = '', ip = '') {
      if (!currentPayload?.impersonatedBy) {
         throw new Error('No active impersonation found');
      }

      const superAdmin = await this.userRepo.findById(currentPayload.impersonatedBy);
      if (!superAdmin) throw new Error('Super admin not found');

      const tokens = await this.createTokens(superAdmin, userAgent, ip);

      return {
         ...tokens,
         user: this.buildPublicUser(superAdmin)
      };
   }
}

module.exports = AuthService;