const express = require('express');
const router = express.Router();

const AuthMiddleware = require('./../src/middlewares/auth.middleware');
const RoleMiddleware = require('./../src/middlewares/role.middleware');
const SellerController = require('./../src/controllers/seller.controller');

const ctrl = new SellerController();

router.use(AuthMiddleware.verifyAccessToken);
router.use(RoleMiddleware.allowRoles('SELLER', 'SUPER_ADMIN'));

// Dashboard
router.get('/dashboard', ctrl.dashboard);

// Profile
router.get('/profile', ctrl.profile);
router.put('/profile', ctrl.updateProfile);

// Products
router.get('/products', ctrl.products);
router.get('/products/:id', ctrl.productDetails);

// Seller Account
router.get('/account', ctrl.account);
router.get('/transactions', ctrl.transactions);

// Promo Codes
router.get('/promocodes', ctrl.promocodes);

// Seller Cart
router.get('/cart', ctrl.getCart);
router.post('/cart/add', ctrl.addToCart);
router.put('/cart/items/:itemId', ctrl.updateCartItem);
router.delete('/cart/items/:itemId', ctrl.removeCartItem);
router.delete('/cart/clear', ctrl.clearCart);
router.post('/cart/apply-promocode', ctrl.applyPromoCode);
router.delete('/cart/remove-promocode', ctrl.removePromoCode);

// Seller Purchase Orders
router.post('/orders', ctrl.createPurchaseOrder);
router.get('/orders', ctrl.purchaseOrders);
router.get('/orders/:id', ctrl.purchaseOrderDetails);
router.put('/orders/:id/cancel', ctrl.cancelPurchaseOrder);

// Seller Customer Orders
router.get('/customer-orders', ctrl.customerOrders);
router.get('/customer-orders/:id', ctrl.customerOrderDetails);
router.patch('/customer-orders/:id/accept', ctrl.acceptCustomerOrder);
router.patch('/customer-orders/:id/reject', ctrl.rejectCustomerOrder);
router.patch('/customer-orders/:id/status', ctrl.updateCustomerOrderStatus);

module.exports = router;