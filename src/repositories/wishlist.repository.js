const BaseRepository = require('./base.repository');
const Wishlist = require('../models/Wishlist.model');

class WishlistRepository extends BaseRepository {
   constructor() {
      super(Wishlist);
      this.wishlist = Wishlist;
   }

   findByUserId(userId) {
      return this.wishlist.find({ userId }).populate('productId').sort({ createdAt: -1 }).lean().exec();
   }

   findOneByUserProduct(userId, productId) {
      return this.wishlist.findOne({ userId, productId }).exec();
   }

   deleteByUserProduct(userId, productId) {
      return this.wishlist.deleteOne({ userId, productId }).exec();
   }
}

module.exports = WishlistRepository;