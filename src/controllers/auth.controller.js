const BaseController = require('./base.controller');
const AuthService = require('../services/auth.service');

class AuthController extends BaseController {
  constructor() {
    super(class { });
    this.authService = new AuthService();
  }

  register = async (req, res) => {  
    try {
      const data = await this.authService.register(req.body);
      return this.commonSuccessResponse(res, data, '', 'Registration successful');
    } catch (error) {
      return this.commonErrorResponse(res, error.message);
    }
  };

  login = async (req, res) => {
    try {
      const data = await this.authService.login({
        ...req.body,
        userAgent: req.get('user-agent') || '',
        ip: req.ip
      });

      this.setRefreshCookie(res, data.refreshToken);
      delete data.refreshToken;

      return this.commonSuccessResponse(res, data, '', 'Login successful');
    } catch (error) {
      return this.commonErrorResponse(res, error.message);
    }
  };

  refresh = async (req, res) => {
    try {
      const data = await this.authService.refresh(req.cookies?.refresh_token);

      this.setRefreshCookie(res, data.refreshToken);
      delete data.refreshToken;

      return this.commonSuccessResponse(res, data, '', 'Token refreshed');
    } catch (error) {
      this.clearRefreshCookie(res);
      return this.commonErrorResponse(res, error.message);
    }
  };

  logout = async (req, res) => {
    try {
      await this.authService.logout(req.cookies?.refresh_token);
      this.clearRefreshCookie(res);

      return this.commonSuccessResponse(res, { ok: true }, '', 'Logged out');
    } catch (error) {
      return this.commonErrorResponse(res, error.message);
    }
  };

  logoutAll = async (req, res) => {
    try {
      await this.authService.logoutAll(req.user.sub);
      this.clearRefreshCookie(res);

      return this.commonSuccessResponse(res, { ok: true }, '', 'Logged out from all devices');
    } catch (error) {
      return this.commonErrorResponse(res, error.message);
    }
  };

  sessions = async (req, res) => {
    try {
      const data = await this.authService.getSessions(req.user.sub);
      return this.commonSuccessResponse(res, data, '', 'Sessions fetched');
    } catch (error) {
      return this.commonErrorResponse(res, error.message);
    }
  };

  revokeSession = async (req, res) => {
    try {
      await this.authService.revokeSession(req.user.sub, req.params.id);
      return this.commonSuccessResponse(res, { ok: true }, '', 'Session revoked');
    } catch (error) {
      return this.commonErrorResponse(res, error.message);
    }
  };

  me = async (req, res) => {
    try {
      const data = await this.authService.me(req.user.sub);
      return this.commonSuccessResponse(res, data, '', 'Profile fetched');
    } catch (error) {
      return this.commonErrorResponse(res, error.message);
    }
  };

  updateProfile = async (req, res) => {
    try {
      const data = await this.authService.updateProfile(req.user.sub, req.body);
      return this.commonSuccessResponse(res, data, '', 'Profile updated');
    } catch (error) {
      return this.commonErrorResponse(res, error.message);
    }
  };

  uploadProfileImage = async (req, res) => {
    try {
      const filePath = req.file ? req.file.path.replace(/\\/g, '/') : '';
      const data = await this.authService.uploadProfileImage(req.user.sub, filePath);

      return this.commonSuccessResponse(res, data, '', 'Profile image updated');
    } catch (error) {
      return this.commonErrorResponse(res, error.message);
    }
  };

  changePassword = async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;

      await this.authService.changePassword(req.user.sub, oldPassword, newPassword);

      return this.commonSuccessResponse(res, { ok: true }, '', 'Password changed successfully');
    } catch (error) {
      return this.commonErrorResponse(res, error.message);
    }
  };

  forgotPassword = async (req, res) => {
    try {
      const data = await this.authService.forgotPassword(req.body.identifier);
      return this.commonSuccessResponse(res, data, '', 'Reset token generated');
    } catch (error) {
      return this.commonErrorResponse(res, error.message);
    }
  };

  resetPassword = async (req, res) => {
    try {
      const { resetToken, newPassword } = req.body;

      await this.authService.resetPassword(resetToken, newPassword);

      return this.commonSuccessResponse(res, { ok: true }, '', 'Password reset successfully');
    } catch (error) {
      return this.commonErrorResponse(res, error.message);
    }
  };

  impersonate = async (req, res) => {
    try {
      const data = await this.authService.impersonate(
        req.user,
        req.params.userId,
        req.get('user-agent') || '',
        req.ip
      );

      this.setRefreshCookie(res, data.refreshToken);
      delete data.refreshToken;

      return this.commonSuccessResponse(res, data, '', 'Impersonation started');
    } catch (error) {
      return this.commonErrorResponse(res, error.message);
    }
  };

  stopImpersonation = async (req, res) => {
    try {
      const data = await this.authService.stopImpersonation(
        req.user,
        req.get('user-agent') || '',
        req.ip
      );

      this.setRefreshCookie(res, data.refreshToken);
      delete data.refreshToken;

      return this.commonSuccessResponse(res, data, '', 'Impersonation stopped');
    } catch (error) {
      return this.commonErrorResponse(res, error.message);
    }
  };

  setRefreshCookie(res, refreshToken) {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/api/auth'
    });
  }

  clearRefreshCookie(res) {
    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/api/auth'
    });
  }
}

module.exports = AuthController;