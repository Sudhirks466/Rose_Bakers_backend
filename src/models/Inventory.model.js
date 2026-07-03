const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
   productPriceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductPrice' },

   currentStock: { type: Number, default: 0 },
   reservedStock: { type: Number, default: 0 },
   minStock: { type: Number, default: 10 },

   unit: { type: String, enum: ['PCS', 'KG'], default: 'PCS' },

   status: {
      type: String,
      enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'],
      default: 'IN_STOCK'
   },

   lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   lastUpdatedAt: Date
}, { timestamps: true });

inventorySchema.index({ productId: 1, productPriceId: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);