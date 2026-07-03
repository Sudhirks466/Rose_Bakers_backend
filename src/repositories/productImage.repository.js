const BaseRepository = require('./base.repository');
const ProductImage = require('../models/ProductImage.model');

class ProductImageRepository extends BaseRepository {
   constructor() {
      super(ProductImage);
      this.image = ProductImage;
   }

   findByProductId(productId) {
      return this.image
         .find({ productId, isActive: true })
         .sort({ isPrimary: -1, sortOrder: 1 })
         .lean()
         .exec();
   }

   countByProductId(productId) {
      return this.image.countDocuments({ productId, isActive: true });
   }

   removePrimary(productId) {
      return this.image.updateMany(
         { productId },
         { isPrimary: false }
      ).exec();
   }
}

module.exports = ProductImageRepository;