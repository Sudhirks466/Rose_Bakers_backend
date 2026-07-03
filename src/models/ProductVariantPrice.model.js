const mongoose = require('mongoose');

const productVariantPriceSchema = new mongoose.Schema({
   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
   variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },

   mrp: { type: Number, required: true },
   customerPrice: { type: Number, required: true },

   sellerPurchasePrice: { type: Number, required: true },
   suggestedSellerPrice: { type: Number },

   minSellerQty: { type: Number, default: 1 },
   discountPercent: { type: Number, default: 0 },

   effectiveFrom: { type: Date, default: Date.now },
   effectiveTo: Date,   

   isActive: { type: Boolean, default: true }
}, { timestamps: true });

productVariantPriceSchema.index({ variantId: 1, isActive: 1 });

module.exports = mongoose.model('ProductVariantPrice', productVariantPriceSchema);