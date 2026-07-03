const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
   inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

   type: {
      type: String,
      enum: ['STOCK_IN', 'STOCK_OUT', 'RESERVED', 'RELEASED', 'WASTAGE', 'RETURNED', 'ADJUSTMENT'],
      required: true
   },

   quantity: { type: Number, required: true },
   previousStock: { type: Number, required: true },
   newStock: { type: Number, required: true },

   note: { type: String },
   orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);