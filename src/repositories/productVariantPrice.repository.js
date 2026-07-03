const BaseRepository = require('./base.repository');
const ProductVariantPrice = require('../models/ProductVariantPrice.model');

class ProductVariantPriceRepository extends BaseRepository {
  constructor() {
    super(ProductVariantPrice);
    this.price = ProductVariantPrice;
  }

  findActiveById(id) {
    return this.price.findOne({
      _id: id,
      isActive: true
    }).exec();
  }

  findByProductId(productId) {
    return this.price
      .find({ productId, isActive: true })
      .populate('variantId')
      .sort({ customerPrice: 1 })
      .lean()
      .exec();
  }

  findByVariantId(variantId) {
    return this.price
      .find({ variantId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}

module.exports = ProductVariantPriceRepository;