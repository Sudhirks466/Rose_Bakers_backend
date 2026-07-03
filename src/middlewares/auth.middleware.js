const JwtUtil = require('../utils/jwt');

class AuthMiddleware {
   static verifyAccessToken(req, res, next) {
      try {
         const header = req.headers.authorization || '';
         const token = header.startsWith('Bearer ') ? header.slice(7) : null;

         if (!token) {
            return res.status(401).json({
               success: false,
               message: 'Missing access token',
            });
         }

         const payload = JwtUtil.verifyAccessToken(token);
         req.user = payload;

         return next();
      } catch (error) {
         return res.status(401).json({
            success: false,
            message: 'Invalid/expired access token',
         });
      }
   }
}

module.exports = AuthMiddleware;
