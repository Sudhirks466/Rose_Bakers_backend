class RoleMiddleware {
   static allowRoles(...allowedRoles) {
      return (req, res, next) => {
         const roles = req.user?.roles || [];
         const allowed = roles.some((role) => allowedRoles.includes(role));

         if (!allowed) {
            return res.status(403).json({
               success: false,
               status: 'Error',
               message: 'Access denied',
               code: 403
            });
         }

         next();
      };
   }

   static onlySuperAdmin(req, res, next) {
      const roles = req.user?.roles || [];

      if (!roles.includes('SUPER_ADMIN')) {
         return res.status(403).json({
            success: false,
            status: 'Error',
            message: 'Only super admin allowed',
            code: 403
         });
      }

      next();
   }
}

module.exports = RoleMiddleware;