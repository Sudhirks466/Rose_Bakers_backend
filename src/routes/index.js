const express = require('express');
const multer = require('multer');
const router = express.Router();

const AuthController = require('../controllers/auth.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const RoleMiddleware = require('../middlewares/role.middleware');

const ctrl = new AuthController();

const upload = multer({
   dest: 'storage/uploads/profile'
});

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);

router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);

router.get('/me', AuthMiddleware.verifyAccessToken, ctrl.me);

router.put('/profile', AuthMiddleware.verifyAccessToken, ctrl.updateProfile);

router.post('/profile/image', AuthMiddleware.verifyAccessToken, upload.single('profilePic'), ctrl.uploadProfileImage);

router.put('/change-password', AuthMiddleware.verifyAccessToken, ctrl.changePassword);

router.post('/logout-all', AuthMiddleware.verifyAccessToken, ctrl.logoutAll);

router.get('/sessions', AuthMiddleware.verifyAccessToken, ctrl.sessions);

router.delete('/sessions/:id', AuthMiddleware.verifyAccessToken, ctrl.revokeSession);

router.post('/impersonate/:userId', AuthMiddleware.verifyAccessToken, RoleMiddleware.onlySuperAdmin, ctrl.impersonate);

router.post('/stop-impersonation', AuthMiddleware.verifyAccessToken, ctrl.stopImpersonation);

module.exports = router;   