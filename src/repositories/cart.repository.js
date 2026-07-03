const BaseRepository = require('./base.repository');
const Cart = require('../models/Cart.model');

class CartRepository extends BaseRepository {
   constructor() {
      super(Cart);
      this.cart = Cart;
   }

   findByUserId(userId) {
      return this.cart
         .findOne({ userId })
         .populate('items.productId')
         .populate('items.productPriceId')
         .lean()
         .exec();
   }

   findRawByUserId(userId) {
      return this.cart.findOne({ userId }).exec();
   }

   createEmptyCart(userId) {
      return this.cart.create({
         userId,
         items: [],
         subtotal: 0,
         deliveryCharge: 0,
         gstAmount: 0,
         grandTotal: 0,
         discountAmount: 0
      });
   }

   findSellerCartByUserId(userId) {
      return this.cart
         .findOne({ userId })
         .populate('items.productId')
         .populate('items.productPriceId')
         .lean()
         .exec();
   }
}

module.exports = CartRepository;