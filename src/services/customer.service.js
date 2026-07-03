const UserRepository = require('../repositories/user.repository');
const AddressRepository = require('../repositories/address.repository');
const WishlistRepository = require('../repositories/wishlist.repository');
const CartRepository = require('../repositories/cart.repository');
const ProductRepository = require('../repositories/product.repository');
const ProductVariantPriceRepository = require('../repositories/productVariantPrice.repository');
const PromoCodeRepository = require('../repositories/promoCode.repository');
const OrderRepository = require('../repositories/order.repository');
const OrderItemRepository = require('../repositories/orderItem.repository');
const OrderStatusHistoryRepository = require('../repositories/orderStatusHistory.repository');
const ProductReviewRepository = require('../repositories/productReview.repository');
const NotificationRepository = require('../repositories/notification.repository');

class CustomerService {
   constructor() {
      this.userRepo = new UserRepository();
      this.addressRepo = new AddressRepository();
      this.wishlistRepo = new WishlistRepository();
      this.cartRepo = new CartRepository();
      this.productRepo = new ProductRepository();
      this.priceRepo = new ProductVariantPriceRepository();
      this.promoRepo = new PromoCodeRepository();
      this.orderRepo = new OrderRepository();
      this.orderItemRepo = new OrderItemRepository();
      this.orderStatusRepo = new OrderStatusHistoryRepository();
      this.reviewRepo = new ProductReviewRepository();
      this.notificationRepo = new NotificationRepository();
   }

   async profile(userId) {
      return this.userRepo.findPublicById(userId);
   }

   async updateProfile(userId, body) {
      const updateData = {};
      if (body.firstName) updateData.firstName = body.firstName;
      if (body.lastName !== undefined) updateData.lastName = body.lastName;

      const oldUser = await this.userRepo.findById(userId);
      updateData.name = `${updateData.firstName || oldUser.firstName || ''} ${updateData.lastName !== undefined ? updateData.lastName : oldUser.lastName || ''
         }`.trim();

      return this.userRepo.updateProfile(userId, updateData);
   }

   async getAddresses(userId) {
      return this.addressRepo.findByUserId(userId);
   }

   async createAddress(userId, body) {
      const count = await this.addressRepo.countByUserId(userId);

      if (body.isDefault || count === 0) {
         await this.addressRepo.removeDefault(userId);
         body.isDefault = true;
      }

      return this.addressRepo.create({
         ...body,
         userId
      });
   }

   async updateAddress(userId, addressId, body) {
      const address = await this.addressRepo.findByUserAndId(userId, addressId);
      if (!address) throw new Error('Address not found');

      if (body.isDefault) {
         await this.addressRepo.removeDefault(userId);
      }

      return this.addressRepo.updateById(addressId, body);
   }

   async deleteAddress(userId, addressId) {
      const address = await this.addressRepo.findByUserAndId(userId, addressId);
      if (!address) throw new Error('Address not found');

      return this.addressRepo.softDeleteById(addressId);
   }

   async setDefaultAddress(userId, addressId) {
      const address = await this.addressRepo.findByUserAndId(userId, addressId);
      if (!address) throw new Error('Address not found');

      await this.addressRepo.removeDefault(userId);
      return this.addressRepo.updateById(addressId, { isDefault: true });
   }

   async getWishlist(userId) {
      return this.wishlistRepo.findByUserId(userId);
   }

   async addWishlist(userId, productId) {
      if (!productId) throw new Error('Product id is required');

      const product = await this.productRepo.findActiveById(productId);
      if (!product) throw new Error('Product not found');

      const exists = await this.wishlistRepo.findOneByUserProduct(userId, productId);
      if (exists) return exists;

      return this.wishlistRepo.create({ userId, productId });
   }

   async removeWishlist(userId, productId) {
      return this.wishlistRepo.deleteByUserProduct(userId, productId);
   }

   async getCart(userId) {
      const cart = await this.cartRepo.findByUserId(userId);
      return cart || this.cartRepo.createEmptyCart(userId);
   }

   async addToCart(userId, body) {
      const { productId, productPriceId, quantity = 1, cakeMessage = '' } = body;

      if (!productId || !productPriceId) {
         throw new Error('Product and price are required');
      }

      const product = await this.productRepo.findActiveById(productId);
      if (!product) throw new Error('Product not found');

      const price = await this.priceRepo.findActiveById(productPriceId);
      if (!price) throw new Error('Product price not found');

      let cart = await this.cartRepo.findRawByUserId(userId);
      if (!cart) cart = await this.cartRepo.createEmptyCart(userId);

      const existingItem = cart.items.find(
         (item) => String(item.productId) === String(productId)
            && String(item.productPriceId) === String(productPriceId)
      );

      if (existingItem) {
         existingItem.quantity += Number(quantity);
         existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
      } else {
         cart.items.push({
            productId,
            productPriceId,
            quantity,
            cakeMessage,
            priceType: 'CUSTOMER',
            unitPrice: price.customerPrice,
            totalPrice: Number(quantity) * price.customerPrice
         });
      }

      this.calculateCart(cart);
      await cart.save();

      return this.cartRepo.findByUserId(userId);
   }

   async updateCartItem(userId, itemId, quantity) {
      if (!quantity || Number(quantity) < 1) throw new Error('Quantity must be at least 1');

      const cart = await this.cartRepo.findRawByUserId(userId);
      if (!cart) throw new Error('Cart not found');

      const item = cart.items.id(itemId);
      if (!item) throw new Error('Cart item not found');

      item.quantity = Number(quantity);
      item.totalPrice = item.quantity * item.unitPrice;

      this.calculateCart(cart);
      await cart.save();

      return this.cartRepo.findByUserId(userId);
   }

   async removeCartItem(userId, itemId) {
      const cart = await this.cartRepo.findRawByUserId(userId);
      if (!cart) throw new Error('Cart not found');

      const item = cart.items.id(itemId);
      if (!item) throw new Error('Cart item not found');

      item.deleteOne();

      this.calculateCart(cart);
      await cart.save();

      return this.cartRepo.findByUserId(userId);
   }

   async clearCart(userId) {
      const cart = await this.cartRepo.findRawByUserId(userId);
      if (!cart) return this.cartRepo.createEmptyCart(userId);

      cart.items = [];
      cart.couponCode = '';
      cart.discountAmount = 0;

      this.calculateCart(cart);
      await cart.save();

      return this.cartRepo.findByUserId(userId);
   }

   async applyPromoCode(userId, code) {
      if (!code) throw new Error('Promo code is required');

      const cart = await this.cartRepo.findRawByUserId(userId);
      if (!cart || !cart.items.length) throw new Error('Cart is empty');

      const promo = await this.promoRepo.findActiveCustomerPromo(code);
      if (!promo) throw new Error('Invalid promo code');

      if (promo.minOrderAmount && cart.subtotal < promo.minOrderAmount) {
         throw new Error(`Minimum order amount should be ${promo.minOrderAmount}`);
      }

      let discount = 0;

      if (promo.discountType === 'PERCENTAGE') {
         discount = (cart.subtotal * promo.discountValue) / 100;
         if (promo.maxDiscountAmount > 0) {
            discount = Math.min(discount, promo.maxDiscountAmount);
         }
      } else {
         discount = promo.discountValue;
      }

      cart.couponCode = promo.code;
      cart.discountAmount = Math.min(discount, cart.subtotal);

      this.calculateCart(cart);
      await cart.save();

      return this.cartRepo.findByUserId(userId);
   }

   async removePromoCode(userId) {
      const cart = await this.cartRepo.findRawByUserId(userId);
      if (!cart) throw new Error('Cart not found');

      cart.couponCode = '';
      cart.discountAmount = 0;

      this.calculateCart(cart);
      await cart.save();

      return this.cartRepo.findByUserId(userId);
   }

   async createOrder(userId, body) {
      const cart = await this.cartRepo.findRawByUserId(userId);
      if (!cart || !cart.items.length) throw new Error('Cart is empty');

      const address = await this.addressRepo.findByUserAndId(userId, body.addressId);
      if (!address) throw new Error('Address not found');

      const orderNo = `RB${Date.now()}`;

      const order = await this.orderRepo.create({
         orderNo,
         orderType: 'CUSTOMER_ORDER',
         customerId: userId,
         deliveryAddress: {
            fullName: address.fullName,
            mobile: address.mobile,
            houseNo: address.houseNo,
            street: address.street,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            pincode: address.pincode
         },
         deliveryDate: body.deliveryDate,
         deliverySlot: body.deliverySlot,
         specialInstructions: body.specialInstructions,
         subtotal: cart.subtotal,
         deliveryCharge: cart.deliveryCharge,
         gstAmount: cart.gstAmount,
         discountAmount: cart.discountAmount,
         grandTotal: cart.grandTotal,
         paymentMethod: body.paymentMethod || 'COD',
         paymentStatus: body.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
         orderStatus: 'PLACED',
         couponCode: cart.couponCode,
         createdBy: userId
      });

      const orderItems = cart.items.map((item) => ({
         orderId: order._id,
         productId: item.productId,
         productPriceId: item.productPriceId,
         productName: '',
         quantity: item.quantity,
         unitPrice: item.unitPrice,
         totalPrice: item.totalPrice,
         cakeMessage: item.cakeMessage,
         customerSellingPrice: item.unitPrice
      }));

      await this.orderItemRepo.createMany(orderItems);

      await this.orderStatusRepo.create({
         orderId: order._id,
         status: 'PLACED',
         note: 'Order placed by customer',
         changedBy: userId,
         changedByRole: 'CUSTOMER'
      });

      await this.clearCart(userId);

      return this.orderRepo.findDetailsById(order._id);
   }

   async getOrders(userId) {
      return this.orderRepo.findByCustomerId(userId);
   }

   async getOrderDetails(userId, orderId) {
      const order = await this.orderRepo.findCustomerOrderById(userId, orderId);
      if (!order) throw new Error('Order not found');

      const items = await this.orderItemRepo.findByOrderId(orderId);
      const timeline = await this.orderStatusRepo.findByOrderId(orderId);

      return { order, items, timeline };
   }

   async cancelOrder(userId, orderId, reason = '') {
      const order = await this.orderRepo.findCustomerOrderRawById(userId, orderId);
      if (!order) throw new Error('Order not found');

      if (['DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
         throw new Error('Order cannot be cancelled');
      }

      order.orderStatus = 'CANCELLED';
      order.cancelledAt = new Date();
      order.cancellationReason = reason;

      await order.save();

      await this.orderStatusRepo.create({
         orderId,
         status: 'CANCELLED',
         note: reason || 'Cancelled by customer',
         changedBy: userId,
         changedByRole: 'CUSTOMER'
      });

      return this.orderRepo.findDetailsById(orderId);
   }

   async createReview(userId, body) {
      if (!body.productId || !body.rating) {
         throw new Error('Product and rating are required');
      }

      return this.reviewRepo.create({
         ...body,
         userId,
         status: 'PENDING'
      });
   }

   async getMyReviews(userId) {
      return this.reviewRepo.findByUserId(userId);
   }

   async updateReview(userId, reviewId, body) {
      const review = await this.reviewRepo.findByUserAndId(userId, reviewId);
      if (!review) throw new Error('Review not found');

      return this.reviewRepo.updateById(reviewId, {
         rating: body.rating,
         reviewTitle: body.reviewTitle,
         reviewText: body.reviewText,
         status: 'PENDING'
      });
   }

   async deleteReview(userId, reviewId) {
      const review = await this.reviewRepo.findByUserAndId(userId, reviewId);
      if (!review) throw new Error('Review not found');

      return this.reviewRepo.updateById(reviewId, { isDeleted: true });
   }

   async getNotifications(userId) {
      return this.notificationRepo.findByUserId(userId);
   }

   async markNotificationRead(userId, notificationId) {
      const notification = await this.notificationRepo.findByUserAndId(userId, notificationId);
      if (!notification) throw new Error('Notification not found');

      return this.notificationRepo.updateById(notificationId, {
         isRead: true,
         readAt: new Date()
      });
   }

   calculateCart(cart) {
      cart.subtotal = cart.items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
      cart.deliveryCharge = cart.subtotal >= 499 ? 0 : 40;
      cart.gstAmount = 0;
      cart.grandTotal = cart.subtotal + cart.deliveryCharge + cart.gstAmount - Number(cart.discountAmount || 0);

      if (cart.grandTotal < 0) cart.grandTotal = 0;
   }

   async assignedPromocodes(userId) {
      return this.promoAssignRepo.findActiveCustomerAssignments(userId);
   }

   async reorder(userId, orderId) {
      const order = await this.orderRepo.findCustomerOrderById(userId, orderId);
      if (!order) throw new Error('Order not found');

      const items = await this.orderItemRepo.findByOrderId(orderId);

      for (const item of items) {
         await this.addToCart(userId, {
            productId: item.productId._id || item.productId,
            productPriceId: item.productPriceId._id || item.productPriceId,
            quantity: item.quantity,
            cakeMessage: item.cakeMessage || ''
         });
      }

      return this.getCart(userId);
   }

   async markAllNotificationsRead(userId) {
      return this.notificationRepo.markAllReadByUserId(userId);
   }

   async deleteNotification(userId, notificationId) {
      const notification = await this.notificationRepo.findByUserAndId(userId, notificationId);
      if (!notification) throw new Error('Notification not found');
      return this.notificationRepo.deleteById(notificationId);
   }

   async createPayment(userId, body) {
      const { orderId, paymentMethod = 'RAZORPAY' } = body;

      const order = await this.orderRepo.findCustomerOrderById(userId, orderId);
      if (!order) throw new Error('Order not found');

      return {
         orderId,
         amount: order.grandTotal,
         currency: 'INR',
         paymentMethod,
         gatewayOrderId: `LOCAL_${Date.now()}`
      };
   }

   async verifyPayment(userId, body) {
      const { orderId, gatewayPaymentId, transactionId } = body;

      const order = await this.orderRepo.findCustomerOrderRawById(userId, orderId);
      if (!order) throw new Error('Order not found');

      order.paymentStatus = 'PAID';
      await order.save();

      return {
         orderId,
         gatewayPaymentId,
         transactionId,
         paymentStatus: 'PAID'
      };
   }
}

module.exports = CustomerService;