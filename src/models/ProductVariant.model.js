const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

   weightLabel: { type: String, required: true },
   weightInGram: { type: Number, required: true },

   cakeType: {
      type: String,
      enum: ['EGG', 'EGGLESS'],
      required: true
   },

   shape: {
      type: String,
      enum: ['ROUND', 'SQUARE', 'HEART', 'RECTANGLE', 'CUSTOM'],
      default: 'ROUND'
   },

   sku: { type: String, unique: true, sparse: true },
   isDefault: { type: Boolean, default: false },
   isActive: { type: Boolean, default: true }
}, { timestamps: true });

productVariantSchema.index(
   { productId: 1, weightLabel: 1, cakeType: 1, shape: 1 },
   { unique: true }
);

module.exports = mongoose.model('ProductVariant', productVariantSchema);