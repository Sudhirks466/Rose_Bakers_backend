const BaseController = require('./base.controller');
const CustomerService = require('../services/customer.service');

class CustomerController extends BaseController {
   constructor() {
      super(class { });
      this.service = new CustomerService();
   }

   profile = async (req, res) => {
      try {
         const data = await this.service.profile(req.user.sub);
         return this.commonSuccessResponse(res, data, '', 'Profile fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateProfile = async (req, res) => {
      try {
         const data = await this.service.updateProfile(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Profile updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   getAddresses = async (req, res) => {
      try {
         const data = await this.service.getAddresses(req.user.sub);
         return this.commonSuccessResponse(res, data, '', 'Addresses fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   createAddress = async (req, res) => {
      try {
         const data = await this.service.createAddress(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Address created');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateAddress = async (req, res) => {
      try {
         const data = await this.service.updateAddress(req.user.sub, req.params.id, req.body);
         return this.commonSuccessResponse(res, data, '', 'Address updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   deleteAddress = async (req, res) => {
      try {
         await this.service.deleteAddress(req.user.sub, req.params.id);
         return this.commonSuccessResponse(res, { ok: true }, '', 'Address deleted');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   setDefaultAddress = async (req, res) => {
      try {
         const data = await this.service.setDefaultAddress(req.user.sub, req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Default address updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   getWishlist = async (req, res) => {
      try {
         const data = await this.service.getWishlist(req.user.sub);
         return this.commonSuccessResponse(res, data, '', 'Wishlist fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   addWishlist = async (req, res) => {
      try {
         const data = await this.service.addWishlist(req.user.sub, req.body.productId);
         return this.commonSuccessResponse(res, data, '', 'Added to wishlist');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   removeWishlist = async (req, res) => {
      try {
         await this.service.removeWishlist(req.user.sub, req.params.productId);
         return this.commonSuccessResponse(res, { ok: true }, '', 'Removed from wishlist');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   getCart = async (req, res) => {
      try {
         const data = await this.service.getCart(req.user.sub);
         return this.commonSuccessResponse(res, data, '', 'Cart fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   addToCart = async (req, res) => {
      try {
         const data = await this.service.addToCart(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Item added to cart');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateCartItem = async (req, res) => {
      try {
         const data = await this.service.updateCartItem(req.user.sub, req.params.itemId, req.body.quantity);
         return this.commonSuccessResponse(res, data, '', 'Cart updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   removeCartItem = async (req, res) => {
      try {
         const data = await this.service.removeCartItem(req.user.sub, req.params.itemId);
         return this.commonSuccessResponse(res, data, '', 'Item removed');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   clearCart = async (req, res) => {
      try {
         const data = await this.service.clearCart(req.user.sub);
         return this.commonSuccessResponse(res, data, '', 'Cart cleared');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   applyPromoCode = async (req, res) => {
      try {
         const data = await this.service.applyPromoCode(req.user.sub, req.body.code);
         return this.commonSuccessResponse(res, data, '', 'Promo applied');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   removePromoCode = async (req, res) => {
      try {
         const data = await this.service.removePromoCode(req.user.sub);
         return this.commonSuccessResponse(res, data, '', 'Promo removed');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   createOrder = async (req, res) => {
      try {
         const data = await this.service.createOrder(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Order placed');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   getOrders = async (req, res) => {
      try {
         const data = await this.service.getOrders(req.user.sub);
         return this.commonSuccessResponse(res, data, '', 'Orders fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   getOrderDetails = async (req, res) => {
      try {
         const data = await this.service.getOrderDetails(req.user.sub, req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Order details fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   cancelOrder = async (req, res) => {
      try {
         const data = await this.service.cancelOrder(req.user.sub, req.params.id, req.body.reason);
         return this.commonSuccessResponse(res, data, '', 'Order cancelled');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   createReview = async (req, res) => {
      try {
         const data = await this.service.createReview(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Review submitted');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   getMyReviews = async (req, res) => {
      try {
         const data = await this.service.getMyReviews(req.user.sub);
         return this.commonSuccessResponse(res, data, '', 'Reviews fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateReview = async (req, res) => {
      try {
         const data = await this.service.updateReview(req.user.sub, req.params.id, req.body);
         return this.commonSuccessResponse(res, data, '', 'Review updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   deleteReview = async (req, res) => {
      try {
         await this.service.deleteReview(req.user.sub, req.params.id);
         return this.commonSuccessResponse(res, { ok: true }, '', 'Review deleted');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   getNotifications = async (req, res) => {
      try {
         const data = await this.service.getNotifications(req.user.sub);
         return this.commonSuccessResponse(res, data, '', 'Notifications fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   markNotificationRead = async (req, res) => {
      try {
         const data = await this.service.markNotificationRead(req.user.sub, req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Notification marked read');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   assignedPromocodes = async (req, res) => {
      try {
         const data = await this.service.assignedPromocodes(req.user.sub);
         return this.commonSuccessResponse(res, data, '', 'Assigned promocodes fetched');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   reorder = async (req, res) => {
      try {
         const data = await this.service.reorder(req.user.sub, req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Order items added to cart');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   markAllNotificationsRead = async (req, res) => {
      try {
         const data = await this.service.markAllNotificationsRead(req.user.sub);
         return this.commonSuccessResponse(res, data, '', 'All notifications marked read');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   deleteNotification = async (req, res) => {
      try {
         await this.service.deleteNotification(req.user.sub, req.params.id);
         return this.commonSuccessResponse(res, { ok: true }, '', 'Notification deleted');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   createPayment = async (req, res) => {
      try {
         const data = await this.service.createPayment(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Payment created');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   verifyPayment = async (req, res) => {
      try {
         const data = await this.service.verifyPayment(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Payment verified');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };
   
}

module.exports = CustomerController;