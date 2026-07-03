const mongoose = require('mongoose');

const productPriceSchema = new mongoose.Schema({
   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

   weightLabel: { type: String, required: true }, // 500g, 1kg, 2kg
   weightInGram: { type: Number, required: true },

   mrp: { type: Number, required: true },
   customerPrice: { type: Number, required: true },

   sellerPurchasePrice: { type: Number, required: true },
   suggestedSellerPrice: { type: Number },

   discountPercent: { type: Number, default: 0 },
   minimumSellerQty: { type: Number, default: 1 },

   isDefault: { type: Boolean, default: false },
   isActive: { type: Boolean, default: true }
}, { timestamps: true });

productPriceSchema.index({ productId: 1, weightLabel: 1 }, { unique: true });

module.exports = mongoose.model('ProductPrice', productPriceSchema);