const express = require('express');
const router = express.Router();

const AuthMiddleware = require('./../src/middlewares/auth.middleware');
const CustomerController = require('./../src/controllers/customer.controller');

const ctrl = new CustomerController();

router.use(AuthMiddleware.verifyAccessToken);

// Profile
router.get('/profile', ctrl.profile);
router.put('/profile', ctrl.updateProfile);

// Address
router.get('/addresses', ctrl.getAddresses);
router.post('/addresses', ctrl.createAddress);
router.put('/addresses/:id', ctrl.updateAddress);
router.delete('/addresses/:id', ctrl.deleteAddress);
router.patch('/addresses/:id/default', ctrl.setDefaultAddress);

// Wishlist
router.get('/wishlist', ctrl.getWishlist);
router.post('/wishlist', ctrl.addWishlist);
router.delete('/wishlist/:productId', ctrl.removeWishlist);

// Cart
router.get('/cart', ctrl.getCart);
router.post('/cart/add', ctrl.addToCart);
router.put('/cart/items/:itemId', ctrl.updateCartItem);
router.delete('/cart/items/:itemId', ctrl.removeCartItem);
router.delete('/cart/clear', ctrl.clearCart);
router.post('/cart/apply-promocode', ctrl.applyPromoCode);
router.delete('/cart/remove-promocode', ctrl.removePromoCode);

// Orders
router.post('/orders', ctrl.createOrder);
router.get('/orders', ctrl.getOrders);
router.get('/orders/:id', ctrl.getOrderDetails);
router.put('/orders/:id/cancel', ctrl.cancelOrder);

// Reviews
router.post('/reviews', ctrl.createReview);
router.get('/reviews', ctrl.getMyReviews);
router.put('/reviews/:id', ctrl.updateReview);
router.delete('/reviews/:id', ctrl.deleteReview);

// Notifications
router.get('/notifications', ctrl.getNotifications);
router.patch('/notifications/:id/read', ctrl.markNotificationRead);

router.get('/promocode/assigned', ctrl.assignedPromocodes);
router.post('/orders/:id/reorder', ctrl.reorder);
router.patch('/notifications/read-all', ctrl.markAllNotificationsRead);
router.delete('/notifications/:id', ctrl.deleteNotification);

router.post('/payments/create', ctrl.createPayment);
router.post('/payments/verify', ctrl.verifyPayment);

module.exports = router;