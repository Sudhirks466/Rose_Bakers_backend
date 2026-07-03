const jwt = require('jsonwebtoken');

class JwtUtil {
  static signAccessToken(payload, options = {}) {
    const secret = process.env.JWT_ACCESS_SECRET;
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';

    if (!secret) throw new Error('JWT_ACCESS_SECRET missing in env');

    return jwt.sign(payload, secret, { expiresIn, ...options });
  }

  static signRefreshToken(payload, options = {}) {
    const secret = process.env.JWT_REFRESH_SECRET;
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

    if (!secret) throw new Error('JWT_REFRESH_SECRET missing in env');

    return jwt.sign(payload, secret, { expiresIn, ...options });
  }

  static verifyAccessToken(token) {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET missing in env');
    return jwt.verify(token, secret);
  }

  static verifyRefreshToken(token) {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error('JWT_REFRESH_SECRET missing in env');
    return jwt.verify(token, secret);
  }
}

module.exports = JwtUtil;
