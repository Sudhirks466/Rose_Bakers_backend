const BaseRepository = require('./base.repository');
const ProductVariant = require('../models/ProductVariant.model');

class ProductVariantRepository extends BaseRepository {
   constructor() {
      super(ProductVariant);
      this.variant = ProductVariant;
   }

   findByProductId(productId) {
      return this.variant
         .find({ productId, isActive: true })
         .sort({ isDefault: -1, weightInGram: 1 })
         .lean()
         .exec();
   }
}

module.exports = ProductVariantRepository;